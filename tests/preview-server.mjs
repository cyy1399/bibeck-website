import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const clientRoot = join(root, "dist", "client");
const { default: worker } = await import(new URL("../dist/server/index.js?preview=" + Date.now(), import.meta.url));
const port = Number(process.env.PORT ?? 4173);

const mime = {
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml; charset=utf-8",
  ".woff2": "font/woff2",
};

async function assetResponse(pathname) {
  const relative = pathname.replace(/^\/+/, "");
  const fullPath = normalize(join(clientRoot, relative));
  if (!fullPath.startsWith(clientRoot)) return new Response("Not found", { status: 404 });
  try {
    const info = await stat(fullPath);
    if (!info.isFile()) return new Response("Not found", { status: 404 });
    return new Response(await readFile(fullPath), {
      headers: { "content-type": mime[extname(fullPath).toLowerCase()] ?? "application/octet-stream" },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? "/", "http://127.0.0.1:" + port);
    let response;
    if (url.pathname.startsWith("/assets/") || url.pathname.match(/\.(?:png|jpe?g|svg|woff2)$/i)) {
      response = await assetResponse(url.pathname);
    } else {
      const request = new Request(url, { method: req.method, headers: req.headers });
      response = await worker.fetch(
        request,
        { ASSETS: { fetch: (assetRequest) => assetResponse(new URL(assetRequest.url).pathname) } },
        { waitUntil() {}, passThroughOnException() {} },
      );
    }
    res.writeHead(response.status, Object.fromEntries(response.headers));
    res.end(Buffer.from(await response.arrayBuffer()));
  } catch (error) {
    res.writeHead(500, { "content-type": "text/plain; charset=utf-8" });
    res.end(error instanceof Error ? error.stack : String(error));
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log("BiBeck QA preview: http://127.0.0.1:" + port);
});