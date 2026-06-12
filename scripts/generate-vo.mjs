// Generates voiceover clips for the CarPass.ai explainer via ElevenLabs TTS.
// Usage:  ELEVENLABS_API_KEY=sk_... node scripts/generate-vo.mjs
import { writeFile, mkdir } from "node:fs/promises";

const KEY = process.env.ELEVENLABS_API_KEY;
if (!KEY) { console.error("Set ELEVENLABS_API_KEY"); process.exit(1); }

const VOICE_DIRS = { v1: "Charlie", v2: "George" };

const LINES = {
  hook: "Every missed call. Every unanswered message. Another customer, buying their next car somewhere else.",
  promise: "CarPass AI keeps every conversation alive — so you never lose a customer again.",
  channels: "One AI agent across every channel your customers use — phone, WhatsApp, SMS, email, and web — all in one continuous conversation.",
  voice: "It answers every call in a natural voice, around the clock — qualifying budget, part-exchange, and finance in the very first conversation.",
  whatsapp1: "On WhatsApp it replies in seconds, even at midnight — understanding voice notes, searching your stock, and sending real cars with real prices.",
  whatsapp2: "Then it qualifies the buyer right in the chat — finance, deposit, part-exchange — and books the test drive before the conversation ends.",
  followup: "And when a lead goes quiet, CarPass doesn't. Perfectly timed follow-ups by SMS and email bring buyers back — automatically.",
  website: "On your website, visitors chat or start a voice call — and the AI answers instantly, every time.",
  funnel: "Every conversation runs one proven funnel — answer, qualify, follow up, sell — trained on real car-buying interactions and synced straight to your CRM.",
  globe: "From independent dealers to national OEMs and finance companies — one platform, every market, twenty-four seven.",
  cta: "CarPass AI. Never lose a customer again. Book your demo at carpass.ai.",
};

const api = (path, opts = {}) =>
  fetch(`https://api.elevenlabs.io/v1${path}`, { ...opts, headers: { "xi-api-key": KEY, "Content-Type": "application/json", ...opts.headers } });

const voicesRes = await api("/voices");
if (!voicesRes.ok) { console.error("voices:", voicesRes.status, await voicesRes.text()); process.exit(1); }
const { voices } = await voicesRes.json();
const ids = {};
for (const [dir, name] of Object.entries(VOICE_DIRS)) {
  const v = voices.find(v => v.name.toLowerCase() === name.toLowerCase()) ||
            voices.find(v => v.name.toLowerCase().includes(name.toLowerCase()));
  if (!v) { console.error(`Voice "${name}" not found. Available: ${voices.map(v => v.name).join(", ")}`); process.exit(1); }
  ids[dir] = v.voice_id;
  console.log(`${dir} = ${name} (${v.voice_id})`);
}

for (const [dir, name] of Object.entries(VOICE_DIRS)) {
  await mkdir(new URL(`../public/${dir}`, import.meta.url), { recursive: true });
  for (const [key, text] of Object.entries(LINES)) {
    const res = await api(`/text-to-speech/${ids[dir]}`, {
      method: "POST",
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: { stability: 0.5, similarity_boost: 0.75 },
      }),
    });
    if (!res.ok) { console.error(`FAIL ${dir}/${key}: ${res.status} ${await res.text()}`); process.exit(1); }
    const buf = Buffer.from(await res.arrayBuffer());
    await writeFile(new URL(`../public/${dir}/${key}.mp3`, import.meta.url), buf);
    console.log(`OK ${dir}/${key}.mp3 (${name}, ${(buf.length / 1024).toFixed(0)} KB)`);
  }
}
console.log("All clips generated.");
