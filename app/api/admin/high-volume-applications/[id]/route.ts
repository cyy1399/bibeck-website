import { NextResponse } from "next/server";
import { getAdminEmail } from "@/lib/admin-auth";
import { sendHighVolumeApprovalEmail } from "@/lib/high-volume-email";
import { approveHighVolumePreReview, recordHighVolumeNotificationError } from "@/lib/rebate-case-store";

export const runtime = "nodejs";

function isSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (!origin || !host) return false;
  try { return new URL(origin).host === host; } catch { return false; }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const adminEmail = await getAdminEmail();
  if (!adminEmail) return NextResponse.json({ error: "未授權" }, { status: 401 });
  if (!isSameOrigin(request)) return NextResponse.json({ error: "來源驗證失敗" }, { status: 403 });
  try {
    const { approvedRate } = await request.json() as { approvedRate?: number };
    const item = await approveHighVolumePreReview((await params).id, Number(approvedRate));
    try {
      await sendHighVolumeApprovalEmail({ caseNumber: item.caseNumber, displayName: item.displayName, contactEmail: item.contactEmail, approvedRate: item.approvedRate! });
      await recordHighVolumeNotificationError(item.id, null);
    } catch (error) {
      await recordHighVolumeNotificationError(item.id, error instanceof Error ? error.message : "EMAIL_FAILED");
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error && error.message === "INVALID_APPROVED_RATE" ? "比例必須介於 20% 至 100%。" : "更新失敗" }, { status: 400 });
  }
}
