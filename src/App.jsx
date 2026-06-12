import React, { useEffect, useRef, useState, useMemo, useId } from "react";
import { motion, AnimatePresence, useMotionValue } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";

/* ============ BRAND ============ */
const C = {
  bg: "#04060B", card: "#0A0F1A", ink: "#EAF2FF", dim: "#6B7A90", muted: "#3A4558",
  teal: "#22E0C8", violet: "#8B5CF6", blue: "#3B82F6", pink: "#D946EF",
  green: "#25D366", sms: "#0A84FF", smsOut: "#30D158", amber: "#F59E0B",
  border: "rgba(255,255,255,0.08)", wa: "#0B141A", waPanel: "#1F2C34",
  waBubbleIn: "#1F2C34", waBubbleOut: "#005C4B",
};
const GRAD = `linear-gradient(120deg, ${C.teal}, ${C.blue} 50%, ${C.violet})`;
const FONT = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
const DISPLAY = "'Archivo', 'Plus Jakarta Sans', 'Inter', sans-serif";

const TL = {
  intro: [0, 8], hook: [8, 17], promise: [17, 25], channels: [25, 36],
  voice: [36, 46], whatsapp1: [46, 58], whatsapp2: [58, 70],
  followup: [70, 81], website: [81, 90], funnel: [90, 102],
  globe: [102, 110], cta: [110, 120],
};
const DURATION = 120;

const active = (now, [s, e]) => now >= s && now < e;
const local = (now, [s, e]) => Math.max(0, Math.min(1, (now - s) / (e - s)));
const easeOut = (p) => 1 - Math.pow(1 - p, 3);
const easeInOut = (p) => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2);
const easeOutExpo = (p) => (p >= 1 ? 1 : 1 - Math.pow(2, -10 * p));
const easeBack = (p) => 1 + 2.70158 * Math.pow(p - 1, 3) + 1.70158 * Math.pow(p - 1, 2);
const clamp01 = (v) => Math.max(0, Math.min(1, v));
const lerp = (a, b, t) => a + (b - a) * t;

const GradTxt = ({ children, style }) => (
  <span style={{ backgroundImage: GRAD, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", ...style }}>{children}</span>
);

/* ============ LOGO MARK (traced from carpass-logo.png, 66x58) ============ */
const MARK_PATHS = [
  "M13 1.5 L62 1.5 A3.5 3.5 0 0 1 65.5 5 L65.5 23.5 A2 2 0 0 1 63.5 25.5 L52.5 25.5 A2 2 0 0 1 50.5 23.5 L50.5 15.5 L19.5 15.5 A4 4 0 0 0 15.5 19.5 L15.5 57.5 L3 57.5 A2.5 2.5 0 0 1 0.5 55 L0.5 14 A12.5 12.5 0 0 1 13 1.5 Z",
  "M26.5 21.5 L39.5 21.5 A4 4 0 0 1 43.5 25.5 L43.5 31 A4 4 0 0 1 39.5 35 L26.5 35 A4 4 0 0 1 22.5 31 L22.5 25.5 A4 4 0 0 1 26.5 21.5 Z",
  "M50.5 33.5 A2 2 0 0 1 52.5 31.5 L63.5 31.5 A2 2 0 0 1 65.5 33.5 L65.5 43 A14.5 14.5 0 0 1 51 57.5 L22.5 57.5 L22.5 43.5 L42.5 43.5 A8 8 0 0 0 50.5 35.5 Z",
];

function LogoMark({ size = 32, fill = "#fff", grad = false, draw = null, style }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const fillVal = grad ? `url(#mk${uid})` : fill;
  return (
    <svg width={size} height={(size * 58) / 66} viewBox="0 0 66 58" style={{ display: "block", ...style }}>
      {grad && (
        <defs>
          <linearGradient id={`mk${uid}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={C.teal} /><stop offset="0.5" stopColor={C.blue} /><stop offset="1" stopColor={C.violet} />
          </linearGradient>
        </defs>
      )}
      {MARK_PATHS.map((d, i) => {
        if (draw == null) return <path key={i} d={d} fill={fillVal} />;
        const sk = clamp01(draw / 0.6 - i * 0.1);
        const fo = clamp01((draw - 0.5) / 0.32);
        const so = 1 - clamp01((draw - 0.72) / 0.24);
        return (
          <path key={i} d={d} pathLength="1" fill={fillVal} fillOpacity={fo}
            stroke={grad ? C.teal : fill} strokeWidth="1.4" strokeOpacity={so * 0.9}
            strokeDasharray="1" strokeDashoffset={1 - easeInOut(sk)} />
        );
      })}
    </svg>
  );
}

/* ============ ICONS ============ */
const I = {
  Phone: ({ s = 24, c = C.teal }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.362 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0122 16.92z" /></svg>,
  WhatsApp: ({ s = 24, c = C.green }) => <svg width={s} height={s} viewBox="0 0 24 24" fill={c}><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>,
  Sms: ({ s = 24, c = C.sms }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" /><circle cx="8.5" cy="11.5" r="0.5" fill={c} /><circle cx="12.5" cy="11.5" r="0.5" fill={c} /><circle cx="16.5" cy="11.5" r="0.5" fill={c} /></svg>,
  Mail: ({ s = 24, c = C.amber }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="3" /><path d="m2 7 10 7L22 7" /></svg>,
  Globe: ({ s = 24, c = C.blue }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M2 12h20" /><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" /></svg>,
  Calendar: ({ s = 24, c = C.violet }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>,
  Zap: ({ s = 24, c = C.teal }) => <svg width={s} height={s} viewBox="0 0 24 24" fill={c} stroke="none"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>,
  Check: ({ s = 16, c = C.teal }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>,
  Arrow: ({ s = 18, c = C.dim }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5l7 7-7 7" /></svg>,
  Mic: ({ s = 18, c = C.teal }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" /><path d="M19 10v2a7 7 0 01-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" /></svg>,
  Database: ({ s = 24, c = C.blue }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" /><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" /></svg>,
  Lock: ({ s = 12, c = "#8696A0" }) => <svg width={s} height={s} viewBox="0 0 24 24" fill={c}><path d="M12 1a5 5 0 00-5 5v3H6a2 2 0 00-2 2v9a2 2 0 002 2h12a2 2 0 002-2v-9a2 2 0 00-2-2h-1V6a5 5 0 00-5-5zm-3 5a3 3 0 116 0v3H9V6z" /></svg>,
  Filter: ({ s = 24, c = C.violet }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>,
  Refresh: ({ s = 24, c = C.blue }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-2.64-6.36" /><path d="M21 3v6h-6" /></svg>,
  Key: ({ s = 24, c = C.teal }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777Zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3" /></svg>,
};

/* ============ UI PRIMITIVES ============ */
const GlassCard = ({ children, style, gradient, sweep }) => (
  <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, position: "relative", overflow: "hidden", ...style }}>
    {gradient && <div style={{ position: "absolute", top: -1, left: -1, right: -1, height: 2, background: GRAD, zIndex: 2 }} />}
    {sweep && <div style={{ position: "absolute", top: 0, bottom: 0, width: "22%", left: "-30%", background: "linear-gradient(100deg, transparent, rgba(255,255,255,0.045), transparent)", transform: "skewX(-16deg)", animation: "csweep 4.6s ease-in-out 1.2s infinite", pointerEvents: "none", zIndex: 3 }} />}
    {children}
  </div>
);
const Badge = ({ children, color = C.teal }) => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "5px 14px", borderRadius: 100, background: `${color}14`, border: `1px solid ${color}33`, color, fontSize: 12, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase" }}>{children}</span>
);
const Pill = ({ children, active: a, color = C.teal }) => (
  <span style={{ padding: "6px 16px", borderRadius: 8, background: a ? `${color}18` : "rgba(255,255,255,0.03)", border: `1px solid ${a ? color + "44" : C.border}`, color: a ? color : C.dim, fontSize: 13, fontWeight: 600, transition: "all .3s", whiteSpace: "nowrap" }}>{children}</span>
);

/* Per-word kinetic reveal */
function KWords({ text, p, start = 0, stagger = 0.045, dur = 0.18, grad = false, dimmed = false }) {
  return text.split(" ").map((w, i) => {
    const wp = easeOutExpo(clamp01((p - start - i * stagger) / dur));
    const word = grad ? <GradTxt>{w}</GradTxt> : w;
    return (
      <span key={i} style={{ display: "inline-block", opacity: wp * (dimmed ? 0.999 : 1), transform: `translateY(${(1 - wp) * 30}px) scale(${0.96 + wp * 0.04})`, color: dimmed ? C.dim : undefined, whiteSpace: "pre" }}>
        {word}{i < text.split(" ").length - 1 ? " " : ""}
      </span>
    );
  });
}

/* ============ CLOCK ============ */
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

/* ============ ATMOSPHERE ============ */
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

function Orbs() {
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 0, overflow: "hidden", pointerEvents: "none" }}>
      <div style={{ position: "absolute", width: "58vw", height: "58vw", left: "-12vw", top: "-20vw", borderRadius: "50%", background: `radial-gradient(circle at 50% 50%, ${C.violet}10, transparent 62%)`, animation: "orbA 46s ease-in-out infinite alternate" }} />
      <div style={{ position: "absolute", width: "50vw", height: "50vw", right: "-14vw", bottom: "-18vw", borderRadius: "50%", background: `radial-gradient(circle at 50% 50%, ${C.teal}0d, transparent 62%)`, animation: "orbB 52s ease-in-out infinite alternate" }} />
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

/* ============ INTRO (gradient circles) ============ */
function LogoIntro({ p }) {
  const appear = easeOut(clamp01(p / 0.5));
  const drift = easeInOut(clamp01(p / 0.55));
  const expand = easeInOut(clamp01((p - 0.7) / 0.25));
  const fade = clamp01((p - 0.9) / 0.1);
  const size = 38 + expand * 30;
  return (
    <div style={{ position: "absolute", inset: 0, opacity: 1 - fade }}>
      <div style={{ position: "absolute", left: `${-10 + drift * 40}%`, top: `${90 - drift * 45}%`, width: `${size}vw`, height: `${size}vw`, borderRadius: "50%", background: `radial-gradient(circle at 40% 40%, ${C.teal}, #0ea5e9, ${C.blue})`, opacity: appear * 0.15, transform: "translate(-50%,-50%)", mixBlendMode: "screen" }} />
      <div style={{ position: "absolute", left: `${90 - drift * 40}%`, top: `${-10 + drift * 45}%`, width: `${size}vw`, height: `${size}vw`, borderRadius: "50%", background: `radial-gradient(circle at 60% 60%, ${C.pink}, ${C.violet}, #a855f7)`, opacity: appear * 0.15, transform: "translate(-50%,-50%)", mixBlendMode: "screen" }} />
    </div>
  );
}

/* ============ PERSISTENT LOGO → corner → CTA button ============ */
function PersistentLogo({ now }) {
  const introIn = easeOut(clamp01((now - 1.0) / 0.8));
  const drawP = clamp01((now - 1.2) / 2.4);
  const wordIn = easeOutExpo(clamp01((now - 3.1) / 1.2));
  const toCorner = easeInOut(clamp01((now - 6.5) / 1.4));
  const toButton = easeInOut(clamp01((now - TL.cta[0]) / 2.2));

  const cornerL = 3, cornerT = 5;
  const btnL = 50, btnT = 67;

  let left, top, tx, ty, markS, fs, gap;
  if (toButton > 0) {
    left = lerp(cornerL, btnL, toButton); top = lerp(cornerT, btnT, toButton);
    tx = lerp(0, -50, toButton); ty = lerp(0, -50, toButton);
    markS = lerp(24, 20, toButton); fs = lerp(17, 18, toButton); gap = 9;
  } else {
    left = lerp(50, cornerL, toCorner); top = lerp(50, cornerT, toCorner);
    tx = lerp(-50, 0, toCorner); ty = lerp(-50, 0, toCorner);
    markS = lerp(74, 24, toCorner); fs = lerp(46, 17, toCorner); gap = lerp(20, 9, toCorner);
  }

  if (introIn <= 0) return null;
  const btnOn = toButton > 0.55;
  return (
    <div style={{ position: "absolute", left: `${left}%`, top: `${top}%`, transform: `translate(${tx}%,${ty}%)`, zIndex: 10, opacity: introIn, whiteSpace: "nowrap", pointerEvents: "none", display: "flex", alignItems: "center", gap }}>
      <div style={{ position: "absolute", inset: `${lerp(2, -14, toButton)}px ${lerp(2, -30, toButton)}px`, borderRadius: 16, background: GRAD, opacity: toButton }} />
      <LogoMark size={markS} grad={!btnOn} fill="#fff" draw={now < 6.5 ? drawP : null} style={{ position: "relative" }} />
      <span style={{ position: "relative", fontFamily: DISPLAY, fontWeight: 800, fontSize: fs, letterSpacing: -0.5, color: "#fff", opacity: wordIn, transform: `translateX(${(1 - wordIn) * -12}px)` }}>
        CarPass{btnOn
          ? <span style={{ color: "rgba(255,255,255,0.85)" }}>.ai</span>
          : <GradTxt style={{ fontWeight: 800 }}>.ai</GradTxt>}
      </span>
    </div>
  );
}

/* ============ SCENES ============ */

function Hook({ p }) {
  return (
    <Center>
      <div style={{ opacity: easeOutExpo(clamp01(p / 0.12)) }}>
        <Badge><I.Zap s={14} /> AUTOMOTIVE AI PLATFORM</Badge>
      </div>
      <h1 style={{ fontFamily: DISPLAY, fontStretch: "115%", fontSize: "clamp(2.4rem,5.4vw,4.6rem)", fontWeight: 800, lineHeight: 1.08, letterSpacing: -2, margin: "34px 0 0", color: C.ink }}>
        <span style={{ display: "block" }}><KWords text="Every missed call." p={p} start={0.03} stagger={0.04} /></span>
        <span style={{ display: "block" }}><KWords text="Every unanswered message." p={p} start={0.2} stagger={0.04} /></span>
        <span style={{ display: "block", marginTop: 10 }}><KWords text="Another customer, buying their" p={p} start={0.42} stagger={0.035} /></span>
        <span style={{ display: "block" }}><KWords text="next car somewhere else." p={p} start={0.56} stagger={0.04} grad /></span>
      </h1>
      <p style={{ color: C.dim, fontSize: "clamp(1rem,1.8vw,1.15rem)", marginTop: 30, opacity: easeOut(clamp01((p - 0.78) / 0.16)), letterSpacing: 0.2 }}>
        CarPass AI — built for automotive retail & finance.
      </p>
    </Center>
  );
}

function PromiseScene({ p }) {
  const words = ["Never", "lose", "a", "customer", "again."];
  const ruleP = easeInOut(clamp01((p - 0.5) / 0.2));
  const subP = easeOut(clamp01((p - 0.6) / 0.2));
  return (
    <Center>
      <div style={{ position: "absolute", left: "50%", top: "50%", transform: `translate(-50%,-50%) scale(${1 + p * 0.1})`, opacity: 0.05, pointerEvents: "none" }}>
        <LogoMark size={560} fill="none" draw={0.45} style={{ opacity: 0.9 }} />
      </div>
      <h1 style={{ fontFamily: DISPLAY, fontStretch: "120%", fontSize: "clamp(2.8rem,7vw,6rem)", fontWeight: 900, lineHeight: 1.04, letterSpacing: -3, margin: 0, position: "relative" }}>
        {words.map((w, i) => {
          const wp = easeOutExpo(clamp01((p - 0.07 - i * 0.075) / 0.22));
          const isGrad = i === 0 || i === 4;
          return (
            <span key={i} style={{ display: "inline-block", opacity: wp, transform: `translateY(${(1 - wp) * 44}px) scale(${0.92 + wp * 0.08})`, whiteSpace: "pre" }}>
              {isGrad ? <GradTxt>{w}</GradTxt> : w}{i < words.length - 1 ? " " : ""}
            </span>
          );
        })}
      </h1>
      <div style={{ height: 2, width: 220 * ruleP, background: GRAD, margin: "36px auto 0", borderRadius: 2, opacity: ruleP }} />
      <p style={{ color: C.dim, fontSize: "clamp(1rem,1.9vw,1.2rem)", marginTop: 24, opacity: subP, transform: `translateY(${(1 - subP) * 14}px)`, letterSpacing: 0.3 }}>
        CarPass AI keeps every conversation alive.
      </p>
    </Center>
  );
}

/* ---- Orbital channels hub ---- */
function Channels({ p }) {
  const STAGE_W = 820, STAGE_H = 470, CX = STAGE_W / 2, CY = STAGE_H / 2 + 8, R = 178;
  const nodes = [
    { label: "Voice", icon: I.Phone, color: C.teal, ang: -90 },
    { label: "WhatsApp", icon: I.WhatsApp, color: C.green, ang: -18 },
    { label: "Email", icon: I.Mail, color: C.amber, ang: 54 },
    { label: "SMS", icon: I.Sms, color: C.sms, ang: 126 },
    { label: "Web", icon: I.Globe, color: C.violet, ang: 198 },
  ].map(n => ({ ...n, x: CX + Math.cos((n.ang * Math.PI) / 180) * R, y: CY + Math.sin((n.ang * Math.PI) / 180) * R }));
  const coreP = easeBack(clamp01((p - 0.06) / 0.2));
  const headP = easeOutExpo(clamp01(p / 0.16));
  const subP = easeOut(clamp01((p - 0.58) / 0.2));
  return (
    <Center wide>
      <div style={{ opacity: headP, transform: `translateY(${(1 - headP) * 18}px)` }}>
        <Badge>ONE CONVERSATION</Badge>
        <h2 style={{ fontFamily: DISPLAY, fontStretch: "112%", fontSize: "clamp(1.8rem,3.8vw,3.1rem)", fontWeight: 800, letterSpacing: -1.2, margin: "22px 0 0" }}>
          One AI. <GradTxt>Every channel.</GradTxt>
        </h2>
      </div>
      <div style={{ position: "relative", width: STAGE_W, height: STAGE_H, margin: "0 auto", maxWidth: "100%" }}>
        <svg width={STAGE_W} height={STAGE_H} viewBox={`0 0 ${STAGE_W} ${STAGE_H}`} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          <defs>
            {nodes.map((n, i) => (
              <linearGradient key={i} id={`cg${i}`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor={n.color} stopOpacity="0.8" /><stop offset="1" stopColor={C.teal} stopOpacity="0.25" />
              </linearGradient>
            ))}
          </defs>
          {/* orbit ring */}
          <g style={{ transformOrigin: `${CX}px ${CY}px`, animation: "spinSlow 70s linear infinite" }}>
            <circle cx={CX} cy={CY} r={R} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1" strokeDasharray="2 7" opacity={clamp01((p - 0.1) / 0.2)} />
          </g>
          <circle cx={CX} cy={CY} r={R - 36} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" opacity={clamp01((p - 0.14) / 0.2)} />
          {/* connectors + packets */}
          {nodes.map((n, i) => {
            const lp = easeOut(clamp01((p - 0.2 - i * 0.055) / 0.24));
            if (lp <= 0) return null;
            const mx = (n.x + CX) / 2, my = (n.y + CY) / 2;
            const dx = CX - n.x, dy = CY - n.y, len = Math.hypot(dx, dy);
            const px = -dy / len, py = dx / len;
            const d = `M ${n.x} ${n.y} Q ${mx + px * 30} ${my + py * 30} ${CX} ${CY}`;
            return (
              <g key={i}>
                <path d={d} fill="none" stroke={`url(#cg${i})`} strokeWidth="1.2" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - lp} opacity={0.55} />
                {lp > 0.95 && (
                  <>
                    <circle r="3" fill={n.color}>
                      <animateMotion dur="2.3s" begin={`${0.2 + i * 0.45}s`} repeatCount="indefinite" path={d} />
                    </circle>
                    <circle r="2.2" fill={C.teal} opacity="0.9">
                      <animateMotion dur="2.7s" begin={`${1.3 + i * 0.45}s`} repeatCount="indefinite" path={d} keyPoints="1;0" keyTimes="0;1" calcMode="linear" />
                    </circle>
                  </>
                )}
              </g>
            );
          })}
        </svg>
        {/* core */}
        <div style={{ position: "absolute", left: CX, top: CY, transform: `translate(-50%,-50%) scale(${Math.max(0, coreP)})`, zIndex: 3 }}>
          <div style={{ width: 118, height: 118, borderRadius: "50%", padding: 2.5, background: `conic-gradient(from 0deg, ${C.teal}, ${C.blue}, ${C.violet}, ${C.pink}, ${C.teal})`, animation: "spinSlow 14s linear infinite" }}>
            <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: C.card, display: "flex", alignItems: "center", justifyContent: "center", animation: "spinSlowRev 14s linear infinite" }}>
              <LogoMark size={46} grad />
            </div>
          </div>
        </div>
        {/* channel nodes */}
        {nodes.map((n, i) => {
          const np = easeBack(clamp01((p - 0.18 - i * 0.055) / 0.22));
          const Icon = n.icon;
          if (np <= 0) return null;
          return (
            <div key={n.label} style={{ position: "absolute", left: n.x, top: n.y, transform: `translate(-50%,-50%) scale(${Math.max(0, np)})`, zIndex: 2, display: "flex", flexDirection: "column", alignItems: "center", gap: 9 }}>
              <div style={{ width: 60, height: 60, borderRadius: 18, background: `${C.card}F0`, border: `1px solid ${n.color}3D`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 0 5px ${n.color}0A` }}>
                <Icon s={26} c={n.color} />
              </div>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: C.ink, letterSpacing: 0.3 }}>{n.label}</span>
            </div>
          );
        })}
      </div>
      <p style={{ color: C.dim, fontSize: 15, marginTop: -6, opacity: subP, letterSpacing: 0.4 }}>
        Phone · WhatsApp · SMS · Email · Web — one continuous conversation.
      </p>
    </Center>
  );
}

function VoiceCall({ p }) {
  const transcript = [
    { who: "ai", t: "Good afternoon, Carpass Motors — Ava speaking. How can I help?" },
    { who: "user", t: "I'm after the black 118i you've got listed." },
    { who: "ai", t: "Great choice. Are you buying cash, or on finance?" },
    { who: "user", t: "Finance — around £300 a month." },
    { who: "ai", t: "Perfect. With £1,500 down that's £279 a month. Shall I book you a test drive?" },
  ];
  return (
    <Center wide>
      <div style={{ display: "flex", gap: 64, alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
        <SideCopy badge="VOICE AI · 24/7" badgeColor={C.teal} title={<>Every call answered. <GradTxt>Instantly.</GradTxt></>} body="Inbound and outbound calls in a natural voice — qualifying budget, part-exchange and finance from the first hello." p={p} pills={[{ t: "Qualifies budget", at: 0.3 }, { t: "Part-exchange", at: 0.45 }, { t: "Finance ready", at: 0.6 }]} />
        <GlassCard style={{ width: 330, borderRadius: 24 }} gradient sweep>
          <div style={{ padding: "20px 20px 12px", borderBottom: `1px solid ${C.border}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, padding: 2, background: GRAD }}>
                <div style={{ width: "100%", height: "100%", borderRadius: 12, background: C.card, display: "flex", alignItems: "center", justifyContent: "center" }}><I.Mic s={22} c={C.teal} /></div>
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>Ava · CarPass AI</div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}><div style={{ width: 8, height: 8, borderRadius: "50%", background: C.teal }} /><span style={{ color: C.teal, fontSize: 12, fontWeight: 600 }}>Live · 00:{String(Math.floor(p * 45)).padStart(2, "0")}</span></div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 2, height: 32, marginTop: 16, justifyContent: "center" }}>
              {Array.from({ length: 32 }).map((_, i) => <div key={i} style={{ width: 3, height: Math.max(4, 6 + Math.sin(p * 20 + i * 0.5) * 10 + Math.sin(i * 0.8) * 6), borderRadius: 2, background: `linear-gradient(180deg, ${C.teal}, ${C.violet})`, opacity: 0.5 + Math.sin(p * 15 + i) * 0.4 }} />)}
            </div>
          </div>
          <div ref={el => { if (el) el.scrollTop = el.scrollHeight; }} style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 8, maxHeight: 280, overflowY: "auto" }}>
            {transcript.map((m, i) => p > 0.14 + i * 0.13 ? <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ alignSelf: m.who === "ai" ? "flex-start" : "flex-end", maxWidth: "85%", padding: "10px 14px", borderRadius: 14, fontSize: 13, lineHeight: 1.5, background: m.who === "ai" ? `${C.teal}10` : `${C.violet}14`, border: `1px solid ${m.who === "ai" ? C.teal + "22" : C.violet + "22"}` }}>{m.t}</motion.div> : null)}
          </div>
        </GlassCard>
      </div>
    </Center>
  );
}

/* ---- Phone bezel frame ---- */
function PhoneFrame({ children, time = "23:12", barBg = "#1F2C34", width = 372 }) {
  return (
    <div style={{ width, borderRadius: 46, padding: 9, background: "#0d1117", border: "1px solid rgba(255,255,255,0.10)", boxShadow: "0 24px 70px rgba(0,0,0,0.65)", position: "relative" }}>
      <div style={{ borderRadius: 37, overflow: "hidden", position: "relative" }}>
        {/* status bar */}
        <div style={{ background: barBg, height: 30, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 22px", position: "relative" }}>
          <span style={{ color: "#E9EDEF", fontSize: 12.5, fontWeight: 600, fontFamily: FONT }}>{time}</span>
          <div style={{ position: "absolute", left: "50%", top: 7, transform: "translateX(-50%)", width: 84, height: 17, borderRadius: 10, background: "#0d1117" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <svg width="15" height="11" viewBox="0 0 16 12" fill="#E9EDEF"><path d="M1 8.5h2V11H1zM4.5 6.5h2V11h-2zM8 4h2v7H8zM11.5 1.5h2V11h-2z" /></svg>
            <svg width="20" height="11" viewBox="0 0 24 12" fill="none"><rect x="0.5" y="0.5" width="19" height="11" rx="3" stroke="#E9EDEF" opacity="0.5" /><rect x="2" y="2" width="13" height="8" rx="1.5" fill="#E9EDEF" /><path d="M21.5 4v4c1-.2 1.7-1 1.7-2s-.7-1.8-1.7-2z" fill="#E9EDEF" opacity="0.5" /></svg>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ---- WhatsApp double scene (one continuous thread) ---- */
function WaScene({ p }) {
  const phase2 = p >= 0.5;
  const cars = [
    { name: "BMW 118i SE", price: "10,495", spec: "105k mi · 2022", img: "https://bluesky.cdn.imgeng.in/cogstock-images/at-7ce77e3ccca7455e8f3c2297b7e1a133.jpg?imgeng=/w_700/" },
    { name: "BMW 120d Sport", price: "12,795", spec: "72k mi · 2021", img: "https://bluesky.cdn.imgeng.in/cogstock-images/at-9d7c881e31b7455d98275798c9b1d0ae.jpg?imgeng=/w_700/" },
  ];
  const steps = { vnote: 0.05, typing1: 0.1, reply1: 0.17, cards: 0.25, summary: 0.38, finQ: 0.53, typing2: 0.57, finCard: 0.63, satQ: 0.75, booked: 0.83 };
  const typing = (p >= steps.typing1 && p < steps.reply1) || (p >= steps.typing2 && p < steps.finCard);
  const Tail = ({ out }) => (
    <svg width="8" height="13" viewBox="0 0 8 13" style={{ position: "absolute", top: 0, [out ? "right" : "left"]: -7 }}>
      <path d={out ? "M0 0 H8 V13 C8 5 4 1.5 0 0 Z" : "M8 0 H0 V13 C0 5 4 1.5 8 0 Z"} fill={out ? C.waBubbleOut : C.waBubbleIn} />
    </svg>
  );
  const Meta = ({ time = "23:12", ticks = true, light = false }) => (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 11, color: light ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.45)", float: "right", margin: "6px -2px 0 10px", position: "relative", top: 4 }}>
      {time}
      {ticks && <svg width="16" height="11" viewBox="0 0 16 11" fill="none"><path d="M11.07 0.65L4.98 6.73L2.22 3.98L0.81 5.39L4.98 9.56L12.48 2.06L11.07 0.65Z" fill="#53bdeb" /><path d="M14.07 0.65L7.98 6.73L7.28 6.04L5.86 7.45L7.98 9.56L15.48 2.06L14.07 0.65Z" fill="#53bdeb" /></svg>}
    </span>
  );
  const copy1 = easeOut(clamp01(Math.min(p / 0.14, (0.5 - p) / 0.06)));
  const copy2 = easeOut(clamp01((p - 0.52) / 0.08));
  return (
    <Center wide>
      <div style={{ display: "flex", gap: 60, alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
        <div style={{ width: 420, maxWidth: "90vw", textAlign: "left", position: "relative", minHeight: 360, flexShrink: 0 }}>
          <div style={{ position: "absolute", inset: 0, opacity: copy1, transform: `translateX(${(1 - copy1) * -26}px)`, pointerEvents: "none" }}>
            <Badge color={C.green}><I.WhatsApp s={14} /> WHATSAPP · 24/7</Badge>
            <h2 style={{ fontFamily: DISPLAY, fontStretch: "112%", fontSize: "clamp(1.6rem,3.4vw,2.5rem)", fontWeight: 800, letterSpacing: -1, margin: "20px 0 0", lineHeight: 1.12 }}>Where your customers <span style={{ color: C.green }}>already are.</span></h2>
            <p style={{ color: C.dim, fontSize: 16, marginTop: 16, lineHeight: 1.7 }}>Replies in seconds — even at midnight. Understands voice notes, searches your stock, sends real cars with real prices.</p>
            <div style={{ display: "flex", gap: 8, marginTop: 24, flexWrap: "wrap" }}>
              <Pill color={C.green} active={p > 0.08}>Voice notes</Pill>
              <Pill color={C.green} active={p > 0.26}>Live inventory</Pill>
              <Pill color={C.green} active={p > 0.4}>Rich car cards</Pill>
            </div>
          </div>
          <div style={{ position: "absolute", inset: 0, opacity: copy2, transform: `translateX(${(1 - copy2) * -26}px)`, pointerEvents: "none" }}>
            <Badge color={C.teal}>QUALIFY & BOOK</Badge>
            <h2 style={{ fontFamily: DISPLAY, fontStretch: "112%", fontSize: "clamp(1.6rem,3.4vw,2.5rem)", fontWeight: 800, letterSpacing: -1, margin: "20px 0 0", lineHeight: 1.12 }}>From chat to <GradTxt>booked test drive.</GradTxt></h2>
            <p style={{ color: C.dim, fontSize: 16, marginTop: 16, lineHeight: 1.7 }}>Finance, deposit, part-exchange — qualified in the conversation, with the test drive booked before it ends.</p>
            <div style={{ display: "flex", gap: 8, marginTop: 24, flexWrap: "wrap" }}>
              <Pill active={p > 0.6}>Finance quote</Pill>
              <Pill active={p > 0.78}>Deposit taken</Pill>
              <Pill active={p > 0.86}>Test drive booked</Pill>
            </div>
          </div>
        </div>
        <PhoneFrame time="23:12" barBg="#1F2C34">
          {/* WA Header */}
          <div style={{ background: "#1F2C34", padding: "6px 10px 8px", display: "flex", alignItems: "center", gap: 8 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8696A0" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
            <div style={{ width: 38, height: 38, borderRadius: "50%", background: GRAD, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <LogoMark size={19} fill="#fff" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 500, fontSize: 16, color: "#E9EDEF" }}>CarPass AI</div>
              <div style={{ fontSize: 12.5, color: typing ? C.green : "#8696A0", marginTop: 1, fontStyle: typing ? "italic" : "normal" }}>{typing ? "typing…" : "online"}</div>
            </div>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8696A0" strokeWidth="2" strokeLinecap="round"><path d="M23 7l-7 5 7 5z" /><rect x="1" y="5" width="15" height="14" rx="2" /></svg>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8696A0" strokeWidth="2" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.11 2 2 0 014.11 2h3" /></svg>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="#8696A0"><circle cx="12" cy="6" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="18" r="1.5" /></svg>
          </div>
          {/* Chat body */}
          <div ref={el => { if (el) el.scrollTop = el.scrollHeight; }} style={{ padding: "8px 14px", height: 430, overflowY: "auto", display: "flex", flexDirection: "column", gap: 4, background: "#0B141A", backgroundImage: "radial-gradient(rgba(255,255,255,0.012) 1px, transparent 1px)", backgroundSize: "20px 20px" }}>
            <div style={{ textAlign: "center", margin: "4px 0 2px" }}><span style={{ background: "#182229", color: "#8696A0", fontSize: 12, padding: "4px 12px", borderRadius: 8 }}>TODAY</span></div>
            <div style={{ textAlign: "center", margin: "2px 12px 6px" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "#182229", color: "#FFD279", fontSize: 11, padding: "5px 10px", borderRadius: 8, lineHeight: 1.35 }}>
                <I.Lock s={10} c="#FFD279" /> Messages and calls are end-to-end encrypted
              </span>
            </div>
            <AnimatePresence>
              {p >= steps.vnote && <motion.div key="v1" initial={{ opacity: 0, scale: 0.95, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} style={{ alignSelf: "flex-end", maxWidth: "78%", position: "relative" }}>
                <Tail out />
                <div style={{ background: C.waBubbleOut, borderRadius: "0 8px 8px 8px", padding: "4px 4px 2px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 8px", background: "rgba(0,0,0,0.15)", borderRadius: 6 }}>
                    <div style={{ width: 34, height: 34, borderRadius: "50%", background: "rgba(0,0,0,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><svg width="14" height="14" viewBox="0 0 24 24" fill="#8fd3c4"><path d="M8 5v14l11-7z" /></svg></div>
                    <div style={{ display: "flex", alignItems: "center", gap: 1.5, flex: 1, height: 28 }}>
                      {Array.from({ length: 28 }).map((_, j) => <div key={j} style={{ width: 2.5, borderRadius: 1, background: "#8fd3c4", height: 3 + ((j * 7 + 3) % 18), opacity: 0.7 }} />)}
                    </div>
                    <span style={{ fontSize: 11, color: "#8fd3c4", flexShrink: 0, marginLeft: 4 }}>0:04</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 3, padding: "2px 4px 1px" }}>
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.55)" }}>23:12</span>
                    <svg width="16" height="11" viewBox="0 0 16 11" fill="none"><path d="M11.07 0.65L4.98 6.73L2.22 3.98L0.81 5.39L4.98 9.56L12.48 2.06L11.07 0.65Z" fill="#53bdeb" /><path d="M14.07 0.65L7.98 6.73L7.28 6.04L5.86 7.45L7.98 9.56L15.48 2.06L14.07 0.65Z" fill="#53bdeb" /></svg>
                  </div>
                </div>
              </motion.div>}
              {p >= steps.reply1 && <motion.div key="t1" initial={{ opacity: 0, scale: 0.95, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} style={{ alignSelf: "flex-start", maxWidth: "85%", position: "relative" }}>
                <Tail />
                <div style={{ background: C.waBubbleIn, borderRadius: "8px 8px 8px 8px", borderTopLeftRadius: 0, padding: "7px 9px 6px" }}>
                  <span style={{ color: "#E9EDEF", fontSize: 14.2, lineHeight: 1.38 }}>Hi James — yes! Two black 1 Series in stock right now. Here you go:</span>
                  <Meta ticks={false} />
                </div>
              </motion.div>}
              {p >= steps.cards && <motion.div key="cards" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ display: "flex", gap: 6, alignSelf: "flex-start", maxWidth: "96%", marginTop: 2 }}>
                {cars.map((car, ci) => (
                  <motion.div key={ci} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: ci * 0.2 }} style={{ width: 156, background: C.waBubbleIn, borderRadius: 10, overflow: "hidden" }}>
                    <img src={car.img} alt={car.name} style={{ width: "100%", height: 92, objectFit: "cover", display: "block" }} />
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
              {p >= steps.summary && <motion.div key="t2" initial={{ opacity: 0, scale: 0.95, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} style={{ alignSelf: "flex-start", maxWidth: "86%", position: "relative", marginTop: 2 }}>
                <Tail />
                <div style={{ background: C.waBubbleIn, borderRadius: 8, borderTopLeftRadius: 0, padding: "7px 9px 6px" }}>
                  <span style={{ color: "#E9EDEF", fontSize: 14.2, lineHeight: 1.4 }}>The <span style={{ color: C.green, fontWeight: 600 }}>118i SE at £10,495</span> is the strongest deal — 1 owner, full history. Want it on finance?</span>
                  <Meta ticks={false} />
                </div>
              </motion.div>}
              {p >= steps.finQ && <motion.div key="fq" initial={{ opacity: 0, scale: 0.95, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} style={{ alignSelf: "flex-end", maxWidth: "78%", position: "relative", marginTop: 2 }}>
                <Tail out />
                <div style={{ background: C.waBubbleOut, borderRadius: 8, borderTopRightRadius: 0, padding: "7px 9px 6px" }}>
                  <span style={{ color: "#E9EDEF", fontSize: 14.2, lineHeight: 1.38 }}>Yes — what would it be a month with £1,500 down?</span>
                  <Meta time="23:13" light />
                </div>
              </motion.div>}
              {p >= steps.finCard && <motion.div key="fc" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ alignSelf: "flex-start", width: 250, background: C.waBubbleIn, borderRadius: 10, overflow: "hidden", marginTop: 2 }}>
                <div style={{ padding: "10px 12px", background: "rgba(37,211,102,0.08)", borderBottom: "1px solid #2A3942", display: "flex", alignItems: "center", gap: 8 }}>
                  <I.Zap s={14} c={C.green} /><span style={{ color: "#E9EDEF", fontSize: 12.5, fontWeight: 700 }}>Finance illustration · 118i SE</span>
                </div>
                <div style={{ padding: "10px 12px" }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                    <span style={{ color: C.green, fontWeight: 800, fontSize: 22, fontFamily: DISPLAY }}>£279</span>
                    <span style={{ color: "#8696A0", fontSize: 12 }}>/ month · 48 months</span>
                  </div>
                  {[["Deposit", "£1,500"], ["Part-exchange", "Accepted"], ["Decision", "In minutes"]].map(([k, v]) => (
                    <div key={k} style={{ display: "flex", justifyContent: "space-between", marginTop: 7, fontSize: 12.5 }}>
                      <span style={{ color: "#8696A0" }}>{k}</span><span style={{ color: "#E9EDEF", fontWeight: 600 }}>{v}</span>
                    </div>
                  ))}
                </div>
              </motion.div>}
              {p >= steps.satQ && <motion.div key="sq" initial={{ opacity: 0, scale: 0.95, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} style={{ alignSelf: "flex-end", maxWidth: "78%", position: "relative", marginTop: 2 }}>
                <Tail out />
                <div style={{ background: C.waBubbleOut, borderRadius: 8, borderTopRightRadius: 0, padding: "7px 9px 6px" }}>
                  <span style={{ color: "#E9EDEF", fontSize: 14.2, lineHeight: 1.38 }}>That works. Can I see it Saturday morning?</span>
                  <Meta time="23:14" light />
                </div>
              </motion.div>}
              {p >= steps.booked && <motion.div key="bk" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ alignSelf: "flex-start", width: 250, background: C.waBubbleIn, borderRadius: 10, overflow: "hidden", marginTop: 2 }}>
                <div style={{ padding: "10px 12px", display: "flex", gap: 10, alignItems: "center" }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(37,211,102,0.12)", border: "1px solid rgba(37,211,102,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <I.Calendar s={18} c={C.green} />
                  </div>
                  <div>
                    <div style={{ color: "#E9EDEF", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>Test drive booked <I.Check s={13} c={C.green} /></div>
                    <div style={{ color: "#8696A0", fontSize: 12, marginTop: 3 }}>Sat 14 Jun · 11:00 · Carpass Motors Leeds</div>
                  </div>
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
        </PhoneFrame>
      </div>
    </Center>
  );
}

/* ---- Follow-up: SMS + Email re-engagement ---- */
function FollowUp({ p }) {
  const phoneIn = easeOutExpo(clamp01((p - 0.06) / 0.2));
  const emailIn = easeOutExpo(clamp01((p - 0.56) / 0.18));
  const recovered = easeBack(clamp01((p - 0.8) / 0.16));
  return (
    <Center wide>
      <div style={{ display: "flex", gap: 70, alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
        <SideCopy badge="NEVER GOES COLD" badgeColor={C.sms} title={<>Gone quiet? <GradTxt>CarPass follows up.</GradTxt></>} body="Perfectly timed nudges by SMS and email — until the customer is back in the conversation, never lost to silence." p={p} pills={[{ t: "Day 2 · SMS", at: 0.25 }, { t: "Day 5 · Email", at: 0.6 }, { t: "Stops on reply", at: 0.78 }]} />
        <div style={{ position: "relative", width: 580, height: 540 }}>
          {/* Email card behind */}
          <div style={{ position: "absolute", right: 0, top: 64, width: 300, opacity: emailIn, transform: `rotate(${4 - emailIn * 7}deg) translateY(${(1 - emailIn) * 40}px)`, zIndex: 1 }}>
            <GlassCard style={{ padding: 16 }} gradient sweep>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: GRAD, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><LogoMark size={17} fill="#fff" /></div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>Carpass Motors</div>
                  <div style={{ fontSize: 11, color: C.dim, marginTop: 1 }}>to james@gmail.com</div>
                </div>
                <span style={{ fontSize: 10.5, fontWeight: 700, color: C.amber, background: `${C.amber}14`, border: `1px solid ${C.amber}33`, padding: "3px 8px", borderRadius: 6, letterSpacing: 0.5 }}>DAY 5 · EMAIL</span>
              </div>
              <div style={{ fontSize: 13.5, fontWeight: 700, marginTop: 12 }}>Your 118i is still available, James</div>
              <div style={{ fontSize: 12.5, color: C.dim, marginTop: 6, lineHeight: 1.55 }}>Saturday test drive slots are open this week — £279/month with your £1,500 deposit still stands…</div>
              <div style={{ marginTop: 12, paddingTop: 10, borderTop: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: C.teal }}>Rebook in one tap</span><I.Arrow s={12} c={C.teal} />
              </div>
            </GlassCard>
          </div>
          {/* SMS phone */}
          <div style={{ position: "absolute", left: 0, top: 0, opacity: phoneIn, transform: `translateY(${(1 - phoneIn) * 50}px)`, zIndex: 2, width: 310 }}>
            <PhoneFrame time="09:30" barBg="#000" width={310}>
              <div style={{ background: "#000", padding: "8px 0 10px", textAlign: "center", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                <div style={{ width: 34, height: 34, borderRadius: "50%", background: GRAD, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center" }}><LogoMark size={16} fill="#fff" /></div>
                <div style={{ color: "#fff", fontSize: 12, marginTop: 5, fontWeight: 600 }}>Carpass Motors</div>
              </div>
              <div style={{ background: "#000", height: 330, padding: "12px 12px 8px", display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ textAlign: "center", color: "#8E8E93", fontSize: 10.5, fontWeight: 600 }}>Tue 09:30 · <span style={{ color: C.sms }}>Day 2</span></div>
                {p > 0.18 && <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ alignSelf: "flex-start", maxWidth: "88%", background: "#26252A", color: "#fff", fontSize: 13.5, lineHeight: 1.45, padding: "9px 13px", borderRadius: 18, borderBottomLeftRadius: 5 }}>
                  Hi James, the black 118i you liked is still available. Saturday's 11:00 test drive slot is open — want me to hold it?
                </motion.div>}
                {p > 0.34 && <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ alignSelf: "flex-start" }}>
                  <div style={{ display: "flex", gap: 4, background: "#26252A", padding: "12px 14px", borderRadius: 18, borderBottomLeftRadius: 5, width: 58 }}>
                    {[0, 1, 2].map(i => <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: "#8E8E93", animation: `tdot 1.2s ${i * 0.18}s ease-in-out infinite` }} />)}
                  </div>
                </motion.div>}
                {p > 0.44 && <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ alignSelf: "flex-end", maxWidth: "80%", background: C.smsOut, color: "#fff", fontSize: 13.5, lineHeight: 1.45, padding: "9px 13px", borderRadius: 18, borderBottomRightRadius: 5, fontWeight: 500 }}>
                  Yes — hold it for me, I'll be there.
                </motion.div>}
                {p > 0.5 && <div style={{ textAlign: "right", color: "#8E8E93", fontSize: 10.5, paddingRight: 4 }}>Delivered</div>}
              </div>
              <div style={{ background: "#000", padding: "6px 10px 10px", display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 26, height: 26, borderRadius: "50%", background: "#26252A", display: "flex", alignItems: "center", justifyContent: "center", color: "#8E8E93", fontSize: 16, fontWeight: 600 }}>+</div>
                <div style={{ flex: 1, border: "1px solid #3A3A3C", borderRadius: 16, padding: "6px 12px", fontSize: 12.5, color: "#8E8E93" }}>Text message</div>
              </div>
            </PhoneFrame>
          </div>
          {/* Recovered chip */}
          <div style={{ position: "absolute", left: 190, bottom: 6, transform: `translateX(-50%) scale(${Math.max(0, recovered)})`, zIndex: 3 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8, background: `${C.teal}14`, border: `1px solid ${C.teal}55`, color: C.teal, padding: "9px 18px", borderRadius: 100, fontSize: 13.5, fontWeight: 700, letterSpacing: 0.3, boxShadow: `0 0 0 6px ${C.teal}08` }}>
              <I.Check s={15} /> Lead recovered
            </span>
          </div>
        </div>
      </div>
    </Center>
  );
}

function Website({ p }) {
  const msgs = [{ who: "user", t: "Do you have any black 1 Series?" }, { who: "ai", t: "Yes — 3 in stock. Want me to call you?" }, { who: "user", t: "Call me" }];
  const step = Math.floor(p * 6);
  const cars = [
    "https://bluesky.cdn.imgeng.in/cogstock-images/at-7ce77e3ccca7455e8f3c2297b7e1a133.jpg?imgeng=/w_700/",
    "https://bluesky.cdn.imgeng.in/cogstock-images/at-9d7c881e31b7455d98275798c9b1d0ae.jpg?imgeng=/w_700/",
  ];
  return (
    <Center wide>
      <div style={{ display: "flex", gap: 64, alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
        <GlassCard style={{ width: 500, height: 360, borderRadius: 16, position: "relative" }} sweep>
          <div style={{ padding: "14px 18px", display: "flex", gap: 8, alignItems: "center", borderBottom: `1px solid ${C.border}` }}>
            <div style={{ display: "flex", gap: 7 }}>{["#ff5f57", "#febc2e", "#28c840"].map(c => <div key={c} style={{ width: 11, height: 11, borderRadius: "50%", background: c }} />)}</div>
            <div style={{ marginLeft: 14, padding: "5px 16px", borderRadius: 8, background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`, fontSize: 12, color: C.dim, flex: 1, maxWidth: 280, display: "flex", alignItems: "center", gap: 6 }}>
              <I.Lock s={10} c={C.dim} /> carpassmotors.co.uk
            </div>
          </div>
          <div style={{ padding: 22 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 26, height: 26, borderRadius: 7, background: GRAD, display: "flex", alignItems: "center", justifyContent: "center" }}><LogoMark size={13} fill="#fff" /></div>
              <div style={{ width: "32%", height: 11, borderRadius: 4, background: "rgba(255,255,255,0.07)" }} />
              <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>{[28, 38, 32].map((w, i) => <div key={i} style={{ width: w, height: 8, borderRadius: 4, background: "rgba(255,255,255,0.05)" }} />)}</div>
            </div>
            <div style={{ width: "52%", height: 15, borderRadius: 4, background: "rgba(255,255,255,0.08)", marginTop: 22 }} />
            <div style={{ display: "flex", gap: 12, marginTop: 18 }}>
              {cars.map((img, i) => (
                <div key={i} style={{ flex: 1, borderRadius: 10, overflow: "hidden", border: `1px solid ${C.border}`, background: "rgba(255,255,255,0.02)" }}>
                  <img src={img} alt="car" style={{ width: "100%", height: 64, objectFit: "cover", display: "block" }} />
                  <div style={{ padding: "7px 9px" }}>
                    <div style={{ width: "70%", height: 7, borderRadius: 3, background: "rgba(255,255,255,0.08)" }} />
                    <div style={{ width: "40%", height: 7, borderRadius: 3, background: `${C.teal}33`, marginTop: 5 }} />
                  </div>
                </div>
              ))}
              <div style={{ flex: 1, borderRadius: 10, border: `1px solid ${C.border}`, background: "rgba(255,255,255,0.02)" }} />
            </div>
          </div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 200, damping: 20 }} style={{ position: "absolute", right: 16, bottom: 16, width: 248, borderRadius: 14, background: C.card, border: `1px solid ${C.teal}33`, overflow: "hidden", zIndex: 2 }}>
            <div style={{ padding: "10px 14px", background: `linear-gradient(90deg, ${C.teal}15, ${C.violet}10)`, display: "flex", alignItems: "center", gap: 8, borderBottom: `1px solid ${C.border}` }}>
              <div style={{ width: 20, height: 20, borderRadius: 6, background: GRAD, display: "flex", alignItems: "center", justifyContent: "center" }}><LogoMark size={10} fill="#fff" /></div>
              <span style={{ fontSize: 12, fontWeight: 700 }}>CarPass AI</span>
              <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 5 }}><div style={{ width: 7, height: 7, borderRadius: "50%", background: C.teal }} /><span style={{ fontSize: 10, color: C.teal, fontWeight: 600 }}>LIVE</span></span>
            </div>
            <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: 6, minHeight: 110 }}>{msgs.map((m, i) => step > i ? <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} style={{ alignSelf: m.who === "ai" ? "flex-start" : "flex-end", maxWidth: "85%", padding: "7px 10px", borderRadius: 10, fontSize: 11.5, lineHeight: 1.4, background: m.who === "ai" ? `${C.teal}12` : `${C.violet}14`, border: `1px solid ${m.who === "ai" ? C.teal + "22" : C.violet + "22"}` }}>{m.t}</motion.div> : null)}</div>
            <div style={{ display: "flex", gap: 8, padding: "0 12px 12px" }}>
              <span style={{ flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "7px 0", borderRadius: 8, background: `${C.teal}14`, border: `1px solid ${C.teal}33`, color: C.teal, fontSize: 11, fontWeight: 700 }}><I.Phone s={12} c={C.teal} /> Call</span>
              <span style={{ flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "7px 0", borderRadius: 8, background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`, color: C.ink, fontSize: 11, fontWeight: 700 }}><I.Sms s={12} c={C.ink} /> Chat</span>
            </div>
          </motion.div>
        </GlassCard>
        <SideCopy badge="WEBSITE WIDGET" badgeColor={C.violet} title={<>Call or chat, <GradTxt>right on your site.</GradTxt></>} body="Drop CarPass onto any dealer website. Visitors chat or start a voice call — the AI answers instantly, every time." p={p} left />
      </div>
    </Center>
  );
}

/* ---- Funnel: Answer → Qualify → Follow up → Sell ---- */
function FunnelScene({ p }) {
  const steps = [
    { icon: I.Phone, label: "Answer", desc: "Every call & message, 24/7", color: C.teal },
    { icon: I.Filter, label: "Qualify", desc: "Budget, finance, part-exchange", color: C.blue },
    { icon: I.Refresh, label: "Follow up", desc: "SMS & email until they reply", color: C.violet },
    { icon: I.Key, label: "Sell", desc: "Test drive booked, deal progressed", color: C.green },
  ];
  const headP = easeOutExpo(clamp01(p / 0.16));
  const beamP = easeInOut(clamp01((p - 0.16) / 0.5));
  const chipsP = [easeOut(clamp01((p - 0.66) / 0.16)), easeOut(clamp01((p - 0.76) / 0.16))];
  return (
    <Center wide>
      <div style={{ opacity: headP, transform: `translateY(${(1 - headP) * 18}px)` }}>
        <Badge color={C.blue}>SALES & FINANCE</Badge>
        <h2 style={{ fontFamily: DISPLAY, fontStretch: "112%", fontSize: "clamp(1.8rem,3.8vw,3.1rem)", fontWeight: 800, letterSpacing: -1.2, margin: "22px 0 0" }}>
          One proven funnel. <GradTxt>On repeat.</GradTxt>
        </h2>
      </div>
      <div style={{ position: "relative", display: "flex", gap: 26, justifyContent: "center", alignItems: "stretch", marginTop: 56, flexWrap: "wrap" }}>
        {/* beam */}
        <div style={{ position: "absolute", left: "6%", right: "6%", top: 43, height: 2, background: "rgba(255,255,255,0.06)", zIndex: 0 }}>
          <div style={{ height: "100%", width: `${beamP * 100}%`, background: GRAD, position: "relative" }}>
            <div style={{ position: "absolute", right: -4, top: -3, width: 8, height: 8, borderRadius: "50%", background: C.teal, opacity: beamP > 0 && beamP < 1 ? 1 : 0, boxShadow: `0 0 0 4px ${C.teal}22` }} />
          </div>
        </div>
        {steps.map((s, i) => {
          const sp = easeBack(clamp01((p - 0.12 - i * 0.12) / 0.2));
          const Icon = s.icon;
          return (
            <div key={i} style={{ opacity: clamp01(sp * 1.4), transform: `translateY(${(1 - sp) * 36}px)`, zIndex: 1 }}>
              <GlassCard style={{ width: 210, padding: "22px 18px 18px", textAlign: "center" }} gradient sweep>
                <div style={{ width: 52, height: 52, borderRadius: 15, background: `${s.color}12`, border: `1px solid ${s.color}36`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto" }}>
                  <Icon s={24} c={s.color} />
                </div>
                <div style={{ fontSize: 11, color: C.muted, fontWeight: 700, letterSpacing: 2, marginTop: 14 }}>{`0${i + 1}`}</div>
                <div style={{ fontWeight: 800, fontSize: 17, marginTop: 4, fontFamily: DISPLAY }}>{s.label}</div>
                <div style={{ fontSize: 12.5, color: C.dim, marginTop: 6, lineHeight: 1.5 }}>{s.desc}</div>
              </GlassCard>
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 40, flexWrap: "wrap" }}>
        <span style={{ opacity: chipsP[0], transform: `translateY(${(1 - chipsP[0]) * 12}px)`, display: "inline-flex", alignItems: "center", gap: 8, padding: "9px 18px", borderRadius: 100, background: "rgba(255,255,255,0.03)", border: `1px solid ${C.border}`, fontSize: 13, color: C.ink, fontWeight: 600 }}>
          <I.Zap s={14} c={C.teal} /> Trained on real car-buying interactions
        </span>
        <span style={{ opacity: chipsP[1], transform: `translateY(${(1 - chipsP[1]) * 12}px)`, display: "inline-flex", alignItems: "center", gap: 8, padding: "9px 18px", borderRadius: 100, background: "rgba(255,255,255,0.03)", border: `1px solid ${C.border}`, fontSize: 13, color: C.ink, fontWeight: 600 }}>
          <I.Database s={14} c={C.blue} /> Synced to your CRM in real time
        </span>
      </div>
    </Center>
  );
}

/* ---- 3D Neon Globe ---- */
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
      <mesh>
        <sphereGeometry args={[2, 64, 64]} />
        <meshBasicMaterial map={texture} color="#33eedd" transparent opacity={0.9} />
      </mesh>
      <mesh>
        <sphereGeometry args={[2.08, 48, 48]} />
        <meshBasicMaterial color={C.teal} transparent opacity={0.03} side={THREE.BackSide} />
      </mesh>
      {arcs.map((pts, i) => {
        const arcDelay = 0.15 + i * 0.08;
        const arcProgress = clamp01((progress - arcDelay) / 0.25);
        return arcProgress > 0 ? <AnimatedArc key={i} points={pts} color={i % 2 === 0 ? C.teal : C.violet} progress={easeOut(arcProgress)} /> : null;
      })}
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
      <div style={{ position: "absolute", inset: 0, opacity: fadeIn, pointerEvents: "none" }}>
        <Canvas camera={{ position: [0, 0, 6], fov: 35 }} style={{ background: "transparent" }}>
          <ambientLight intensity={0.12} />
          <pointLight position={[-2, 2, 5]} color={C.teal} intensity={2.5} />
          <pointLight position={[-4, 0, 3]} color={C.violet} intensity={0.8} />
          <NeonGlobe progress={p} />
        </Canvas>
      </div>
      <div style={{ position: "absolute", left: "5vw", bottom: "5vh", width: "40vw", height: "40vw", borderRadius: "50%", background: `radial-gradient(circle at 50% 50%, ${C.teal}12, ${C.violet}08, transparent 60%)`, pointerEvents: "none", opacity: fadeIn * 0.8 }} />
      <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "48%", display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 60px 0 40px", textAlign: "left" }}>
        <div style={{ opacity: easeOut(clamp01((p - 0.1) / 0.2)), transform: `translateY(${(1 - easeOut(clamp01((p - 0.1) / 0.2))) * 20}px)` }}>
          <Badge><I.Globe s={14} c={C.teal} /> BUILT FOR AUTOMOTIVE</Badge>
        </div>
        <h2 style={{ fontFamily: DISPLAY, fontStretch: "112%", fontSize: "clamp(1.8rem,3.4vw,2.9rem)", fontWeight: 800, letterSpacing: -1, margin: "24px 0 0", lineHeight: 1.1, opacity: easeOut(clamp01((p - 0.15) / 0.2)), transform: `translateY(${(1 - easeOut(clamp01((p - 0.15) / 0.2))) * 20}px)` }}>
          Retailers. OEMs.<br /><GradTxt>Finance companies.</GradTxt>
        </h2>
        <p style={{ color: C.dim, fontSize: 16, marginTop: 20, lineHeight: 1.7, maxWidth: 420, opacity: easeOut(clamp01((p - 0.25) / 0.2)) }}>
          From a single showroom to a national network — one platform across every market and every time zone, twenty-four seven.
        </p>
        <div style={{ display: "flex", gap: 32, marginTop: 36, opacity: easeOut(clamp01((p - 0.4) / 0.25)) }}>
          {[{ n: "Voice + 4", l: "Channels" }, { n: "24/7", l: "Always on" }, { n: "Every", l: "Market" }].map((s, i) => (
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
  const after = clamp01((p - 0.22) / 0.25);
  const chips = [
    { icon: <I.Phone s={14} c={C.teal} />, t: "Voice + messaging" },
    { icon: <I.Key s={14} c={C.green} />, t: "Built for automotive" },
    { icon: <I.Zap s={14} c={C.violet} />, t: "Always on, 24/7" },
  ];
  return (
    <div style={{ position: "absolute", inset: 0, textAlign: "center" }}>
      <div style={{ position: "absolute", left: "50%", top: "38%", transform: "translate(-50%,-50%)", width: "100%", padding: "0 32px" }}>
        <h2 style={{ fontFamily: DISPLAY, fontStretch: "118%", fontSize: "clamp(2.2rem,5.4vw,4.4rem)", fontWeight: 900, letterSpacing: -2.5, margin: 0, lineHeight: 1.06 }}>
          <KWords text="Never lose a" p={p} start={0.24} stagger={0.05} /><br />
          <KWords text="customer again." p={p} start={0.4} stagger={0.055} grad />
        </h2>
        <p style={{ color: C.dim, fontSize: "clamp(1rem,1.8vw,1.2rem)", marginTop: 26, opacity: easeOut(clamp01((p - 0.52) / 0.18)), letterSpacing: 0.3 }}>
          Book a demo at <span style={{ color: C.ink, fontWeight: 600 }}>carpass.ai</span>
        </p>
      </div>
      <div style={{ position: "absolute", left: "50%", top: "67%", transform: "translate(-50%,-50%)", width: 240, height: 70, borderRadius: 20, border: `1px solid ${C.teal}33`, opacity: easeOut(clamp01((p - 0.34) / 0.2)) * 0.6, animation: "pulseRing 2.6s ease-out infinite" }} />
      <div style={{ position: "absolute", left: "50%", top: "86%", transform: "translate(-50%,-50%)", display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center", width: "90%" }}>
        {chips.map((c, i) => {
          const cp = easeOut(clamp01((after - 0.3 - i * 0.12) / 0.3));
          return (
            <span key={i} style={{ opacity: cp, transform: `translateY(${(1 - cp) * 14}px)`, display: "inline-flex", alignItems: "center", gap: 8, padding: "9px 18px", borderRadius: 100, background: "rgba(255,255,255,0.03)", border: `1px solid ${C.border}`, fontSize: 13, color: C.ink, fontWeight: 600 }}>
              {c.icon} {c.t}
            </span>
          );
        })}
      </div>
    </div>
  );
}

/* ---- Shared layout ---- */
function Center({ children, wide }) {
  return <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "40px 32px" }}><div style={{ width: "100%", maxWidth: wide ? 1180 : 880, position: "relative" }}>{children}</div></div>;
}

function SideCopy({ badge, badgeColor, title, body, p, left, pills }) {
  const lp = easeOut(clamp01(p / 0.25));
  return (
    <div style={{ maxWidth: 420, textAlign: "left", opacity: lp, transform: `translateX(${(1 - lp) * (left ? 30 : -30)}px)` }}>
      <Badge color={badgeColor}>{badge}</Badge>
      <h2 style={{ fontFamily: DISPLAY, fontStretch: "112%", fontSize: "clamp(1.6rem,3.4vw,2.5rem)", fontWeight: 800, letterSpacing: -1, margin: "20px 0 0", lineHeight: 1.12 }}>{title}</h2>
      <p style={{ color: C.dim, fontSize: 16, marginTop: 16, lineHeight: 1.7 }}>{body}</p>
      {pills && <div style={{ display: "flex", gap: 8, marginTop: 24, flexWrap: "wrap" }}>{pills.map((pl, i) => <Pill key={i} active={p > pl.at} color={badgeColor}>{pl.t}</Pill>)}</div>}
    </div>
  );
}

/* ============ AUDIO ============ */
const VO_KEYS = ["hook", "promise", "channels", "voice", "whatsapp1", "whatsapp2", "followup", "website", "funnel", "globe", "cta"];
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

/* ============ SETTINGS FAB ============ */
function SettingsFab({ playing, onTogglePlay, onRestart, voice, onVoiceChange, now }) {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  return (
    <div
      style={{ position: "absolute", bottom: 0, right: 0, width: open ? 240 : 80, height: open ? 360 : 80, zIndex: 20, opacity: hovered || open ? 1 : 0, transition: "opacity .3s" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setOpen(false); }}
    >
      {open && (
        <div style={{ position: "absolute", bottom: 70, right: 18, width: 200, background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "8px 0", overflow: "hidden" }}>
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
          <div style={{ padding: "6px 16px", fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: 1 }}>Voice</div>
          {VOICES.map(v => (
            <button key={v.id} onClick={() => onVoiceChange(v.id)} style={{ ...menuBtn, color: voice === v.id ? C.teal : C.ink }}>
              <span style={{ width: 20, textAlign: "center", fontSize: 10 }}>{voice === v.id ? "●" : "○"}</span>
              <span>{v.label}</span>
            </button>
          ))}
          <div style={{ height: 1, background: C.border, margin: "6px 0" }} />
          <div style={{ padding: "6px 16px", fontSize: 12, color: C.dim, fontFamily: "monospace" }}>
            {now.toFixed(1)}s / {DURATION}s
          </div>
        </div>
      )}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          position: "absolute", bottom: 18, right: 18, width: 44, height: 44, borderRadius: 12,
          background: open ? C.card : "rgba(255,255,255,0.06)",
          border: `1px solid ${open ? C.teal + "44" : C.border}`,
          color: open ? C.teal : "#EAF2FF", fontSize: 18, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", transition: "all .2s",
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

/* ============ ROOT ============ */
const SCENES = [
  ["intro", TL.intro, LogoIntro],
  ["hook", TL.hook, Hook],
  ["promise", TL.promise, PromiseScene],
  ["channels", TL.channels, Channels],
  ["voice", TL.voice, VoiceCall],
  ["wa", [TL.whatsapp1[0], TL.whatsapp2[1]], WaScene],
  ["followup", TL.followup, FollowUp],
  ["website", TL.website, Website],
  ["funnel", TL.funnel, FunnelScene],
  ["globe", TL.globe, GlobeSlide],
  ["cta", TL.cta, CTA],
];
const OV = 0.32, FD = 0.62;

const SEEK_T = (() => { const v = parseFloat(new URLSearchParams(window.location.search).get("t")); return Number.isFinite(v) ? Math.max(0, Math.min(DURATION, v)) : null; })();

export default function App() {
  const [playing, setPlaying] = useState(SEEK_T != null);
  const [started, setStarted] = useState(SEEK_T != null);
  const handleStart = () => { setStarted(true); setPlaying(true); };
  const [voice, setVoice] = useState("v2");
  const t = useClock(playing);
  useEffect(() => { if (SEEK_T != null) t.set(SEEK_T); }, [t]);
  const now = t.get();
  const audio = useAudio(playing, now, voice);
  const restart = () => { audio.stopAll(); t.set(0); setPlaying(true); };
  return (
    <div style={{ fontFamily: FONT, color: C.ink, position: "fixed", inset: 0, overflow: "hidden", background: C.bg }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Archivo:ital,wdth,wght@0,62..125,400..900&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { overflow: hidden; }
        *::-webkit-scrollbar { width: 0; height: 0; }
        * { scrollbar-width: none; }
        @keyframes pfloat { 0% { transform: translateY(0); opacity: 0; } 8% { opacity: 1; } 92% { opacity: 1; } 100% { transform: translateY(-105vh); opacity: 0; } }
        @keyframes csweep { 0% { left: -30%; } 55%, 100% { left: 130%; } }
        @keyframes spinSlow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes spinSlowRev { from { transform: rotate(0deg); } to { transform: rotate(-360deg); } }
        @keyframes orbA { from { transform: translate(0, 0); } to { transform: translate(8vw, 6vh); } }
        @keyframes orbB { from { transform: translate(0, 0); } to { transform: translate(-7vw, -5vh); } }
        @keyframes tdot { 0%, 60%, 100% { transform: translateY(0); opacity: .5; } 30% { transform: translateY(-4px); opacity: 1; } }
        @keyframes pulseRing { 0% { transform: translate(-50%,-50%) scale(1); opacity: .5; } 100% { transform: translate(-50%,-50%) scale(1.35); opacity: 0; } }
      `}</style>
      <Backdrop t={now} />
      <Orbs />
      <Particles />
      {SCENES.map(([key, span, Comp]) => {
        const s = span[0] - OV, e = span[1] + OV;
        if (now < s || now >= e) return null;
        const enter = easeOut(clamp01((now - s) / FD));
        const exit = easeOut(clamp01((e - now) / FD));
        const op = Math.min(enter, exit);
        const dy = (1 - enter) * 16 - (1 - exit) * 16;
        return (
          <div key={key} style={{ position: "absolute", inset: 0, zIndex: 1, opacity: op, transform: `translateY(${dy}px)` }}>
            <Comp p={local(now, span)} now={now} />
          </div>
        );
      })}
      <PersistentLogo now={now} />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 3, background: "rgba(255,255,255,0.06)", zIndex: 5 }}>
        <div style={{ height: "100%", width: `${(now / DURATION) * 100}%`, background: GRAD }} />
      </div>
      <SettingsFab playing={playing} onTogglePlay={() => setPlaying(v => !v)} onRestart={restart} voice={voice} onVoiceChange={setVoice} now={now} />
      {!started && (
        <div onClick={handleStart} style={{
          position: "absolute", inset: 0, zIndex: 50,
          background: C.bg, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", cursor: "pointer",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 40 }}>
            <LogoMark size={42} grad />
            <span style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 30, letterSpacing: -0.5, color: "#fff" }}>CarPass<GradTxt>.ai</GradTxt></span>
          </div>
          <div style={{ width: 80, height: 80, borderRadius: "50%", border: `2px solid ${C.teal}`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill={C.teal}><path d="M8 5v14l11-7z" /></svg>
          </div>
          <span style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 18, color: C.ink }}>Click to play</span>
          <span style={{ color: C.dim, fontSize: 13, marginTop: 8 }}>Never lose a customer again.</span>
        </div>
      )}
    </div>
  );
}
