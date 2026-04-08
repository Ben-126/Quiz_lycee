"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import type { Question, ReponseUtilisateur } from "@/types";
import QuestionCard, { TEMPS_MAX_PAR_TYPE } from "./QuestionCard";
import CorrectionDisplay from "./CorrectionDisplay";
import ScoreDisplay from "./ScoreDisplay";
import {
  getPerformance,
  getNiveau,
  sauvegarderPerformance,
  type NiveauDifficulte,
} from "@/lib/performance";

type EtatQuiz = "chargement" | "question" | "verification" | "correction" | "termine" | "erreur";

const MATIERES_AVEC_CLAVIER_MATH = new Set(["mathematiques", "physique-chimie", "svt", "snt"]);

interface QuizRunnerProps {
  matiereSlug: string;
  chapitreSlug: string;
  titreChapitre: string;
  niveauLycee?: string;
}

interface ModeRevision {
  actif: boolean;
  questionsRatees: string[];
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

export default function QuizRunner({ matiereSlug, chapitreSlug, titreChapitre, niveauLycee = "seconde" }: QuizRunnerProps) {
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
  const [niveau, setNiveau] = useState<NiveauDifficulte>("intermediaire");
  const [modeRevision, setModeRevision] = useState<ModeRevision>({ actif: false, questionsRatees: [] });
  const debutQuestionRef = useRef<number>(0);

  const chargerQuiz = useCallback(async (revisionConfig?: ModeRevision) => {
    setEtat("chargement");
    setQuestionIndex(0);
    setReponses([]);
    setDerniereReponse(null);
    setErreur(null);

    const performance = getPerformance(matiereSlug, chapitreSlug);
    const niveauActuel = getNiveau(performance);
    setNiveau(niveauActuel);

    const body: Record<string, unknown> = { matiereSlug, chapitreSlug, niveau: niveauActuel, niveauLycee };
    if (revisionConfig?.actif && revisionConfig.questionsRatees.length > 0) {
      body.questionsRatees = revisionConfig.questionsRatees;
    }

    try {
      const res = await fetch("/api/quiz/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        throw new Error("Impossible de générer le quiz. Veuillez réessayer.");
      }

      const data = await res.json();
      setQuestions(data.questions);
      debutQuestionRef.current = Date.now();
      setEtat("question");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erreur inconnue";
      setErreur(message);
      setEtat("erreur");
    }
  }, [matiereSlug, chapitreSlug]);

  useEffect(() => {
    setModeRevision({ actif: false, questionsRatees: [] });
    chargerQuiz();
  }, [chargerQuiz]);

  function calculerPoints(correcte: boolean, elapsedMs: number, tempsMaxMs: number): number {
    if (!correcte) return 0;
    const ratio = Math.max(0, 1 - elapsedMs / tempsMaxMs);
    return Math.round(40 + ratio * 60);
  }

  const handleTimeUp = () => {
    if (etat !== "question") return;
    const question = questions[questionIndex];
    const tempsMaxMs = TEMPS_MAX_PAR_TYPE[question.type];
    const nouvelleReponse: ReponseUtilisateur = {
      questionIndex,
      reponse: "",
      correcte: false,
      tempsMs: tempsMaxMs,
      pointsObtenus: 0,
    };
    setReponses((prev) => [...prev, nouvelleReponse]);
    setDerniereReponse({ reponse: "", correcte: false });
    setEtat("correction");
  };

  const handleReponse = async (reponse: string | boolean) => {
    if (etat !== "question") return;
    const question = questions[questionIndex];
    const elapsedMs = Date.now() - debutQuestionRef.current;
    const tempsMaxMs = TEMPS_MAX_PAR_TYPE[question.type];

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

        const points = calculerPoints(correcte, elapsedMs, tempsMaxMs);
        const nouvelleReponse: ReponseUtilisateur = { questionIndex, reponse, correcte, tempsMs: elapsedMs, pointsObtenus: points };
        setReponses((prev) => [...prev, nouvelleReponse]);
        setDerniereReponse({ reponse, correcte, feedback });
        setEtat("correction");
      } catch {
        const correcte = verifierReponseLocale(question, reponse);
        const points = calculerPoints(correcte, elapsedMs, tempsMaxMs);
        const nouvelleReponse: ReponseUtilisateur = { questionIndex, reponse, correcte, tempsMs: elapsedMs, pointsObtenus: points };
        setReponses((prev) => [...prev, nouvelleReponse]);
        setDerniereReponse({ reponse, correcte });
        setEtat("correction");
      }
      return;
    }

    const correcte = verifierReponseLocale(question, reponse);
    const points = calculerPoints(correcte, elapsedMs, tempsMaxMs);
    const nouvelleReponse: ReponseUtilisateur = { questionIndex, reponse, correcte, tempsMs: elapsedMs, pointsObtenus: points };
    setReponses((prev) => [...prev, nouvelleReponse]);
    setDerniereReponse({ reponse, correcte });
    setEtat("correction");
    debutQuestionRef.current = Date.now();
  };

  const handleTerminer = useCallback((reponsesFinales: ReponseUtilisateur[]) => {
    const totalPoints = reponsesFinales.reduce((sum, r) => sum + r.pointsObtenus, 0);
    const maxPoints = questions.length * 100;
    const pourcentage = Math.round((totalPoints / maxPoints) * 100);
    const ratees = reponsesFinales
      .filter((r) => !r.correcte)
      .map((r) => questions[r.questionIndex]?.question ?? "")
      .filter(Boolean);

    sauvegarderPerformance(matiereSlug, chapitreSlug, pourcentage, ratees);
    setEtat("termine");
  }, [questions, matiereSlug, chapitreSlug]);

  const handleSuivant = () => {
    if (questionIndex + 1 >= questions.length) {
      handleTerminer(reponses);
    } else {
      setQuestionIndex((i) => i + 1);
      setDerniereReponse(null);
      debutQuestionRef.current = Date.now();
      setEtat("question");
    }
  };

  const score = reponses.reduce((sum, r) => sum + r.pointsObtenus, 0);
  const maxScore = questions.length * 100;
  const showMathKeyboard = MATIERES_AVEC_CLAVIER_MATH.has(matiereSlug);

  const etiquetteNiveau = niveau === "debutant" ? "Débutant" : niveau === "avance" ? "Avancé" : null;

  if (etat === "chargement") {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4" data-testid="chargement">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        <p className="text-gray-500 text-sm">
          {modeRevision.actif ? "Préparation de la révision ciblée..." : "Génération du quiz en cours..."}
        </p>
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
          onClick={() => chargerQuiz()}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-colors"
        >
          Réessayer
        </button>
      </div>
    );
  }

  if (etat === "termine") {
    const questionsRateesQuiz = reponses
      .filter((r) => !r.correcte)
      .map((r) => questions[r.questionIndex]?.question ?? "")
      .filter(Boolean);

    const handleReviserErreurs = () => {
      const config: ModeRevision = { actif: true, questionsRatees: questionsRateesQuiz };
      setModeRevision(config);
      chargerQuiz(config);
    };

    return (
      <ScoreDisplay
        score={score}
        maxScore={maxScore}
        matiereSlug={matiereSlug}
        chapitreSlug={chapitreSlug}
        questionsRatees={questionsRateesQuiz}
        modeRevision={modeRevision.actif}
        onRecommencer={() => {
          setModeRevision({ actif: false, questionsRatees: [] });
          chargerQuiz();
        }}
        onReviserErreurs={questionsRateesQuiz.length > 0 ? handleReviserErreurs : undefined}
      />
    );
  }

  const questionCourante = questions[questionIndex];

  return (
    <div className="space-y-4">
      {(etiquetteNiveau || modeRevision.actif) && (
        <div className="flex gap-2 flex-wrap">
          {etiquetteNiveau && (
            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
              niveau === "debutant" ? "bg-green-100 text-green-700" : "bg-purple-100 text-purple-700"
            }`}>
              {niveau === "debutant" ? "Niveau débutant" : "Niveau avancé"}
            </span>
          )}
          {modeRevision.actif && (
            <span className="text-xs font-semibold px-2 py-1 rounded-full bg-orange-100 text-orange-700">
              Mode révision
            </span>
          )}
        </div>
      )}
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
          onTimeUp={handleTimeUp}
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
