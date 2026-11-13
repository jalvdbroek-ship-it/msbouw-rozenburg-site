// Bouwt de statische pagina's in de projectroot uit src/pages + src/partials.
// Gebruik: node tools/build.mjs   (SITE_URL=https://... voor sitemap.xml; NOINDEX=1 voor een voorbeeldlink die niet in Google hoort)
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const SITE_URL = (process.env.SITE_URL || "https://www.msbouwrozenburg.nl").replace(/\/$/, "");
const read = (p) => readFileSync(join(root, p), "utf8");
const partial = (n) => read(`src/partials/${n}.html`);
const imgDir = join(root, "assets", "img");

// breedte en hoogte uit de WebP-header (lossy VP8 of VP8X)
function webpSize(file) {
  const b = readFileSync(file);
  const kind = b.toString("ascii", 12, 16);
  if (kind === "VP8 ") return [b.readUInt16LE(26) & 0x3fff, b.readUInt16LE(28) & 0x3fff];
  if (kind === "VP8X") return [1 + b.readUIntLE(24, 3), 1 + b.readUIntLE(27, 3)];
  throw new Error(`Onbekend WebP-formaat: ${file}`);
}
const widthsFor = (name) =>
  readdirSync(imgDir)
    .map((f) => f.match(new RegExp("^" + name + "-(\\d+)\\.webp$")))
    .filter(Boolean)
    .map((m) => +m[1])
    .sort((a, b) => a - b);

function pic(attrs) {
  const a = {};
  for (const m of attrs.matchAll(/(\w+)(?:=(?:"([^"]*)"|([^\s"]+)))?/g)) a[m[1]] = m[2] ?? m[3] ?? true;
  const ws = widthsFor(a.name);
  if (!ws.length) throw new Error(`Geen foto gevonden voor "${a.name}"`);
  const [w, h] = webpSize(join(imgDir, `${a.name}-${ws[ws.length - 1]}.webp`));
  const srcset = ws.map((x) => `assets/img/${a.name}-${x}.webp ${x}w`).join(", ");
  const eager = a.eager ? `fetchpriority="high"` : `loading="lazy" decoding="async"`;
  const cls = a.class ? ` class="${a.class}"` : "";
  const pos = a.pos ? ` style="object-position:${a.pos}"` : "";
  return `<img${cls} src="assets/img/${a.name}-${ws[ws.length - 1]}.webp" srcset="${srcset}" sizes="${a.sizes || "(min-width: 900px) 50vw, 100vw"}" width="${w}" height="${h}" alt="${a.alt ?? ""}" ${eager}${pos}>`;
}

const pages = readdirSync(join(root, "src", "pages")).filter((f) => f.endsWith(".html"));
const sitemap = [];
for (const file of pages) {
  let src = read(`src/pages/${file}`);
  const meta = {};
  src = src.replace(/^<!--\s*(\w+):\s*(.*?)\s*-->\n?/gm, (_, k, v) => ((meta[k] = v), ""));
  const out = file;
  const nav = meta.nav || "";
  let html = partial("layout")
    .replace("{{sprite}}", partial("sprite"))
    .replace("{{head}}", partial("head"))
    .replace("{{header}}", partial("header"))
    .replace("{{footer}}", partial("footer"))
    .replace("{{main}}", src)
    .replace("{{hero-media}}", () => {
      if (!widthsFor("hero-timmerman").length) return partial("hero-drawing");
      const img = pic('name=hero-timmerman alt="Handen van een timmerman die met een handschaaf hout bewerkt. Stockfoto." sizes="100vw" pos="50% 50%" eager');
      return `<div class="hero__duo"><div class="hero__shot">${img}</div></div><p class="hero__credit">Foto: Pexels</p>`;
    })
    .replaceAll("{{title}}", meta.title)
    .replaceAll("{{description}}", meta.description)
    .replaceAll("{{bodyclass}}", meta.bodyclass || "")
    .replaceAll("{{canonical}}", `${SITE_URL}/${out === "index.html" ? "" : out}`)
    .replaceAll("{{year}}", String(new Date().getFullYear()))
    .replace("{{portrait}}", () => (widthsFor("marcus-van-der-stel").length ? `<div class="reveal-img">${pic('name=marcus-van-der-stel alt="Marcus van der Stel, eigenaar van MSBouw" sizes="(min-width: 900px) 30vw, 100vw"')}</div>` : `<div class="monogram" aria-hidden="true">MS</div>`))
    .replace(/\{\{pic ([^}]+)\}\}/g, (_, attrs) => pic(attrs))
    .replace(/(<a class="nav__link"[^>]*href="([^"]+)")/g, (m, all, href) => (href === nav ? `${all} aria-current="page"` : m))
    .replace("<!--robots-->", meta.noindex || process.env.NOINDEX ? '<meta name="robots" content="noindex">' : "")
    .replace(/<!--jsonld-->/, meta.jsonld === "business" ? partial("jsonld") : "");
  if (/\{\{/.test(html)) throw new Error(`Onopgeloste plaatshouder in ${file}: ${html.match(/\{\{[^}]*\}\}/)[0]}`);
  writeFileSync(join(root, out), html);
  if (!meta.noindex) sitemap.push(`${SITE_URL}/${out === "index.html" ? "" : out}`);
  console.log("gebouwd", out);
}
writeFileSync(join(root, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemap.map((u) => `  <url><loc>${u}</loc></url>`).join("\n")}\n</urlset>\n`);
writeFileSync(join(root, "robots.txt"), process.env.NOINDEX ? "User-agent: *\nDisallow: /\n" : `User-agent: *\nAllow: /\nSitemap: ${SITE_URL}/sitemap.xml\n`);
