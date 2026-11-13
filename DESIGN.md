# MSBouw Rozenburg: ontwerpnotitie

Onderwerp en publiek: MSBouw Renovatie & Totaalverbouwing, Rozenburg. Eigenaar Marcus van der Stel. Publiek: huiseigenaren (en eigenaren van bedrijfspanden) die een renovatie, badkamer, trap of maatwerk willen laten doen. De enige taak van de site: bezoeker neemt contact op (offerte, bellen).

## Onderzoek (fase 1)

Bron: de bestaande WordPress-site (eenpagina, thema Zerif Lite). Wat de site vertelt: 6 dienstblokken, een eigenaarsverhaal, 3 fotocarrousels (badkamers 7, trappen 8, overige 7 foto's), 5 klantreacties zonder score, contactgegevens, een VELUX-vermelding.

Tekortkomingen van de oude site: foto's alleen in een automatisch draaiende carrousel zonder voor-en-na; geen offerteformulier (alleen een e-mailadres); logo met witte gloed werkt alleen op wit; geen aparte pagina's voor diensten en werkwijze; geen duidelijk eerste scherm met wat, waarom en contact.

Niet te bevestigen met openbare bronnen (zoekopdrachten vonden niets over dit bedrijf): KvK-nummer, adres, openingstijden, werkgebied, Google-beoordelingen, startjaar. Er is niets van verzonnen. Naamverwarring: er zijn andere "Bouw"-bedrijven in Rozenburg (zoals Bouw- en Aannemingsbedrijf W. Bijl); die zijn niet gebruikt.

Gebruikte feiten (allemaal van de bestaande site, zie README voor de te bevestigen lijst): telefoon 06 1467 0460 en 0181 75 14 64, e-mail info@MsBouwRozenburg.nl, "ruim 30 jaar ervaring", ervaring bij een glasbedrijf en aannemer, VELUX-expert, schadeherstel/verzekeringswerk, 5 klantreacties (letterlijk), de 20 projectfoto's en de hero-foto.

## Referenties bekeken in de browser

| Site | Meegenomen als principe |
| --- | --- |
| New Level (Stone & Timber) | Rustige serif-koppen op warm papier, hairlines, veel witruimte |
| LRC Builders | Vertrouwen via bewijs, diensten + projecten naast elkaar, directe contactactie |
| The Home X | Grote typografie met veel ruimte, projectgegevens als stille metadata |
| Arc Studio, Scrollwork | Scrollgestuurde diepte en een proces dat zichzelf vertelt (hier: de dakrand die tekent) |

Niets is gekopieerd: eigen kleur, eigen lettertype, eigen signatuur.

## Kleurconcepten (fase 2, gemeten met `npm run contrast`)

| Rol | A Antraciet en koper | **B Dakblauw en messing (gekozen)** | C Steen en eiken |
| --- | --- | --- | --- |
| Primary | #22262B | **#0F1D3A** | #1F2A26 |
| Secondary | #3C434B | **#2B43A6** | #6A4B33 |
| Accent | #B87333 | **#D9A441** | #C8553D |
| Background | #F3EFE8 | **#F4F1EA** | #E9E3D8 |
| Surface | #FBF9F5 | **#FBF9F4** | #F4F0E8 |
| Text | #1B1E22 | **#121C33** | #1E211F |
| Muted | #5B5F66 | **#4C5670** | #5A5C55 |
| CTA | #B87333 | **#D9A441 (tekst #0F1D3A)** | #C8553D |

Meting: A faalt op accent-op-donker (4.0:1) en CTA-tekst (4.4:1). C faalt op accent-op-donker (3.4:1) en witte CTA-tekst (4.35:1). B haalt alles, laagste paar 5.6:1.

Waarom B: (1) het blauw komt uit het bestaande logo van MSBouw, dus de klant blijft herkenbaar; (2) de echte foto's zijn warm (beige tegels, hout, wit); donkerblauw is het complement en laat ze opvallen, terwijl koper en terracotta (A, C) in dezelfde tinten zitten als de tegels en het hout en erin verdwijnen; (3) messing is een stil accent dat vakmanschap suggereert zonder bouwgeel of luxe-goud; (4) de CTA is op elk vlak duidelijk.

Gebruik: donker (primary) voor hero, header, werkwijze, contact en footer; warm papier voor de rest. Messing alleen als accent en CTA op donker; op licht wordt het donkerder messing (#7A5A12, 5.6:1) voor kleine tekst. De primaire knop is messing op donker en donkerblauw op licht. Blauw (secondary) wordt gebruikt voor focus op licht en hover van de donkere knop.

CSS-tokens in OKLCH staan bovenaan `assets/css/style.css`.

## Signatuur

De dakrand: de silhouet van het dak uit het logo van MSBouw (schoorsteenstap inbegrepen) als één gouden lijn. Hij tekent zichzelf in de hero, loopt over de werkwijze mee met het scrollen en staat als kleine lijn onder elke paginakop. Kleiner werk gebruikt de maatlijn (`|——|`) als label voor secties.

## Typografie

Young Serif voor koppen (sterk, warm, ambachtelijk), Hanken Grotesk voor tekst en interface. Beide lokaal gehost (geen Google-verzoeken). Vloeiende schaal met `clamp()`; koppen met `text-wrap: balance`.

## Vorm, ruimte, beeld

Scherpe hoeken, geen kaarten met afronding, geen gradients, geen schaduwen behalve op de voor-en-na-greep. Eén rail van 1320 px, gutter 20 tot 64 px. Sectieruimte 80 tot 176 px. Foto's zijn de bewijslast: alleen echte projectfoto's van MSBouw, WebP, met afmetingen in HTML (geen layoutverspringing). De hero heeft een schuine linkerrand die de dakhelling herhaalt.

## Beweging

Eén georkestreerd moment: de hero. Een getekend huis in doorsnede renoveert zichzelf in vier fasen (sloop, timmerwerk, afwerking, oplevering) en herhaalt rustig; koppen komen woord voor woord omhoog; een lint met vakgebieden loopt door. Er staat bewust geen voor-en-na in de hero, want die staat verderop. Verder alleen beweging die iets vertelt:
- voor-en-na op home: een gepinde scène waarin scrollen de voor-foto "wegveegt" naar de na-foto, drie projecten achter elkaar;
- bouwverloop op projecten: horizontale gepinde scène, tuinhuis in vijf beelden;
- werkwijze: de dakrand tekent mee;
- statement: woorden lichten op tijdens scrollen; koppen en foto's worden gecontroleerd onthuld; lichte parallax in de collage;
- "30" telt op (het enige echte getal);
- knoppen met opvul-hover, nav-lijn, foto-preview bij de dienstenlijst (alleen met muis);
- paginaovergang: zachte cross-document fade.

GSAP 3.15.1 + ScrollTrigger, lokaal in `assets/js/vendor/`, geen ander animatiesysteem. Onder `prefers-reduced-motion` is alles direct zichtbaar en zijn voor-en-na en bouwverloop gewone handmatige sliders/scroll. Op mobiel (< 900 px) geen pinnen: voor-en-na is een sleepslider, het bouwverloop scrolt zijwaarts met snap. Valt de animatie-bibliotheek uit, dan zet een vangnet alles zichtbaar.

## Vermeden

Template-aannemerslook (geel/zwart, helm-iconen, gradient-hero), afgeronde kaartenrijen, sterren zonder echte score, verzonnen cijfers, automatisch draaiende carrousels, emoji, neon, 3D, zware libraries.

## Skills (stap 4)

| Skill | Bestaat | Past bij stack | Besluit |
| --- | --- | --- | --- |
| `website-standaard` (eigen, GG Coder) | ja, aanwezig | ja | gebruikt: werkwijze, scripts |
| `evidence-led-ui` (GG Coder) | ja, aanwezig | ja | gebruikt: ontwerpthese, rubric, anti-slop |
| Playwright | ja, aanwezig in GG Coder | ja | gebruikt: `tools/test-site.mjs`, `tools/shots.mjs`, `check-a11y` |
| GSAP + ScrollTrigger | npm `gsap@3.15.1`, gratis standaardlicentie | ja | gebruikt, lokaal opgenomen |
| Anthropic `frontend-design` | ja (github.com/anthropics/skills) | ja, algemeen | niet geïnstalleerd; overlapt met evidence-led-ui, principes toegepast |
| `web-animation-skills` (iart-ai) | ja | deels | niet geïnstalleerd; GSAP-patronen zelf geschreven |
| `scroll-craft` (nateherkai) | ja | nee, gericht op video-scrub en 3D-hero's met gegenereerde beelden | niet geïnstalleerd; past niet bij telefoonfoto's |
| `ui-ux-pro-max` | ja | deels, Python-zoekdatabase | niet geïnstalleerd; overbodig naast bovenstaande |
| Skillry-catalogus | ja, verbonden | betaald, gericht op SaaS/landing | niets geïnstalleerd; niets bouwbedrijf-specifiek gevonden |

Er is dus niets nieuws geïnstalleerd, behalve GSAP als bestanden in het project.

## Zo komen de eisen terug

Zie `OPDRACHT.md`.
