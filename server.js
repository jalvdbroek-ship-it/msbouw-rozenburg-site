// Lokale server voor de preview. Serveert alleen de websitebestanden; POST /api/offerte schrijft naar data/ (alleen lokaal).
import http from "node:http";
import { readFile, appendFile, mkdir } from "node:fs/promises";
import { extname, join, normalize, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));
const PORT = Number(process.env.PORT) || 4173;
const types = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".svg": "image/svg+xml", ".webp": "image/webp", ".jpg": "image/jpeg", ".png": "image/png", ".woff2": "font/woff2", ".xml": "application/xml", ".txt": "text/plain; charset=utf-8" };
const hidden = ["src", "tools", "bronfoto", "data", "docs", "node_modules", ".gg"];

http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://x");
  if (req.method === "POST" && url.pathname === "/api/offerte") {
    let body = "";
    for await (const c of req) { body += c; if (body.length > 20000) { res.writeHead(413).end(); return; } }
    try {
      const d = JSON.parse(body);
      if (!d.naam || !d.email || !d.bericht) throw new Error("onvolledig");
      await mkdir(join(root, "data"), { recursive: true });
      await appendFile(join(root, "data", "aanvragen.jsonl"), JSON.stringify({ ontvangen: new Date().toISOString(), ...d }) + "\n");
      res.writeHead(200, { "Content-Type": "application/json" }).end('{"ok":true}');
    } catch { res.writeHead(400, { "Content-Type": "application/json" }).end('{"ok":false}'); }
    return;
  }
  if (req.method !== "GET" && req.method !== "HEAD") { res.writeHead(405).end(); return; }
  let path = decodeURIComponent(url.pathname);
  if (path.endsWith("/")) path += "index.html";
  const file = normalize(join(root, path));
  const rel = file.slice(root.length).split(sep)[0];
  if (!file.startsWith(root) || hidden.includes(rel) || rel.startsWith(".") || !types[extname(file)]) { res.writeHead(404).end("Niet gevonden"); return; }
  try {
    const buf = await readFile(file);
    res.writeHead(200, { "Content-Type": types[extname(file)], "Cache-Control": "no-cache" }).end(buf);
  } catch { res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }).end("Niet gevonden"); }
}).listen(PORT, () => console.log(`MSBouw preview op http://localhost:${PORT}/`));
