// WCAG-contrast voor de drie kleurconcepten. Gebruik: node tools/contrast.mjs
// Toetst alleen paren die op de site echt voorkomen. Exitcode 1 als het winnende concept (B) faalt.
const concepts = {
  A: { naam: "Antraciet en koper", primary: "#22262B", secondary: "#3C434B", accent: "#B87333", background: "#F3EFE8", surface: "#FBF9F5", text: "#1B1E22", muted: "#5B5F66", cta: "#B87333", ctaText: "#1B1E22" },
  B: { naam: "Dakblauw en messing", primary: "#0F1D3A", secondary: "#2B43A6", accent: "#D9A441", background: "#F4F1EA", surface: "#FBF9F4", text: "#121C33", muted: "#4C5670", cta: "#D9A441", ctaText: "#0F1D3A", accentInk: "#7A5A12", onDarkMuted: "#CFCBC2", err: "#B3261E" },
  C: { naam: "Steen en eiken", primary: "#1F2A26", secondary: "#6A4B33", accent: "#C8553D", background: "#E9E3D8", surface: "#F4F0E8", text: "#1E211F", muted: "#5A5C55", cta: "#C8553D", ctaText: "#FFFFFF" },
};

const lin = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const lum = (h) => { const [r, g, b] = rgb(h).map(lin); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const ratio = (a, b) => { const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x); return (hi + 0.05) / (lo + 0.05); };
function oklch(h) {
  const [r, g, b] = rgb(h).map(lin);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const bb = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  return `oklch(${L.toFixed(3)} ${Math.hypot(a, bb).toFixed(3)} ${((Math.atan2(bb, a) * 180 / Math.PI + 360) % 360).toFixed(0)})`;
}

let fail = 0;
for (const [k, c] of Object.entries(concepts)) {
  const pairs = [
    ["tekst op achtergrond", c.text, c.background, 4.5],
    ["tekst op surface", c.text, c.surface, 4.5],
    ["muted op achtergrond", c.muted, c.background, 4.5],
    ["muted op surface", c.muted, c.surface, 4.5],
    ["achtergrond op primary", c.background, c.primary, 4.5],
    ["accent op primary", c.accent, c.primary, 4.5],
    ["CTA-tekst op CTA", c.ctaText, c.cta, 4.5],
    ["CTA tegen primary (grens)", c.cta, c.primary, 3],
    ["secondary op achtergrond (links)", c.secondary, c.background, 4.5],
    ["primary op achtergrond (CTA licht)", c.primary, c.background, 4.5],
    ...(c.accentInk ? [["messing-tekst op achtergrond", c.accentInk, c.background, 4.5], ["messing-tekst op surface", c.accentInk, c.surface, 4.5], ["muted-op-donker op primary", c.onDarkMuted, c.primary, 4.5], ["foutkleur op achtergrond", c.err, c.background, 4.5]] : []),
  ];
  console.log(`\nConcept ${k}: ${c.naam}`);
  for (const [naam, fg, bg, min] of pairs) {
    const r = ratio(fg, bg); const ok = r >= min;
    if (!ok && k === "B") fail++;
    console.log(`  ${ok ? "ok  " : "FAIL"} ${r.toFixed(2).padStart(5)}:1 (min ${min})  ${naam}  ${fg} op ${bg}`);
  }
}
if (process.argv.includes("--tokens")) {
  console.log("\nTokens concept B:");
  for (const [n, v] of Object.entries(concepts.B)) if (v.startsWith("#")) console.log(`  --${n}: ${oklch(v)};  /* ${v} */`);
}
process.exit(fail ? 1 : 0);
