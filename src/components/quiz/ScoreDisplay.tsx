"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import type { Competence, Question, ReponseUtilisateur, ResultatGamification } from "@/types";
import XPToast from "@/components/gamification/XPToast";

function useAnimatedCounter(target: number, duration = 1200): number {
  const [value, setValue] = useState(0);
  useEffect(() => {
    const start = Date.now();
    let raf: number;
    const tick = () => {
      const progress = Math.min((Date.now() - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

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
  const animatedPourcentage = useAnimatedCounter(pourcentage);
  const nbCorrectes = reponses.filter((r) => r.correcte).length;
  const notesur20Raw = questions.length > 0
    ? Math.round((nbCorrectes / questions.length) * 200) / 10
    : Math.round(pourcentage * 20 / 100 * 10) / 10;
  const animatedNote = useAnimatedCounter(Math.round(notesur20Raw * 10)) / 10;

  useEffect(() => {
    if (pourcentage >= 60) {
      import("canvas-confetti").then(({ default: confetti }) => {
        confetti({
          particleCount: pourcentage >= 80 ? 150 : 80,
          spread: 70,
          origin: { y: 0.55 },
          colors: ["#4D5EE8", "#EF6E5A", "#F5C840", "#3DD6BF"],
        });
      });
    }
  }, [pourcentage]);

  const notesur20 = notesur20Raw;

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
    notesur20 >= 16 ? "var(--teal)" :
    notesur20 >= 12 ? "var(--amber)" :
    notesur20 >= 8 ? "#f0a832" : "var(--coral-l)";

  return (
    <>
      {resultatGamification && resultatGamification.xpGagne > 0 && (
        <XPToast resultat={resultatGamification} />
      )}
      <div className="text-center space-y-6" data-testid="score-display">
      {/* En-tête mode contrôle */}
      {modeControle && (
        <div className="seq-scale seq-1 inline-flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: "rgba(245,200,64,0.1)", border: "1px solid rgba(245,200,64,0.3)" }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: "var(--amber)" }}>📝 Contrôle terminé</span>
        </div>
      )}

      <div className="seq-scale seq-1">
        <span className="text-6xl">{emoji}</span>
      </div>

      {/* Note /20 pour le contrôle */}
      {modeControle ? (
        <div className="seq-fade-up seq-2">
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-6xl font-bold" style={{ color: couleurNote }} data-testid="note-controle">
              {animatedNote % 1 === 0 ? animatedNote.toFixed(0) : animatedNote.toFixed(1)}
            </span>
            <span className="text-3xl" style={{ color: "var(--text3)" }}>/20</span>
          </div>
          <p style={{ fontSize: 14, color: "var(--text3)", marginTop: 4 }}>
            {nbCorrectes} bonne{nbCorrectes > 1 ? "s" : ""} réponse{nbCorrectes > 1 ? "s" : ""} sur {questions.length}
          </p>
        </div>
      ) : (
        <div className="seq-fade-up seq-2">
          <p className="text-5xl font-bold" style={{ color: "var(--text)" }} data-testid="score-valeur">
            {animatedPourcentage}<span className="text-3xl" style={{ color: "var(--text3)" }}>%</span>
          </p>
          <p style={{ fontSize: 14, color: "var(--text3)", marginTop: 4 }} data-testid="score-points">{score} pts sur {maxScore}</p>
        </div>
      )}

      <div className="seq-fade-up seq-3 w-full h-4 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
        <div
          className={`h-full ${couleurBarre} rounded-full transition-all duration-700`}
          style={{ width: `${pourcentage}%` }}
        />
      </div>

      <p className="seq-fade-up seq-4" style={{ color: "var(--text2)", fontWeight: 500 }}>{texte}</p>

      {/* Révision détaillée question par question (mode contrôle) */}
      {modeControle && questions.length > 0 && (
        <div className="text-left space-y-3 mt-2">
          <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
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
                className="rounded-xl p-3.5 text-sm"
                style={{
                  background: correcte ? "rgba(61,214,191,0.08)" : "rgba(239,110,90,0.08)",
                  border: `1px solid ${correcte ? "rgba(61,214,191,0.3)" : "rgba(239,110,90,0.3)"}`,
                }}
              >
                <div className="flex items-start gap-2">
                  <span className="text-base mt-0.5 shrink-0">{correcte ? "✅" : "❌"}</span>
                  <div className="flex-1 min-w-0">
                    <p style={{ fontWeight: 500, color: "var(--text)", lineHeight: 1.4, marginBottom: 8 }}>
                      <span style={{ color: "var(--text3)", marginRight: 4 }}>{i + 1}.</span>
                      {q.question}
                    </p>
                    <div className="space-y-1 text-xs">
                      <p style={{ color: correcte ? "var(--teal)" : "var(--coral-l)" }}>
                        <span className="font-semibold">Ta réponse :</span> {userReponse}
                      </p>
                      {!correcte && (
                        <p style={{ color: "var(--teal)" }}>
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
        <div className="seq-fade-up seq-5 text-left rounded-xl p-4" style={{ background: "rgba(77,94,232,0.08)", border: "1px solid rgba(77,94,232,0.2)" }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: "var(--indigo-l)", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
            <span aria-hidden="true">📋</span>
            Compétences travaillées
          </p>
          <ul className="space-y-1.5">
            {competences.map((comp) => (
              <li key={comp.id} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "var(--indigo-l)" }}>
                <span style={{ color: "var(--indigo-l)", fontSize: 12 }} aria-hidden="true">✓</span>
                {comp.titre}
              </li>
            ))}
          </ul>
        </div>
      )}

      {modeRevision && questionsRatees.length === 0 && (
        <div className="rounded-xl p-3 text-sm font-medium" style={{ background: "rgba(61,214,191,0.1)", border: "1px solid rgba(61,214,191,0.3)", color: "var(--teal)" }}>
          Bravo ! Tu as réussi toutes les questions de révision.
        </div>
      )}

      <div className="seq-fade-up seq-6 flex flex-col gap-3">
        {/* Boutons mode contrôle */}
        {modeControle ? (
          <>
            <button
              onClick={onRecommencer}
              data-testid="btn-recommencer"
              className="btn-action w-full py-3 rounded-xl font-semibold"
              style={{ background: "var(--amber)", color: "#000", border: "none", cursor: "pointer" }}
            >
              📝 Refaire le contrôle
            </button>
            <div className="flex flex-col sm:flex-row gap-3">
              {onChoisirMode && (
                <button
                  onClick={onChoisirMode}
                  data-testid="btn-choisir-mode"
                  className="btn-action flex-1 py-3 rounded-xl font-semibold"
                  style={{ background: "var(--indigo)", color: "#fff", border: "none", cursor: "pointer" }}
                >
                  🎯 Mode entraînement
                </button>
              )}
              <Link
                href={`/${niveauLycee}/${matiereSlug}`}
                data-testid="btn-retour-chapitres"
                className="btn-action flex-1 py-3 rounded-xl font-semibold text-center"
                style={{ background: "transparent", border: "2px solid var(--border2)", color: "var(--text2)" }}
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
                className="btn-action w-full py-3 rounded-xl font-semibold"
                style={{ background: "var(--amber)", color: "#000", border: "none", cursor: "pointer" }}
              >
                📝 Réviser mes erreurs ({questionsRatees.length})
              </button>
            )}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={onRecommencer}
                data-testid="btn-recommencer"
                className="btn-action flex-1 py-3 rounded-xl font-semibold"
                style={{ background: "var(--indigo)", color: "#fff", border: "none", cursor: "pointer" }}
              >
                🔄 Refaire le quiz
              </button>
              <Link
                href={`/${niveauLycee}/${matiereSlug}`}
                data-testid="btn-retour-chapitres"
                className="btn-action flex-1 py-3 rounded-xl font-semibold text-center"
                style={{ background: "transparent", border: "2px solid var(--border2)", color: "var(--text2)" }}
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
