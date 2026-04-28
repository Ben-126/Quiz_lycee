"use client";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Header from "@/components/navigation/Header";
import StatsMatiere from "@/components/progression/StatsMatiere";
import GraphiqueChapitres from "@/components/progression/GraphiqueChapitres";
import GraphiqueEvolution from "@/components/progression/GraphiqueEvolution";
import HistoriqueQuiz from "@/components/progression/HistoriqueQuiz";
import PredictionNote from "@/components/progression/PredictionNote";
import BadgeGrid from "@/components/gamification/BadgeGrid";
import StreakDisplay from "@/components/gamification/StreakDisplay";
import CalendrierStreak from "@/components/gamification/CalendrierStreak";
import {
  getNotificationsStreak,
  marquerNotifsStreakLues,
  notifsStreakDejaMontrees,
  type NotifStreak,
} from "@/lib/streak-notifications";
import { NIVEAUX, type Niveau } from "@/data/programmes";
import { getToutesPerformances, type PerformanceChapitre } from "@/lib/performance";
import { getHistorique, type EntreeHistorique } from "@/lib/history";
import {
  getProfilGamification,
  getNiveauFromXP,
  getProgressionNiveau,
  BADGES_GENERAUX,
  getBadgesMatiere,
} from "@/lib/gamification";
import type { ProfilGamification } from "@/types";

export default function ProgressionPage() {
  const [niveauActif, setNiveauActif] = useState<Niveau>("seconde");
  const [matiereActiveSlug, setMatiereActiveSlug] = useState<string>(
    NIVEAUX.find((n) => n.slug === "seconde")?.matieres[0]?.slug ?? ""
  );
  const [chapitreActifSlug, setChapitreActifSlug] = useState<string | null>(null);
  const [historique, setHistorique] = useState<EntreeHistorique[]>([]);
  const [performances, setPerformances] = useState<Record<string, PerformanceChapitre>>({});
  const [mounted, setMounted] = useState(false);
  const [profilGami, setProfilGami] = useState<ProfilGamification | null>(null);
  const [notifsStreak, setNotifsStreak] = useState<NotifStreak[]>([]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHistorique(getHistorique());
    setPerformances(getToutesPerformances());
    const profil = getProfilGamification();
    setProfilGami(profil);
    if (!notifsStreakDejaMontrees()) {
      const notifs = getNotificationsStreak(profil);
      setNotifsStreak(notifs);
      if (notifs.length > 0) marquerNotifsStreakLues();
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    const niveauInfo = NIVEAUX.find((n) => n.slug === niveauActif);
    if (niveauInfo && niveauInfo.matieres.length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMatiereActiveSlug(niveauInfo.matieres[0].slug);
      setChapitreActifSlug(null);
    }
  }, [niveauActif]);


  const niveauInfo = NIVEAUX.find((n) => n.slug === niveauActif)!;
  const matiereActive = niveauInfo.matieres.find((m) => m.slug === matiereActiveSlug);

  const totalQuiz = useMemo(() =>
    Object.values(performances)
      .filter((p) => p.nombreQuizCompletes > 0)
      .reduce((sum, p) => sum + p.nombreQuizCompletes, 0),
    [performances]
  );

  const scoreMoyenGlobal = useMemo(() => {
    const avec = Object.values(performances).filter((p) => p.nombreQuizCompletes > 0);
    return avec.length > 0
      ? Math.round(avec.reduce((sum, p) => sum + p.scoreMoyen, 0) / avec.length)
      : null;
  }, [performances]);

  const chapitresData = useMemo(() => {
    if (!matiereActive) return [];
    return matiereActive.chapitres.map((c) => {
      const cle = `${matiereActiveSlug}/${c.slug}`;
      const perf = performances[cle];
      return {
        slug: c.slug,
        nom: c.titre,
        scoreMoyen: perf && perf.nombreQuizCompletes > 0 ? perf.scoreMoyen : null,
      };
    });
  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  }, [matiereActive, matiereActiveSlug, performances]);

  const tousLesBadges = useMemo(() => {
    const matieres = NIVEAUX.flatMap((n) => n.matieres);
    const badgesMatiere = matieres.flatMap((m) => getBadgesMatiere(m.slug, m.nom));
    return [...BADGES_GENERAUX, ...badgesMatiere];
  }, []);

  const entreesEvolution = useMemo(() => {
    if (!chapitreActifSlug) return [];
    return historique.filter(
      (e) => e.chapitreSlug === chapitreActifSlug && e.matiereSlug === matiereActiveSlug
    );
  }, [historique, chapitreActifSlug, matiereActiveSlug]);

  if (!mounted) {
    return (
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--bg)" }}>
        <Header />
        <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 32, height: 32, border: "4px solid rgba(77,94,232,0.3)", borderTopColor: "var(--indigo)", borderRadius: "50%" }} className="animate-spin" />
        </main>
      </div>
    );
  }

  if (totalQuiz === 0 && historique.length === 0) {
    return (
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--bg)" }}>
        <Header />
        <main style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 16px", textAlign: "center", gap: 16 }}>
          <p style={{ fontSize: 48 }}>📊</p>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text)" }}>Aucune progression pour l&apos;instant</h2>
          <p style={{ color: "var(--text3)", fontSize: 14, maxWidth: 280 }}>
            Lance ton premier quiz pour voir ta progression ici 🚀
          </p>
          <Link
            href="/app"
            style={{ padding: "12px 24px", background: "var(--indigo)", color: "#fff", borderRadius: "var(--r-md)", fontWeight: 600, textDecoration: "none" }}
          >
            Choisir une matière
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--bg)" }}>
      <Header />
      <main style={{ maxWidth: 896, margin: "0 auto", width: "100%", padding: "24px 16px 48px", display: "flex", flexDirection: "column", gap: 24 }}>

        {totalQuiz > 0 && (
          <div style={{ display: "flex", gap: 12, padding: 16, background: "rgba(77,94,232,0.08)", borderRadius: "var(--r-lg)", border: "1px solid rgba(77,94,232,0.18)" }}>
            <div style={{ flex: 1, textAlign: "center" }}>
              <p style={{ fontSize: 24, fontWeight: 700, color: "var(--indigo-l)" }}>{totalQuiz}</p>
              <p style={{ fontSize: 12, color: "var(--indigo-l)", opacity: 0.7 }}>quiz complétés</p>
            </div>
            <div style={{ width: 1, background: "rgba(77,94,232,0.3)" }} />
            <div style={{ flex: 1, textAlign: "center" }}>
              <p style={{ fontSize: 24, fontWeight: 700, color: "var(--indigo-l)" }}>
                {scoreMoyenGlobal !== null ? `${scoreMoyenGlobal}%` : "—"}
              </p>
              <p style={{ fontSize: 12, color: "var(--indigo-l)", opacity: 0.7 }}>score moyen global</p>
            </div>
          </div>
        )}

        {profilGami && profilGami.xpTotal > 0 && (() => {
          const niveau      = getNiveauFromXP(profilGami.xpTotal);
          const progression = getProgressionNiveau(profilGami.xpTotal);
          return (
            <div style={{ background: "var(--card)", borderRadius: "var(--r-lg)", border: "1px solid var(--border)", padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Niveau actuel */}
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: 64, height: 64, borderRadius: "var(--r-md)", background: "rgba(77,94,232,0.08)", border: "2px solid rgba(77,94,232,0.3)", flexShrink: 0 }}>
                  <span style={{ fontSize: 24 }}>{niveau.emoji}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "var(--indigo-l)" }}>Niv. {niveau.numero}</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 4 }}>
                    <p style={{ fontSize: 18, fontWeight: 700, color: "var(--text)" }}>{niveau.nom}</p>
                    <p style={{ fontSize: 14, color: "var(--indigo-l)", fontWeight: 500 }}>{profilGami.xpTotal} XP</p>
                  </div>
                  {progression.xpPourMonter > 0 ? (
                    <>
                      <div style={{ width: "100%", height: 10, background: "rgba(77,94,232,0.15)", borderRadius: 999, overflow: "hidden" }}>
                        <div
                          style={{ height: "100%", background: "var(--indigo)", borderRadius: 999, transition: "width 0.7s", width: `${progression.pourcentage}%` }}
                        />
                      </div>
                      <p style={{ fontSize: 11, color: "var(--text3)", marginTop: 4 }}>
                        {progression.xpDansNiveau} / {progression.xpPourMonter} XP pour le niveau suivant
                      </p>
                    </>
                  ) : (
                    <p style={{ fontSize: 11, color: "var(--amber)", fontWeight: 600, marginTop: 4 }}>Niveau maximum atteint !</p>
                  )}
                </div>
              </div>

              {/* Notifications streak */}
              {notifsStreak.map((notif, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    gap: 12,
                    padding: 12,
                    borderRadius: "var(--r-sm)",
                    fontSize: 14,
                    border: "1px solid",
                    ...(notif.type === "streak_rappel"
                      ? { background: "rgba(245,200,64,0.1)", borderColor: "rgba(245,200,64,0.3)", color: "var(--amber)" }
                      : notif.type === "streak_gel_utilise"
                      ? { background: "rgba(61,214,191,0.1)", borderColor: "rgba(61,214,191,0.3)", color: "var(--teal)" }
                      : { background: "rgba(239,110,90,0.1)", borderColor: "rgba(239,110,90,0.3)", color: "var(--coral-l)" })
                  }}
                >
                  <div>
                    <p style={{ fontWeight: 600 }}>{notif.message}</p>
                    <p style={{ fontSize: 12, marginTop: 2, opacity: 0.8 }}>{notif.detail}</p>
                  </div>
                </div>
              ))}

              {/* StreakDisplay */}
              <StreakDisplay profil={profilGami} />

              {/* Badges */}
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
                  Badges — {profilGami.badgesDebloques.length} / {tousLesBadges.length} débloqués
                </p>
                <BadgeGrid allBadges={tousLesBadges} debloques={profilGami.badgesDebloques} />
              </div>

              {/* Calendrier streak */}
              <CalendrierStreak profil={profilGami} />
            </div>
          );
        })()}

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }} role="tablist">
          {NIVEAUX.map((n) => (
            <button
              key={n.slug}
              role="tab"
              aria-selected={niveauActif === n.slug}
              onClick={() => setNiveauActif(n.slug)}
              style={{
                padding: "6px 12px",
                borderRadius: "var(--r-pill)",
                fontSize: 14,
                fontWeight: 600,
                border: "2px solid",
                cursor: "pointer",
                transition: "all 0.15s",
                ...(niveauActif === n.slug
                  ? { background: "var(--indigo)", color: "#fff", borderColor: "var(--indigo)" }
                  : { background: "transparent", color: "var(--indigo-l)", borderColor: "rgba(77,94,232,0.4)" })
              }}
            >
              {n.emoji} {n.label}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {niveauInfo.matieres.map((m) => (
            <button
              key={m.slug}
              onClick={() => { setMatiereActiveSlug(m.slug); setChapitreActifSlug(null); }}
              style={{
                padding: "6px 12px",
                borderRadius: "var(--r-pill)",
                fontSize: 14,
                fontWeight: 500,
                cursor: "pointer",
                border: "none",
                transition: "all 0.15s",
                ...(matiereActiveSlug === m.slug
                  ? { background: "var(--indigo)", color: "#fff" }
                  : { background: "rgba(255,255,255,0.06)", color: "var(--text2)" })
              }}
            >
              {m.emoji} {m.nom}
            </button>
          ))}
        </div>

        {matiereActive && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <StatsMatiere matiereSlug={matiereActiveSlug} chapitres={matiereActive.chapitres} />

            <PredictionNote
              matiereSlug={matiereActiveSlug}
              chapitres={matiereActive.chapitres}
              performances={performances}
            />

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
              <div style={{ background: "var(--card)", borderRadius: "var(--r-lg)", border: "1px solid var(--border)", padding: 16, boxShadow: "0 4px 16px rgba(0,0,0,0.3)" }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text2)", marginBottom: 12 }}>Score par chapitre</h3>
                <GraphiqueChapitres
                  chapitres={chapitresData}
                  chapitreActifSlug={chapitreActifSlug}
                  onSelectChapitre={setChapitreActifSlug}
                />
                <p style={{ fontSize: 11, color: "var(--text3)", marginTop: 8, textAlign: "center" }}>
                  Clique sur un chapitre pour voir son évolution →
                </p>
              </div>

              <div style={{ background: "var(--card)", borderRadius: "var(--r-lg)", border: "1px solid var(--border)", padding: 16, boxShadow: "0 4px 16px rgba(0,0,0,0.3)" }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text2)", marginBottom: 12 }}>
                  {chapitreActifSlug
                    ? `Évolution — ${matiereActive.chapitres.find((c) => c.slug === chapitreActifSlug)?.titre ?? ""}`
                    : "Évolution du score"}
                </h3>
                <GraphiqueEvolution entrees={entreesEvolution} />
              </div>
            </div>
          </div>
        )}

        {historique.length > 0 && (
          <div style={{ background: "var(--card)", borderRadius: "var(--r-lg)", border: "1px solid var(--border)", padding: 16, boxShadow: "0 4px 16px rgba(0,0,0,0.3)" }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text2)", marginBottom: 12 }}>Historique récent</h3>
            <HistoriqueQuiz entrees={historique.slice(0, 20)} />
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "center", paddingTop: 8, paddingBottom: 16 }}>
          <Link
            href="/parametres"
            style={{ fontSize: 12, color: "var(--text3)", textDecoration: "underline", textUnderlineOffset: 2 }}
          >
            ⚙️ Paramètres et réinitialisation
          </Link>
        </div>

      </main>
    </div>
  );
}
