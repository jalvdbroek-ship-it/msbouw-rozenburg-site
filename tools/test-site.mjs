// Browsertest: node tools/test-site.mjs   (server moet draaien: npm start)
import { loadPlaywright } from "./browser.mjs";
const BASE = (process.env.BASE || "http://localhost:4173").replace(//$/, "");
const pages = ["index", "diensten", "projecten", "over-mij", "werkwijze", "contact", "privacy"];
const sizes = { desktop: [1440, 900], tablet: [820, 1180], mobiel: [390, 844] };
const { chromium } = await loadPlaywright();
const b = await chromium.launch();
let fails = 0;
const ok = (c, msg) => { if (!c) fails++; console.log(`${c ? "ok  " : "FAIL"} ${msg}`); };

for (const [name, [w, h]] of Object.entries(sizes)) {
  for (const reduced of [false, true]) {
    if (reduced && name !== "desktop" && name !== "mobiel") continue;
    const ctx = await b.newContext({ viewport: { width: w, height: h }, reducedMotion: reduced ? "reduce" : "no-preference" });
    for (const pg of pages) {
      const p = await ctx.newPage();
      const errs = [], bad = [];
      p.on("console", (m) => m.type() === "error" && errs.push(m.text()));
      p.on("pageerror", (e) => errs.push(String(e)));
      p.on("response", (r) => r.status() >= 400 && bad.push(`${r.status()} ${r.url()}`));
      const t0 = Date.now();
      await p.goto(`${BASE}/${pg}.html`, { waitUntil: "load" });
      const load = Date.now() - t0;
      await p.waitForTimeout(2800);
      // scroll door de pagina zodat alles triggert
      const total = await p.evaluate(() => document.documentElement.scrollHeight);
      for (let y = 0; y < total; y += h * 0.6) { await p.evaluate((v) => scrollTo(0, v), y); await p.waitForTimeout(60); }
      await p.waitForTimeout(1500);
      const r = await p.evaluate(() => {
        const vw = document.documentElement.clientWidth;
        const overflow = document.documentElement.scrollWidth > vw + 1;
        const imgs = [...document.images].filter((i) => !i.complete || i.naturalWidth === 0).map((i) => i.currentSrc || i.src);
        const hidden = [...document.querySelectorAll("[data-reveal], .svc, .reveal-img, .wi, .statement__text .w")].filter((e) => {
          const r = e.getBoundingClientRect(); const cs = getComputedStyle(e);
          return r.top < innerHeight * 5 && (+cs.opacity < 0.15);
        }).length;
        return { overflow, imgs, hidden, h1: document.querySelectorAll("h1").length, title: document.title, motion: document.documentElement.classList.contains("motion") };
      });
      const tag = `${name}${reduced ? "+reduced" : ""} ${pg}`;
      ok(errs.length === 0 && bad.length === 0, `${tag}: geen console/netwerkfouten ${errs.concat(bad).join(" | ")}`);
      ok(!r.overflow, `${tag}: geen horizontale overflow`);
      ok(r.imgs.length === 0, `${tag}: alle afbeeldingen geladen ${r.imgs.join(",")}`);
      ok(r.h1 === 1, `${tag}: één h1`);
      if (reduced) ok(!r.motion, `${tag}: reduced motion zet beweging uit`);
      if (!reduced && (pg !== "projecten" || name === "mobiel")) { /* verborgen elementen na scrollen */ }
      ok(r.hidden === 0, `${tag}: geen onzichtbare inhoud na scrollen (${r.hidden})`);
      if (!reduced && name === "desktop") console.log(`     laadtijd (load): ${load} ms`);
      await p.close();
    }
    await ctx.close();
  }
}

// links en CTA's
{
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  const seen = new Set();
  for (const pg of pages) {
    await p.goto(`${BASE}/${pg}.html`);
    const hrefs = await p.$$eval("a[href]", (as) => as.map((a) => a.getAttribute("href")));
    for (const h of hrefs) {
      if (seen.has(`${pg}:${h}`)) continue; seen.add(`${pg}:${h}`);
      if (/^(tel|mailto):/.test(h)) { ok(/^(tel:\+31\d{9}|mailto:info@MsBouwRozenburg\.nl)/.test(h), `${pg}: ${h}`); continue; }
      const [path, hash] = h.split("#");
      if (/^https?:/.test(h)) continue;
      const target = path || `${pg}.html`;
      const res = await ctx.request.get(`${BASE}/${target}`);
      let good = res.ok();
      if (good && hash) { const html = await res.text(); good = html.includes(`id="${hash}"`); }
      ok(good, `${pg}: link ${h}`);
    }
  }
  await ctx.close();
}

// formulier
{
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  await p.goto(`${BASE}/contact.html`);
  await p.waitForTimeout(1500);
  await p.click("button[type=submit]");
  ok(await p.locator(".field.has-error").count() === 3, "formulier: lege invoer geeft 3 meldingen");
  ok(await p.evaluate(() => document.activeElement.id) === "naam", "formulier: focus naar eerste fout");
  await p.fill("#naam", "Test Persoon"); await p.fill("#email", "fout"); await p.fill("#bericht", "Ik wil mijn trap laten renoveren.");
  await p.click("button[type=submit]");
  ok(await p.locator("#email-err").innerText() !== "", "formulier: ongeldig e-mailadres gemeld");
  ok(await p.inputValue("#naam") === "Test Persoon", "formulier: invoer blijft staan");
  await p.fill("#email", "test@example.nl");
  await p.click("button[type=submit]");
  await p.waitForSelector(".status--ok.is-on", { timeout: 5000 });
  ok(true, "formulier: succesmelding bij geslaagde verzending");
  await p.reload(); await p.waitForTimeout(800);
  await p.route("**/api/offerte", (r) => r.abort());
  await p.fill("#naam", "Test Persoon"); await p.fill("#email", "test@example.nl"); await p.fill("#bericht", "Ik wil mijn trap laten renoveren.");
  await p.click("button[type=submit]");
  await p.waitForSelector(".status--err.is-on", { timeout: 5000 });
  const mail = await p.getAttribute(".status--err a.btn", "href");
  ok(/^mailto:info@MsBouwRozenburg\.nl\?subject=/.test(mail), "formulier: foutmelding met mailto-terugval");
  ok(await p.inputValue("#bericht") !== "", "formulier: invoer blijft staan na fout");
  await ctx.close();
}

// mobiel menu, lightbox, filter
{
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
  const p = await ctx.newPage();
  await p.goto(`${BASE}/index.html`); await p.waitForTimeout(1500);
  await p.click(".menu-btn");
  ok(await p.getAttribute(".menu-btn", "aria-expanded") === "true" && await p.locator(".nav").isVisible(), "mobiel: menu opent");
  await p.keyboard.press("Escape");
  ok(await p.getAttribute(".menu-btn", "aria-expanded") === "false", "mobiel: Escape sluit menu");
  await p.goto(`${BASE}/projecten.html`); await p.waitForTimeout(1500);
  await p.click("[data-filter=trappen]");
  ok(await p.locator(".gallery__item:visible").count() === 4, "projecten: filter trappen toont 4");
  await p.click(".gallery__item:visible .gallery__btn");
  ok(await p.locator("#lightbox").evaluate((d) => d.open), "projecten: lightbox opent");
  await p.keyboard.press("Escape");
  ok(!(await p.locator("#lightbox").evaluate((d) => d.open)), "projecten: Escape sluit lightbox");
  await ctx.close();
}
await b.close();
console.log(fails ? `\n${fails} controle(s) mislukt` : "\nAlle controles geslaagd");
process.exit(fails ? 1 : 0);
