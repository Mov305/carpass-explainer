import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useMotionValue } from "framer-motion";

/* ============================================================
   matchedby.com — Timed SaaS Explainer "Video"
   Logo morph intro → feature scenes → CTA
   Dark, multi-gradient (teal → violet → blue), Motion-driven
   ============================================================ */

const C = {
  bg: "#06080D",
  ink: "#EAF2FF",
  dim: "#8A97AD",
  teal: "#22E0C8",
  violet: "#8B5CF6",
  blue: "#3B82F6",
  green: "#25D366",
  wa: "#0B141A",
  waPanel: "#1F2C33",
  waBubbleIn: "#1F2C33",
  waBubbleOut: "#005C4B",
};

const FONT =
  "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

/* ---- master timeline (seconds) ---- */
const TL = {
  logo: [0, 8],
  hook: [8, 16],
  omni: [16, 25],
  phone: [25, 35],
  whatsapp: [35, 46],
  website: [46, 54],
  booking: [54, 62],
  automation: [62, 69],
  cta: [69, 78],
};
const DURATION = 78;

const active = (now, [s, e]) => now >= s && now < e;
const local = (now, [s, e]) => Math.max(0, Math.min(1, (now - s) / (e - s)));
const easeOut = (p) => 1 - Math.pow(1 - p, 3);
const easeInOut = (p) => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2);
const clamp01 = (v) => Math.max(0, Math.min(1, v));

/* ============================================================
   Vector car (premium, copyright-free) — studio side profile
   ============================================================ */
function CarArt() {
  return (
    <svg viewBox="0 0 200 110" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="cbody" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3a4a55" />
          <stop offset="1" stopColor="#11181d" />
        </linearGradient>
        <linearGradient id="cglass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#9fb4c2" />
          <stop offset="1" stopColor="#4a5b66" />
        </linearGradient>
        <radialGradient id="cfloor" cx="0.5" cy="0.5" r="0.6">
          <stop offset="0" stopColor="#1b2630" />
          <stop offset="1" stopColor="#1b2630" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="100" cy="96" rx="80" ry="9" fill="url(#cfloor)" />
      <path
        d="M18 78 Q20 60 40 56 L66 40 Q74 34 92 33 L132 33 Q150 34 160 46 L182 56 Q190 60 188 74 L188 80 Q188 84 182 84 L24 84 Q18 84 18 78 Z"
        fill="url(#cbody)"
        stroke="#46586a"
        strokeWidth="0.8"
      />
      <path d="M70 42 Q76 37 90 37 L126 37 Q142 38 150 47 L150 52 L70 52 Z" fill="url(#cglass)" opacity="0.9" />
      <path d="M108 38 L108 52" stroke="#11181d" strokeWidth="1.4" />
      {[58, 150].map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy="84" r="15" fill="#0b0f12" />
          <circle cx={cx} cy="84" r="8" fill="#2a3942" />
          <circle cx={cx} cy="84" r="3" fill="#5b6f7d" />
        </g>
      ))}
      <path d="M40 57 Q90 50 168 60" stroke="#7d93a3" strokeWidth="1" fill="none" opacity="0.5" />
    </svg>
  );
}

/* ============================================================
   Master clock — drives the whole "video"
   ============================================================ */
function useClock(playing) {
  const t = useMotionValue(0);
  const [, force] = useState(0);
  const raf = useRef();
  const last = useRef(null);
  useEffect(() => {
    if (!playing) return;
    const loop = (now) => {
      if (last.current == null) last.current = now;
      const dt = (now - last.current) / 1000;
      last.current = now;
      let nt = t.get() + dt;
      if (nt > DURATION) nt = 0;
      t.set(nt);
      force((n) => n + 1);
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf.current);
      last.current = null;
    };
  }, [playing, t]);
  return t;
}

/* ============================================================
   SCENE: Logo morph intro
   ============================================================ */
function LogoIntro({ p }) {
  const drift = easeInOut(Math.min(p / 0.45, 1));
  const merge = clamp01((p - 0.4) / 0.25);
  const zoom = clamp01((p - 0.62) / 0.3);
  const textIn = clamp01((p - 0.5) / 0.3);
  const fade = clamp01((p - 0.9) / 0.1);

  const gap = 220 * (1 - drift);
  const scale = 1 + easeInOut(zoom) * 6;
  const radius = 150 + merge * 30;

  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", opacity: 1 - fade }}>
      <div style={{ position: "relative", width: 600, height: 600, transform: `scale(${scale})` }}>
        <svg viewBox="0 0 600 600" width="100%" height="100%">
          <defs>
            <radialGradient id="g1" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stopColor={C.teal} />
              <stop offset="1" stopColor={C.blue} />
            </radialGradient>
            <radialGradient id="g2" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stopColor={C.violet} />
              <stop offset="1" stopColor={C.blue} />
            </radialGradient>
            <filter id="soft">
              <feGaussianBlur stdDeviation="6" />
            </filter>
          </defs>
          <g style={{ mixBlendMode: "screen" }}>
            <circle cx={300 - gap / 2} cy="300" r={radius} fill="url(#g1)" opacity={0.92} filter="url(#soft)" />
            <circle cx={300 + gap / 2} cy="300" r={radius} fill="url(#g2)" opacity={0.92} filter="url(#soft)" />
          </g>
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", opacity: textIn * (1 - zoom), transform: `scale(${0.9 + textIn * 0.1})` }}>
          <span style={{ fontFamily: FONT, fontWeight: 800, fontSize: 60, letterSpacing: -2, color: "#fff", textShadow: "0 2px 30px rgba(0,0,0,0.5)" }}>
            matched<span style={{ color: C.teal }}>by</span>
            <span style={{ color: C.dim, fontWeight: 600 }}>.com</span>
          </span>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   SCENE: Hook
   ============================================================ */
function Hook({ p }) {
  const lines = ["Every unanswered", "message is a", "lost customer."];
  return (
    <Center>
      <Kicker p={p}>THE AI AGENT PLATFORM</Kicker>
      <h1 style={{ fontSize: "clamp(2.4rem,6vw,5rem)", fontWeight: 800, lineHeight: 1.04, letterSpacing: -2, margin: 0 }}>
        {lines.map((l, i) => {
          const lp = clamp01((p - 0.1 - i * 0.12) / 0.4);
          return (
            <span key={i} style={{ display: "block", opacity: lp, filter: `blur(${(1 - lp) * 10}px)`, transform: `translateY(${(1 - easeOut(lp)) * 40}px)`, color: i === 2 ? C.teal : C.ink }}>
              {l}
            </span>
          );
        })}
      </h1>
      <Sub p={p} delay={0.6}>matchedby.com answers every one — phone, WhatsApp & web, 24/7.</Sub>
    </Center>
  );
}

/* ============================================================
   SCENE: Omnichannel
   ============================================================ */
function Omni({ p }) {
  const channels = [
    { icon: "📞", label: "Phone", sub: "Inbound & outbound" },
    { icon: "💬", label: "WhatsApp", sub: "Voice & chat" },
    { icon: "🌐", label: "Website", sub: "Call or chat on-site" },
  ];
  const corePop = Math.min(p / 0.25, 1);
  return (
    <Center wide>
      <H2 p={p}>One AI agent. <span style={{ color: C.teal }}>Every channel.</span></H2>
      <div style={{ position: "relative", height: 360, marginTop: 30, width: "100%" }}>
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 0 }}>
          {channels.map((c, i) => {
            const cp = clamp01((p - 0.3 - i * 0.12) / 0.4);
            const angle = (i / 3) * Math.PI * 2 - Math.PI / 2;
            return (
              <line key={i} x1="50%" y1="50%" x2={`calc(50% + ${Math.cos(angle) * 250 * easeOut(cp)}px)`} y2={`calc(50% + ${Math.sin(angle) * 120 * easeOut(cp)}px)`} stroke={C.teal} strokeWidth="1" opacity={cp * 0.4} />
            );
          })}
        </svg>
        <div style={{ position: "absolute", left: "50%", top: "50%", transform: `translate(-50%,-50%) scale(${easeOut(corePop)})`, width: 140, height: 140, borderRadius: "50%", background: `conic-gradient(from 0deg, ${C.teal}, ${C.violet}, ${C.blue}, ${C.teal})`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, boxShadow: `0 0 80px ${C.violet}66`, zIndex: 2 }}>
          <div style={{ width: 122, height: 122, borderRadius: "50%", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>AI Agent</div>
        </div>
        {channels.map((c, i) => {
          const cp = clamp01((p - 0.3 - i * 0.12) / 0.4);
          const angle = (i / 3) * Math.PI * 2 - Math.PI / 2;
          const x = Math.cos(angle) * 250 * easeOut(cp);
          const y = Math.sin(angle) * 120 * easeOut(cp);
          return (
            <div key={c.label} style={{ position: "absolute", left: "50%", top: "50%", marginLeft: -95, marginTop: -55, width: 190, padding: "18px 14px", borderRadius: 18, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(8px)", textAlign: "center", opacity: cp, transform: `translate(${x}px,${y}px)` }}>
              <div style={{ fontSize: 30 }}>{c.icon}</div>
              <div style={{ fontWeight: 700, marginTop: 6 }}>{c.label}</div>
              <div style={{ fontSize: 12, color: C.dim }}>{c.sub}</div>
            </div>
          );
        })}
      </div>
    </Center>
  );
}

/* ============================================================
   SCENE: Phone call demo
   ============================================================ */
function PhoneDemo({ p }) {
  const transcript = [
    { who: "ai", t: "Hi, this is Ava from Carpass — is now a good time?" },
    { who: "user", t: "Sure, go ahead." },
    { who: "ai", t: "Great. I've got a 2022 BMW 1 Series that fits your budget." },
    { who: "user", t: "Sounds good, can you book me a viewing?" },
    { who: "ai", t: "Done — Thursday at 2pm. I'll text you the details." },
  ];
  const ring = Math.sin(p * Math.PI * 8) * 0.5 + 0.5;
  return (
    <Center wide>
      <Row>
        <SideCopy kicker="PHONE · AI VOICE" title="Real phone calls, handled by AI." body="Inbound and outbound calls on real numbers. The agent talks naturally, qualifies leads, and books — no human in the loop." p={p} />
        <div style={{ width: 300, borderRadius: 30, background: "linear-gradient(160deg,#0d1320,#070a11)", border: "1px solid rgba(255,255,255,0.08)", padding: 24, boxShadow: "0 30px 80px rgba(0,0,0,0.6)" }}>
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <div style={{ width: 76, height: 76, borderRadius: "50%", margin: "0 auto", background: `conic-gradient(from 0deg, ${C.teal}, ${C.violet}, ${C.blue})`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 ${20 + ring * 30}px ${C.teal}aa` }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#0d1320", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>📞</div>
            </div>
            <div style={{ marginTop: 12, fontWeight: 700 }}>AI Agent · Ava</div>
            <div style={{ color: C.teal, fontSize: 12 }}>● Live call · 00:{String(Math.floor(p * 40)).padStart(2, "0")}</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {transcript.map((m, i) =>
              p > 0.18 + i * 0.15 ? (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ alignSelf: m.who === "ai" ? "flex-start" : "flex-end", maxWidth: "85%", padding: "8px 12px", borderRadius: 14, fontSize: 12.5, lineHeight: 1.4, background: m.who === "ai" ? "rgba(34,224,200,0.12)" : "rgba(139,92,246,0.18)", border: `1px solid ${m.who === "ai" ? C.teal + "44" : C.violet + "44"}` }}>
                  {m.t}
                </motion.div>
              ) : null
            )}
          </div>
        </div>
      </Row>
    </Center>
  );
}

/* ============================================================
   SCENE: WhatsApp
   ============================================================ */
function WaWave({ color = "#8fd3c4", n = 24 }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 2, height: 20, flex: 1 }}>
      {Array.from({ length: n }).map((_, i) => {
        const h = 4 + ((i * 13) % 14);
        return <motion.span key={i} style={{ width: 2, borderRadius: 2, background: color }} animate={{ height: [h, h + 8, h] }} transition={{ duration: 0.8, repeat: Infinity, delay: (i % 5) * 0.1 }} />;
      })}
    </div>
  );
}
function Time({ children, mine }) {
  return <div style={{ fontSize: 9, color: "#8696A0", textAlign: "right", marginTop: 2 }}>{children} {mine && <span style={{ color: "#53bdeb" }}>✓✓</span>}</div>;
}
function WhatsApp({ p }) {
  const step = p < 0.15 ? 0 : p < 0.3 ? 1 : p < 0.45 ? 2 : p < 0.62 ? 3 : 4;
  const cars = [
    { price: "10,495", spec: "105,580 mi · 2022" },
    { price: "12,795", spec: "72,300 mi · 2021" },
  ];
  return (
    <Center wide>
      <Row>
        <SideCopy kicker="WHATSAPP · 24/7" title="Lives where your customers already are." body="Two-way voice and chat on WhatsApp. Understands intent, searches inventory, sends rich cards — and never misses a message." p={p} />
        <div style={{ width: 340, background: C.wa, borderRadius: 14, overflow: "hidden", border: "1px solid #223039", boxShadow: "0 30px 80px rgba(0,0,0,0.6)", backgroundImage: "radial-gradient(rgba(255,255,255,0.015) 1px, transparent 1px)", backgroundSize: "18px 18px" }}>
          <div style={{ background: C.waPanel, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#2A3942", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>👤</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 14, color: "#E9EDEF" }}>Carpass ai agents</div>
              <div style={{ fontSize: 11, color: "#8696A0" }}>online</div>
            </div>
            <span style={{ color: "#8696A0", fontSize: 13 }}>🔍&nbsp;&nbsp;⋮</span>
          </div>
          <div style={{ padding: 12, minHeight: 440, display: "flex", flexDirection: "column", gap: 8 }}>
            <AnimatePresence>
              {step >= 1 && (
                <motion.div key="v1" initial={{ opacity: 0, scale: 0.9, x: 20 }} animate={{ opacity: 1, scale: 1, x: 0 }} style={{ alignSelf: "flex-end", width: "82%" }}>
                  <div style={{ background: C.waBubbleOut, borderRadius: "8px 8px 0 8px", padding: "8px 10px", display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ color: "#fff", fontSize: 16 }}>▶</span>
                    <WaWave />
                    <span style={{ fontSize: 10, color: "#8fd3c4" }}>0:03</span>
                  </div>
                  <Time mine>15:53</Time>
                </motion.div>
              )}
              {step >= 2 && (
                <motion.div key="t1" initial={{ opacity: 0, scale: 0.9, x: -20 }} animate={{ opacity: 1, scale: 1, x: 0 }} style={{ alignSelf: "flex-start", maxWidth: "85%" }}>
                  <div style={{ background: C.waBubbleIn, borderRadius: "8px 8px 8px 0", padding: "8px 11px", color: "#E9EDEF", fontSize: 13.5 }}>Here are the vehicles matching your search:</div>
                </motion.div>
              )}
              {step >= 3 && (
                <motion.div key="cards" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ display: "flex", gap: 8 }}>
                  {cars.map((car, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.15 }} style={{ flex: 1, background: C.waBubbleIn, borderRadius: 8, overflow: "hidden" }}>
                      <div style={{ height: 70, background: "linear-gradient(135deg,#2A3942,#11181d)" }}><CarArt /></div>
                      <div style={{ padding: 8, fontSize: 11, color: "#E9EDEF" }}>
                        1 Series <span style={{ color: C.green, fontWeight: 700 }}>£{car.price}</span>
                        <div style={{ color: "#8696A0", marginTop: 2, fontSize: 10 }}>{car.spec}</div>
                        <div style={{ color: C.green, marginTop: 6, fontWeight: 600, fontSize: 11 }}>⧉ View Details</div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
              {step >= 4 && (
                <motion.div key="t2" initial={{ opacity: 0, scale: 0.9, x: -20 }} animate={{ opacity: 1, scale: 1, x: 0 }} style={{ alignSelf: "flex-start", maxWidth: "90%" }}>
                  <div style={{ background: C.waBubbleIn, borderRadius: "8px 8px 8px 0", padding: "8px 11px", color: "#E9EDEF", fontSize: 12.5, lineHeight: 1.5 }}>
                    Okay, I've found a few black BMW 1 Series for you. First up, a <span style={{ color: C.green }}>2022</span> 1.5 118i SE for £10,495. Any of those catch your eye?
                  </div>
                  <Time>15:53</Time>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div style={{ background: C.waPanel, padding: "8px 12px", display: "flex", alignItems: "center", gap: 8, color: "#8696A0" }}>
            <span>＋</span>
            <div style={{ flex: 1, background: "#2A3942", borderRadius: 20, padding: "7px 12px", fontSize: 12 }}>Type a message</div>
            <span>🎤</span>
          </div>
        </div>
      </Row>
    </Center>
  );
}

/* ============================================================
   SCENE: Website chat widget
   ============================================================ */
function Website({ p }) {
  const msgs = [
    { who: "user", t: "Do you have any black 1 Series in stock?" },
    { who: "ai", t: "Yes — 3 in stock. Want me to call you now or send details?" },
    { who: "user", t: "Call me 🙂" },
  ];
  const step = Math.floor(p * 6);
  return (
    <Center wide>
      <Row>
        <div style={{ width: 380, height: 300, borderRadius: 16, background: "linear-gradient(160deg,#0e1422,#0a0d16)", border: "1px solid rgba(255,255,255,0.07)", position: "relative", overflow: "hidden", boxShadow: "0 30px 80px rgba(0,0,0,0.6)" }}>
          <div style={{ padding: 16, display: "flex", gap: 8, alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ff5f57" }} />
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#febc2e" }} />
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#28c840" }} />
            <div style={{ marginLeft: 10, fontSize: 11, color: C.dim }}>carpass.com</div>
          </div>
          <div style={{ padding: 20 }}>
            <div style={{ width: "60%", height: 14, borderRadius: 6, background: "rgba(255,255,255,0.08)" }} />
            <div style={{ width: "85%", height: 10, borderRadius: 6, background: "rgba(255,255,255,0.05)", marginTop: 12 }} />
            <div style={{ width: "75%", height: 10, borderRadius: 6, background: "rgba(255,255,255,0.05)", marginTop: 8 }} />
          </div>
          <motion.div initial={{ opacity: 0, y: 30, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: "spring", stiffness: 140 }} style={{ position: "absolute", right: 16, bottom: 16, width: 230, borderRadius: 16, background: "#0d1320", border: `1px solid ${C.teal}44`, overflow: "hidden", boxShadow: `0 10px 40px ${C.teal}33` }}>
            <div style={{ padding: "10px 12px", background: `linear-gradient(90deg,${C.teal}22,${C.violet}22)`, fontSize: 12, fontWeight: 700 }}>💬 Chat with us</div>
            <div style={{ padding: 10, display: "flex", flexDirection: "column", gap: 6, minHeight: 120 }}>
              {msgs.map((m, i) => (step > i ? <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ alignSelf: m.who === "ai" ? "flex-start" : "flex-end", maxWidth: "85%", padding: "6px 9px", borderRadius: 10, fontSize: 11, background: m.who === "ai" ? "rgba(34,224,200,0.14)" : "rgba(139,92,246,0.18)" }}>{m.t}</motion.div> : null))}
            </div>
          </motion.div>
        </div>
        <SideCopy kicker="WEBSITE WIDGET" title="Call or chat, right on your site." body="Drop the agent onto any website. Visitors chat instantly or start a voice call — and the AI picks up every time." p={p} left />
      </Row>
    </Center>
  );
}

/* ============================================================
   SCENE: Booking
   ============================================================ */
function Booking({ p }) {
  const slots = [
    { d: "Mon", t: "10:00", b: 0 },
    { d: "Tue", t: "14:30", b: 1 },
    { d: "Wed", t: "09:00", b: 0 },
    { d: "Thu", t: "16:00", b: 1 },
    { d: "Fri", t: "11:30", b: 1 },
  ];
  return (
    <Center wide>
      <Row>
        <div style={{ width: 320, borderRadius: 20, padding: 22, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(8px)" }}>
          <div style={{ fontWeight: 700, marginBottom: 14, display: "flex", justifyContent: "space-between" }}>
            <span>📅 May 2026</span>
            <span style={{ color: C.teal, fontSize: 12 }}>Auto-booking</span>
          </div>
          {slots.map((s, i) => {
            const show = p > 0.15 + i * 0.1;
            const booked = s.b && p > 0.35 + i * 0.1;
            return (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 13px", borderRadius: 12, marginBottom: 7, opacity: show ? 1 : 0, transform: show ? "none" : "translateX(-12px)", transition: "all .4s", background: booked ? "rgba(34,224,200,0.12)" : "rgba(255,255,255,0.02)", border: `1px solid ${booked ? C.teal + "55" : "rgba(255,255,255,0.06)"}` }}>
                <span style={{ color: C.dim, fontSize: 13 }}>{s.d} · {s.t}</span>
                {booked ? <span style={{ color: C.teal, fontSize: 12, fontWeight: 700 }}>✓ Booked</span> : <span style={{ color: "#3A4A44", fontSize: 12 }}>Open</span>}
              </div>
            );
          })}
        </div>
        <SideCopy kicker="BOOKING SYSTEM" title="It books the appointment for you." body="The agent collects availability mid-conversation, writes it to your calendar, then syncs the booking to your CRM automatically." p={p} left />
      </Row>
    </Center>
  );
}

/* ============================================================
   SCENE: Automation flow
   ============================================================ */
function Automation({ p }) {
  const nodes = ["Call ends", "AI extracts data", "Workflow runs", "CRM updated"];
  return (
    <Center wide>
      <H2 p={p}>Then it <span style={{ color: C.teal }}>automates the rest.</span></H2>
      <Sub p={p} delay={0.2}>Every conversation triggers your workflow — data flows into any system, instantly.</Sub>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flexWrap: "wrap", gap: 6, marginTop: 50 }}>
        {nodes.map((n, i) => (
          <React.Fragment key={n}>
            <div style={{ padding: "16px 20px", borderRadius: 14, fontWeight: 600, fontSize: 14, background: "rgba(255,255,255,0.04)", border: `1px solid ${C.teal}44`, opacity: p > 0.2 + i * 0.18 ? 1 : 0, transform: p > 0.2 + i * 0.18 ? "scale(1)" : "scale(0.8)", transition: "all .4s" }}>{n}</div>
            {i < nodes.length - 1 && <div style={{ width: 28, height: 2, background: C.teal, opacity: p > 0.28 + i * 0.18 ? 1 : 0, transform: `scaleX(${p > 0.28 + i * 0.18 ? 1 : 0})`, transformOrigin: "left", transition: "all .3s" }} />}
          </React.Fragment>
        ))}
      </div>
    </Center>
  );
}

/* ============================================================
   SCENE: CTA
   ============================================================ */
function CTA({ p }) {
  const stats = [
    { to: 100000, suf: "+", label: "calls without hiring" },
    { to: 24, suf: "/7", label: "always on" },
    { to: 5, suf: "", label: "channels, one agent" },
  ];
  return (
    <Center>
      <div style={{ display: "flex", gap: 40, justifyContent: "center", flexWrap: "wrap", marginBottom: 50 }}>
        {stats.map((s, i) => {
          const lp = clamp01((p - 0.1 - i * 0.1) / 0.5);
          return (
            <div key={i} style={{ opacity: lp }}>
              <div style={{ fontSize: "clamp(2.2rem,5vw,3.4rem)", fontWeight: 800, background: `linear-gradient(90deg,${C.teal},${C.violet})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                {Math.floor(easeOut(lp) * s.to).toLocaleString()}{s.suf}
              </div>
              <div style={{ color: C.dim, fontSize: 13, maxWidth: 150, margin: "6px auto 0" }}>{s.label}</div>
            </div>
          );
        })}
      </div>
      <h2 style={{ fontSize: "clamp(2rem,5vw,4rem)", fontWeight: 800, letterSpacing: -1.5, margin: 0, opacity: Math.min(p / 0.3, 1) }}>
        One platform.<br /><span style={{ color: C.teal }}>Zero missed opportunities.</span>
      </h2>
      <div style={{ marginTop: 36, opacity: clamp01((p - 0.4) / 0.3) }}>
        <span style={{ display: "inline-block", padding: "15px 38px", borderRadius: 100, background: `linear-gradient(90deg,${C.teal},${C.violet})`, color: "#04110C", fontWeight: 800, fontSize: 18 }}>matchedby.com</span>
        <div style={{ color: C.dim, marginTop: 16, fontSize: 14 }}>samy@matchedby.com</div>
      </div>
    </Center>
  );
}

/* ============================================================
   Shared layout helpers
   ============================================================ */
function Center({ children, wide }) {
  return <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: 40 }}><div style={{ width: "100%", maxWidth: wide ? 1100 : 860 }}>{children}</div></div>;
}
function Row({ children }) {
  return <div style={{ display: "flex", gap: 56, alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>{children}</div>;
}
function Kicker({ children, p }) {
  return <div style={{ color: C.teal, fontSize: 13, letterSpacing: 3, marginBottom: 26, opacity: Math.min(p / 0.2, 1) }}>{children}</div>;
}
function H2({ children, p }) {
  const lp = Math.min(p / 0.25, 1);
  return <h2 style={{ fontSize: "clamp(1.8rem,4.5vw,3.4rem)", fontWeight: 800, letterSpacing: -1.2, margin: 0, opacity: lp, transform: `translateY(${(1 - lp) * 30}px)` }}>{children}</h2>;
}
function Sub({ children, p, delay = 0 }) {
  const lp = clamp01((p - delay) / 0.4);
  return <p style={{ color: C.dim, fontSize: "clamp(1rem,2vw,1.25rem)", marginTop: 22, maxWidth: 560, marginLeft: "auto", marginRight: "auto", opacity: lp }}>{children}</p>;
}
function SideCopy({ kicker, title, body, p, left }) {
  const lp = Math.min(p / 0.3, 1);
  return (
    <div style={{ maxWidth: 400, textAlign: "left", opacity: lp, transform: `translateX(${(1 - easeOut(lp)) * (left ? 40 : -40)}px)` }}>
      <div style={{ color: C.teal, fontSize: 13, letterSpacing: 2, marginBottom: 14 }}>{kicker}</div>
      <h2 style={{ fontSize: "clamp(1.6rem,3.5vw,2.6rem)", fontWeight: 800, letterSpacing: -1, margin: 0, lineHeight: 1.1 }}>{title}</h2>
      <p style={{ color: C.dim, fontSize: "1.05rem", marginTop: 16, lineHeight: 1.6 }}>{body}</p>
    </div>
  );
}

/* ============================================================
   Animated gradient background
   ============================================================ */
function Backdrop({ t }) {
  const x1 = 30 + Math.sin(t * 0.3) * 20;
  const y1 = 30 + Math.cos(t * 0.25) * 20;
  const x2 = 70 + Math.cos(t * 0.2) * 20;
  const y2 = 60 + Math.sin(t * 0.35) * 15;
  return <div style={{ position: "absolute", inset: 0, background: `radial-gradient(40% 50% at ${x1}% ${y1}%, ${C.violet}22, transparent), radial-gradient(45% 55% at ${x2}% ${y2}%, ${C.teal}1c, transparent), ${C.bg}`, zIndex: 0 }} />;
}

/* ============================================================
   ROOT — the player
   ============================================================ */
export default function App() {
  const [playing, setPlaying] = useState(true);
  const t = useClock(playing);
  const now = t.get();

  const scenes = [
    ["logo", LogoIntro],
    ["hook", Hook],
    ["omni", Omni],
    ["phone", PhoneDemo],
    ["whatsapp", WhatsApp],
    ["website", Website],
    ["booking", Booking],
    ["automation", Automation],
    ["cta", CTA],
  ];

  const restart = () => {
    t.set(0);
    setPlaying(true);
  };

  return (
    <div style={{ fontFamily: FONT, color: C.ink }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap'); * { box-sizing: border-box; }`}</style>
      <div style={{ position: "relative", width: "100%", aspectRatio: "16 / 9", maxWidth: 1280, margin: "0 auto", borderRadius: 16, overflow: "hidden", background: C.bg, boxShadow: "0 40px 120px rgba(0,0,0,0.6)" }}>
        <Backdrop t={now} />
        {scenes.map(([key, Comp]) => {
          const span = TL[key];
          if (!active(now, span)) return null;
          return <div key={key} style={{ position: "absolute", inset: 0, zIndex: 1 }}><Comp p={local(now, span)} /></div>;
        })}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 4, background: "rgba(255,255,255,0.08)", zIndex: 5 }}>
          <div style={{ height: "100%", width: `${(now / DURATION) * 100}%`, background: `linear-gradient(90deg,${C.teal},${C.violet})` }} />
        </div>
      </div>
      <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 16 }}>
        <button onClick={() => setPlaying((v) => !v)} style={btn}>{playing ? "⏸ Pause" : "▶ Play"}</button>
        <button onClick={restart} style={btn}>↻ Restart</button>
        <div style={{ color: C.dim, alignSelf: "center", fontSize: 13 }}>{now.toFixed(1)}s / {DURATION}s</div>
      </div>
    </div>
  );
}

const btn = { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#EAF2FF", padding: "8px 18px", borderRadius: 100, fontSize: 14, cursor: "pointer", fontFamily: FONT };
