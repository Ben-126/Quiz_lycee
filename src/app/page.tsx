"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";

/* ── Logo Révioria ───────────────────────────────────────── */
function LogoImg({ size = 28 }: { size?: number }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.9)",
      borderRadius: "var(--r-sm)",
      width: size,
      height: size,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
      flexShrink: 0,
    }}>
      <Image src="/logo-revioria.png" alt="Révioria" width={size - 4} height={size - 4} style={{ objectFit: "contain" }} />
    </div>
  );
}

/* ── Fade-up hook ────────────────────────────────────────── */
function useFadeUp() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("visible"); }),
      { threshold: 0.12 }
    );
    document.querySelectorAll(".fade-up").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

/* ── Divider ─────────────────────────────────────────────── */
function Divider() {
  return <div style={{ height: 1, background: "var(--border)", margin: "0" }} />;
}

/* ── FAQ ─────────────────────────────────────────────────── */
const FAQ_ITEMS = [
  {
    q: "C'est vraiment gratuit ?",
    a: "Oui, complètement. Quiz illimités, toutes les matières, suivi de progression — sans carte bancaire. Un plan Premium arrivera plus tard, mais le cœur de Révioria restera toujours gratuit.",
  },
  {
    q: "Ça suit vraiment le programme officiel ?",
    a: "Les contenus sont basés sur les programmes publiés par l'Éducation nationale pour la Seconde, la Première et la Terminale. Les questions sont générées par IA à partir des compétences officielles de chaque chapitre.",
  },
  {
    q: "J'ai besoin de créer un compte ?",
    a: "Non. Tu peux réviser immédiatement sans inscription. Crée un compte si tu veux sauvegarder ta progression, accéder aux streaks ou jouer avec des amis.",
  },
  {
    q: "Ça marche sur téléphone ?",
    a: "Oui, le site est entièrement responsive. Révise depuis ton téléphone, ta tablette ou ton ordinateur.",
  },
  {
    q: "Comment les questions sont générées ?",
    a: "Chaque quiz est généré à la volée par une IA à partir des compétences précises de ton chapitre. Tu n'auras jamais deux fois exactement le même quiz — idéal pour vraiment mémoriser.",
  },
  {
    q: "C'est quoi la révision espacée ?",
    a: "C'est une technique prouvée scientifiquement : on te repose les chapitres au bon moment, juste avant que tu les oublies. La version avancée arrive avec le plan Premium.",
  },
];

function SectionFAQ() {
  return (
    <section style={{ padding: "88px 24px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <div className="fade-up" style={{ textAlign: "center", marginBottom: 48 }}>
          <SectionLabel color="var(--amber)">FAQ</SectionLabel>
          <h2 style={{
            fontFamily: "var(--f-head)",
            fontWeight: 900,
            fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)",
            letterSpacing: "-0.025em",
            lineHeight: 1.15,
            color: "var(--text)",
            marginTop: 10,
          }}>
            Questions fréquentes
          </h2>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {FAQ_ITEMS.map((item, i) => (
            <FAQItem key={i} question={item.q} answer={item.a} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQItem({ question, answer, index }: { question: string; answer: string; index: number }) {
  return (
    <div
      className="fade-up"
      style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: "var(--r-lg)",
        padding: "20px 24px",
        transitionDelay: `${index * 0.05}s`,
      }}
    >
      <h3 style={{
        fontFamily: "var(--f-head)",
        fontWeight: 800,
        fontSize: "0.95rem",
        color: "var(--text)",
        marginBottom: 8,
      }}>
        {question}
      </h3>
      <p style={{
        fontFamily: "var(--f-body)",
        fontSize: "0.9rem",
        color: "var(--text2)",
        lineHeight: 1.65,
        margin: 0,
      }}>
        {answer}
      </p>
    </div>
  );
}

/* ── Section label ───────────────────────────────────────── */
function SectionLabel({ children, color = "var(--indigo-l)" }: { children: string; color?: string }) {
  return (
    <span style={{
      fontFamily: "var(--f-head)",
      fontSize: "0.72rem",
      fontWeight: 700,
      letterSpacing: "0.14em",
      textTransform: "uppercase",
      color,
      display: "block",
      marginBottom: "12px",
    }}>{children}</span>
  );
}

/* ── Feature card ────────────────────────────────────────── */
type FeatureColor = "indigo" | "coral" | "amber" | "teal";
const colorMap: Record<FeatureColor, { icon: string; iconBorder: string; text: string }> = {
  indigo: { icon: "rgba(77,94,232,0.12)", iconBorder: "rgba(77,94,232,0.2)", text: "#4D5EE8" },
  coral:  { icon: "rgba(239,110,90,0.10)", iconBorder: "rgba(239,110,90,0.2)", text: "#EF6E5A" },
  amber:  { icon: "rgba(245,200,64,0.10)", iconBorder: "rgba(245,200,64,0.2)", text: "#F5C840" },
  teal:   { icon: "rgba(61,214,191,0.10)", iconBorder: "rgba(61,214,191,0.2)", text: "#3DD6BF" },
};

function FeatureCard({ icon, title, desc, color = "indigo" }: { icon: string; title: string; desc: string; color?: FeatureColor }) {
  const c = colorMap[color];
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={ref}
      className="fade-up"
      style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: "var(--r-lg)",
        padding: "30px",
        transition: "transform .2s, border-color .2s",
        cursor: "default",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)";
        (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(77,94,232,0.28)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
        (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)";
      }}
    >
      <div style={{
        width: 46, height: 46,
        borderRadius: "var(--r-sm)",
        background: c.icon,
        border: `1px solid ${c.iconBorder}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "1.4rem",
        marginBottom: "16px",
      }}>{icon}</div>
      <h3 style={{ fontFamily: "var(--f-head)", fontWeight: 800, fontSize: "1rem", color: "var(--text)", marginBottom: "8px" }}>{title}</h3>
      <p style={{ fontFamily: "var(--f-body)", fontSize: "0.92rem", color: "var(--text2)", lineHeight: 1.65 }}>{desc}</p>
    </div>
  );
}

/* ── Matiere pill ────────────────────────────────────────── */
function MatierePill({ children }: { children: string }) {
  return (
    <span style={{
      fontFamily: "var(--f-head)",
      fontWeight: 700,
      fontSize: "0.82rem",
      padding: "6px 16px",
      borderRadius: "var(--r-pill)",
      background: "rgba(77,94,232,0.08)",
      border: "1px solid rgba(77,94,232,0.2)",
      color: "var(--indigo-l)",
      display: "inline-block",
    }}>{children}</span>
  );
}

/* ── Pricing check / dash ────────────────────────────────── */
function PricingItem({ included, children }: { included: boolean; children: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
      <span style={{ color: included ? "var(--teal)" : "var(--text3)", fontWeight: 700, fontSize: "1rem", flexShrink: 0 }}>
        {included ? "✓" : "–"}
      </span>
      <span style={{ fontFamily: "var(--f-body)", fontSize: "0.93rem", color: included ? "var(--text)" : "var(--text3)" }}>{children}</span>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   LANDING PAGE
═══════════════════════════════════════════════════════════════ */
export default function LandingPage() {
  useFadeUp();

  return (
    <div className="landing-grain" style={{ background: "var(--bg)", color: "var(--text)", minHeight: "100vh", position: "relative" }}>

      {/* ── NAV PILL FLOTTANTE ─────────────────────────────── */}
      <nav style={{
        position: "fixed",
        top: 14,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 100,
        background: "rgba(9,10,18,0.88)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid var(--border2)",
        borderRadius: "var(--r-pill)",
        boxShadow: "0 8px 40px rgba(0,0,0,0.4)",
        padding: "10px 20px",
        display: "flex",
        alignItems: "center",
        gap: 28,
        whiteSpace: "nowrap",
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <LogoImg size={24} />
          <span style={{ fontFamily: "var(--f-head)", fontWeight: 900, fontSize: "1rem", color: "var(--text)" }}>Révioria</span>
        </div>

        {/* Liens nav */}
        <div style={{ display: "flex", gap: 4 }}>
          {[
            { label: "Fonctionnalités", href: "#features" },
            { label: "Matières", href: "#matieres" },
            { label: "Tarifs", href: "#pricing" },
            { label: "Discord", href: "https://discord.gg/8JavmWyV" },
          ].map(({ label, href }) => (
            <a
              key={href}
              href={href}
              style={{
                fontFamily: "var(--f-body)",
                fontWeight: 600,
                fontSize: "0.88rem",
                color: "var(--text2)",
                textDecoration: "none",
                padding: "6px 12px",
                borderRadius: "var(--r-pill)",
                transition: "background .15s, color .15s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.06)";
                (e.currentTarget as HTMLAnchorElement).style.color = "var(--text)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                (e.currentTarget as HTMLAnchorElement).style.color = "var(--text2)";
              }}
            >{label}</a>
          ))}
        </div>

        {/* CTA nav */}
        <Link href="/app" style={{
          fontFamily: "var(--f-head)",
          fontWeight: 800,
          fontSize: "0.88rem",
          color: "#fff",
          textDecoration: "none",
          background: "linear-gradient(135deg, #EF6E5A 0%, #E85840 100%)",
          padding: "8px 20px",
          borderRadius: "var(--r-pill)",
          boxShadow: "0 4px 16px rgba(239,110,90,0.28)",
          transition: "transform .15s, box-shadow .15s",
          display: "inline-block",
        }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-2px)";
            (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 6px 24px rgba(239,110,90,0.4)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)";
            (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 4px 16px rgba(239,110,90,0.28)";
          }}
        >
          Commencer →
        </Link>
      </nav>

      {/* ── HERO ──────────────────────────────────────────── */}
      <section style={{
        position: "relative",
        overflow: "hidden",
        padding: "160px 24px 100px",
        textAlign: "center",
        maxWidth: 900,
        margin: "0 auto",
      }}>
        {/* Glows atmosphériques */}
        <div style={{ position: "absolute", top: 60, left: "50%", transform: "translateX(-50%)", width: 560, height: 400, background: "var(--glow-i)", filter: "blur(90px)", borderRadius: "50%", pointerEvents: "none", zIndex: 0 }} />
        <div style={{ position: "absolute", bottom: 40, right: "5%", width: 380, height: 380, background: "var(--glow-c)", filter: "blur(90px)", borderRadius: "50%", pointerEvents: "none", zIndex: 0 }} />
        <div style={{ position: "absolute", top: 80, left: "5%", width: 260, height: 260, background: "var(--glow-a)", filter: "blur(90px)", borderRadius: "50%", pointerEvents: "none", zIndex: 0 }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          {/* Badge hero */}
          <div className="fade-up" style={{ marginBottom: 24, display: "inline-block" }}>
            <span style={{
              fontFamily: "var(--f-head)",
              fontWeight: 800,
              fontSize: "0.72rem",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              background: "rgba(245,200,64,0.1)",
              border: "1px solid rgba(245,200,64,0.3)",
              color: "var(--amber-l)",
              padding: "5px 14px",
              borderRadius: "var(--r-pill)",
            }}>
              ✦ Nouveau · Révision spatiale avec IA
            </span>
          </div>

          {/* H1 */}
          <h1 className="fade-up" style={{
            fontFamily: "var(--f-display)",
            fontSize: "clamp(2.8rem, 6.5vw, 5rem)",
            fontWeight: 400,
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            color: "var(--text)",
            marginBottom: 24,
          }}>
            Révise <em style={{ fontStyle: "italic", color: "var(--coral-l)" }}>mieux</em>,<br />réussis <em style={{ fontStyle: "italic", color: "var(--indigo-l)" }}>plus</em>.
          </h1>

          {/* Sous-titre */}
          <p className="fade-up" style={{
            fontFamily: "var(--f-body)",
            fontSize: "1.1rem",
            fontWeight: 500,
            color: "var(--text2)",
            lineHeight: 1.65,
            maxWidth: 560,
            margin: "0 auto 40px",
          }}>
            Révioria génère des quiz personnalisés sur les programmes officiels du lycée — Seconde, Première, Terminale. Apprends plus vite avec l&apos;IA et la révision espacée.
          </p>

          {/* CTAs */}
          <div className="fade-up" style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/app" style={{
              fontFamily: "var(--f-head)",
              fontWeight: 800,
              fontSize: "1rem",
              color: "#fff",
              textDecoration: "none",
              background: "linear-gradient(135deg, #EF6E5A 0%, #E85840 100%)",
              padding: "15px 32px",
              borderRadius: "var(--r-pill)",
              boxShadow: "0 4px 20px rgba(239,110,90,0.32)",
              transition: "transform .2s, box-shadow .2s",
              display: "inline-block",
            }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 8px 28px rgba(239,110,90,0.4)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 4px 20px rgba(239,110,90,0.32)"; }}
            >
              Commencer gratuitement →
            </Link>
            <a href="#features" style={{
              fontFamily: "var(--f-head)",
              fontWeight: 700,
              fontSize: "1rem",
              color: "var(--text2)",
              textDecoration: "none",
              background: "transparent",
              border: "1px solid var(--border2)",
              padding: "14px 28px",
              borderRadius: "var(--r-pill)",
              transition: "border-color .2s, color .2s",
              display: "inline-block",
            }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.3)"; (e.currentTarget as HTMLAnchorElement).style.color = "var(--text)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--border2)"; (e.currentTarget as HTMLAnchorElement).style.color = "var(--text2)"; }}
            >
              Voir les fonctionnalités
            </a>
          </div>

          {/* Stats */}
          <div className="fade-up" style={{ display: "flex", gap: 40, justifyContent: "center", marginTop: 56, flexWrap: "wrap" }}>
            {[
              { value: "12+", label: "Matières couvertes" },
              { value: "100%", label: "Programmes officiels" },
              { value: "Gratuit", label: "Pour commencer" },
            ].map(({ value, label }) => (
              <div key={label} style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "var(--f-head)", fontWeight: 900, fontSize: "1.8rem", color: "var(--text)", letterSpacing: "-0.02em" }}>{value}</div>
                <div style={{ fontFamily: "var(--f-body)", fontSize: "0.82rem", color: "var(--text3)", marginTop: 4 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Divider />

      {/* ── FEATURES ──────────────────────────────────────── */}
      <section id="features" style={{ padding: "88px 24px", maxWidth: 1100, margin: "0 auto" }}>
        <div className="fade-up" style={{ textAlign: "center", marginBottom: 48 }}>
          <SectionLabel color="var(--indigo-l)">Fonctionnalités</SectionLabel>
          <h2 style={{
            fontFamily: "var(--f-head)",
            fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)",
            fontWeight: 900,
            letterSpacing: "-0.025em",
            lineHeight: 1.15,
            color: "var(--text)",
          }}>Tout ce qu&apos;il te faut pour réussir</h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 14 }}>
          <FeatureCard color="indigo" icon="🤖" title="Quiz IA personnalisés" desc="Des questions générées par intelligence artificielle sur les chapitres de ton programme. Chaque révision est unique." />
          <FeatureCard color="coral" icon="🧠" title="Révision espacée" desc="Flashcards avec l'algorithme de répétition espacée pour ancrer les notions dans la mémoire à long terme." />
          <FeatureCard color="amber" icon="🔥" title="Streaks & progression" desc="Maintiens ta série de jours de révision et suis ta progression matière par matière en temps réel." />
          <FeatureCard color="teal" icon="📷" title="Scan de cours" desc="Prends une photo de tes notes ou de ton manuel — Révioria en extrait le contenu et génère un quiz instantanément." />
          <FeatureCard color="indigo" icon="🌍" title="Langues vivantes" desc="Pratique l'anglais, l'espagnol et d'autres langues avec des exercices de conversation et de vocabulaire." />
          <FeatureCard color="coral" icon="👥" title="Mode social" desc="Compare tes scores avec tes amis, lance des défis et motive-toi en groupe pour réviser ensemble." />
        </div>
      </section>

      <Divider />

      {/* ── COMMENT ÇA MARCHE ─────────────────────────────── */}
      <section style={{ padding: "88px 24px", background: "var(--bg2)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div className="fade-up" style={{ textAlign: "center", marginBottom: 48 }}>
            <SectionLabel color="var(--coral-l)">Comment ça marche</SectionLabel>
            <h2 style={{
              fontFamily: "var(--f-head)",
              fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)",
              fontWeight: 900,
              letterSpacing: "-0.025em",
              lineHeight: 1.15,
              color: "var(--text)",
            }}>De zéro à l&apos;exam en 4 étapes</h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20 }}>
            {[
              { num: "01", title: "Choisis ton niveau", desc: "Seconde, Première ou Terminale. Révioria adapte tout le contenu à ton programme.", color: "var(--indigo)" },
              { num: "02", title: "Sélectionne une matière", desc: "Maths, Physique, Histoire, Français, SVT… Plus de 12 matières disponibles.", color: "var(--coral)" },
              { num: "03", title: "Lance un quiz", desc: "L'IA génère des questions sur le chapitre choisi. Réponds, découvre tes erreurs, progresse.", color: "var(--amber)" },
              { num: "04", title: "Suis ta progression", desc: "Tableau de bord, streaks, révision espacée — Révioria t'aide à maintenir le rythme.", color: "var(--teal)" },
            ].map(({ num, title, desc, color }) => (
              <div key={num} className="fade-up" style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "var(--r-lg)",
                padding: "28px",
              }}>
                <div style={{ fontFamily: "var(--f-display)", fontSize: "2.2rem", color, marginBottom: 12, opacity: 0.7 }}>{num}</div>
                <h3 style={{ fontFamily: "var(--f-head)", fontWeight: 800, fontSize: "1rem", color: "var(--text)", marginBottom: 8 }}>{title}</h3>
                <p style={{ fontFamily: "var(--f-body)", fontSize: "0.9rem", color: "var(--text2)", lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MATIÈRES ──────────────────────────────────────── */}
      <section id="matieres" style={{ padding: "88px 24px", background: "var(--bg2)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div className="fade-up" style={{ textAlign: "center", marginBottom: 40 }}>
            <SectionLabel color="var(--teal)">Matières disponibles</SectionLabel>
            <h2 style={{
              fontFamily: "var(--f-head)",
              fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)",
              fontWeight: 900,
              letterSpacing: "-0.025em",
              lineHeight: 1.15,
              color: "var(--text)",
              marginBottom: 12,
            }}>Tous les programmes du lycée</h2>
            <p style={{ fontFamily: "var(--f-body)", fontSize: "0.98rem", color: "var(--text2)" }}>
              Contenus alignés sur les programmes officiels du Ministère de l&apos;Éducation nationale.
            </p>
          </div>

          <div className="fade-up" style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
            {["Mathématiques", "Physique-Chimie", "SVT", "Histoire-Géographie", "Français", "Philosophie", "Anglais", "Espagnol", "SES", "NSI", "HGGSP", "Spé Maths"].map((m) => (
              <MatierePill key={m}>{m}</MatierePill>
            ))}
          </div>
        </div>
      </section>

      <Divider />

      {/* ── COMMUNAUTÉ DISCORD ────────────────────────────── */}
      <section style={{ padding: "88px 24px" }}>
        <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
          <div className="fade-up">
            <SectionLabel color="var(--indigo-l)">Communauté</SectionLabel>
            <h2 style={{
              fontFamily: "var(--f-head)",
              fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)",
              fontWeight: 900,
              letterSpacing: "-0.025em",
              lineHeight: 1.15,
              color: "var(--text)",
              marginBottom: 16,
            }}>Rejoins la communauté</h2>
            <p style={{ fontFamily: "var(--f-body)", fontSize: "0.98rem", color: "var(--text2)", lineHeight: 1.65, marginBottom: 32 }}>
              Pose tes questions, partage tes astuces et suis l&apos;évolution de Révioria en temps réel sur notre Discord.
            </p>
            <a
              href="https://discord.gg/8JavmWyV"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontFamily: "var(--f-head)",
                fontWeight: 800,
                fontSize: "1rem",
                color: "#fff",
                textDecoration: "none",
                background: "#5865F2",
                padding: "14px 32px",
                borderRadius: "var(--r-pill)",
                boxShadow: "0 4px 20px rgba(88,101,242,0.3)",
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                transition: "transform .2s, box-shadow .2s",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 8px 28px rgba(88,101,242,0.45)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 4px 20px rgba(88,101,242,0.3)"; }}
            >
              {/* Discord icon */}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.032.054a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.995a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
              Rejoindre le Discord
            </a>
          </div>
        </div>
      </section>

      <Divider />

      {/* ── PRICING ───────────────────────────────────────── */}
      <section id="pricing" style={{ padding: "88px 24px", background: "var(--bg2)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div className="fade-up" style={{ textAlign: "center", marginBottom: 48 }}>
            <SectionLabel color="var(--amber-l)">Tarifs</SectionLabel>
            <h2 style={{
              fontFamily: "var(--f-head)",
              fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)",
              fontWeight: 900,
              letterSpacing: "-0.025em",
              lineHeight: 1.15,
              color: "var(--text)",
            }}>Simple et transparent</h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16, maxWidth: 720, margin: "0 auto" }}>
            {/* Free */}
            <div className="fade-up" style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "var(--r-xl)",
              padding: "36px",
            }}>
              <div style={{ marginBottom: 8 }}>
                <span style={{
                  fontFamily: "var(--f-head)", fontWeight: 800,
                  fontSize: "0.72rem", letterSpacing: "0.05em", textTransform: "uppercase",
                  background: "rgba(61,214,191,.1)", border: "1px solid rgba(61,214,191,0.3)",
                  color: "var(--teal)", padding: "3px 12px", borderRadius: "var(--r-pill)",
                }}>Gratuit</span>
              </div>
              <div style={{ fontFamily: "var(--f-display)", fontSize: "2.8rem", color: "var(--text)", margin: "16px 0 4px" }}>0 €</div>
              <div style={{ fontFamily: "var(--f-body)", fontSize: "0.9rem", color: "var(--text3)", marginBottom: 28 }}>Pour toujours</div>
              <div style={{ marginBottom: 28 }}>
                <PricingItem included>Quiz IA illimités</PricingItem>
                <PricingItem included>Toutes les matières</PricingItem>
                <PricingItem included>Suivi de progression</PricingItem>
                <PricingItem included>Streaks & gamification</PricingItem>
                <PricingItem included={false}>Révision espacée avancée</PricingItem>
                <PricingItem included={false}>Scan de cours (OCR)</PricingItem>
                <PricingItem included={false}>Mode social & défis</PricingItem>
              </div>
              <Link href="/app" style={{
                display: "block", textAlign: "center",
                fontFamily: "var(--f-head)", fontWeight: 800, fontSize: "0.95rem",
                color: "var(--text2)", textDecoration: "none",
                border: "1px solid var(--border2)", borderRadius: "var(--r-pill)",
                padding: "13px 24px", transition: "border-color .2s, color .2s",
              }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.3)"; (e.currentTarget as HTMLAnchorElement).style.color = "var(--text)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--border2)"; (e.currentTarget as HTMLAnchorElement).style.color = "var(--text2)"; }}
              >
                Commencer gratuitement
              </Link>
            </div>

            {/* Premium — À venir */}
            <div className="fade-up" style={{
              borderColor: "var(--coral)",
              background: "linear-gradient(145deg, rgba(239,110,90,0.08) 0%, var(--card) 60%)",
              boxShadow: "0 0 0 1px rgba(239,110,90,0.2), 0 24px 48px rgba(239,110,90,0.06)",
              border: "1px solid var(--coral)",
              borderRadius: "var(--r-xl)",
              padding: "36px",
              position: "relative",
              opacity: 0.85,
            }}>
              {/* Badge "À venir" */}
              <div style={{
                position: "absolute", top: 16, right: 16,
                fontFamily: "var(--f-head)", fontWeight: 800,
                fontSize: "0.68rem", letterSpacing: "0.08em", textTransform: "uppercase",
                background: "rgba(77,94,232,0.15)", border: "1px solid rgba(77,94,232,0.3)",
                color: "var(--indigo-l)", padding: "3px 10px", borderRadius: "var(--r-pill)",
              }}>À venir</div>

              <div style={{ marginBottom: 8 }}>
                <span style={{
                  fontFamily: "var(--f-head)", fontWeight: 800,
                  fontSize: "0.72rem", letterSpacing: "0.05em", textTransform: "uppercase",
                  background: "rgba(245,200,64,.1)", border: "1px solid rgba(245,200,64,0.3)",
                  color: "var(--amber)", padding: "3px 12px", borderRadius: "var(--r-pill)",
                }}>Premium</span>
              </div>
              <div style={{ fontFamily: "var(--f-display)", fontSize: "2.8rem", color: "var(--text2)", margin: "16px 0 4px" }}>
                —
              </div>
              <div style={{ fontFamily: "var(--f-body)", fontSize: "0.9rem", color: "var(--text3)", marginBottom: 28 }}>Tarif annoncé au lancement</div>
              <div style={{ marginBottom: 28 }}>
                <PricingItem included>Tout ce qui est gratuit</PricingItem>
                <PricingItem included>Révision espacée avancée</PricingItem>
                <PricingItem included>Scan de cours illimité (OCR)</PricingItem>
                <PricingItem included>Mode social & défis amis</PricingItem>
                <PricingItem included>Support prioritaire</PricingItem>
              </div>
              <a
                href="https://discord.gg/8JavmWyV"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "block", textAlign: "center",
                  fontFamily: "var(--f-head)", fontWeight: 800, fontSize: "0.95rem",
                  color: "var(--text2)", textDecoration: "none",
                  border: "1px solid var(--border2)", borderRadius: "var(--r-pill)",
                  padding: "13px 24px", transition: "border-color .2s, color .2s",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.3)"; (e.currentTarget as HTMLAnchorElement).style.color = "var(--text)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--border2)"; (e.currentTarget as HTMLAnchorElement).style.color = "var(--text2)"; }}
              >
                Être notifié sur Discord
              </a>
            </div>
          </div>
        </div>
      </section>

      <Divider />

      {/* ── FAQ ───────────────────────────────────────────── */}
      <SectionFAQ />

      <Divider />

      {/* ── CTA FINAL ─────────────────────────────────────── */}
      <section style={{ padding: "96px 24px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 600, height: 400, background: "var(--glow-i)", filter: "blur(80px)", borderRadius: "50%", pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 700, margin: "0 auto" }}>
          <div className="fade-up">
            <h2 style={{
              fontFamily: "var(--f-display)",
              fontSize: "clamp(2.2rem, 5vw, 3.8rem)",
              fontWeight: 400,
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
              color: "var(--text)",
              marginBottom: 20,
            }}>
              Prêt à changer<br />ta façon de <em style={{ fontStyle: "italic", color: "var(--coral-l)" }}>réviser</em> ?
            </h2>
            <p style={{ fontFamily: "var(--f-body)", fontSize: "1.05rem", color: "var(--text2)", lineHeight: 1.65, marginBottom: 36 }}>
              Révise plus efficacement avec l&apos;IA. Gratuit pour commencer, sans carte bancaire.
            </p>
            <Link href="/app" style={{
              fontFamily: "var(--f-head)",
              fontWeight: 800,
              fontSize: "1.05rem",
              color: "#fff",
              textDecoration: "none",
              background: "linear-gradient(135deg, #EF6E5A 0%, #E85840 100%)",
              padding: "16px 40px",
              borderRadius: "var(--r-pill)",
              boxShadow: "0 4px 20px rgba(239,110,90,0.32)",
              display: "inline-block",
              transition: "transform .2s, box-shadow .2s",
            }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 8px 32px rgba(239,110,90,0.5)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 4px 20px rgba(239,110,90,0.32)"; }}
            >
              Commencer maintenant →
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────── */}
      <footer style={{
        borderTop: "1px solid var(--border)",
        padding: "32px 24px",
        background: "var(--bg2)",
      }}>
        <div style={{
          maxWidth: 1100,
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <LogoImg size={20} />
            <span style={{ fontFamily: "var(--f-head)", fontWeight: 900, fontSize: "0.9rem", color: "var(--text2)" }}>Révioria</span>
          </div>

          <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            {[
              { label: "Confidentialité", href: "/confidentialite" },
              { label: "Mentions légales", href: "/mentions-legales" },
              { label: "Discord", href: "https://discord.gg/8JavmWyV" },
              { label: "Programmes officiels", href: "https://www.education.gouv.fr/reussir-au-lycee/les-programmes-du-lycee-general-et-technologique-9812" },
            ].map(({ label, href }) => (
              <Link key={label} href={href} target={href.startsWith("http") ? "_blank" : undefined} rel={href.startsWith("http") ? "noopener noreferrer" : undefined} style={{
                fontFamily: "var(--f-body)",
                fontSize: "0.82rem",
                color: "var(--text3)",
                textDecoration: "none",
                transition: "color .15s",
              }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "var(--text2)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "var(--text3)"; }}
              >{label}</Link>
            ))}
          </div>

          <span style={{ fontFamily: "var(--f-body)", fontSize: "0.78rem", color: "var(--text3)" }}>
            © {new Date().getFullYear()} Révioria
          </span>
        </div>
      </footer>

    </div>
  );
}
