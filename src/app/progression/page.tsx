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

  useEffect(() => {
    setHistorique(getHistorique());
    setPerformances(getToutesPerformances());
    setProfilGami(getProfilGamification());
    setMounted(true);
  }, []);

  useEffect(() => {
    const niveauInfo = NIVEAUX.find((n) => n.slug === niveauActif);
    if (niveauInfo && niveauInfo.matieres.length > 0) {
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
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        </main>
      </div>
    );
  }

  if (totalQuiz === 0 && historique.length === 0) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center px-4 text-center gap-4">
          <p className="text-6xl">📊</p>
          <h2 className="text-xl font-bold text-gray-800">Aucune progression pour l&apos;instant</h2>
          <p className="text-gray-500 text-sm max-w-xs">
            Lance ton premier quiz pour voir ta progression ici 🚀
          </p>
          <Link
            href="/"
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
          >
            Choisir une matière
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="max-w-4xl mx-auto w-full px-4 py-6 space-y-6">

        {totalQuiz > 0 && (
          <div className="flex gap-3 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100">
            <div className="flex-1 text-center">
              <p className="text-2xl font-bold text-indigo-700">{totalQuiz}</p>
              <p className="text-xs text-indigo-500">quiz complétés</p>
            </div>
            <div className="w-px bg-indigo-200" />
            <div className="flex-1 text-center">
              <p className="text-2xl font-bold text-indigo-700">
                {scoreMoyenGlobal !== null ? `${scoreMoyenGlobal}%` : "—"}
              </p>
              <p className="text-xs text-indigo-500">score moyen global</p>
            </div>
          </div>
        )}

        {profilGami && profilGami.xpTotal > 0 && (() => {
          const niveau      = getNiveauFromXP(profilGami.xpTotal);
          const progression = getProgressionNiveau(profilGami.xpTotal);
          return (
            <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm p-5 space-y-4">
              {/* Niveau actuel */}
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-center justify-center w-16 h-16 rounded-2xl bg-indigo-50 border-2 border-indigo-200 shrink-0">
                  <span className="text-2xl">{niveau.emoji}</span>
                  <span className="text-xs font-bold text-indigo-600">Niv. {niveau.numero}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 mb-1">
                    <p className="text-lg font-bold text-gray-800">{niveau.nom}</p>
                    <p className="text-sm text-indigo-500 font-medium">{profilGami.xpTotal} XP</p>
                  </div>
                  {progression.xpPourMonter > 0 ? (
                    <>
                      <div className="w-full h-2.5 bg-indigo-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 rounded-full transition-all duration-700"
                          style={{ width: `${progression.pourcentage}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        {progression.xpDansNiveau} / {progression.xpPourMonter} XP pour le niveau suivant
                      </p>
                    </>
                  ) : (
                    <p className="text-xs text-yellow-600 font-semibold mt-1">Niveau maximum atteint !</p>
                  )}
                </div>
              </div>

              {/* Streak */}
              {profilGami.streakJours > 0 && (
                <div className="flex items-center gap-2 text-sm text-orange-600 font-medium">
                  <span>🔥</span>
                  <span>Série de {profilGami.streakJours} jour{profilGami.streakJours > 1 ? "s" : ""} consécutif{profilGami.streakJours > 1 ? "s" : ""}</span>
                </div>
              )}

              {/* Badges */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Badges — {profilGami.badgesDebloques.length} / {tousLesBadges.length} débloqués
                </p>
                <BadgeGrid allBadges={tousLesBadges} debloques={profilGami.badgesDebloques} />
              </div>
            </div>
          );
        })()}

        <div className="flex gap-2 flex-wrap" role="tablist">
          {NIVEAUX.map((n) => (
            <button
              key={n.slug}
              role="tab"
              aria-selected={niveauActif === n.slug}
              onClick={() => setNiveauActif(n.slug)}
              className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-colors border-2 ${
                niveauActif === n.slug
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-indigo-600 border-indigo-300 hover:border-indigo-500"
              }`}
            >
              {n.emoji} {n.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2 flex-wrap">
          {niveauInfo.matieres.map((m) => (
            <button
              key={m.slug}
              onClick={() => { setMatiereActiveSlug(m.slug); setChapitreActifSlug(null); }}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                matiereActiveSlug === m.slug
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {m.emoji} {m.nom}
            </button>
          ))}
        </div>

        {matiereActive && (
          <div className="space-y-4">
            <StatsMatiere matiereSlug={matiereActiveSlug} chapitres={matiereActive.chapitres} />

            <PredictionNote
              matiereSlug={matiereActiveSlug}
              chapitres={matiereActive.chapitres}
              performances={performances}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Score par chapitre</h3>
                <GraphiqueChapitres
                  chapitres={chapitresData}
                  chapitreActifSlug={chapitreActifSlug}
                  onSelectChapitre={setChapitreActifSlug}
                />
                <p className="text-xs text-gray-400 mt-2 text-center">
                  Clique sur un chapitre pour voir son évolution →
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
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
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Historique récent</h3>
            <HistoriqueQuiz entrees={historique.slice(0, 20)} />
          </div>
        )}

        <div className="flex justify-center pt-2 pb-4">
          <Link
            href="/parametres"
            className="text-xs text-gray-400 hover:text-indigo-500 transition-colors underline underline-offset-2"
          >
            ⚙️ Paramètres et réinitialisation
          </Link>
        </div>

      </main>
    </div>
  );
}
