# MSBouw Renovatie & Totaalverbouwing, Rozenburg: nieuwe website

Statische website (HTML, CSS, JavaScript, GSAP). Geen framework, geen tracking, geen externe verzoeken.

## De live site

**https://jalvdbroek-ship-it.github.io/msbouw-rozenburg-site/** (voorbeeldlink; staat op `noindex`, dus niet in Google). De repository is openbaar en er staat geen wachtwoord op. Elke push naar `main` publiceert opnieuw via GitHub Pages.

Voor de echte livegang: `SITE_URL=https://jouwdomein.nl npm run build` (zonder `NOINDEX`), dan pushen.

## De site lokaal openen

```bash
npm start            # http://localhost:4173/
```

of dubbelklik `start-site.bat`. Open nooit `index.html` direct vanaf schijf: het formulier en de lettertypen hebben de server nodig.

## Mapstructuur

| Pad | Wat |
| --- | --- |
| `*.html` | gegenereerde pagina's (home, diensten, projecten, over-mij, werkwijze, contact, privacy) |
| `src/pages`, `src/partials` | de bron: pas teksten hier aan, daarna `npm run build` |
| `assets/css/style.css` | alle stijlen, kleurtokens bovenaan |
| `assets/js/main.js` | gedrag en beweging; `vendor/` bevat GSAP 3.15.1 + ScrollTrigger |
| `assets/img`, `assets/fonts` | geoptimaliseerde foto's (WebP), lettertypen |
| `bronfoto/` | de originele foto's van de oude site; `npm run photos` maakt er WebP van |
| `tools/` | build, fototool, contrastmeting, browsertests, screenshots |
| `docs/screens` | screenshots van de huidige versie (alleen lokaal, niet in git) |
| `server.js` | lokale server; `/api/offerte` schrijft lokaal naar `data/` |
| `DESIGN.md`, `OPDRACHT.md` | onderzoek, ontwerpkeuzes, eisenlijst |

Wijzigen: tekst in `src/pages/*.html`, dan `npm run build`. Foto van Marcus toevoegen: `marcus-van-der-stel-640.webp` en `-1000.webp` in `assets/img`, dan build; de site toont hem automatisch in plaats van het monogram.

## Controle

```bash
npm start                         # in een terminal
npm run test:site                 # 3 formaten, reduced motion, links, formulier, menu, lightbox
npm run contrast                  # kleurparen concept A/B/C
URL=http://localhost:4173/index.html node tools/check-a11y.mjs
```

Laatste run: alle `test:site`-controles geslaagd (zie het rapport in het gesprek); `check-a11y` heeft twee bekende meldingen, zie onderaan.

## Wat er vaststaat

Echte foto's, echte teksten en reacties van de oude site. Geen verzonnen projecten, keurmerken, scores of cijfers. Er is geen gemiddelde beoordeling, want de oude site toont er geen.

## Wat je nog moet doen voor livegang

- [ ] **Formulier koppelen.** Op een statische host bestaat `/api/offerte` niet. Nu valt het formulier terug op een mailto-knop (getest). Kies een echte afhandeling (formulierdienst of eigen server) en zet het adres in `data-endpoint` in `src/pages/contact.html`.
- [ ] **Bevestigen met Marcus** (komen van de oude site, niet onafhankelijk geverifieerd): "ruim 30 jaar ervaring", VELUX-erkenning als expert, het verhaal over glasbedrijf en aannemer, verzekeringswerk, de 5 reacties en dat de namen erbij mogen blijven staan.
- [ ] **Ontbrekend:** KvK-nummer, adres, openingstijden, werkgebied (nu staat alleen "Rozenburg"), WhatsApp (niet gevonden, dus niet gebruikt), Google-beoordelingen (aantal en score), fotodatums per project.
- [ ] **Privacyverklaring** is een concept (bewaartermijn leeg); laten nalezen.
- [ ] **Portret van Marcus** en recentere projectfoto's. De huidige zijn telefoonfoto's uit 2019 en deels tussenstadia; nieuwe foto's tillen de site direct op.
- [ ] **Domein:** `SITE_URL=https://jouwdomein.nl npm run build` zet canonical en `sitemap.xml` goed (nu `https://www.msbouwrozenburg.nl`).
- [ ] Logo: de bestaande logobestanden zijn niet gebruikt (witte gloed werkt niet op donker); de site gebruikt een woordmerk met de dakrand uit het logo. Laat Marcus kiezen of er een schoon logo moet komen.
- [ ] **Hero-foto is een stockfoto** (Pexels, bron in `docs/foto-bronnen.md`), geen werk van MSBouw. Vervang door een eigen, goede foto zodra die er is (zie `.gg/skills/hero-foto-zoeken`). Eerder geprobeerd en weer weggehaald: getekend huis.
- [ ] (optioneel) **Hero-beeld genereren:** nu een getekend huis dat zichzelf renoveert (sloop, timmerwerk, afwerking, oplevering; `src/partials/hero-drawing.html`). Gegenereerde sfeerbeelden (geen echt MSBouw-werk, de site labelt ze zo): `GEMINI_API_KEY` in je omgeving zetten, `node tools/generate-hero.mjs && npm run photos && npm run build`. Vervang ze liever door echte, professionele foto's van Marcus' werk.
- [ ] Open Graph-afbeelding voor delen op social media (nog niet gemaakt).

## Bekende meldingen van check-a11y

- Mobiele navigatielinks "zonder focusindicator": de checker focust links in het gesloten menu (`visibility: hidden`); die zijn dan niet bereikbaar. Open menu: wel zichtbare focus.
- Voor-en-na-schuifbalk: focus-ring op de hele foto (getest).

## Techniek

HTML/CSS/JS, GSAP 3.15.1 met ScrollTrigger (gratis standaardlicentie), Young Serif en Hanken Grotesk (SIL OFL) lokaal. Node 20+ voor build en server, Python met Pillow voor de fototool.
