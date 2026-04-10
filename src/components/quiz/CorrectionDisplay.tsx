"use client";
import type { Question } from "@/types";
import { getParametres } from "@/lib/parametres";
import ExplicationAvancee from "./ExplicationAvancee";

interface CorrectionDisplayProps {
  question: Question;
  reponseUtilisateur: string | boolean;
  correcte: boolean;
  feedback?: string;
  onSuivant: () => void;
  estDerniere: boolean;
}

function getLibelleReponse(question: Question, reponse: string | boolean): string {
  if (typeof reponse === "boolean") {
    return reponse ? "Vrai" : "Faux";
  }
  if (question.type === "qcm") {
    const index = question.options.indexOf(reponse);
    if (index !== -1) {
      return `${String.fromCharCode(65 + index)}. ${reponse}`;
    }
  }
  return reponse;
}

function getLibelleBonneReponse(question: Question): string {
  if (question.type === "vrai_faux") {
    return question.reponseCorrecte ? "Vrai" : "Faux";
  }
  if (question.type === "qcm") {
    const index = question.options.indexOf(question.reponseCorrecte);
    if (index !== -1) {
      return `${String.fromCharCode(65 + index)}. ${question.reponseCorrecte}`;
    }
  }
  return question.reponseCorrecte;
}

export default function CorrectionDisplay({
  question,
  reponseUtilisateur,
  correcte,
  feedback,
  onSuivant,
  estDerniere,
}: CorrectionDisplayProps) {
  const libelleUser = getLibelleReponse(question, reponseUtilisateur);
  const libelleBonne = getLibelleBonneReponse(question);
  const { explicationsAvanceesOuvertes } = getParametres();

  return (
    <div
      className={`rounded-2xl border-2 p-5 space-y-4 ${
        correcte ? "bg-green-50 border-green-300" : "bg-red-50 border-red-300"
      }`}
      data-testid="correction-display"
    >
      <div className="flex items-center gap-3">
        <span className="text-3xl">{correcte ? "🎉" : "😕"}</span>
        <div>
          <p className={`font-bold text-lg ${correcte ? "text-green-700" : "text-red-700"}`}>
            {correcte ? "Bonne réponse !" : "Mauvaise réponse"}
          </p>
          {!correcte && (
            <p className="text-sm text-gray-600 mt-0.5">
              Ta réponse : <span className="font-medium text-red-600">{libelleUser}</span>
              {" · "}
              Bonne réponse : <span className="font-medium text-green-600">{libelleBonne}</span>
            </p>
          )}
          {correcte && question.type === "qcm" && (
            <p className="text-sm text-green-600 mt-0.5">{libelleUser}</p>
          )}
        </div>
      </div>

      {feedback && question.type === "reponse_courte" && !correcte && (
        <div className="bg-orange-50 rounded-xl p-3 border border-orange-200">
          <p className="text-xs font-semibold text-orange-600 uppercase tracking-wide mb-1">Retour</p>
          <p className="text-sm text-orange-800">{feedback}</p>
        </div>
      )}

      <div className="bg-white rounded-xl p-4 border border-gray-100">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Explication</p>
        <p className="text-sm text-gray-700 leading-relaxed">{question.explication}</p>
      </div>

      <ExplicationAvancee
        explicationAvancee={question.explicationAvancee}
        defaultExpanded={!correcte || explicationsAvanceesOuvertes}
      />

      <button
        onClick={onSuivant}
        data-testid="btn-suivant"
        className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-colors"
      >
        {estDerniere ? "Voir mon score" : "Question suivante →"}
      </button>
    </div>
  );
}
