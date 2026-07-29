import { NextResponse } from "next/server";
import { validateHighVolumeApplication } from "@/lib/high-volume-application";
import { sendHighVolumeApplicationEmail } from "@/lib/high-volume-email";

export const runtime = "edge";

const attempts = new Map<string, number[]>();
const RATE_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT = 5;

function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (!origin || !host) return false;
  try { return new URL(origin).host === host; } catch { return false; }
}

function isRateLimited(request: Request): boolean {
  const key = request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const now = Date.now();
  const recent = (attempts.get(key) ?? []).filter((timestamp) => now - timestamp < RATE_WINDOW_MS);
  recent.push(now); attempts.set(key, recent);
  return recent.length > RATE_LIMIT;
}

function createApplicationId(): string {
  const date = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  const bytes = new Uint8Array(2); crypto.getRandomValues(bytes);
  return `HV-${date}-${Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("").toUpperCase()}`;
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "無效的提交來源。" }, { status: 403 });
  if (isRateLimited(request)) return NextResponse.json({ error: "提交次數過多，請稍後再試。" }, { status: 429 });
  try {
    const form = await request.formData();
    const result = await validateHighVolumeApplication(form);
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
    const applicationId = createApplicationId();
    await sendHighVolumeApplicationEmail({ applicationId, submittedAt: new Date().toISOString(), userAgent: request.headers.get("user-agent") ?? "", data: result.data, attachments: result.attachments });
    return NextResponse.json({ applicationId }, { status: 201 });
  } catch (error) {
    const unconfigured = error instanceof Error && error.message === "EMAIL_PROVIDER_NOT_CONFIGURED";
    return NextResponse.json({ error: unconfigured ? "寄信服務尚未設定，申請未送出。" : "申請未能送出，請稍後再試。" }, { status: unconfigured ? 503 : 502 });
  }
}
