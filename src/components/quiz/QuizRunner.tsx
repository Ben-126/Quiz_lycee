"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import type { Question, ReponseUtilisateur, NiveauCorrection, FeedbackDetaille, Competence, ModeQuiz } from "@/types";
import QuestionCard, { TEMPS_MAX_PAR_TYPE } from "./QuestionCard";
import CorrectionDisplay from "./CorrectionDisplay";
import ScoreDisplay from "./ScoreDisplay";
import ModeSelector from "./ModeSelector";
import TimerBar from "./TimerBar";
import CoachIA from "@/components/coach/CoachIA";
import {
  getPerformance,
  getNiveau,
  sauvegarderPerformance,
  type NiveauDifficulte,
} from "@/lib/performance";
import { ajouterCarteRevision } from "@/lib/revision-espacee";
import { getParametres } from "@/lib/parametres";
import { enregistrerQuizGamification } from "@/lib/gamification";
import type { ResultatGamification } from "@/types";

type EtatQuiz = "selection_mode" | "chargement" | "question" | "verification" | "correction" | "termine" | "erreur";

const MATIERES_AVEC_CLAVIER_MATH = new Set(["mathematiques", "physique-chimie", "svt", "snt"]);
const QUESTIONS_PAR_CONTROLE = 10;
const SECONDES_PAR_QUESTION_CONTROLE = 20;

interface QuizRunnerProps {
  matiereSlug: string;
  chapitreSlug: string;
  titreChapitre: string;
  niveauLycee?: string;
  matiereName?: string;
  competences?: Competence[];
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

function formatTemps(secondes: number): string {
  const m = Math.floor(secondes / 60);
  const s = secondes % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function QuizRunner({ matiereSlug, chapitreSlug, titreChapitre, niveauLycee = "seconde", matiereName = "", competences = [] }: QuizRunnerProps) {
  const [etat, setEtat] = useState<EtatQuiz>("selection_mode");
  const [modeQuiz, setModeQuiz] = useState<ModeQuiz>("entrainement");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [reponses, setReponses] = useState<ReponseUtilisateur[]>([]);
  const [derniereReponse, setDerniereReponse] = useState<{
    reponse: string | boolean;
    correcte: boolean;
    niveauCorrection: NiveauCorrection;
    feedback?: string;
    feedbackDetaille?: FeedbackDetaille;
  } | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [niveau, setNiveau] = useState<NiveauDifficulte>("intermediaire");
  const [modeRevision, setModeRevision] = useState<ModeRevision>({ actif: false, questionsRatees: [] });
  const [tempsControle, setTempsControle] = useState(0);
  const [resultatGamification, setResultatGamification] = useState<ResultatGamification | null>(null);
  const debutQuestionRef = useRef<number>(0);

  // Countdown timer for contrôle mode
  useEffect(() => {
    if (modeQuiz !== "controle" || etat !== "question" || tempsControle <= 0) return;
    const id = setTimeout(() => {
      setTempsControle((prev) => prev - 1);
    }, 1000);
    return () => clearTimeout(id);
  }, [modeQuiz, etat, tempsControle]);

  const chargerQuiz = useCallback(async (revisionConfig?: ModeRevision, forceMode?: ModeQuiz) => {
    setEtat("chargement");
    setQuestionIndex(0);
    setReponses([]);
    setDerniereReponse(null);
    setErreur(null);

    const mode = forceMode ?? modeQuiz;
    const performance = getPerformance(matiereSlug, chapitreSlug);
    const niveauActuel = getNiveau(performance);
    setNiveau(niveauActuel);
    const questionsParQuiz = mode === "controle" ? QUESTIONS_PAR_CONTROLE : getParametres().questionsParQuiz;

    const body: Record<string, unknown> = { matiereSlug, chapitreSlug, niveau: niveauActuel, niveauLycee, questionsParQuiz };
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

      if (mode === "controle") {
        setTempsControle(questionsParQuiz * SECONDES_PAR_QUESTION_CONTROLE);
      }

      setEtat("question");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erreur inconnue";
      setErreur(message);
      setEtat("erreur");
    }
  }, [matiereSlug, chapitreSlug, modeQuiz, niveauLycee]);

  function calculerPoints(niv: NiveauCorrection, elapsedMs: number, tempsMaxMs: number): number {
    if (niv === "incorrect") return 0;
    const ratio = Math.max(0, 1 - elapsedMs / tempsMaxMs);
    if (niv === "partiel") return Math.round(20 + ratio * 30);
    return Math.round(40 + ratio * 60);
  }

  const handleTerminer = useCallback((reponsesFinales: ReponseUtilisateur[]) => {
    const totalPoints = reponsesFinales.reduce((sum, r) => sum + r.pointsObtenus, 0);
    const maxPoints = questions.length * 100;
    const pourcentage = Math.round((totalPoints / maxPoints) * 100);
    const ratees = reponsesFinales
      .filter((r) => !r.correcte)
      .map((r) => questions[r.questionIndex]?.question ?? "")
      .filter(Boolean);

    sauvegarderPerformance(matiereSlug, chapitreSlug, pourcentage, ratees, {
      niveau: niveauLycee,
      matiereName,
      chapitreNom: titreChapitre,
    });

    // Alimenter le système de révision espacée avec les questions incorrectes
    reponsesFinales
      .filter((r) => r.niveauCorrection === "incorrect")
      .forEach((r) => {
        const q = questions[r.questionIndex];
        if (q) {
          ajouterCarteRevision(q, matiereSlug, chapitreSlug, niveauLycee, matiereName, titreChapitre);
        }
      });
    const resultatGami = enregistrerQuizGamification({
      matiereSlug,
      chapitreSlug,
      scorePourcentage: pourcentage,
      modeControle: modeQuiz === "controle",
    });
    setResultatGamification(resultatGami);
    setEtat("termine");
  }, [questions, matiereSlug, chapitreSlug, niveauLycee, matiereName, titreChapitre, modeQuiz]);

  // Handle contrôle timer expiry
  useEffect(() => {
    if (modeQuiz !== "controle" || tempsControle !== 0 || etat !== "question" || questions.length === 0) return;
    const remaining: ReponseUtilisateur[] = [];
    for (let i = reponses.length; i < questions.length; i++) {
      remaining.push({
        questionIndex: i,
        reponse: "",
        correcte: false,
        niveauCorrection: "incorrect",
        tempsMs: 0,
        pointsObtenus: 0,
      });
    }
    handleTerminer([...reponses, ...remaining]);
  }, [modeQuiz, tempsControle, etat, reponses, questions, handleTerminer]);

  const handleSelectMode = (mode: ModeQuiz) => {
    setModeQuiz(mode);
    setModeRevision({ actif: false, questionsRatees: [] });
    chargerQuiz(undefined, mode);
  };

  const handleTimeUp = () => {
    if (etat !== "question") return;
    const question = questions[questionIndex];
    const tempsMaxMs = TEMPS_MAX_PAR_TYPE[question.type];
    const nouvelleReponse: ReponseUtilisateur = {
      questionIndex,
      reponse: "",
      correcte: false,
      niveauCorrection: "incorrect",
      tempsMs: tempsMaxMs,
      pointsObtenus: 0,
    };
    setReponses((prev) => [...prev, nouvelleReponse]);
    setDerniereReponse({ reponse: "", correcte: false, niveauCorrection: "incorrect" });
    setEtat("correction");
  };

  const handleReponse = async (reponse: string | boolean) => {
    if (etat !== "question") return;
    const question = questions[questionIndex];
    const elapsedMs = Date.now() - debutQuestionRef.current;
    const tempsMaxMs = TEMPS_MAX_PAR_TYPE[question.type];

    // Mode chrono : comme entraînement mais avec TimerBar visible
    if (modeQuiz === "chrono") {
      const correcte = verifierReponseLocale(question, reponse);
      const niveauCorrection: NiveauCorrection = correcte ? "correct" : "incorrect";
      const points = calculerPoints(niveauCorrection, elapsedMs, tempsMaxMs);
      const nouvelleReponse: ReponseUtilisateur = { questionIndex, reponse, correcte, niveauCorrection, tempsMs: elapsedMs, pointsObtenus: points };
      setReponses((prev) => [...prev, nouvelleReponse]);
      setDerniereReponse({ reponse, correcte, niveauCorrection });
      setEtat("correction");
      return;
    }

    // Mode contrôle: réponse locale immédiate, pas de correction intermédiaire
    if (modeQuiz === "controle") {
      const correcte = verifierReponseLocale(question, reponse);
      const niveauCorrection: NiveauCorrection = correcte ? "correct" : "incorrect";
      const points = calculerPoints(niveauCorrection, elapsedMs, tempsMaxMs);
      const nouvelleReponse: ReponseUtilisateur = { questionIndex, reponse, correcte, niveauCorrection, tempsMs: elapsedMs, pointsObtenus: points };
      const newReponses = [...reponses, nouvelleReponse];
      setReponses(newReponses);

      if (questionIndex + 1 >= questions.length) {
        handleTerminer(newReponses);
      } else {
        setQuestionIndex((i) => i + 1);
        debutQuestionRef.current = Date.now();
        setEtat("question");
      }
      return;
    }

    // Mode entraînement: vérification avec feedback
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

        let niveauCorrection: NiveauCorrection;
        let feedback: string | undefined;
        let feedbackDetaille: FeedbackDetaille | undefined;

        if (res.ok) {
          const data = await res.json();
          niveauCorrection = (["correct", "partiel", "incorrect"].includes(data.niveauCorrection)
            ? data.niveauCorrection
            : (data.correcte ? "correct" : "incorrect")) as NiveauCorrection;
          feedback = String(data.feedback ?? "");
          feedbackDetaille = data.feedbackDetaille ?? undefined;
        } else {
          niveauCorrection = verifierReponseLocale(question, reponse) ? "correct" : "incorrect";
        }

        const correcte = niveauCorrection === "correct";
        const points = calculerPoints(niveauCorrection, elapsedMs, tempsMaxMs);
        const nouvelleReponse: ReponseUtilisateur = { questionIndex, reponse, correcte, niveauCorrection, tempsMs: elapsedMs, pointsObtenus: points };
        setReponses((prev) => [...prev, nouvelleReponse]);
        setDerniereReponse({ reponse, correcte, niveauCorrection, feedback, feedbackDetaille });
        setEtat("correction");
      } catch {
        const ok = verifierReponseLocale(question, reponse);
        const niveauCorrection: NiveauCorrection = ok ? "correct" : "incorrect";
        const points = calculerPoints(niveauCorrection, elapsedMs, tempsMaxMs);
        const nouvelleReponse: ReponseUtilisateur = { questionIndex, reponse, correcte: ok, niveauCorrection, tempsMs: elapsedMs, pointsObtenus: points };
        setReponses((prev) => [...prev, nouvelleReponse]);
        setDerniereReponse({ reponse, correcte: ok, niveauCorrection });
        setEtat("correction");
      }
      return;
    }

    const correcte = verifierReponseLocale(question, reponse);
    const niveauCorrection: NiveauCorrection = correcte ? "correct" : "incorrect";
    const points = calculerPoints(niveauCorrection, elapsedMs, tempsMaxMs);
    const nouvelleReponse: ReponseUtilisateur = { questionIndex, reponse, correcte, niveauCorrection, tempsMs: elapsedMs, pointsObtenus: points };
    setReponses((prev) => [...prev, nouvelleReponse]);
    setDerniereReponse({ reponse, correcte, niveauCorrection });
    setEtat("correction");
    debutQuestionRef.current = Date.now();
  };

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

  // Sélection du mode
  if (etat === "selection_mode") {
    return <ModeSelector titreChapitre={titreChapitre} onSelectMode={handleSelectMode} />;
  }

  if (etat === "chargement") {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4" data-testid="chargement">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        <p className="text-gray-500 text-sm">
          {modeRevision.actif ? "Préparation de la révision ciblée..." : modeQuiz === "controle" ? "Préparation du contrôle..." : "Génération du quiz en cours..."}
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
        niveauLycee={niveauLycee}
        questionsRatees={questionsRateesQuiz}
        modeRevision={modeRevision.actif}
        competences={competences}
        modeControle={modeQuiz === "controle"}
        resultatGamification={resultatGamification}
        questions={questions}
        reponses={reponses}
        onRecommencer={() => {
          if (modeQuiz === "controle") {
            setModeRevision({ actif: false, questionsRatees: [] });
            chargerQuiz(undefined, "controle");
          } else {
            setModeRevision({ actif: false, questionsRatees: [] });
            chargerQuiz();
          }
        }}
        onChoisirMode={() => {
          setEtat("selection_mode");
        }}
        onReviserErreurs={modeQuiz === "entrainement" && questionsRateesQuiz.length > 0 ? handleReviserErreurs : undefined}
      />
    );
  }

  const questionCourante = questions[questionIndex];
  const questionCourtanteTexte =
    (etat === "question" || etat === "correction") && questionCourante
      ? questionCourante.question
      : undefined;

  // Données de la question débloquées pour le coach uniquement après correction
  const coachExplication = etat === "correction" ? questionCourante?.explication : undefined;
  const coachEtapes = etat === "correction" ? questionCourante?.explicationAvancee?.etapes : undefined;
  const coachMethode = etat === "correction" ? questionCourante?.explicationAvancee?.methode : undefined;
  const coachErreursFrequentes = etat === "correction" ? questionCourante?.explicationAvancee?.erreurs_frequentes : undefined;

  return (
    <div className="space-y-4">
      {/* Bandeau mode contrôle avec chronomètre global */}
      {modeQuiz === "controle" && etat === "question" && (
        <div className={`flex items-center justify-between px-4 py-2.5 rounded-xl border-2 ${
          tempsControle <= 60 ? "bg-red-50 border-red-300" :
          tempsControle <= 120 ? "bg-orange-50 border-orange-300" :
          "bg-orange-50 border-orange-200"
        }`}>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-orange-700">📝 Mode Contrôle</span>
          </div>
          <div className={`flex items-center gap-1.5 font-mono font-bold text-lg ${
            tempsControle <= 60 ? "text-red-600" :
            tempsControle <= 120 ? "text-orange-600" :
            "text-orange-700"
          }`}>
            <span aria-label="Temps restant">⏱</span>
            <span data-testid="timer-controle">{formatTemps(tempsControle)}</span>
          </div>
        </div>
      )}

      {(etiquetteNiveau || modeRevision.actif) && modeQuiz === "entrainement" && (
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

      {modeQuiz === "chrono" && etat === "question" && (
        <TimerBar
          dureeSecondes={30}
          onExpire={handleTimeUp}
          reset={questionIndex}
        />
      )}

      {etat === "question" && (
        <QuestionCard
          question={questionCourante}
          index={questionIndex}
          total={questions.length}
          onAnswer={handleReponse}
          onTimeUp={modeQuiz === "controle" ? undefined : handleTimeUp}
          disabled={false}
          showMathKeyboard={showMathKeyboard}
          competenceLabel={competences.length > 0 ? competences[questionIndex % competences.length]?.titre : undefined}
          sansMinuterie={modeQuiz === "controle"}
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
            competenceLabel={competences.length > 0 ? competences[questionIndex % competences.length]?.titre : undefined}
          />
          <CorrectionDisplay
            question={questionCourante}
            reponseUtilisateur={derniereReponse.reponse}
            correcte={derniereReponse.correcte}
            niveauCorrection={derniereReponse.niveauCorrection}
            feedback={derniereReponse.feedback}
            feedbackDetaille={derniereReponse.feedbackDetaille}
            onSuivant={handleSuivant}
            estDerniere={questionIndex + 1 >= questions.length}
          />
        </div>
      )}

      {/* Coach IA flottant — disponible pendant le quiz en mode entraînement */}
      {modeQuiz === "entrainement" && (etat === "question" || etat === "correction") && (
        <CoachIA
          matiere={matiereName}
          chapitre={titreChapitre}
          niveauLycee={niveauLycee}
          questionCourante={questionCourtanteTexte}
          explication={coachExplication}
          etapes={coachEtapes}
          methode={coachMethode}
          erreursFrequentes={coachErreursFrequentes}
        />
      )}
    </div>
  );
}
