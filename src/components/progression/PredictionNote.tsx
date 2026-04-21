"use client";
import { useMemo } from "react";
import type { Chapitre } from "@/types";
import type { PerformanceChapitre } from "@/lib/performance";

interface PredictionNoteProps {
  matiereSlug: string;
  chapitres: Chapitre[];
  performances: Record<string, PerformanceChapitre>;
}

interface AnalyseChapitre {
  slug: string;
  titre: string;
  scoreMoyen: number | null;
  tendance: "hausse" | "baisse" | "stable" | null;
}

function calculerTendance(scores: number[]): "hausse" | "baisse" | "stable" | null {
  if (scores.length < 2) return null;
  const recent = scores[scores.length - 1];
  const precedent = scores[scores.length - 2];
  if (recent - precedent >= 5) return "hausse";
  if (precedent - recent >= 5) return "baisse";
  return "stable";
}

function noteVersCouleur(note: number): { bg: string; text: string; border: string } {
  if (note >= 16) return { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" };
  if (note >= 14) return { bg: "bg-green-50", text: "text-green-700", border: "border-green-200" };
  if (note >= 12) return { bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200" };
  if (note >= 10) return { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200" };
  return { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" };
}

function noteVersEmoji(note: number): string {
  if (note >= 18) return "🏆";
  if (note >= 16) return "⭐";
  if (note >= 14) return "👍";
  if (note >= 12) return "📈";
  if (note >= 10) return "⚠️";
  return "🚨";
}

function noteVersMessage(note: number): string {
  if (note >= 18) return "Excellent niveau, continue comme ça !";
  if (note >= 16) return "Très bon niveau, quelques détails à peaufiner.";
  if (note >= 14) return "Bon niveau, consolide les chapitres faibles.";
  if (note >= 12) return "Niveau correct, un effort sur les points faibles fera la différence.";
  if (note >= 10) return "Juste la moyenne, des révisions ciblées s'imposent.";
  return "Des lacunes importantes, concentre-toi sur les bases.";
}

export default function PredictionNote({ matiereSlug, chapitres, performances }: PredictionNoteProps) {
  const analyse = useMemo((): {
    notePredite: number | null;
    chapitresAnalyses: AnalyseChapitre[];
    pointsFaibles: AnalyseChapitre[];
    aConsolider: AnalyseChapitre[];
    nonTravailles: Chapitre[];
    chapitresTravailles: number;
  } => {
    const chapitresAnalyses: AnalyseChapitre[] = chapitres.map((c) => {
      const cle = `${matiereSlug}/${c.slug}`;
      const perf = performances[cle];
      if (!perf || perf.nombreQuizCompletes === 0) {
        return { slug: c.slug, titre: c.titre, scoreMoyen: null, tendance: null };
      }
      return {
        slug: c.slug,
        titre: c.titre,
        scoreMoyen: perf.scoreMoyen,
        tendance: calculerTendance(perf.derniersScores),
      };
    });

    const avecDonnees = chapitresAnalyses.filter((c) => c.scoreMoyen !== null);
    const nonTravailles = chapitres.filter((c) => {
      const cle = `${matiereSlug}/${c.slug}`;
      const perf = performances[cle];
      return !perf || perf.nombreQuizCompletes === 0;
    });

    if (avecDonnees.length === 0) {
      return {
        notePredite: null,
        chapitresAnalyses,
        pointsFaibles: [],
        aConsolider: [],
        nonTravailles,
        chapitresTravailles: 0,
      };
    }

    // Calcul note : moyenne pondérée + pénalité chapitres non travaillés
    const scoreMoyenTravailles =
      avecDonnees.reduce((sum, c) => sum + (c.scoreMoyen ?? 0), 0) / avecDonnees.length;

    // Pénalité douce pour chapitres non travaillés (on suppose 50% pour eux)
    const ratioTravaille = avecDonnees.length / chapitres.length;
    const scorePondere = scoreMoyenTravailles * ratioTravaille + 50 * (1 - ratioTravaille);

    const notePredite = Math.round((scorePondere / 100) * 20 * 10) / 10;

    const pointsFaibles = avecDonnees
      .filter((c) => (c.scoreMoyen ?? 0) < 60)
      .sort((a, b) => (a.scoreMoyen ?? 0) - (b.scoreMoyen ?? 0));

    const aConsolider = avecDonnees
      .filter((c) => (c.scoreMoyen ?? 0) >= 60 && (c.scoreMoyen ?? 0) < 80)
      .sort((a, b) => (a.scoreMoyen ?? 0) - (b.scoreMoyen ?? 0));

    return {
      notePredite,
      chapitresAnalyses,
      pointsFaibles,
      aConsolider,
      nonTravailles,
      chapitresTravailles: avecDonnees.length,
    };
  }, [matiereSlug, chapitres, performances]);

  if (analyse.chapitresTravailles === 0) return null;

  const { notePredite, pointsFaibles, aConsolider, nonTravailles } = analyse;
  const aucunPointFaible = pointsFaibles.length === 0 && aConsolider.length === 0 && nonTravailles.length === 0;

  return (
    <div className="space-y-4">
      {/* Carte prédiction de note */}
      {notePredite !== null && (() => {
        const couleurs = noteVersCouleur(notePredite);
        return (
          <div className={`rounded-2xl border p-5 ${couleurs.bg} ${couleurs.border}`}>
            <div className="flex items-center gap-4">
              <div className={`flex flex-col items-center justify-center w-20 h-20 rounded-2xl bg-white border-2 ${couleurs.border} shrink-0 shadow-sm`}>
                <span className="text-3xl font-black ${couleurs.text}">{notePredite}</span>
                <span className={`text-xs font-semibold ${couleurs.text}`}>/20</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{noteVersEmoji(notePredite)}</span>
                  <p className={`text-sm font-bold ${couleurs.text}`}>Note estimée</p>
                </div>
                <p className={`text-xs ${couleurs.text} opacity-80`}>{noteVersMessage(notePredite)}</p>
                <p className="text-xs text-gray-400 mt-1">
                  Basée sur {analyse.chapitresTravailles}/{chapitres.length} chapitres travaillés
                </p>
              </div>
            </div>

            {/* Jauge visuelle */}
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>0</span>
                <span>10</span>
                <span>20</span>
              </div>
              <div className="w-full h-3 bg-white rounded-full overflow-hidden border border-gray-100">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    notePredite >= 16 ? "bg-emerald-500" :
                    notePredite >= 14 ? "bg-green-500" :
                    notePredite >= 12 ? "bg-yellow-500" :
                    notePredite >= 10 ? "bg-orange-500" : "bg-red-500"
                  }`}
                  style={{ width: `${(notePredite / 20) * 100}%` }}
                />
              </div>
            </div>
          </div>
        );
      })()}

      {/* Analyse des points faibles */}
      {!aucunPointFaible && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
          <h3 className="text-sm font-bold text-gray-700">Analyse des points faibles</h3>

          {pointsFaibles.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-red-600 uppercase tracking-wide flex items-center gap-1">
                <span>🚨</span> À retravailler en priorité
              </p>
              {pointsFaibles.map((c) => (
                <ChapitreBar
                  key={c.slug}
                  titre={c.titre}
                  score={c.scoreMoyen ?? 0}
                  tendance={c.tendance}
                  couleur="red"
                />
              ))}
            </div>
          )}

          {aConsolider.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-orange-600 uppercase tracking-wide flex items-center gap-1">
                <span>⚠️</span> À consolider
              </p>
              {aConsolider.map((c) => (
                <ChapitreBar
                  key={c.slug}
                  titre={c.titre}
                  score={c.scoreMoyen ?? 0}
                  tendance={c.tendance}
                  couleur="orange"
                />
              ))}
            </div>
          )}

          {nonTravailles.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1">
                <span>📚</span> Non travaillés
              </p>
              <div className="flex flex-wrap gap-2">
                {nonTravailles.map((c) => (
                  <span
                    key={c.slug}
                    className="px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium"
                  >
                    {c.titre}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tout est bon */}
      {aucunPointFaible && analyse.chapitresTravailles > 0 && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3">
          <span className="text-2xl">🎉</span>
          <div>
            <p className="text-sm font-semibold text-emerald-700">Aucun point faible détecté !</p>
            <p className="text-xs text-emerald-600">Tous tes chapitres sont maîtrisés ou en bonne voie.</p>
          </div>
        </div>
      )}
    </div>
  );
}

interface ChapitreBarProps {
  titre: string;
  score: number;
  tendance: "hausse" | "baisse" | "stable" | null;
  couleur: "red" | "orange";
}

function ChapitreBar({ titre, score, tendance, couleur }: ChapitreBarProps) {
  const barColor = couleur === "red" ? "bg-red-400" : "bg-orange-400";
  const tendanceIcon = tendance === "hausse" ? "↗️" : tendance === "baisse" ? "↘️" : tendance === "stable" ? "→" : "";

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-700 font-medium truncate max-w-[60%]">{titre}</span>
        <span className="text-xs text-gray-500 flex items-center gap-1">
          {tendanceIcon && <span className="text-base leading-none">{tendanceIcon}</span>}
          <span className="font-semibold">{score}%</span>
        </span>
      </div>
      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}
