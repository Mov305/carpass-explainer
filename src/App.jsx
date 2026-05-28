import React, { useEffect, useRef, useState, useMemo } from "react";
import { motion, AnimatePresence, useMotionValue } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";

const C = {
  bg: "#04060B", card: "#0A0F1A", ink: "#EAF2FF", dim: "#6B7A90", muted: "#3A4558",
  teal: "#22E0C8", violet: "#8B5CF6", blue: "#3B82F6", pink: "#D946EF", green: "#25D366",
  border: "rgba(255,255,255,0.08)", wa: "#0B141A", waPanel: "#1F2C33",
  waBubbleIn: "#1F2C33", waBubbleOut: "#005C4B",
};
const FONT = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
const DISPLAY = "'Plus Jakarta Sans', 'Inter', sans-serif";

const TL = {
  logo: [0, 8], hook: [8, 19], omni: [19, 28], phone: [28, 38],
  whatsapp: [38, 49], website: [49, 57], booking: [57, 65],
  automation: [65, 74], globe: [74, 84], cta: [84, 95],
};
const DURATION = 95;

const active = (now, [s, e]) => now >= s && now < e;
const local = (now, [s, e]) => Math.max(0, Math.min(1, (now - s) / (e - s)));
const easeOut = (p) => 1 - Math.pow(1 - p, 3);
const easeInOut = (p) => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2);
const clamp01 = (v) => Math.max(0, Math.min(1, v));
const lerp = (a, b, t) => a + (b - a) * t;

/* ---- SVG Icons ---- */
const I = {
  Phone: ({ s = 24, c = C.teal }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.362 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0122 16.92z" /></svg>,
  Chat: ({ s = 24, c = C.green }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" /></svg>,
  Globe: ({ s = 24, c = C.blue }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M2 12h20" /><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" /></svg>,
  Calendar: ({ s = 24, c = C.violet }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>,
  Zap: ({ s = 24, c = C.teal }) => <svg width={s} height={s} viewBox="0 0 24 24" fill={c} stroke="none"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>,
  Check: ({ s = 16, c = C.teal }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>,
  Arrow: ({ s = 18, c = C.dim }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5l7 7-7 7" /></svg>,
  Mic: ({ s = 18, c = C.teal }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" /><path d="M19 10v2a7 7 0 01-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" /></svg>,
  Database: ({ s = 24, c = C.blue }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" /><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" /></svg>,
};

/* ---- UI primitives ---- */
const GlassCard = ({ children, style, gradient }) => (
  <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, position: "relative", overflow: "hidden", ...style }}>
    {gradient && <div style={{ position: "absolute", top: -1, left: -1, right: -1, height: 2, background: `linear-gradient(90deg, ${C.teal}, ${C.violet}, ${C.blue})` }} />}
    {children}
  </div>
);
const Badge = ({ children, color = C.teal }) => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 14px", borderRadius: 100, background: `${color}14`, border: `1px solid ${color}33`, color, fontSize: 12, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" }}>{children}</span>
);
const Pill = ({ children, active: a }) => (
  <span style={{ padding: "6px 16px", borderRadius: 8, background: a ? `${C.teal}18` : "rgba(255,255,255,0.03)", border: `1px solid ${a ? C.teal + "44" : C.border}`, color: a ? C.teal : C.dim, fontSize: 13, fontWeight: 600, transition: "all .3s" }}>{children}</span>
);

function CarArt() {
  return (
    <svg viewBox="0 0 200 110" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
      <defs><linearGradient id="cbody" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3a4a55" /><stop offset="1" stopColor="#11181d" /></linearGradient><linearGradient id="cglass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#9fb4c2" /><stop offset="1" stopColor="#4a5b66" /></linearGradient></defs>
      <path d="M18 78 Q20 60 40 56 L66 40 Q74 34 92 33 L132 33 Q150 34 160 46 L182 56 Q190 60 188 74 L188 80 Q188 84 182 84 L24 84 Q18 84 18 78 Z" fill="url(#cbody)" stroke="#46586a" strokeWidth="0.8" />
      <path d="M70 42 Q76 37 90 37 L126 37 Q142 38 150 47 L150 52 L70 52 Z" fill="url(#cglass)" opacity="0.9" />
      <path d="M108 38 L108 52" stroke="#11181d" strokeWidth="1.4" />
      {[58, 150].map(cx => <g key={cx}><circle cx={cx} cy="84" r="15" fill="#0b0f12" /><circle cx={cx} cy="84" r="8" fill="#2a3942" /><circle cx={cx} cy="84" r="3" fill="#5b6f7d" /></g>)}
    </svg>
  );
}

/* ---- Clock ---- */
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
    return () => { cancelAnimationFrame(raf.current); last.current = null; };
  }, [playing, t]);
  return t;
}

/* ---- Floating particles ---- */
function Particles() {
  const ps = useMemo(() => Array.from({ length: 28 }, (_, i) => ({
    x: (i * 37 + 13) % 100, size: 1.5 + (i % 3), dur: 20 + (i % 7) * 5,
    delay: (i * 2.3) % 18, op: 0.08 + (i % 5) * 0.04,
    color: i % 4 === 0 ? C.teal : i % 4 === 1 ? C.violet : i % 4 === 2 ? C.blue : "rgba(255,255,255,0.5)",
  })), []);
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 0, overflow: "hidden", pointerEvents: "none" }}>
      {ps.map((p, i) => <div key={i} style={{ position: "absolute", left: `${p.x}%`, bottom: "-2%", width: p.size, height: p.size, borderRadius: "50%", background: p.color, opacity: p.op, animation: `pfloat ${p.dur}s linear ${p.delay}s infinite` }} />)}
    </div>
  );
}

/* ---- Logo intro ---- */
function LogoIntro({ p }) {
  const appear = easeOut(clamp01(p / 0.5));
  const drift = easeInOut(clamp01(p / 0.55));
  const expand = easeInOut(clamp01((p - 0.7) / 0.25));
  const fade = clamp01((p - 0.9) / 0.1);
  const size = 38 + expand * 30;
  return (
    <div style={{ position: "absolute", inset: 0, opacity: 1 - fade }}>
      <div style={{ position: "absolute", left: `${-10 + drift * 40}%`, top: `${90 - drift * 45}%`, width: `${size}vw`, height: `${size}vw`, borderRadius: "50%", background: `radial-gradient(circle at 40% 40%, ${C.teal}, #0ea5e9, #06b6d4)`, opacity: appear * 0.15, transform: "translate(-50%,-50%)", mixBlendMode: "screen" }} />
      <div style={{ position: "absolute", left: `${90 - drift * 40}%`, top: `${-10 + drift * 45}%`, width: `${size}vw`, height: `${size}vw`, borderRadius: "50%", background: `radial-gradient(circle at 60% 60%, #d946ef, ${C.violet}, #a855f7)`, opacity: appear * 0.15, transform: "translate(-50%,-50%)", mixBlendMode: "screen" }} />
    </div>
  );
}

/* ---- Persistent logo → CTA button morph ---- */
function PersistentLogo({ now }) {
  const introIn = easeOut(clamp01((now - 3.5) / 2));
  const toCorner = easeInOut(clamp01((now - 7) / 1.5));
  const ctaStart = TL.cta[0];
  const toButton = easeInOut(clamp01((now - ctaStart) / 2.5));

  const cornerL = 3, cornerT = 5, cornerFs = 20;
  const btnL = 50, btnT = 75, btnFs = 20;

  let left, top, tx, ty, fs;
  if (toButton > 0) {
    left = lerp(cornerL, btnL, toButton);
    top = lerp(cornerT, btnT, toButton);
    tx = lerp(0, -50, toButton);
    ty = lerp(0, -50, toButton);
    fs = lerp(cornerFs, btnFs, toButton);
  } else {
    left = lerp(50, cornerL, toCorner);
    top = lerp(50, cornerT, toCorner);
    tx = lerp(-50, 0, toCorner);
    ty = lerp(-50, 0, toCorner);
    fs = lerp(56, cornerFs, toCorner);
  }

  if (introIn <= 0) return null;
  return (
    <div style={{ position: "absolute", left: `${left}%`, top: `${top}%`, transform: `translate(${tx}%,${ty}%)`, zIndex: 10, opacity: introIn, whiteSpace: "nowrap", pointerEvents: "none" }}>
      <div style={{ position: "absolute", inset: `${lerp(0, -18, toButton)}px ${lerp(0, -44, toButton)}px`, borderRadius: lerp(0, 14, toButton), background: `linear-gradient(135deg, ${C.teal}, ${C.violet})`, opacity: toButton }} />
      <span style={{ position: "relative", fontFamily: DISPLAY, fontWeight: 800, fontSize: fs, letterSpacing: -1, color: "#fff" }}>
        matched<span style={{ color: toButton > 0.5 ? "#fff" : C.teal }}>by</span>
        <span style={{ color: toButton > 0.5 ? "rgba(255,255,255,0.7)" : C.dim, fontWeight: 600 }}>.com</span>
      </span>
    </div>
  );
}

/* ============ SCENES ============ */

function Hook({ p }) {
  const lines = ["Every unanswered", "message is a", "lost customer."];
  return (
    <Center>
      <Badge><I.Zap s={14} /> AI AGENT PLATFORM</Badge>
      <h1 style={{ fontFamily: DISPLAY, fontSize: "clamp(2.4rem,5.5vw,4.8rem)", fontWeight: 800, lineHeight: 1.06, letterSpacing: -2, margin: "32px 0 0" }}>
        {lines.map((l, i) => { const lp = clamp01((p - 0.02 - i * 0.07) / 0.15); return <span key={i} style={{ display: "block", opacity: lp, transform: `translateY(${(1 - easeOut(lp)) * 20}px)`, color: i === 2 ? C.teal : C.ink }}>{l}</span>; })}
      </h1>
      <p style={{ color: C.dim, fontSize: "clamp(1rem,2vw,1.2rem)", marginTop: 28, maxWidth: 520, marginLeft: "auto", marginRight: "auto", opacity: clamp01((p - 0.35) / 0.2), lineHeight: 1.7 }}>
        matchedby.com answers every one — phone, WhatsApp & web, 24/7.
      </p>
    </Center>
  );
}

function Omni({ p }) {
  const channels = [
    { icon: I.Phone, label: "Phone", sub: "Inbound & outbound", color: C.teal, x: 0, y: -160 },
    { icon: I.Globe, label: "Website", sub: "Chat & voice on-site", color: C.blue, x: -220, y: 80 },
    { icon: I.Chat, label: "WhatsApp", sub: "Voice & chat", color: C.green, x: 220, y: 80 },
  ];
  const cp0 = easeOut(clamp01(p / 0.2));
  return (
    <Center wide>
      <div style={{ opacity: clamp01(p / 0.15), transform: `translateY(${(1 - clamp01(p / 0.15)) * 20}px)` }}><Badge>OMNICHANNEL</Badge></div>
      <h2 style={{ fontFamily: DISPLAY, fontSize: "clamp(1.8rem,4vw,3.2rem)", fontWeight: 800, letterSpacing: -1, margin: "24px 0 0", opacity: clamp01(p / 0.2) }}>One AI agent. <span style={{ color: C.teal }}>Every channel.</span></h2>
      <div style={{ position: "relative", height: 420, marginTop: 20, width: "100%" }}>
        <div style={{ position: "absolute", left: "50%", top: "50%", transform: `translate(-50%,-50%) scale(${cp0})`, zIndex: 3 }}>
          <div style={{ width: 120, height: 120, borderRadius: "50%", padding: 3, background: `conic-gradient(from 0deg, ${C.teal}, ${C.violet}, ${C.blue}, ${C.teal})` }}>
            <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: C.card, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4 }}>
              <I.Zap s={22} /><span style={{ fontSize: 12, fontWeight: 700 }}>AI Agent</span>
            </div>
          </div>
        </div>
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 1 }}>
          <defs>{channels.map((ch, i) => <linearGradient key={i} id={`lg${i}`} x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor={C.teal} /><stop offset="100%" stopColor={ch.color} /></linearGradient>)}</defs>
          {channels.map((ch, i) => { const cp = easeOut(clamp01((p - 0.25 - i * 0.08) / 0.3)); return <line key={i} x1="50%" y1="50%" x2={`calc(50% + ${ch.x * cp}px)`} y2={`calc(50% + ${ch.y * cp}px)`} stroke={`url(#lg${i})`} strokeWidth="1.5" opacity={cp * 0.4} strokeDasharray="6 4" />; })}
        </svg>
        {channels.map((ch, i) => { const cp = easeOut(clamp01((p - 0.25 - i * 0.08) / 0.3)); const Icon = ch.icon; return (
          <div key={ch.label} style={{ position: "absolute", left: "50%", top: "50%", marginLeft: -90, marginTop: -50, transform: `translate(${ch.x * cp}px,${ch.y * cp}px)`, opacity: cp, zIndex: 2 }}>
            <GlassCard style={{ width: 180, padding: "20px 16px", textAlign: "center" }} gradient>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: `${ch.color}12`, border: `1px solid ${ch.color}33`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}><Icon s={22} c={ch.color} /></div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{ch.label}</div>
              <div style={{ fontSize: 12, color: C.dim, marginTop: 4 }}>{ch.sub}</div>
            </GlassCard>
          </div>
        ); })}
      </div>
    </Center>
  );
}

function PhoneDemo({ p }) {
  const transcript = [
    { who: "ai", t: "Hi, this is Ava from Carpass — is now a good time?" },
    { who: "user", t: "Sure, go ahead." },
    { who: "ai", t: "Great. I've got a 2022 BMW 1 Series that fits your budget." },
    { who: "user", t: "Sounds good, can you book me a viewing?" },
    { who: "ai", t: "Done — Thursday at 2pm. I'll text you the details." },
  ];
  return (
    <Center wide>
      <div style={{ display: "flex", gap: 64, alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
        <SideCopy badge="PHONE · AI VOICE" badgeColor={C.teal} title={<>Real phone calls,<br />handled by <span style={{ color: C.teal }}>AI.</span></>} body="Inbound and outbound calls on real numbers. The agent talks naturally, qualifies leads, and books — no human in the loop." p={p} pills={[{ t: "Qualifies leads", at: 0.3 }, { t: "Books appointments", at: 0.5 }]} />
        <GlassCard style={{ width: 320, borderRadius: 24 }} gradient>
          <div style={{ padding: "20px 20px 12px", borderBottom: `1px solid ${C.border}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, padding: 2, background: `linear-gradient(135deg, ${C.teal}, ${C.violet})` }}>
                <div style={{ width: "100%", height: "100%", borderRadius: 12, background: C.card, display: "flex", alignItems: "center", justifyContent: "center" }}><I.Mic s={22} c={C.teal} /></div>
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>AI Agent · Ava</div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}><div style={{ width: 8, height: 8, borderRadius: "50%", background: C.teal }} /><span style={{ color: C.teal, fontSize: 12, fontWeight: 600 }}>Live · 00:{String(Math.floor(p * 45)).padStart(2, "0")}</span></div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 2, height: 32, marginTop: 16, justifyContent: "center" }}>
              {Array.from({ length: 32 }).map((_, i) => <div key={i} style={{ width: 3, height: Math.max(4, 6 + Math.sin(p * 20 + i * 0.5) * 10 + Math.sin(i * 0.8) * 6), borderRadius: 2, background: `linear-gradient(180deg, ${C.teal}, ${C.violet})`, opacity: 0.5 + Math.sin(p * 15 + i) * 0.4 }} />)}
            </div>
          </div>
          <div ref={el => { if (el) el.scrollTop = el.scrollHeight; }} style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 8, maxHeight: 280, overflowY: "auto" }}>
            {transcript.map((m, i) => p > 0.15 + i * 0.14 ? <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ alignSelf: m.who === "ai" ? "flex-start" : "flex-end", maxWidth: "85%", padding: "10px 14px", borderRadius: 14, fontSize: 13, lineHeight: 1.5, background: m.who === "ai" ? `${C.teal}10` : `${C.violet}14`, border: `1px solid ${m.who === "ai" ? C.teal + "22" : C.violet + "22"}` }}>{m.t}</motion.div> : null)}
          </div>
        </GlassCard>
      </div>
    </Center>
  );
}

function WhatsApp({ p }) {
  const step = p < 0.12 ? 0 : p < 0.26 ? 1 : p < 0.4 ? 2 : p < 0.58 ? 3 : 4;
  const cars = [
    { name: "BMW 118i SE", price: "10,495", spec: "105k mi · 2022", img: "https://bluesky.cdn.imgeng.in/cogstock-images/at-7ce77e3ccca7455e8f3c2297b7e1a133.jpg?imgeng=/w_700/" },
    { name: "BMW 120d Sport", price: "12,795", spec: "72k mi · 2021", img: "https://bluesky.cdn.imgeng.in/cogstock-images/at-9d7c881e31b7455d98275798c9b1d0ae.jpg?imgeng=/w_700/" },
  ];
  const WaBubble = ({ children, out, tail = true }) => (
    <div style={{ alignSelf: out ? "flex-end" : "flex-start", maxWidth: "82%" }}>
      <div style={{ background: out ? "#005C4B" : "#1F2C34", borderRadius: out ? "8px 8px 0 8px" : "8px 8px 8px 0", padding: "6px 8px 4px", color: "#E9EDEF", fontSize: 14.2, lineHeight: 1.35 }}>{children}</div>
    </div>
  );
  return (
    <Center wide>
      <div style={{ display: "flex", gap: 64, alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
        <SideCopy badge="WHATSAPP · 24/7" badgeColor={C.green} title={<>Where your customers <span style={{ color: C.green }}>already are.</span></>} body="Two-way voice and chat on WhatsApp. Understands intent, searches inventory, sends rich cards — never misses a message." p={p} pills={[{ t: "Voice notes", at: 0.3 }, { t: "Rich cards", at: 0.5 }, { t: "Auto-reply", at: 0.7 }]} />
        <div style={{ width: 375, borderRadius: 14, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }}>
          {/* WA Header */}
          <div style={{ background: "#1F2C34", padding: "6px 10px", display: "flex", alignItems: "center", gap: 8 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8696A0" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#2A3942", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="#8696A0"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 500, fontSize: 16.5, color: "#E9EDEF", letterSpacing: 0 }}>Carpass AI</div>
              <div style={{ fontSize: 13, color: "#8696A0", marginTop: 1 }}>online</div>
            </div>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8696A0" strokeWidth="2" strokeLinecap="round"><path d="M23 7l-7 5 7 5z" /><rect x="1" y="5" width="15" height="14" rx="2" /></svg>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8696A0" strokeWidth="2" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.11 2 2 0 014.11 2h3" /></svg>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="#8696A0"><circle cx="12" cy="6" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="18" r="1.5" /></svg>
          </div>
          {/* Chat body */}
          <div ref={el => { if (el) el.scrollTop = el.scrollHeight; }} style={{ padding: "8px 12px", height: 440, overflowY: "auto", display: "flex", flexDirection: "column", gap: 3, background: "#0B141A", backgroundImage: "radial-gradient(rgba(255,255,255,0.012) 1px, transparent 1px)", backgroundSize: "20px 20px" }}>
            {/* Date chip */}
            <div style={{ textAlign: "center", margin: "4px 0 6px" }}><span style={{ background: "#182229", color: "#8696A0", fontSize: 12, padding: "4px 12px", borderRadius: 8 }}>TODAY</span></div>
            <AnimatePresence>
              {step >= 1 && <motion.div key="v1" initial={{ opacity: 0, scale: 0.95, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} style={{ alignSelf: "flex-end", maxWidth: "75%" }}>
                <div style={{ background: "#005C4B", borderRadius: "8px 8px 0 8px", padding: "4px 4px 2px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 8px", background: "rgba(0,0,0,0.15)", borderRadius: 6 }}>
                    <div style={{ width: 34, height: 34, borderRadius: "50%", background: "rgba(0,0,0,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><svg width="14" height="14" viewBox="0 0 24 24" fill="#8fd3c4"><path d="M8 5v14l11-7z" /></svg></div>
                    <div style={{ display: "flex", alignItems: "center", gap: 1.5, flex: 1, height: 28 }}>
                      {Array.from({ length: 30 }).map((_, j) => <div key={j} style={{ width: 2.5, borderRadius: 1, background: "#8fd3c4", height: 3 + ((j * 7 + 3) % 18), opacity: 0.7 }} />)}
                    </div>
                    <span style={{ fontSize: 11, color: "#8fd3c4", flexShrink: 0, marginLeft: 4 }}>0:03</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 3, padding: "2px 4px 1px" }}>
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.55)" }}>15:53</span>
                    <svg width="16" height="11" viewBox="0 0 16 11" fill="none"><path d="M11.07 0.65L4.98 6.73L2.22 3.98L0.81 5.39L4.98 9.56L12.48 2.06L11.07 0.65Z" fill="#53bdeb" /><path d="M14.07 0.65L7.98 6.73L7.28 6.04L5.86 7.45L7.98 9.56L15.48 2.06L14.07 0.65Z" fill="#53bdeb" /></svg>
                  </div>
                </div>
              </motion.div>}
              {step >= 2 && <motion.div key="t1" initial={{ opacity: 0, scale: 0.95, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} style={{ alignSelf: "flex-start", maxWidth: "85%" }}>
                <div style={{ background: "#1F2C34", borderRadius: "8px 8px 8px 0", padding: "6px 8px 3px" }}>
                  <div style={{ color: "#E9EDEF", fontSize: 14.2, lineHeight: 1.35 }}>Here are the vehicles matching your search:</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", textAlign: "right", marginTop: 1 }}>15:53</div>
                </div>
              </motion.div>}
              {step >= 3 && <motion.div key="cards" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ display: "flex", gap: 6, alignSelf: "flex-start", maxWidth: "95%" }}>
                {cars.map((car, ci) => (
                  <motion.div key={ci} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: ci * 0.2 }} style={{ width: 155, background: "#1F2C34", borderRadius: 8, overflow: "hidden" }}>
                    <img src={car.img} alt={car.name} style={{ width: "100%", height: 90, objectFit: "cover", display: "block" }} />
                    <div style={{ padding: "8px 10px" }}>
                      <div style={{ fontWeight: 600, fontSize: 13, color: "#E9EDEF" }}>{car.name}</div>
                      <div style={{ color: C.green, fontWeight: 700, fontSize: 15, marginTop: 3 }}>£{car.price}</div>
                      <div style={{ color: "#8696A0", fontSize: 11, marginTop: 2 }}>{car.spec}</div>
                      <div style={{ marginTop: 8, padding: "6px 0 2px", borderTop: "1px solid #2A3942", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                        <span style={{ color: C.green, fontSize: 12, fontWeight: 600 }}>View details</span>
                        <I.Arrow s={11} c={C.green} />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>}
              {step >= 4 && <motion.div key="t2" initial={{ opacity: 0, scale: 0.95, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} style={{ alignSelf: "flex-start", maxWidth: "85%" }}>
                <div style={{ background: "#1F2C34", borderRadius: "8px 8px 8px 0", padding: "6px 8px 3px" }}>
                  <div style={{ color: "#E9EDEF", fontSize: 14.2, lineHeight: 1.4 }}>I found a couple of black BMW 1 Series for you. The <span style={{ color: C.green, fontWeight: 600 }}>2022 118i SE</span> at £10,495 is a great deal. Want to book a viewing?</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", textAlign: "right", marginTop: 1 }}>15:54</div>
                </div>
              </motion.div>}
            </AnimatePresence>
          </div>
          {/* WA Input bar */}
          <div style={{ background: "#1F2C34", padding: "6px 8px", display: "flex", alignItems: "center", gap: 6 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8696A0" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" /></svg>
            <div style={{ flex: 1, background: "#2A3942", borderRadius: 22, padding: "9px 14px", fontSize: 14, color: "#8696A0" }}>Message</div>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="#8696A0"><path d="M12 15c1.66 0 3-1.34 3-3V6c0-1.66-1.34-3-3-3S9 4.34 9 6v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V6z" /><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" /></svg>
          </div>
        </div>
      </div>
    </Center>
  );
}

function Website({ p }) {
  const msgs = [{ who: "user", t: "Do you have any black 1 Series?" }, { who: "ai", t: "Yes — 3 in stock. Want me to call you?" }, { who: "user", t: "Call me" }];
  const step = Math.floor(p * 6);
  return (
    <Center wide>
      <div style={{ display: "flex", gap: 64, alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
        <GlassCard style={{ width: 480, height: 340, borderRadius: 16, position: "relative" }}>
          <div style={{ padding: "14px 18px", display: "flex", gap: 8, alignItems: "center", borderBottom: `1px solid ${C.border}` }}>
            <div style={{ display: "flex", gap: 7 }}>{["#ff5f57", "#febc2e", "#28c840"].map(c => <div key={c} style={{ width: 11, height: 11, borderRadius: "50%", background: c }} />)}</div>
            <div style={{ marginLeft: 14, padding: "5px 16px", borderRadius: 8, background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`, fontSize: 12, color: C.dim, flex: 1, maxWidth: 260 }}>carpass.ai</div>
          </div>
          <div style={{ padding: 24 }}>
            <div style={{ width: "55%", height: 16, borderRadius: 4, background: "rgba(255,255,255,0.06)" }} />
            <div style={{ display: "flex", gap: 10, marginTop: 16 }}><div style={{ width: "65%", height: 10, borderRadius: 4, background: "rgba(255,255,255,0.04)" }} /><div style={{ width: "25%", height: 10, borderRadius: 4, background: "rgba(255,255,255,0.04)" }} /></div>
            <div style={{ display: "flex", gap: 12, marginTop: 24 }}>{[1, 2, 3].map(i => <div key={i} style={{ flex: 1, height: 60, borderRadius: 8, background: "rgba(255,255,255,0.03)", border: `1px solid ${C.border}` }} />)}</div>
          </div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 200, damping: 20 }} style={{ position: "absolute", right: 16, bottom: 16, width: 240, borderRadius: 14, background: C.card, border: `1px solid ${C.teal}33`, overflow: "hidden" }}>
            <div style={{ padding: "10px 14px", background: `linear-gradient(90deg, ${C.teal}15, ${C.violet}10)`, display: "flex", alignItems: "center", gap: 8, borderBottom: `1px solid ${C.border}` }}><div style={{ width: 8, height: 8, borderRadius: "50%", background: C.teal }} /><span style={{ fontSize: 12, fontWeight: 700 }}>Chat with AI</span></div>
            <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: 6, minHeight: 110 }}>{msgs.map((m, i) => step > i ? <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} style={{ alignSelf: m.who === "ai" ? "flex-start" : "flex-end", maxWidth: "85%", padding: "7px 10px", borderRadius: 10, fontSize: 11.5, lineHeight: 1.4, background: m.who === "ai" ? `${C.teal}12` : `${C.violet}14`, border: `1px solid ${m.who === "ai" ? C.teal + "22" : C.violet + "22"}` }}>{m.t}</motion.div> : null)}</div>
          </motion.div>
        </GlassCard>
        <SideCopy badge="WEBSITE WIDGET" badgeColor={C.blue} title={<>Call or chat, <span style={{ color: C.blue }}>right on your site.</span></>} body="Drop the agent onto any website. Visitors chat or start a voice call — the AI picks up every time." p={p} left />
      </div>
    </Center>
  );
}

function Booking({ p }) {
  const slots = [{ day: "Mon 26", time: "10:00 AM", b: 0 }, { day: "Tue 27", time: "2:30 PM", b: 1 }, { day: "Wed 28", time: "9:00 AM", b: 0 }, { day: "Thu 29", time: "4:00 PM", b: 1 }, { day: "Fri 30", time: "11:30 AM", b: 1 }];
  return (
    <Center wide>
      <div style={{ display: "flex", gap: 64, alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
        <SideCopy badge="SMART BOOKING" badgeColor={C.violet} title={<>Books the appointment <span style={{ color: C.violet }}>for you.</span></>} body="The agent checks availability mid-conversation, writes it to your calendar, and syncs the booking to your CRM automatically." p={p} pills={[{ t: "Calendar sync", at: 0.4 }, { t: "CRM update", at: 0.6 }]} />
        <GlassCard style={{ width: 340, borderRadius: 16 }} gradient>
          <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}><I.Calendar s={20} /><span style={{ fontWeight: 700, fontSize: 15 }}>May 2026</span></div>
            <span style={{ color: C.teal, fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 6, background: `${C.teal}12`, border: `1px solid ${C.teal}22` }}>AUTO</span>
          </div>
          <div style={{ padding: "12px 16px" }}>
            {slots.map((s, i) => { const show = p > 0.12 + i * 0.1; const done = s.b && p > 0.3 + i * 0.1; return (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", borderRadius: 10, marginBottom: 6, opacity: show ? 1 : 0, transform: show ? "none" : "translateY(8px)", transition: "all .4s", background: done ? `${C.teal}08` : "transparent", border: `1px solid ${done ? C.teal + "33" : C.border}` }}>
                <div><div style={{ fontSize: 13, fontWeight: 600 }}>{s.day}</div><div style={{ fontSize: 12, color: C.dim, marginTop: 2 }}>{s.time}</div></div>
                {done ? <div style={{ display: "flex", alignItems: "center", gap: 5 }}><I.Check s={14} /><span style={{ color: C.teal, fontSize: 12, fontWeight: 600 }}>Booked</span></div> : <span style={{ color: C.muted, fontSize: 12 }}>Available</span>}
              </div>
            ); })}
          </div>
        </GlassCard>
      </div>
    </Center>
  );
}

/* ---- Automation — vertical card flow ---- */
function Automation({ p }) {
  const steps = [
    { icon: I.Phone, label: "Call Ends", desc: "Conversation captured & transcribed", color: C.teal },
    { icon: I.Zap, label: "AI Extracts", desc: "Intent, data, and next steps identified", color: C.violet },
    { icon: I.Arrow, label: "Workflow Runs", desc: "Automation triggers instantly", color: C.blue },
    { icon: I.Database, label: "CRM Synced", desc: "Lead updated in real-time", color: C.teal },
  ];
  return (
    <Center wide>
      <div style={{ display: "flex", gap: 64, alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
        <SideCopy badge="AUTOMATION" badgeColor={C.teal} title={<>Then it <span style={{ color: C.teal }}>automates the rest.</span></>} body="Every conversation triggers your workflow — data flows into any system, instantly. No manual entry, no delays." p={p} />
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {steps.map((s, i) => {
            const sp = easeOut(clamp01((p - 0.12 - i * 0.14) / 0.22));
            const lp = easeOut(clamp01((p - 0.2 - i * 0.14) / 0.15));
            const Icon = s.icon;
            return (
              <React.Fragment key={i}>
                <div style={{ opacity: sp, transform: `translateX(${(1 - sp) * 40}px)` }}>
                  <GlassCard style={{ width: 300, padding: "16px 18px", display: "flex", alignItems: "center", gap: 16 }} gradient>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: `${s.color}12`, border: `1px solid ${s.color}33`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Icon s={20} c={s.color} />
                    </div>
                    <div><div style={{ fontWeight: 700, fontSize: 14 }}>{s.label}</div><div style={{ fontSize: 12, color: C.dim, marginTop: 2 }}>{s.desc}</div></div>
                  </GlassCard>
                </div>
                {i < steps.length - 1 && (
                  <div style={{ width: 2, height: 20, marginLeft: 40, background: `linear-gradient(180deg, ${s.color}55, ${steps[i + 1].color}55)`, opacity: lp }} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </Center>
  );
}

/* ---- 3D Neon Globe with earth texture ---- */
function AnimatedArc({ points, color, progress }) {
  const visibleCount = Math.max(2, Math.floor(progress * points.length));
  const visible = points.slice(0, visibleCount);
  return <Line points={visible} color={color} lineWidth={2} transparent opacity={0.7} />;
}

function NeonGlobe({ progress = 1 }) {
  const groupRef = useRef();
  const texture = useMemo(() => new THREE.TextureLoader().load("/earth-night.jpg"), []);
  useFrame(() => { if (groupRef.current) groupRef.current.rotation.y -= 0.0001; });

  const arcs = useMemo(() => {
    const toV = (lat, lng) => {
      const p = (90 - lat) * Math.PI / 180, t = (lng + 180) * Math.PI / 180, r = 2;
      return new THREE.Vector3(-r * Math.sin(p) * Math.cos(t), r * Math.cos(p), r * Math.sin(p) * Math.sin(t));
    };
    const cities = [[51.5, -0.1], [40.7, -74], [25.2, 55.3], [35.7, 139.7], [-33.9, 151.2], [1.3, 103.8], [48.9, 2.35], [55.7, 37.6]];
    return cities.slice(1).map(c => {
      const s = toV(cities[0][0], cities[0][1]), e = toV(c[0], c[1]);
      const mid = new THREE.Vector3().addVectors(s, e).multiplyScalar(0.5);
      mid.normalize().multiplyScalar(3.2);
      return new THREE.QuadraticBezierCurve3(s, mid, e).getPoints(64).map(v => [v.x, v.y, v.z]);
    });
  }, []);

  return (
    <group ref={groupRef} position={[-2.5, -0.5, 0]} rotation={[0.15, -1.5, 0]}>
      {/* Earth with night-lights texture */}
      <mesh>
        <sphereGeometry args={[2, 64, 64]} />
        <meshBasicMaterial map={texture} color="#33eedd" transparent opacity={0.9} />
      </mesh>
      {/* Atmosphere glow */}
      <mesh>
        <sphereGeometry args={[2.08, 48, 48]} />
        <meshBasicMaterial color={C.teal} transparent opacity={0.03} side={THREE.BackSide} />
      </mesh>
      {/* Animated connection arcs */}
      {arcs.map((pts, i) => {
        const arcDelay = 0.15 + i * 0.08;
        const arcProgress = clamp01((progress - arcDelay) / 0.25);
        return arcProgress > 0 ? <AnimatedArc key={i} points={pts} color={i % 2 === 0 ? C.teal : C.violet} progress={easeOut(arcProgress)} /> : null;
      })}
      {/* City glow dots */}
      {[[51.5, -0.1], [40.7, -74], [25.2, 55.3], [35.7, 139.7], [-33.9, 151.2], [1.3, 103.8]].map((c, i) => {
        const ph = (90 - c[0]) * Math.PI / 180, th = (c[1] + 180) * Math.PI / 180, r = 2.02;
        const dotProgress = clamp01((progress - 0.1 - i * 0.06) / 0.2);
        return dotProgress > 0 ? <mesh key={i} position={[-r * Math.sin(ph) * Math.cos(th), r * Math.cos(ph), r * Math.sin(ph) * Math.sin(th)]} scale={easeOut(dotProgress)}>
          <sphereGeometry args={[0.035, 8, 8]} /><meshBasicMaterial color={C.teal} />
        </mesh> : null;
      })}
    </group>
  );
}

function GlobeSlide({ p }) {
  const fadeIn = easeOut(clamp01(p / 0.3));
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      {/* Globe — full-viewport Canvas, globe offset inside the 3D scene */}
      <div style={{
        position: "absolute", inset: 0,
        opacity: fadeIn, pointerEvents: "none",
      }}>
        <Canvas camera={{ position: [0, 0, 6], fov: 35 }} style={{ background: "transparent" }}>
          <ambientLight intensity={0.12} />
          <pointLight position={[-2, 2, 5]} color={C.teal} intensity={2.5} />
          <pointLight position={[-4, 0, 3]} color={C.violet} intensity={0.8} />
          <NeonGlobe progress={p} />
        </Canvas>
      </div>
      {/* Atmospheric rim glow */}
      <div style={{
        position: "absolute", left: "5vw", bottom: "5vh",
        width: "40vw", height: "40vw", borderRadius: "50%",
        background: `radial-gradient(circle at 50% 50%, ${C.teal}12, ${C.violet}08, transparent 60%)`,
        pointerEvents: "none", opacity: fadeIn * 0.8,
      }} />
      {/* Text content — right side */}
      <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "48%", display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 60px 0 40px", textAlign: "left" }}>
        <div style={{ opacity: easeOut(clamp01((p - 0.1) / 0.2)), transform: `translateY(${(1 - easeOut(clamp01((p - 0.1) / 0.2))) * 20}px)` }}>
          <Badge><I.Globe s={14} c={C.teal} /> GLOBAL REACH</Badge>
        </div>
        <h2 style={{ fontFamily: DISPLAY, fontSize: "clamp(1.8rem,3.5vw,3rem)", fontWeight: 800, letterSpacing: -1, margin: "24px 0 0", lineHeight: 1.08, opacity: easeOut(clamp01((p - 0.15) / 0.2)), transform: `translateY(${(1 - easeOut(clamp01((p - 0.15) / 0.2))) * 20}px)` }}>
          Connect to any business, <span style={{ color: C.teal }}>anywhere.</span>
        </h2>
        <p style={{ color: C.dim, fontSize: 16, marginTop: 20, lineHeight: 1.7, maxWidth: 420, opacity: easeOut(clamp01((p - 0.25) / 0.2)) }}>
          Deploy your AI agent across borders and time zones. One platform handles every language, every channel, every market — 24/7.
        </p>
        <div style={{ display: "flex", gap: 32, marginTop: 36, opacity: easeOut(clamp01((p - 0.4) / 0.25)) }}>
          {[{ n: "5+", l: "Countries" }, { n: "24/7", l: "Coverage" }, { n: "Real-time", l: "Sync" }].map((s, i) => (
            <div key={i}>
              <div style={{ fontSize: 26, fontWeight: 800, fontFamily: DISPLAY, color: C.teal }}>{s.n}</div>
              <div style={{ fontSize: 12, color: C.dim, marginTop: 4 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---- CTA ---- */
function CTA({ p }) {
  const stats = [
    { value: "100,000", suf: "+", label: "Calls handled without hiring" },
    { value: "24", suf: "/7", label: "Always on, never sleeps" },
    { value: "5", suf: "", label: "Channels, one agent" },
  ];
  const afterLogo = clamp01((p - 0.3) / 0.25);
  return (
    <Center>
      <div style={{ opacity: easeOut(afterLogo), transform: `translateY(${(1 - easeOut(afterLogo)) * 30}px)` }}>
        <div style={{ display: "flex", gap: 56, justifyContent: "center", flexWrap: "wrap", marginBottom: 56 }}>
          {stats.map((s, i) => {
            const lp = clamp01((afterLogo - 0.1 - i * 0.15) / 0.4);
            return (
              <div key={i} style={{ opacity: easeOut(lp), transform: `translateY(${(1 - easeOut(lp)) * 15}px)`, textAlign: "center" }}>
                <div style={{ fontSize: "clamp(2.2rem,5vw,3.6rem)", fontWeight: 800, fontFamily: DISPLAY, background: `linear-gradient(90deg, ${C.teal}, ${C.violet})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{s.value}{s.suf}</div>
                <div style={{ color: C.dim, fontSize: 13, maxWidth: 180, margin: "8px auto 0" }}>{s.label}</div>
              </div>
            );
          })}
        </div>
        <h2 style={{ fontFamily: DISPLAY, fontSize: "clamp(2rem,5vw,3.8rem)", fontWeight: 800, letterSpacing: -1.5, margin: 0 }}>
          One platform.<br /><span style={{ color: C.teal }}>Zero missed opportunities.</span>
        </h2>
        <div style={{ color: C.dim, marginTop: 28, fontSize: 14, opacity: clamp01(afterLogo / 0.5) }}>samy@matchedby.com</div>
      </div>
    </Center>
  );
}

/* ---- Shared helpers ---- */
function Center({ children, wide }) {
  return <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "40px 32px" }}><div style={{ width: "100%", maxWidth: wide ? 1100 : 860 }}>{children}</div></div>;
}

function SideCopy({ badge, badgeColor, title, body, p, left, pills }) {
  const lp = easeOut(clamp01(p / 0.25));
  return (
    <div style={{ maxWidth: 420, textAlign: "left", opacity: lp, transform: `translateX(${(1 - lp) * (left ? 30 : -30)}px)` }}>
      <Badge color={badgeColor}>{badge}</Badge>
      <h2 style={{ fontFamily: DISPLAY, fontSize: "clamp(1.6rem,3.5vw,2.6rem)", fontWeight: 800, letterSpacing: -1, margin: "20px 0 0", lineHeight: 1.1 }}>{title}</h2>
      <p style={{ color: C.dim, fontSize: 16, marginTop: 16, lineHeight: 1.7 }}>{body}</p>
      {pills && <div style={{ display: "flex", gap: 8, marginTop: 24, flexWrap: "wrap" }}>{pills.map((pl, i) => <Pill key={i} active={p > pl.at}>{pl.t}</Pill>)}</div>}
    </div>
  );
}

function Backdrop({ t }) {
  const x1 = 30 + Math.sin(t * 0.15) * 15, y1 = 30 + Math.cos(t * 0.12) * 15;
  const x2 = 70 + Math.cos(t * 0.1) * 15, y2 = 60 + Math.sin(t * 0.18) * 10;
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(50% 50% at ${x1}% ${y1}%, ${C.violet}11, transparent), radial-gradient(50% 50% at ${x2}% ${y2}%, ${C.teal}0d, transparent), ${C.bg}`, zIndex: 0 }} />
      <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,0.025) 1px, transparent 1px)", backgroundSize: "32px 32px", zIndex: 0 }} />
    </>
  );
}

/* ============ ROOT ============ */
/* ---- Audio system ---- */
const VO_KEYS = ["hook", "omni", "phone", "whatsapp", "website", "booking", "automation", "globe", "cta"];
const VOICES = [
  { id: "v1", label: "Charlie (US)" },
  { id: "v2", label: "George (UK)" },
];

function useAudio(playing, now, voiceId) {
  const musicRef = useRef(null);
  const voCache = useRef({});
  const activeVo = useRef(null);
  const prevVoice = useRef(voiceId);

  const getVoRefs = (vid) => {
    if (!voCache.current[vid]) {
      voCache.current[vid] = {};
      VO_KEYS.forEach(k => {
        const a = new Audio(`/${vid}/${k}.mp3`);
        a.volume = 1;
        voCache.current[vid][k] = a;
      });
    }
    return voCache.current[vid];
  };

  useEffect(() => {
    if (!musicRef.current) {
      musicRef.current = new Audio("/speech.wav");
      musicRef.current.volume = 0.15;
      musicRef.current.loop = true;
    }
  }, []);

  useEffect(() => {
    if (prevVoice.current !== voiceId) {
      const old = voCache.current[prevVoice.current];
      if (old) Object.values(old).forEach(a => { a.pause(); a.currentTime = 0; });
      activeVo.current = null;
      prevVoice.current = voiceId;
    }
  }, [voiceId]);

  useEffect(() => {
    const music = musicRef.current;
    if (!music) return;
    if (playing) { music.play().catch(() => {}); }
    else { music.pause(); }
  }, [playing]);

  useEffect(() => {
    const refs = getVoRefs(voiceId);
    if (!playing) {
      Object.values(refs).forEach(a => a.pause());
      return;
    }
    let currentKey = null;
    for (const k of VO_KEYS) {
      const span = TL[k];
      if (span && now >= span[0] && now < span[1]) { currentKey = k; break; }
    }
    if (currentKey !== activeVo.current) {
      if (activeVo.current && refs[activeVo.current]) {
        refs[activeVo.current].pause();
        refs[activeVo.current].currentTime = 0;
      }
      activeVo.current = currentKey;
      if (currentKey && refs[currentKey]) {
        refs[currentKey].currentTime = 0;
        refs[currentKey].play().catch(() => {});
      }
    }
  });

  return {
    stopAll: () => {
      if (musicRef.current) { musicRef.current.currentTime = 0; }
      Object.values(voCache.current).forEach(v => Object.values(v).forEach(a => { a.pause(); a.currentTime = 0; }));
      activeVo.current = null;
    }
  };
}

/* ---- Settings FAB ---- */
function SettingsFab({ playing, onTogglePlay, onRestart, voice, onVoiceChange, now }) {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  return (
    <div
      style={{ position: "absolute", bottom: 0, right: 0, width: open ? 240 : 80, height: open ? 360 : 80, zIndex: 20, opacity: hovered || open ? 1 : 0, transition: "opacity .3s" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setOpen(false); }}
    >
      {/* Menu */}
      {open && (
        <div style={{
          position: "absolute", bottom: 70, right: 18, width: 200,
          background: C.card, border: `1px solid ${C.border}`, borderRadius: 14,
          padding: "8px 0", overflow: "hidden",
        }}>
          {/* Playback */}
          <div style={{ padding: "6px 16px", fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: 1 }}>Playback</div>
          <button onClick={onTogglePlay} style={menuBtn}>
            <span style={{ width: 20, textAlign: "center" }}>{playing ? "⏸" : "▶"}</span>
            <span>{playing ? "Pause" : "Play"}</span>
          </button>
          <button onClick={() => { onRestart(); setOpen(false); }} style={menuBtn}>
            <span style={{ width: 20, textAlign: "center" }}>↻</span>
            <span>Restart</span>
          </button>
          <div style={{ height: 1, background: C.border, margin: "6px 0" }} />
          {/* Voice */}
          <div style={{ padding: "6px 16px", fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: 1 }}>Voice</div>
          {VOICES.map(v => (
            <button key={v.id} onClick={() => onVoiceChange(v.id)} style={{ ...menuBtn, color: voice === v.id ? C.teal : C.ink }}>
              <span style={{ width: 20, textAlign: "center", fontSize: 10 }}>{voice === v.id ? "●" : "○"}</span>
              <span>{v.label}</span>
            </button>
          ))}
          <div style={{ height: 1, background: C.border, margin: "6px 0" }} />
          {/* Timer */}
          <div style={{ padding: "6px 16px", fontSize: 12, color: C.dim, fontFamily: "monospace" }}>
            {now.toFixed(1)}s / {DURATION}s
          </div>
        </div>
      )}
      {/* FAB button */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          position: "absolute", bottom: 18, right: 18,
          width: 44, height: 44, borderRadius: 12,
          background: open ? C.card : "rgba(255,255,255,0.06)",
          border: `1px solid ${open ? C.teal + "44" : C.border}`,
          color: open ? C.teal : "#EAF2FF",
          fontSize: 18, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all .2s",
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
        </svg>
      </button>
    </div>
  );
}

const menuBtn = {
  display: "flex", alignItems: "center", gap: 10,
  width: "100%", padding: "8px 16px", border: "none",
  background: "transparent", color: "#EAF2FF", fontSize: 13,
  cursor: "pointer", textAlign: "left", fontFamily: FONT,
};

export default function App() {
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);
  const handleStart = () => { setStarted(true); setPlaying(true); };
  const [voice, setVoice] = useState("v2");
  const t = useClock(playing);
  const now = t.get();
  const audio = useAudio(playing, now, voice);
  const scenes = [
    ["logo", LogoIntro], ["hook", Hook], ["omni", Omni], ["phone", PhoneDemo],
    ["whatsapp", WhatsApp], ["website", Website], ["booking", Booking],
    ["automation", Automation], ["globe", GlobeSlide], ["cta", CTA],
  ];
  const restart = () => { audio.stopAll(); t.set(0); setPlaying(true); };
  return (
    <div style={{ fontFamily: FONT, color: C.ink, position: "fixed", inset: 0, overflow: "hidden", background: C.bg }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { overflow: hidden; }
        *::-webkit-scrollbar { width: 0; height: 0; }
        * { scrollbar-width: none; }
        @keyframes pfloat { 0% { transform: translateY(0); opacity: 0; } 8% { opacity: 1; } 92% { opacity: 1; } 100% { transform: translateY(-105vh); opacity: 0; } }
      `}</style>
      <Backdrop t={now} />
      <Particles />
      {scenes.map(([key, Comp]) => {
        const span = TL[key];
        if (!active(now, span)) return null;
        return <div key={key} style={{ position: "absolute", inset: 0, zIndex: 1 }}><Comp p={local(now, span)} /></div>;
      })}
      <PersistentLogo now={now} />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 3, background: "rgba(255,255,255,0.06)", zIndex: 5 }}>
        <div style={{ height: "100%", width: `${(now / DURATION) * 100}%`, background: `linear-gradient(90deg, ${C.teal}, ${C.violet})` }} />
      </div>
      <SettingsFab playing={playing} onTogglePlay={() => setPlaying(v => !v)} onRestart={restart} voice={voice} onVoiceChange={setVoice} now={now} />
      {!started && (
        <div onClick={handleStart} style={{
          position: "absolute", inset: 0, zIndex: 50,
          background: C.bg, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", cursor: "pointer",
        }}>
          <div style={{
            width: 80, height: 80, borderRadius: "50%", border: `2px solid ${C.teal}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            marginBottom: 24, transition: "transform .2s",
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill={C.teal}><path d="M8 5v14l11-7z" /></svg>
          </div>
          <span style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 18, color: C.ink }}>Click to play</span>
          <span style={{ color: C.dim, fontSize: 13, marginTop: 8 }}>matchedby.com — SaaS Explainer</span>
        </div>
      )}
    </div>
  );
}
