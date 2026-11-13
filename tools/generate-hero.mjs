// Genereert sfeerbeelden voor de hero met Google Gemini (afbeeldingsmodel). Kosten per beeld bij Google.
// Gebruik: zet GEMINI_API_KEY in je omgeving (nooit in een bestand), dan:
//   node tools/generate-hero.mjs        en daarna     npm run photos && npm run build
// De beelden zijn sfeerbeelden, geen echt MSBouw-werk; de site toont er een label "Sfeerbeeld, gegenereerd" bij.
import { mkdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const key = process.env.GEMINI_API_KEY;
if (!key) { console.error("GEMINI_API_KEY ontbreekt. Zet hem in je omgeving, niet in een bestand."); process.exit(1); }
const out = join(dirname(fileURLToPath(import.meta.url)), "..", "bronfoto", "gegenereerd");
mkdirSync(out, { recursive: true });
const api = "https://generativelanguage.googleapis.com/v1beta";
const headers = { "x-goog-api-key": key, "Content-Type": "application/json" };

// modelnamen veranderen vaak: kies uit de lijst van het account
const list = await (await fetch(`${api}/models`, { headers })).json();
const names = (list.models || []).map((m) => m.name.replace("models/", "")).filter((n) => /image/i.test(n));
const model = process.env.GEMINI_IMAGE_MODEL || names.find((n) => /3\.1.*flash.*image/.test(n)) || names.find((n) => /3.*pro.*image/.test(n)) || names[0];
if (!model) { console.error("Geen afbeeldingsmodel beschikbaar voor deze sleutel."); process.exit(1); }
console.log("Model:", model);

const style = "Photorealistic architectural and interior photograph, natural window light, shallow depth of field, calm warm palette of white walls and natural oak, a single deep navy accent, high-end but lived-in Dutch home, sharp focus, no text, no logos, no watermarks, no people's faces.";
const shots = [
  ["hero-1", `A bright renovated hallway in a Dutch row house with a freshly renovated oak staircase with white risers and a slim oak handrail, morning light from a side window, clean white plaster walls, oak floor. Vertical composition 3:4. ${style}`],
  ["hero-2", `Close-up of a carpenter's oak workbench: a hand plane resting on a fresh oak board, curled oak shavings, a folding wooden ruler and a flat carpenter's pencil, soft window light, a blurred renovated interior behind. Hands not visible. Vertical composition 3:4. ${style}`],
];
for (const [name, prompt] of shots) {
  const res = await fetch(`${api}/models/${model}:generateContent`, {
    method: "POST", headers,
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseModalities: ["IMAGE"], imageConfig: { aspectRatio: "3:4" } } }),
  });
  const json = await res.json();
  const part = json.candidates?.[0]?.content?.parts?.find((p) => p.inlineData);
  if (!part) { console.error(name, "mislukt:", JSON.stringify(json.error || json).slice(0, 300)); continue; }
  const ext = part.inlineData.mimeType.includes("jpeg") ? "jpg" : "png";
  writeFileSync(join(out, `${name}.${ext}`), Buffer.from(part.inlineData.data, "base64"));
  console.log("opgeslagen", `${name}.${ext}`);
}
