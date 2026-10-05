import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { analyzeScenario, findScenario } from "./scenarios.ts";
import { renderPreview } from "./render.ts";

const files = { "/styles.css": ["styles.css", "text/css"], "/interactions.js": ["interactions.js", "text/javascript"] };
export function createReviewServer() {
  // No production adapter/config/credentials are read, and no financial body is accepted.
  return createServer(async (request, response) => {
    const headers = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow", "X-Content-Type-Options": "nosniff", "Referrer-Policy": "no-referrer",
      "Content-Security-Policy": "default-src 'none'; style-src 'self'; script-src 'self'; img-src data:; form-action 'self'; base-uri 'none'; frame-ancestors 'none'" };
    const reply = (status, body, contentType = "text/plain") => { response.writeHead(status, { ...headers, "Content-Type": contentType + "; charset=utf-8" }); response.end(body); };
    if (process.env.NODE_ENV === "production") return reply(404, "Not available");
    if (request.method !== "GET") return reply(405, "Read-only local review");
    const address = serverAddress(response.socket?.localPort);
    if (request.headers.host !== new URL(address).host) return reply(403, "Loopback review only");
    try {
      const url = new URL(request.url, address);
      if (Object.hasOwn(files, url.pathname)) {
        const [name, type] = files[url.pathname];
        return reply(200, await readFile(new URL(name, import.meta.url), "utf8"), type);
      }
      if (url.pathname !== "/" || [...url.searchParams.keys()].some(key => key !== "scenario") || url.searchParams.getAll("scenario").length > 1) return reply(404, "Not available");
      const scenario = findScenario(url.searchParams.get("scenario") ?? "A");
      if (!scenario) return reply(404, "Unknown synthetic fixture");
      return reply(200, renderPreview(await analyzeScenario(scenario.id), scenario), "text/html");
    } catch { return reply(500, "Local preview unavailable"); }
  });
}
const serverAddress = port => `http://127.0.0.1:${port}`;
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (!process.argv.includes("--local-review") || process.env.NODE_ENV === "production") throw new Error("Local review only; production is prohibited");
  const server = createReviewServer();
  server.listen(4317, "127.0.0.1", () => { console.log("Local synthetic review: http://127.0.0.1:4317 — no auth, no saving, unpublished"); });
  server.on("error", () => { console.error("Local preview listener unavailable"); process.exitCode = 1; });
  process.on("SIGINT", () => server.close());
  process.on("SIGTERM", () => server.close());
}
