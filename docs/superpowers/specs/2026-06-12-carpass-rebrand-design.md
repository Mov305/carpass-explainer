# CarPass.ai Explainer v2 — Design Spec

Date: 2026-06-12 · Status: Approved by user

## Goal

Rebrand the 95s matchedby explainer to **CarPass.ai** (AI communication platform for automotive retailers, OEMs and finance companies) and raise it to After-Effects-grade motion quality. New length: **118 seconds, 12 scenes**.

## Brand system

- **Wordmark:** `CarPass.ai` — "CarPass" white, ".ai" in brand gradient. Capital C + P matches the C/P monogram.
- **Logo mark:** `public/carpass-logo.png` (66×58, white on transparent) redrawn as inline SVG (3 paths: Γ frame + inner rounded rect + bottom-right L). Sharp at any size, gradient-fillable, stroke draw-on animation in intro. PNG used as favicon.
- **Gradient:** teal `#22E0C8` → blue `#3B82F6` → violet `#8B5CF6` (matchedby palette already in project; matchedby.com unreachable to verify exact site values).
- **Slogan:** "Never lose a customer again." — own scene at 17–25s, returns as CTA headline.
- **No blur anywhere; transparency only. No emojis; SVG icons only.**

## Timeline (118s)

| key | span | content |
|---|---|---|
| intro | 0–8 | Gradient circles converge; monogram draws on; CarPass.ai reveal; logo → corner at ~7s |
| hook | 8–17 | Kinetic word-by-word: "Every missed call. Every unanswered message. Another customer, buying their next car somewhere else." |
| promise | 17–25 | Full-screen slogan "Never lose a customer again." word-spring + gradient sweep |
| channels | 25–36 | Orbital hub: monogram core, thin rotating ring, 5 channel nodes (Voice, WhatsApp real glyph, SMS, Email, Web), light packets along curved connectors both directions |
| voice | 36–46 | Phone call demo, "Ava from CarPass", transcript qualifies budget / part-exchange / finance |
| whatsapp1 | 46–58 | Hyper-real WA dark theme: encryption chip, bubble tails, typing indicator, 21:47 voice note → instant reply → 2 real car cards |
| whatsapp2 | 58–70 | Same thread continues: finance question → £279/mo quote card → test drive booked + confirmation card (absorbs old Booking scene) |
| followup | 70–81 | Lead goes quiet → "Day 2 · SMS" nudge (phone frame) → "Day 5 · Email" card → reply. |
| website | 81–90 | carpass.ai browser mock with real car cards; CarPass-branded chat/call widget |
| funnel | 90–100 | Horizontal funnel Answer → Qualify → Follow up → Sell, progress beam, "Trained on real car-buying interactions", CRM sync chip |
| globe | 100–108 | Existing 3D globe; copy: "Built for automotive — retailers, OEMs, finance companies" |
| cta | 108–118 | Logo morphs corner → gradient CarPass.ai button; slogan headline; "Book a demo at carpass.ai" |

## Voiceover script (11 clips × v1 Charlie US, v2 George UK — ElevenLabs eleven_multilingual_v2)

- **hook**: Every missed call. Every unanswered message. Another customer, buying their next car somewhere else.
- **promise**: CarPass AI keeps every conversation alive — so you never lose a customer again.
- **channels**: One AI agent across every channel your customers use — phone, WhatsApp, SMS, email, and web — all in one continuous conversation.
- **voice**: It answers every call in a natural voice, around the clock — qualifying budget, part-exchange, and finance in the very first conversation.
- **whatsapp1**: On WhatsApp it replies in seconds, even at midnight — understanding voice notes, searching your stock, and sending real cars with real prices.
- **whatsapp2**: Then it qualifies the buyer right in the chat — finance, deposit, part-exchange — and books the test drive before the conversation ends.
- **followup**: And when a lead goes quiet, CarPass doesn't. Perfectly timed follow-ups by SMS and email bring buyers back — automatically.
- **website**: On your website, visitors chat or start a voice call — and the AI answers instantly, every time.
- **funnel**: Every conversation runs one proven funnel — answer, qualify, follow up, sell — trained on real car-buying interactions and synced straight to your CRM.
- **globe**: From independent dealers to national OEMs and finance companies — one platform, every market, twenty-four seven.
- **cta**: CarPass AI. Never lose a customer again. Book your demo at carpass.ai.

Stale clips to delete: omni, phone, whatsapp, booking, automation (per voice dir).

## Motion upgrades

- 0.6s cross-dissolve + vertical drift between all scenes (render window extends ±0.3s past span)
- Per-word staggered kinetic type (expo easing) on hook/promise/cta
- SVG monogram stroke draw-on in intro
- Travelling light sweep across glass cards
- Phone bezel + status bar frames around WhatsApp and SMS mockups
- Two large slow-drifting gradient orbs added behind particles (radial transparency, no blur)
- Remove dead `CarArt` component

## Architecture (unchanged)

Single RAF clock (`useClock`) → `TL` spans → per-scene `p`. Audio: music bed + per-scene VO keyed by `VO_KEYS`, dual voice cache (v1/v2), settings FAB, click-to-play overlay. `DURATION = 118`.

## Chrome / meta

- index.html: title "CarPass.ai — Never lose a customer again", favicon `/carpass-logo.png`, theme-color `#04060B`
- Click-to-play overlay: monogram + "CarPass.ai" + slogan
- CTA contact line: "Book a demo at carpass.ai" (replaces samy@matchedby.com)

## Delivery

1. Rewrite `src/App.jsx`; update `index.html`
2. `scripts/generate-vo.mjs` → 22 clips via ElevenLabs API (key via env var, not committed)
3. `npm run build` verification; commit; push; trigger Coolify deploy (app uuid `o8dfrpw3dpy1tko3076waohj`)
