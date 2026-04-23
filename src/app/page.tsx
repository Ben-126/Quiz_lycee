"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { deconnecter } from "@/lib/auth";
import AuthModal from "@/components/auth/AuthModal";
import MatiereCard from "@/components/navigation/MatiereCard";
import BanniereObjectif from "@/components/engagement/BanniereObjectif";
import { NIVEAUX, type Niveau } from "@/data/programmes";
import { getParametres } from "@/lib/parametres";
import type { User } from "@supabase/supabase-js";

// ─── Design tokens ────────────────────────────────────────────────────────────
const S = {
  bg: "#090A12",
  bg2: "#0D0F1B",
  border: "rgba(255,255,255,0.07)",
  border2: "rgba(255,255,255,0.14)",
  indigo: "#4D5EE8",
  indigoL: "#7A8DF5",
  coral: "#EF6E5A",
  coralL: "#F79080",
  amber: "#F5C840",
  amberL: "#FAD96A",
  teal: "#3DD6BF",
  text: "#ECEDF5",
  text2: "#878FA8",
  text3: "#484F68",
  card: "rgba(14,16,26,0.92)",
} as const;

// ─── Data ─────────────────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: "✦",
    title: "Quiz IA adaptatif",
    desc: "Questions générées par IA en temps réel, calibrées sur ton niveau et tes lacunes du moment.",
    accent: S.indigo,
    bg: "rgba(77,94,232,0.12)",
    bdr: "rgba(77,94,232,0.2)",
  },
  {
    icon: "◎",
    title: "Coach personnalisé",
    desc: "Analyse tes erreurs, identifie tes lacunes et propose un plan de révision sur-mesure.",
    accent: S.coral,
    bg: "rgba(239,110,90,0.10)",
    bdr: "rgba(239,110,90,0.2)",
  },
  {
    icon: "◈",
    title: "Streaks & Gamification",
    desc: "Maintiens ta série quotidienne, accumule des XP et débloque des badges de progression.",
    accent: S.amber,
    bg: "rgba(245,200,64,0.10)",
    bdr: "rgba(245,200,64,0.2)",
  },
  {
    icon: "⬡",
    title: "Scan de cours",
    desc: "Photographie tes notes — l'IA génère instantanément des questions de révision personnalisées.",
    accent: S.teal,
    bg: "rgba(61,214,191,0.10)",
    bdr: "rgba(61,214,191,0.2)",
  },
  {
    icon: "◉",
    title: "Révision espacée",
    desc: "L'algorithme scientifique qui optimise quand réviser chaque notion pour mémoriser durablement.",
    accent: S.indigo,
    bg: "rgba(77,94,232,0.12)",
    bdr: "rgba(77,94,232,0.2)",
  },
  {
    icon: "◐",
    title: "Langues vivantes",
    desc: "Pratique l'oral en anglais, espagnol ou allemand avec reconnaissance vocale et correction.",
    accent: S.coral,
    bg: "rgba(239,110,90,0.10)",
    bdr: "rgba(239,110,90,0.2)",
  },
];

const STEPS = [
  { n: "01", title: "Choisis ta matière", desc: "Maths, SVT, Histoire-Géo… Tous les programmes officiels du lycée pour Seconde, Première et Terminale." },
  { n: "02", title: "Lance un quiz", desc: "L'IA génère 10 questions adaptées à ton chapitre en quelques secondes. Aucune question identique." },
  { n: "03", title: "Analyse tes résultats", desc: "Vois exactement où tu en es et quels chapitres travailler en priorité dans ton calendrier." },
  { n: "04", title: "Progresse avec le coach", desc: "Des explications détaillées et des conseils sur-mesure pour comprendre, pas juste mémoriser." },
];

const FREE_FEATURES = [
  [true, "Quiz IA — 3 matières"],
  [true, "Progression basique"],
  [true, "Coach IA (5 sessions/jour)"],
  [false, "Toutes les matières"],
  [false, "Scan de cours & notes"],
  [false, "Langues vivantes orales"],
  [false, "Révision espacée avancée"],
] as [boolean, string][];

const PREMIUM_FEATURES = [
  [true, "Quiz IA — toutes les matières"],
  [true, "Progression détaillée"],
  [true, "Coach IA avancé illimité"],
  [true, "Scan de cours & notes"],
  [true, "Langues vivantes orales"],
  [true, "Révision espacée intelligente"],
  [true, "Accès prioritaire aux nouveautés"],
] as [boolean, string][];

// ─── Sub-components ────────────────────────────────────────────────────────────
function FeatureCard({ f, delay }: { f: typeof FEATURES[0]; delay: number }) {
  return (
    <div
      className="fade-up"
      style={{
        background: S.card,
        border: `1px solid ${S.border}`,
        borderRadius: 22,
        padding: 30,
        transition: "transform .2s, border-color .2s",
        transitionDelay: `${delay}s`,
        cursor: "default",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-3px)";
        e.currentTarget.style.borderColor = "rgba(77,94,232,0.28)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.borderColor = S.border;
      }}
    >
      <div
        style={{
          width: 46, height: 46, borderRadius: 10, marginBottom: 16,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: f.bg, border: `1px solid ${f.bdr}`,
          fontSize: "1.25rem", color: f.accent,
        }}
      >
        {f.icon}
      </div>
      <h3 style={{ fontFamily: "var(--f-head)", fontWeight: 800, color: S.text, marginBottom: 8, fontSize: "1.05rem", letterSpacing: "-0.01em" }}>
        {f.title}
      </h3>
      <p style={{ fontFamily: "var(--f-body)", color: S.text2, fontSize: "0.92rem", lineHeight: 1.65, margin: 0 }}>
        {f.desc}
      </p>
    </div>
  );
}

function PricingRow({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "5px 0" }}>
      <span style={{ color: ok ? S.teal : S.text3, fontWeight: 700, fontSize: "0.9rem", flexShrink: 0 }}>
        {ok ? "✓" : "–"}
      </span>
      <span style={{ fontFamily: "var(--f-body)", fontSize: "0.9rem", color: ok ? S.text : S.text3 }}>
        {label}
      </span>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [niveauActif, setNiveauActif] = useState<Niveau>(
    () => (typeof window !== "undefined" ? getParametres().niveauDefaut : "seconde")
  );
  const appRef = useRef<HTMLDivElement>(null);
  const niveauInfo = NIVEAUX.find((n) => n.slug === niveauActif)!;

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("visible")),
      { threshold: 0.08 }
    );
    document.querySelectorAll(".fade-up").forEach((el) => observer.observe(el));

    return () => {
      subscription.unsubscribe();
      observer.disconnect();
    };
  }, []);

  const scrollToApp = () => appRef.current?.scrollIntoView({ behavior: "smooth" });
  const handleDeconnexion = async () => { await deconnecter(); setUser(null); };

  return (
    <div className="rv-grain" style={{ background: S.bg, color: S.text, minHeight: "100vh" }}>

      {/* ──────────────────────── NAV PILL ──────────────────────── */}
      <nav style={{
        position: "fixed", top: 14, left: "50%", transform: "translateX(-50%)",
        zIndex: 100, background: "rgba(9,10,18,0.88)", backdropFilter: "blur(20px)",
        border: `1px solid ${S.border2}`, borderRadius: 999,
        boxShadow: "0 8px 40px rgba(0,0,0,0.4)",
        display: "flex", alignItems: "center", gap: 2, height: 52, padding: "0 20px",
        whiteSpace: "nowrap",
      }}>
        <button
          onClick={scrollToApp}
          style={{ display: "flex", alignItems: "center", gap: 8, background: "transparent", border: "none", cursor: "pointer", padding: "0 10px 0 0" }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 2 14.5 9.5H22l-6 4.5 2.5 7.5L12 17l-6.5 4.5L8 14 2 9.5h7.5L12 2Z" fill={S.indigo} />
            <circle cx="18.5" cy="6" r="2.2" fill={S.coral} />
            <circle cx="5.5" cy="18" r="1.8" fill={S.teal} />
          </svg>
          <span style={{ fontFamily: "var(--f-head)", fontWeight: 900, color: S.text, fontSize: "1rem", letterSpacing: "-0.01em" }}>
            Révioria
          </span>
        </button>

        {(["Fonctionnalités", "Comment ça marche", "Tarifs"] as const).map((label, i) => (
          <a
            key={i}
            href={`#s${i}`}
            style={{ fontSize: "0.85rem", color: S.text2, textDecoration: "none", padding: "6px 10px", borderRadius: 8, fontFamily: "var(--f-body)", fontWeight: 600, transition: "background .2s" }}
            onMouseEnter={(e) => ((e.target as HTMLElement).style.background = "rgba(255,255,255,0.06)")}
            onMouseLeave={(e) => ((e.target as HTMLElement).style.background = "transparent")}
          >
            {label}
          </a>
        ))}

        <button
          onClick={user ? scrollToApp : () => setShowAuth(true)}
          style={{
            marginLeft: 10,
            background: `linear-gradient(135deg, ${S.coral} 0%, #E85840 100%)`,
            color: "#fff", border: "none", borderRadius: 999, padding: "8px 20px",
            fontFamily: "var(--f-head)", fontWeight: 800, fontSize: "0.85rem", cursor: "pointer",
            boxShadow: "0 4px 16px rgba(239,110,90,0.30)",
          }}
        >
          {user ? "Réviser" : "Commencer"}
        </button>
      </nav>

      {/* ──────────────────────── HERO ──────────────────────── */}
      <section style={{ padding: "155px 24px 88px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        {/* Glows atmosphériques */}
        <div style={{ position: "absolute", top: 60, left: "50%", transform: "translateX(-50%)", width: 560, height: 400, background: "rgba(77,94,232,0.16)", filter: "blur(90px)", borderRadius: "50%", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: 40, right: "10%", width: 380, height: 380, background: "rgba(239,110,90,0.14)", filter: "blur(90px)", borderRadius: "50%", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: 120, left: "6%", width: 260, height: 260, background: "rgba(245,200,64,0.12)", filter: "blur(90px)", borderRadius: "50%", pointerEvents: "none" }} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 760, margin: "0 auto" }}>
          {/* Badge */}
          <div
            className="fade-up"
            style={{ display: "inline-flex", alignItems: "center", background: "rgba(245,200,64,0.10)", border: "1px solid rgba(245,200,64,0.30)", borderRadius: 999, padding: "5px 14px", marginBottom: 28 }}
          >
            <span style={{ color: S.amberL, fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: "var(--f-head)" }}>
              ✦ Nouveau — Révision espacée intelligente
            </span>
          </div>

          {/* H1 */}
          <h1
            className="fade-up"
            style={{
              fontFamily: "var(--f-display, Georgia, serif)",
              fontSize: "clamp(2.8rem, 6.5vw, 5rem)",
              fontWeight: 400, lineHeight: 1.1, letterSpacing: "-0.02em",
              color: S.text, margin: "0 0 24px", transitionDelay: "0.05s",
            }}
          >
            Révise <em style={{ fontStyle: "italic", color: S.coral }}>mieux</em>,<br />
            pas plus longtemps
          </h1>

          {/* Baseline */}
          <p
            className="fade-up"
            style={{
              fontFamily: "var(--f-body)", fontSize: "1.08rem", fontWeight: 500,
              color: S.text2, lineHeight: 1.65, maxWidth: 500, margin: "0 auto 40px",
              transitionDelay: "0.1s",
            }}
          >
            Quiz IA adaptatif, coach personnalisé, révision espacée — tout ce qu&apos;il faut pour progresser vraiment au lycée.
          </p>

          {/* CTAs */}
          <div className="fade-up" style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: 56, transitionDelay: "0.15s" }}>
            <button
              onClick={scrollToApp}
              style={{
                background: `linear-gradient(135deg, ${S.coral} 0%, #E85840 100%)`,
                color: "#fff", border: "none", borderRadius: 999, padding: "14px 28px",
                fontFamily: "var(--f-head)", fontWeight: 800, fontSize: "1rem", cursor: "pointer",
                boxShadow: "0 4px 20px rgba(239,110,90,0.32)", transition: "transform .2s, box-shadow .2s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 30px rgba(239,110,90,0.45)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(239,110,90,0.32)"; }}
            >
              Commencer gratuitement
            </button>
            <a
              href="#s1"
              style={{
                background: "transparent", border: `1px solid ${S.border2}`, borderRadius: 999,
                padding: "14px 28px", fontFamily: "var(--f-head)", fontWeight: 700, fontSize: "1rem",
                color: S.text2, textDecoration: "none", display: "inline-block", transition: "all .2s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = S.indigo; e.currentTarget.style.color = S.text; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = S.border2; e.currentTarget.style.color = S.text2; }}
            >
              Comment ça marche
            </a>
          </div>

          {/* Stats */}
          <div className="fade-up" style={{ display: "flex", gap: 48, justifyContent: "center", flexWrap: "wrap", transitionDelay: "0.2s" }}>
            {[
              { n: "12+", l: "Matières lycée" },
              { n: "100%", l: "Programme officiel" },
              { n: "IA", l: "Questions uniques" },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "var(--f-head)", fontWeight: 900, fontSize: "1.9rem", color: S.text, lineHeight: 1 }}>{s.n}</div>
                <div style={{ fontFamily: "var(--f-body)", fontSize: "0.82rem", color: S.text3, marginTop: 4 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div style={{ height: 1, background: S.border, margin: "0 24px" }} />

      {/* ──────────────────────── FEATURES ──────────────────────── */}
      <section id="s0" style={{ padding: "88px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div className="fade-up" style={{ textAlign: "center", marginBottom: 10 }}>
            <span style={{ color: S.indigoL, fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: "var(--f-head)" }}>
              Fonctionnalités
            </span>
          </div>
          <h2
            className="fade-up"
            style={{ textAlign: "center", fontFamily: "var(--f-head)", fontWeight: 900, fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)", color: S.text, letterSpacing: "-0.025em", lineHeight: 1.15, marginBottom: 12, transitionDelay: "0.05s" }}
          >
            Tout pour réussir tes révisions
          </h2>
          <p
            className="fade-up"
            style={{ textAlign: "center", color: S.text2, fontFamily: "var(--f-body)", maxWidth: 480, margin: "0 auto 48px", lineHeight: 1.65, transitionDelay: "0.1s" }}
          >
            Une suite d&apos;outils IA conçus pour les lycéens qui veulent des résultats concrets.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 14 }}>
            {FEATURES.map((f, i) => <FeatureCard key={i} f={f} delay={i * 0.05} />)}
          </div>
        </div>
      </section>

      <div style={{ height: 1, background: S.border, margin: "0 24px" }} />

      {/* ──────────────────────── HOW IT WORKS ──────────────────────── */}
      <section id="s1" style={{ padding: "88px 24px", background: S.bg2 }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <div className="fade-up" style={{ textAlign: "center", marginBottom: 10 }}>
            <span style={{ color: S.coralL, fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: "var(--f-head)" }}>
              Comment ça marche
            </span>
          </div>
          <h2
            className="fade-up"
            style={{ textAlign: "center", fontFamily: "var(--f-head)", fontWeight: 900, fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)", color: S.text, letterSpacing: "-0.025em", lineHeight: 1.15, marginBottom: 48, transitionDelay: "0.05s" }}
          >
            Prêt à réviser en 30 secondes
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 20 }}>
            {STEPS.map((step, i) => (
              <div key={i} className="fade-up" style={{ textAlign: "center", padding: "32px 20px", transitionDelay: `${i * 0.08}s` }}>
                <div style={{ fontFamily: "var(--f-head)", fontWeight: 900, fontSize: "3rem", color: "rgba(77,94,232,0.22)", marginBottom: 14, lineHeight: 1 }}>
                  {step.n}
                </div>
                <h3 style={{ fontFamily: "var(--f-head)", fontWeight: 800, color: S.text, marginBottom: 8, fontSize: "1.05rem" }}>{step.title}</h3>
                <p style={{ fontFamily: "var(--f-body)", color: S.text2, fontSize: "0.9rem", lineHeight: 1.65, margin: 0 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div style={{ height: 1, background: S.border, margin: "0 24px" }} />

      {/* ──────────────────────── PRICING ──────────────────────── */}
      <section id="s2" style={{ padding: "88px 24px" }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <div className="fade-up" style={{ textAlign: "center", marginBottom: 10 }}>
            <span style={{ color: S.amberL, fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: "var(--f-head)" }}>
              Tarifs
            </span>
          </div>
          <h2
            className="fade-up"
            style={{ textAlign: "center", fontFamily: "var(--f-head)", fontWeight: 900, fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)", color: S.text, letterSpacing: "-0.025em", lineHeight: 1.15, marginBottom: 48, transitionDelay: "0.05s" }}
          >
            Simple, sans surprise
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
            {/* Free */}
            <div className="fade-up" style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 30, padding: 32 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                <div>
                  <div style={{ fontFamily: "var(--f-head)", fontWeight: 900, fontSize: "1.3rem", color: S.text }}>Gratuit</div>
                  <div style={{ fontFamily: "var(--f-body)", color: S.text3, fontSize: "0.85rem", marginTop: 2 }}>Pour commencer</div>
                </div>
                <span style={{ background: "rgba(61,214,191,0.10)", border: "1px solid rgba(61,214,191,0.30)", color: S.teal, borderRadius: 999, padding: "3px 12px", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", fontFamily: "var(--f-head)" }}>
                  Gratuit
                </span>
              </div>
              <div style={{ fontFamily: "var(--f-head)", fontWeight: 900, fontSize: "2.4rem", color: S.text, marginBottom: 24 }}>0 €</div>
              <div style={{ marginBottom: 28 }}>
                {FREE_FEATURES.map(([ok, label], i) => <PricingRow key={i} ok={ok} label={label} />)}
              </div>
              <button
                onClick={scrollToApp}
                style={{ width: "100%", background: "transparent", border: `1px solid ${S.border2}`, borderRadius: 999, padding: "13px 0", fontFamily: "var(--f-head)", fontWeight: 800, fontSize: "0.95rem", color: S.text2, cursor: "pointer" }}
              >
                Commencer gratuitement
              </button>
            </div>

            {/* Premium */}
            <div
              className="fade-up"
              style={{
                background: "linear-gradient(145deg, rgba(239,110,90,0.10) 0%, rgba(14,16,26,0.92) 60%)",
                border: `1px solid ${S.coral}`,
                boxShadow: "0 0 0 1px rgba(239,110,90,0.25), 0 24px 48px rgba(239,110,90,0.08)",
                borderRadius: 30, padding: 32, transitionDelay: "0.05s",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                <div>
                  <div style={{ fontFamily: "var(--f-head)", fontWeight: 900, fontSize: "1.3rem", color: S.text }}>Premium</div>
                  <div style={{ fontFamily: "var(--f-body)", color: S.text3, fontSize: "0.85rem", marginTop: 2 }}>Pour vraiment progresser</div>
                </div>
                <span style={{ background: "rgba(245,200,64,0.10)", border: "1px solid rgba(245,200,64,0.30)", color: S.amberL, borderRadius: 999, padding: "3px 12px", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", fontFamily: "var(--f-head)" }}>
                  Premium
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 4, marginBottom: 24 }}>
                <span style={{ fontFamily: "var(--f-head)", fontWeight: 900, fontSize: "2.4rem", color: S.text }}>7,99 €</span>
                <span style={{ fontFamily: "var(--f-body)", color: S.text2, marginBottom: 8 }}>/mois</span>
              </div>
              <div style={{ marginBottom: 28 }}>
                {PREMIUM_FEATURES.map(([ok, label], i) => <PricingRow key={i} ok={ok} label={label} />)}
              </div>
              <button
                onClick={scrollToApp}
                style={{
                  width: "100%",
                  background: `linear-gradient(135deg, ${S.coral} 0%, #E85840 100%)`,
                  border: "none", borderRadius: 999, padding: "13px 0",
                  fontFamily: "var(--f-head)", fontWeight: 800, fontSize: "0.95rem", color: "#fff", cursor: "pointer",
                  boxShadow: "0 4px 20px rgba(239,110,90,0.32)",
                }}
              >
                Essayer Premium — Bientôt disponible
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────── ZONE APP — HEADER ──────────────────────── */}
      <div style={{ background: `linear-gradient(180deg, ${S.bg} 0%, ${S.bg2} 100%)`, padding: "56px 24px 0", textAlign: "center" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${S.border2}, transparent)`, marginBottom: 40 }} />
          <div style={{ display: "inline-flex", alignItems: "center", background: "rgba(77,94,232,0.08)", border: "1px solid rgba(77,94,232,0.20)", borderRadius: 999, padding: "6px 16px", marginBottom: 20 }}>
            <span style={{ color: S.indigoL, fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: "var(--f-head)" }}>
              ◎ Zone Application
            </span>
          </div>
          <h2 style={{ fontFamily: "var(--f-display, Georgia, serif)", fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 400, color: S.text, letterSpacing: "-0.02em", marginBottom: 8, marginTop: 0 }}>
            Choisis ta matière et <em style={{ fontStyle: "italic" }}>commence</em>
          </h2>
          <p style={{ color: S.text2, fontFamily: "var(--f-body)", marginBottom: 0, marginTop: 8 }}>
            Sélectionne ton niveau puis une matière pour lancer un quiz IA.
          </p>
        </div>
      </div>

      {/* ──────────────────────── ZONE APP ──────────────────────── */}
      <div ref={appRef} style={{ background: S.bg2, padding: "0 24px 80px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          {/* Header sticky */}
          <div style={{
            position: "sticky", top: 0, zIndex: 50,
            background: "rgba(13,15,27,0.96)", backdropFilter: "blur(16px)",
            borderBottom: `1px solid ${S.border}`, padding: "12px 0", marginBottom: 28,
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <div style={{ display: "flex", gap: 6 }}>
                {NIVEAUX.map((niveau) => (
                  <button
                    key={niveau.slug}
                    onClick={() => setNiveauActif(niveau.slug)}
                    style={{
                      padding: "7px 16px", borderRadius: 999, cursor: "pointer",
                      fontFamily: "var(--f-head)", fontWeight: 700, fontSize: "0.85rem",
                      border: "1px solid", transition: "all .2s",
                      background: niveauActif === niveau.slug ? S.indigo : "transparent",
                      color: niveauActif === niveau.slug ? "#fff" : S.text2,
                      borderColor: niveauActif === niveau.slug ? S.indigo : S.border2,
                    }}
                  >
                    {niveau.emoji} {niveau.label}
                  </button>
                ))}
              </div>
              <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                <Link href="/progression" style={{ color: S.text2, textDecoration: "none", fontSize: "0.83rem", fontFamily: "var(--f-body)", fontWeight: 600, padding: "6px 10px", borderRadius: 8 }}>
                  📈 Progression
                </Link>
                <Link href="/revision" style={{ color: S.text2, textDecoration: "none", fontSize: "0.83rem", fontFamily: "var(--f-body)", fontWeight: 600, padding: "6px 10px", borderRadius: 8 }}>
                  🧠 Révision
                </Link>
                {user ? (
                  <button
                    onClick={handleDeconnexion}
                    style={{ color: S.text3, background: "transparent", border: "none", cursor: "pointer", fontSize: "0.83rem", fontFamily: "var(--f-body)", padding: "6px 10px", borderRadius: 8 }}
                  >
                    🚪 Déco
                  </button>
                ) : (
                  <button
                    onClick={() => setShowAuth(true)}
                    style={{
                      background: `linear-gradient(135deg, ${S.coral} 0%, #E85840 100%)`,
                      color: "#fff", border: "none", borderRadius: 999, padding: "7px 16px",
                      fontFamily: "var(--f-head)", fontWeight: 800, fontSize: "0.83rem", cursor: "pointer",
                    }}
                  >
                    Connexion
                  </button>
                )}
              </div>
            </div>
          </div>

          <BanniereObjectif />

          <div
            className="grid grid-cols-3 sm:grid-cols-4 gap-3 sm:gap-4 mt-4"
            data-testid="liste-matieres"
          >
            {niveauInfo.matieres.map((matiere) => (
              <MatiereCard key={matiere.slug} matiere={matiere} niveau={niveauActif} />
            ))}
          </div>

          <p style={{ textAlign: "center", color: S.text3, fontSize: "0.78rem", marginTop: 32, fontFamily: "var(--f-body)", lineHeight: 1.6 }}>
            Contenus inspirés des{" "}
            <a
              href="https://www.education.gouv.fr/reussir-au-lycee/les-programmes-du-lycee-general-et-technologique-9812"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: S.indigoL }}
            >
              programmes officiels du ministère de l&apos;Éducation nationale
            </a>
          </p>
        </div>
      </div>

      {/* ──────────────────────── FOOTER ──────────────────────── */}
      <footer style={{ background: S.bg, borderTop: `1px solid ${S.border}`, padding: "28px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 2 14.5 9.5H22l-6 4.5 2.5 7.5L12 17l-6.5 4.5L8 14 2 9.5h7.5L12 2Z" fill={S.indigo} />
            </svg>
            <span style={{ fontFamily: "var(--f-head)", fontWeight: 800, color: S.text3, fontSize: "0.9rem" }}>Révioria</span>
          </div>
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            <Link href="/mentions-legales" style={{ color: S.text3, fontSize: "0.82rem", textDecoration: "none", fontFamily: "var(--f-body)" }}>Mentions légales</Link>
            <Link href="/confidentialite" style={{ color: S.text3, fontSize: "0.82rem", textDecoration: "none", fontFamily: "var(--f-body)" }}>Confidentialité</Link>
            <Link href="/parametres" style={{ color: S.text3, fontSize: "0.82rem", textDecoration: "none", fontFamily: "var(--f-body)" }}>Paramètres</Link>
          </div>
        </div>
      </footer>

      {showAuth && (
        <AuthModal onFermer={() => setShowAuth(false)} onConnecte={() => setShowAuth(false)} />
      )}
    </div>
  );
}
