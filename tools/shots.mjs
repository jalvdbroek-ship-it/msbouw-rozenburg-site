// Screenshots per sectie. Gebruik: node tools/shots.mjs <pagina> <breedte> <hoogte> <uitvoermap> [reduced]
import { mkdirSync } from "node:fs";
import { loadPlaywright } from "./browser.mjs";
const [page = "index.html", w = "1440", h = "900", out = "docs/screens", reduced] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const { chromium } = await loadPlaywright();
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: +w, height: +h }, reducedMotion: reduced ? "reduce" : "no-preference" });
const p = await ctx.newPage();
const errors = [];
p.on("console", (m) => m.type() === "error" && errors.push(m.text()));
p.on("pageerror", (e) => errors.push(String(e)));
await p.goto(`http://localhost:4173/${page}`, { waitUntil: "load" });
await p.waitForTimeout(3500);
const base = page.replace(".html", "") + `-${w}${reduced ? "-reduced" : ""}`;
const secs = await p.$$eval("main > section", (els) => els.map((e) => ({ top: e.getBoundingClientRect().top + scrollY, h: e.offsetHeight })));
let i = 0;
for (const s of secs) {
  const steps = s.h > +h * 1.6 ? [0, 0.5, 0.95] : [0];
  for (const f of steps) {
    const y = Math.max(0, s.top - 72 + f * (s.h - +h * 0.6));
    for (let k = 1; k <= 6; k++) { await p.evaluate((v) => scrollTo(0, v), y - 600 + (k * 100)); await p.waitForTimeout(80); }
    await p.evaluate((v) => scrollTo(0, v), y);
    await p.waitForTimeout(1600);
    await p.screenshot({ path: `${out}/${base}-${String(++i).padStart(2, "0")}.png` });
  }
}
console.log(`${i} screenshots, fouten: ${JSON.stringify(errors)}`);
await b.close();
