"use client";
import { useState, useEffect, useCallback } from "react";
import type { Question, ReponseUtilisateur } from "@/types";
import QuestionCard from "./QuestionCard";
import CorrectionDisplay from "./CorrectionDisplay";
import ScoreDisplay from "./ScoreDisplay";

type EtatQuiz = "chargement" | "question" | "verification" | "correction" | "termine" | "erreur";

const MATIERES_AVEC_CLAVIER_MATH = new Set(["mathematiques", "physique-chimie", "svt", "snt"]);

interface QuizRunnerProps {
  matiereSlug: string;
  chapitreSlug: string;
  titreChapitre: string;
}

function normaliserReponse(reponse: string | boolean): string {
  if (typeof reponse === "boolean") return reponse ? "true" : "false";
  return reponse
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[.,;:!?'"()\-]/g, "")
    .replace(/\s+/g, " ");
}

function verifierReponseLocale(question: Question, reponseUser: string | boolean): boolean {
  if (question.type === "vrai_faux") {
    return question.reponseCorrecte === reponseUser;
  }
  if (question.type === "qcm") {
    return normaliserReponse(question.reponseCorrecte) === normaliserReponse(reponseUser);
  }
  const u = normaliserReponse(reponseUser);
  const c = normaliserReponse(question.reponseCorrecte);
  return u === c || u.includes(c) || c.includes(u);
}

export default function QuizRunner({ matiereSlug, chapitreSlug, titreChapitre }: QuizRunnerProps) {
  const [etat, setEtat] = useState<EtatQuiz>("chargement");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [reponses, setReponses] = useState<ReponseUtilisateur[]>([]);
  const [derniereReponse, setDerniereReponse] = useState<{
    reponse: string | boolean;
    correcte: boolean;
    feedback?: string;
  } | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  const chargerQuiz = useCallback(async () => {
    setEtat("chargement");
    setQuestionIndex(0);
    setReponses([]);
    setDerniereReponse(null);
    setErreur(null);

    try {
      const res = await fetch("/api/quiz/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matiereSlug, chapitreSlug }),
      });

      if (!res.ok) {
        throw new Error("Impossible de générer le quiz. Veuillez réessayer.");
      }

      const data = await res.json();
      setQuestions(data.questions);
      setEtat("question");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erreur inconnue";
      setErreur(message);
      setEtat("erreur");
    }
  }, [matiereSlug, chapitreSlug]);

  useEffect(() => {
    chargerQuiz();
  }, [chargerQuiz]);

  const handleReponse = async (reponse: string | boolean) => {
    if (etat !== "question") return;
    const question = questions[questionIndex];

    if (question.type === "reponse_courte") {
      setEtat("verification");
      try {
        const res = await fetch("/api/quiz/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question: question.question,
            reponseCorrecte: question.reponseCorrecte,
            reponseUser: reponse,
            explication: question.explication,
          }),
        });

        let correcte: boolean;
        let feedback: string | undefined;

        if (res.ok) {
          const data = await res.json();
          correcte = Boolean(data.correcte);
          feedback = String(data.feedback ?? "");
        } else {
          correcte = verifierReponseLocale(question, reponse);
        }

        const nouvelleReponse: ReponseUtilisateur = { questionIndex, reponse, correcte };
        setReponses((prev) => [...prev, nouvelleReponse]);
        setDerniereReponse({ reponse, correcte, feedback });
        setEtat("correction");
      } catch {
        const correcte = verifierReponseLocale(question, reponse);
        const nouvelleReponse: ReponseUtilisateur = { questionIndex, reponse, correcte };
        setReponses((prev) => [...prev, nouvelleReponse]);
        setDerniereReponse({ reponse, correcte });
        setEtat("correction");
      }
      return;
    }

    const correcte = verifierReponseLocale(question, reponse);
    const nouvelleReponse: ReponseUtilisateur = { questionIndex, reponse, correcte };
    setReponses((prev) => [...prev, nouvelleReponse]);
    setDerniereReponse({ reponse, correcte });
    setEtat("correction");
  };

  const handleSuivant = () => {
    if (questionIndex + 1 >= questions.length) {
      setEtat("termine");
    } else {
      setQuestionIndex((i) => i + 1);
      setDerniereReponse(null);
      setEtat("question");
    }
  };

  const score = reponses.filter((r) => r.correcte).length;
  const showMathKeyboard = MATIERES_AVEC_CLAVIER_MATH.has(matiereSlug);

  if (etat === "chargement") {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4" data-testid="chargement">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        <p className="text-gray-500 text-sm">Génération du quiz en cours...</p>
        <p className="text-gray-400 text-xs">{titreChapitre}</p>
      </div>
    );
  }

  if (etat === "erreur") {
    return (
      <div className="text-center py-16 space-y-4" data-testid="erreur">
        <p className="text-4xl">😕</p>
        <p className="text-gray-700 font-medium">Impossible de charger le quiz</p>
        <p className="text-gray-500 text-sm">{erreur}</p>
        <button
          onClick={chargerQuiz}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-colors"
        >
          Réessayer
        </button>
      </div>
    );
  }

  if (etat === "termine") {
    return (
      <ScoreDisplay
        score={score}
        total={questions.length}
        matiereSlug={matiereSlug}
        chapitreSlug={chapitreSlug}
        onRecommencer={chargerQuiz}
      />
    );
  }

  const questionCourante = questions[questionIndex];

  return (
    <div className="space-y-4">
      {etat === "verification" && (
        <div className="flex flex-col items-center justify-center py-8 gap-3" data-testid="verification">
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Correction en cours...</p>
        </div>
      )}

      {etat === "question" && (
        <QuestionCard
          question={questionCourante}
          index={questionIndex}
          total={questions.length}
          onAnswer={handleReponse}
          disabled={false}
          showMathKeyboard={showMathKeyboard}
        />
      )}

      {etat === "correction" && derniereReponse && (
        <div className="space-y-4">
          <QuestionCard
            question={questionCourante}
            index={questionIndex}
            total={questions.length}
            onAnswer={handleReponse}
            disabled={true}
            showMathKeyboard={showMathKeyboard}
          />
          <CorrectionDisplay
            question={questionCourante}
            reponseUtilisateur={derniereReponse.reponse}
            correcte={derniereReponse.correcte}
            feedback={derniereReponse.feedback}
            onSuivant={handleSuivant}
            estDerniere={questionIndex + 1 >= questions.length}
          />
        </div>
      )}
    </div>
  );
}
