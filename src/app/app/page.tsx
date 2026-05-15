"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/navigation/Header";
import MatiereCard from "@/components/navigation/MatiereCard";
import { NIVEAUX, type Niveau } from "@/data/programmes";
import BanniereObjectif from "@/components/engagement/BanniereObjectif";
import { getParametres } from "@/lib/parametres";
import { supabase } from "@/lib/supabase";
import { getProfilGamification, getNiveauFromXP, getProgressionNiveau, BADGES_GENERAUX } from "@/lib/gamification";
import { getCartesAReviser } from "@/lib/revision-espacee";
import { getHistorique } from "@/lib/history";
import { Skeleton } from "@/components/ui/Skeleton";
import type { User } from "@supabase/supabase-js";
import type { ProfilGamification } from "@/types";

const SEPT_JOURS_MS = 7 * 24 * 60 * 60 * 1000;

export default function HomePage() {
  const [niveauActif, setNiveauActif] = useState<Niveau>(
    () => (typeof window !== "undefined" ? getParametres().niveauDefaut : "seconde")
  );
  const [user, setUser] = useState<User | null>(null);
  const [profil, setProfil] = useState<ProfilGamification | null>(null);
  const [nbCartesAReviser, setNbCartesAReviser] = useState(0);
  const [quizSemaine, setQuizSemaine] = useState(0);
  const [xpSemaine, setXpSemaine] = useState(0);
  const [dashboardLoaded, setDashboardLoaded] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { setDashboardLoaded(true); return; }
      setUser(user);
      const p = getProfilGamification();
      setProfil(p);
      setNbCartesAReviser(getCartesAReviser().length);
      const hist = getHistorique();
      const limite = new Date(Date.now() - SEPT_JOURS_MS).toISOString();
      const recent = hist.filter((e) => e.date >= limite);
      setQuizSemaine(recent.length);
      setXpSemaine(recent.length * 20);
      setDashboardLoaded(true);
    });
  }, []);

  const niveauInfo = NIVEAUX.find((n) => n.slug === niveauActif)!;
  const niveau = profil ? getNiveauFromXP(profil.xpTotal) : null;
  const progression = profil ? getProgressionNiveau(profil.xpTotal) : null;
  const pseudo = user?.user_metadata?.pseudo ?? user?.email?.split("@")[0] ?? null;
  const badgesRecents = profil
    ? profil.badgesDebloques
        .map((b) => BADGES_GENERAUX.find((bg) => bg.id === b.id))
        .filter(Boolean)
        .slice(-3)
        .reverse()
    : [];

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header />

      <main style={{ flex: 1, maxWidth: 1100, margin: "0 auto", width: "100%", padding: "24px 24px 48px" }}>
        <BanniereObjectif />

        {/* Dashboard personnalisé (si connecté) */}
        {!dashboardLoaded ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12, marginBottom: 32 }}>
            {[1, 2, 3].map((i) => <Skeleton key={i} style={{ height: 80 }} />)}
          </div>
        ) : user && profil && niveau && progression ? (
          <div style={{ marginBottom: 32, display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Greeting + streak */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 22 }}>{niveau.emoji}</span>
                <div>
                  <p style={{ fontSize: 13, color: "var(--text3)" }}>Content de te revoir,</p>
                  <p style={{ fontSize: 18, fontWeight: 800, color: "var(--text)", fontFamily: "var(--f-head)" }}>{pseudo}</p>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {profil.streakJours > 0 && (
                  <div style={{ display: "flex", alignItems: "center", gap: 5, background: "rgba(245,200,64,0.1)", border: "1px solid rgba(245,200,64,0.25)", borderRadius: 20, padding: "4px 12px" }}>
                    <span>🔥</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "var(--amber)" }}>{profil.streakJours} jour{profil.streakJours > 1 ? "s" : ""}</span>
                  </div>
                )}
                {nbCartesAReviser > 0 && (
                  <Link href="/revision" style={{ display: "flex", alignItems: "center", gap: 5, background: "rgba(77,94,232,0.12)", border: "1px solid rgba(77,94,232,0.25)", borderRadius: 20, padding: "4px 12px", textDecoration: "none" }}>
                    <span>📚</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "var(--indigo-l)" }}>{nbCartesAReviser} à réviser</span>
                  </Link>
                )}
              </div>
            </div>

            {/* Stats semaine + barre XP */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 2fr", gap: 10 }}>
              <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--r-md)", padding: "12px 16px" }}>
                <p style={{ fontSize: 11, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Quiz · 7j</p>
                <p style={{ fontSize: 24, fontWeight: 800, color: "var(--coral-l)" }}>{quizSemaine}</p>
              </div>
              <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--r-md)", padding: "12px 16px" }}>
                <p style={{ fontSize: 11, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>XP · 7j</p>
                <p style={{ fontSize: 24, fontWeight: 800, color: "var(--indigo-l)" }}>+{xpSemaine}</p>
              </div>
              <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--r-md)", padding: "12px 16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <p style={{ fontSize: 11, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{niveau.nom}</p>
                  <p style={{ fontSize: 11, color: "var(--text3)" }}>{profil.xpTotal} XP</p>
                </div>
                <div style={{ width: "100%", height: 6, background: "rgba(255,255,255,0.07)", borderRadius: 999, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${progression.pourcentage}%`, background: "var(--indigo)", borderRadius: 999, transition: "width 1s ease" }} />
                </div>
              </div>
            </div>

            {/* Badges récents */}
            {badgesRecents.length > 0 && (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {badgesRecents.map((badge) => badge && (
                  <div key={badge.id} style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(245,200,64,0.07)", border: "1px solid rgba(245,200,64,0.18)", borderRadius: 999, padding: "4px 12px" }}>
                    <span style={{ fontSize: 14 }}>{badge.emoji}</span>
                    <span style={{ fontSize: 12, color: "var(--amber)", fontWeight: 600 }}>{badge.nom}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : null}

        {/* En-tête */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h1 style={{
            fontFamily: "var(--f-display)",
            fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
            fontWeight: 400,
            lineHeight: 1.15,
            letterSpacing: "-0.02em",
            color: "var(--text)",
            marginBottom: 10,
          }}>
            Choisis ta <em style={{ fontStyle: "italic", color: "var(--indigo-l)" }}>matière</em>
          </h1>
          <p style={{
            fontFamily: "var(--f-body)",
            fontSize: "0.95rem",
            color: "var(--text2)",
            lineHeight: 1.6,
          }}>
            Révise avec l&apos;IA · Sélectionne ton niveau puis une matière pour commencer
          </p>
        </div>

        {/* Sélecteur de niveau */}
        <div
          role="tablist"
          aria-label="Niveau scolaire"
          style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 32, flexWrap: "wrap" }}
        >
          {NIVEAUX.map((niveau) => {
            const actif = niveauActif === niveau.slug;
            return (
              <button
                key={niveau.slug}
                role="tab"
                aria-selected={actif}
                onClick={() => setNiveauActif(niveau.slug)}
                style={{
                  fontFamily: "var(--f-head)",
                  fontWeight: 800,
                  fontSize: "0.9rem",
                  padding: "8px 22px",
                  borderRadius: "var(--r-pill)",
                  border: actif ? "none" : "1px solid var(--border2)",
                  cursor: "pointer",
                  transition: "background .15s, color .15s, box-shadow .15s",
                  background: actif
                    ? "linear-gradient(135deg, #4D5EE8 0%, #3A4DD4 100%)"
                    : "transparent",
                  color: actif ? "#fff" : "var(--text2)",
                  boxShadow: actif ? "0 4px 14px rgba(77,94,232,0.3)" : "none",
                }}
                onMouseEnter={(e) => {
                  if (!actif) {
                    (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.06)";
                    (e.currentTarget as HTMLButtonElement).style.color = "var(--text)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!actif) {
                    (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                    (e.currentTarget as HTMLButtonElement).style.color = "var(--text2)";
                  }
                }}
              >
                {niveau.emoji} {niveau.label}
              </button>
            );
          })}
        </div>

        {/* Grille de matières */}
        <div
          data-testid="liste-matieres"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
            gap: 12,
          }}
        >
          {niveauInfo.matieres.map((matiere) => (
            <MatiereCard key={matiere.slug} matiere={matiere} niveau={niveauActif} />
          ))}
        </div>

        {/* Footer note */}
        <p style={{
          textAlign: "center",
          fontFamily: "var(--f-body)",
          fontSize: "0.75rem",
          color: "var(--text3)",
          marginTop: 40,
        }}>
          Contenus inspirés des{" "}
          <a
            href="https://www.education.gouv.fr/reussir-au-lycee/les-programmes-du-lycee-general-et-technologique-9812"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--indigo-l)", textDecoration: "underline" }}
          >
            programmes officiels du ministère de l&apos;Éducation nationale
          </a>
        </p>
      </main>
    </div>
  );
}
