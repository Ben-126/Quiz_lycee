"use client";
import Link from "next/link";
import type { Competence, Question, ReponseUtilisateur, ResultatGamification } from "@/types";
import XPToast from "@/components/gamification/XPToast";

interface ScoreDisplayProps {
  score: number;
  maxScore: number;
  matiereSlug: string;
  chapitreSlug: string;
  niveauLycee?: string;
  questionsRatees?: string[];
  modeRevision?: boolean;
  competences?: Competence[];
  modeControle?: boolean;
  questions?: Question[];
  reponses?: ReponseUtilisateur[];
  onRecommencer: () => void;
  onChoisirMode?: () => void;
  onReviserErreurs?: () => void;
  resultatGamification?: ResultatGamification | null;
}

function getReponseTexte(reponse: string | boolean): string {
  if (typeof reponse === "boolean") return reponse ? "Vrai" : "Faux";
  if (reponse === "") return "Sans réponse";
  return reponse;
}

function getReponseCorrecteTexte(question: Question): string {
  if (question.type === "vrai_faux") return question.reponseCorrecte ? "Vrai" : "Faux";
  return question.reponseCorrecte;
}

export default function ScoreDisplay({
  score,
  maxScore,
  matiereSlug,
  niveauLycee = "seconde",
  questionsRatees = [],
  modeRevision = false,
  competences = [],
  modeControle = false,
  questions = [],
  reponses = [],
  onRecommencer,
  onChoisirMode,
  onReviserErreurs,
  resultatGamification = null,
}: ScoreDisplayProps) {
  const pourcentage = Math.round((score / maxScore) * 100);
  const nbCorrectes = reponses.filter((r) => r.correcte).length;
  const notesur20 = questions.length > 0
    ? Math.round((nbCorrectes / questions.length) * 200) / 10
    : Math.round(pourcentage * 20 / 100 * 10) / 10;

  const getMessage = () => {
    if (modeControle) {
      if (notesur20 >= 16) return { texte: "Excellent ! Tu maîtrises parfaitement ce chapitre.", emoji: "🏆" };
      if (notesur20 >= 12) return { texte: "Bon résultat ! Quelques points à consolider.", emoji: "👍" };
      if (notesur20 >= 8) return { texte: "Résultat moyen. Il faut revoir ce chapitre.", emoji: "📚" };
      return { texte: "Ce chapitre nécessite une révision approfondie. Courage !", emoji: "💪" };
    }
    if (pourcentage >= 80) return { texte: "Excellent travail ! Tu maîtrises ce chapitre.", emoji: "🏆" };
    if (pourcentage >= 60) return { texte: "Bon travail ! Continue à réviser.", emoji: "👍" };
    if (pourcentage >= 40) return { texte: "Pas mal ! Un peu plus de révisions s'impose.", emoji: "📚" };
    return { texte: "Ce chapitre nécessite plus de révisions. Courage !", emoji: "💪" };
  };

  const { texte, emoji } = getMessage();

  const couleurBarre =
    pourcentage >= 80 ? "bg-green-500" :
    pourcentage >= 60 ? "bg-yellow-500" :
    pourcentage >= 40 ? "bg-orange-500" : "bg-red-500";

  const couleurNote =
    notesur20 >= 16 ? "text-green-600" :
    notesur20 >= 12 ? "text-yellow-600" :
    notesur20 >= 8 ? "text-orange-500" : "text-red-600";

  return (
    <>
      {resultatGamification && resultatGamification.xpGagne > 0 && (
        <XPToast resultat={resultatGamification} />
      )}
      <div className="text-center space-y-6" data-testid="score-display">
      {/* En-tête mode contrôle */}
      {modeControle && (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-100 border border-orange-200">
          <span className="text-sm font-bold text-orange-700">📝 Contrôle terminé</span>
        </div>
      )}

      <div>
        <span className="text-6xl">{emoji}</span>
      </div>

      {/* Note /20 pour le contrôle */}
      {modeControle ? (
        <div>
          <div className="flex items-baseline justify-center gap-1">
            <span className={`text-6xl font-bold ${couleurNote}`} data-testid="note-controle">
              {notesur20 % 1 === 0 ? notesur20.toFixed(0) : notesur20.toFixed(1)}
            </span>
            <span className="text-3xl text-gray-400">/20</span>
          </div>
          <p className="text-sm text-gray-400 mt-1">
            {nbCorrectes} bonne{nbCorrectes > 1 ? "s" : ""} réponse{nbCorrectes > 1 ? "s" : ""} sur {questions.length}
          </p>
        </div>
      ) : (
        <div>
          <p className="text-5xl font-bold text-gray-800" data-testid="score-valeur">
            {pourcentage}<span className="text-3xl text-gray-400">%</span>
          </p>
          <p className="text-sm text-gray-400 mt-1" data-testid="score-points">{score} pts sur {maxScore}</p>
        </div>
      )}

      <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${couleurBarre} rounded-full transition-all duration-700`}
          style={{ width: `${pourcentage}%` }}
        />
      </div>

      <p className="text-gray-600 font-medium">{texte}</p>

      {/* Révision détaillée question par question (mode contrôle) */}
      {modeControle && questions.length > 0 && (
        <div className="text-left space-y-3 mt-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Corrigé du contrôle
          </p>
          {questions.map((q, i) => {
            const rep = reponses.find((r) => r.questionIndex === i);
            const correcte = rep?.correcte ?? false;
            const userReponse = rep ? getReponseTexte(rep.reponse) : "Sans réponse";
            const bonneReponse = getReponseCorrecteTexte(q);

            return (
              <div
                key={i}
                className={`rounded-xl border p-3.5 text-sm ${
                  correcte
                    ? "bg-green-50 border-green-200"
                    : "bg-red-50 border-red-200"
                }`}
              >
                <div className="flex items-start gap-2">
                  <span className="text-base mt-0.5 shrink-0">{correcte ? "✅" : "❌"}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 leading-snug mb-2">
                      <span className="text-gray-400 mr-1">{i + 1}.</span>
                      {q.question}
                    </p>
                    <div className="space-y-1 text-xs">
                      <p className={correcte ? "text-green-700" : "text-red-700"}>
                        <span className="font-semibold">Ta réponse :</span> {userReponse}
                      </p>
                      {!correcte && (
                        <p className="text-green-700">
                          <span className="font-semibold">Bonne réponse :</span> {bonneReponse}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Compétences travaillées (mode entraînement) */}
      {!modeControle && competences.length > 0 && (
        <div className="text-left bg-indigo-50 border border-indigo-100 rounded-xl p-4">
          <p className="text-xs font-semibold text-indigo-700 mb-2 flex items-center gap-1.5">
            <span aria-hidden="true">📋</span>
            Compétences travaillées
          </p>
          <ul className="space-y-1.5">
            {competences.map((comp) => (
              <li key={comp.id} className="flex items-center gap-2 text-sm text-indigo-800">
                <span className="text-indigo-400 text-xs" aria-hidden="true">✓</span>
                {comp.titre}
              </li>
            ))}
          </ul>
        </div>
      )}

      {modeRevision && questionsRatees.length === 0 && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-sm text-green-700 font-medium">
          Bravo ! Tu as réussi toutes les questions de révision.
        </div>
      )}

      <div className="flex flex-col gap-3">
        {/* Boutons mode contrôle */}
        {modeControle ? (
          <>
            <button
              onClick={onRecommencer}
              data-testid="btn-recommencer"
              className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold transition-colors"
            >
              📝 Refaire le contrôle
            </button>
            <div className="flex flex-col sm:flex-row gap-3">
              {onChoisirMode && (
                <button
                  onClick={onChoisirMode}
                  data-testid="btn-choisir-mode"
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-colors"
                >
                  🎯 Mode entraînement
                </button>
              )}
              <Link
                href={`/${niveauLycee}/${matiereSlug}`}
                data-testid="btn-retour-chapitres"
                className="flex-1 py-3 bg-white border-2 border-gray-200 hover:border-indigo-300 text-gray-700 hover:text-indigo-700 rounded-xl font-semibold transition-colors text-center"
              >
                ← Retour aux chapitres
              </Link>
            </div>
          </>
        ) : (
          <>
            {onReviserErreurs && questionsRatees.length > 0 && (
              <button
                onClick={onReviserErreurs}
                data-testid="btn-reviser-erreurs"
                className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold transition-colors"
              >
                📝 Réviser mes erreurs ({questionsRatees.length})
              </button>
            )}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={onRecommencer}
                data-testid="btn-recommencer"
                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-colors"
              >
                🔄 Refaire le quiz
              </button>
              <Link
                href={`/${niveauLycee}/${matiereSlug}`}
                data-testid="btn-retour-chapitres"
                className="flex-1 py-3 bg-white border-2 border-gray-200 hover:border-indigo-300 text-gray-700 hover:text-indigo-700 rounded-xl font-semibold transition-colors text-center"
              >
                ← Retour aux chapitres
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
    </>
  );
}
