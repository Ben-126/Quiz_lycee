"use client";
import { useState, useRef, useEffect } from "react";
import type { Question } from "@/types";
import MathKeyboard from "./MathKeyboard";

interface QuestionCardProps {
  question: Question;
  index: number;
  total: number;
  onAnswer: (reponse: string | boolean) => void;
  onTimeUp?: () => void;
  disabled: boolean;
  showMathKeyboard?: boolean;
  tempsMaxMs?: number;
  competenceLabel?: string;
  sansMinuterie?: boolean;
}

export const TEMPS_MAX_PAR_TYPE: Record<Question["type"], number> = {
  qcm: 30_000,
  vrai_faux: 15_000,
  reponse_courte: 60_000,
};

export default function QuestionCard({
  question,
  index,
  total,
  onAnswer,
  onTimeUp,
  disabled,
  showMathKeyboard = false,
  tempsMaxMs,
  competenceLabel,
  sansMinuterie = false,
}: QuestionCardProps) {
  const [valeur, setValeur] = useState("");
  const [clavierOuvert, setClavierOuvert] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const maxMs = tempsMaxMs ?? TEMPS_MAX_PAR_TYPE[question.type];
  const [tempsRestantMs, setTempsRestantMs] = useState(maxMs);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTempsRestantMs(maxMs);
    if (disabled || sansMinuterie) return;
    const debut = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - debut;
      const restant = Math.max(0, maxMs - elapsed);
      setTempsRestantMs(restant);
      if (restant === 0) {
        clearInterval(interval);
        onTimeUp?.();
      }
    }, 100);
    return () => clearInterval(interval);
  }, [question, maxMs, disabled, onTimeUp, sansMinuterie]);

  const tempsRestantSec = Math.ceil(tempsRestantMs / 1000);
  const ratioRestant = tempsRestantMs / maxMs;
  const couleurTimer =
    ratioRestant > 0.5 ? "bg-green-500" : ratioRestant > 0.25 ? "bg-yellow-500" : "bg-red-500";

  const insererSymbole = (symbole: string) => {
    const input = inputRef.current;
    if (!input) {
      setValeur((prev) => prev + symbole);
      return;
    }
    const debut = input.selectionStart ?? valeur.length;
    const fin = input.selectionEnd ?? valeur.length;
    const nouvelleValeur = valeur.slice(0, debut) + symbole + valeur.slice(fin);
    setValeur(nouvelleValeur);
    requestAnimationFrame(() => {
      input.setSelectionRange(debut + symbole.length, debut + symbole.length);
      input.focus();
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <span style={{ fontSize: 14, fontWeight: 500, color: "var(--indigo-l)" }}>Question {index + 1}/{total}</span>
        <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${((index + 1) / total) * 100}%`, background: "var(--indigo)" }}
          />
        </div>
        {!disabled && !sansMinuterie && (
          <span className={`text-xs font-bold tabular-nums px-2 py-0.5 rounded-full text-white ${couleurTimer}`}>
            {tempsRestantSec}s
          </span>
        )}
      </div>

      {!disabled && !sansMinuterie && (
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
          <div
            className={`h-full ${couleurTimer} rounded-full transition-all duration-100`}
            style={{ width: `${ratioRestant * 100}%` }}
          />
        </div>
      )}

      {competenceLabel && (
        <div className="flex items-center gap-1.5">
          <span
            className="inline-block px-2.5 py-1 text-xs font-semibold rounded-full leading-tight"
            style={{ background: "rgba(77,94,232,0.08)", color: "var(--indigo-l)", border: "1px solid rgba(77,94,232,0.2)" }}
            aria-label={`Compétence visée : ${competenceLabel}`}
          >
            🎯 {competenceLabel}
          </span>
        </div>
      )}

      <p style={{ color: "var(--text)", fontWeight: 500, fontSize: 16, lineHeight: 1.6 }} data-testid="question-texte">
        {question.question}
      </p>

      {question.type === "qcm" && (
        <div className="grid gap-2" data-testid="options-qcm">
          {question.options.map((option, i) => (
            <button
              key={i}
              onClick={() => onAnswer(option)}
              disabled={disabled}
              className="text-left px-4 py-3 rounded-xl transition-all duration-150 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ border: "2px solid var(--border2)", color: "var(--text2)", background: "transparent" }}
              onMouseEnter={(e) => { if (!disabled) { (e.target as HTMLButtonElement).style.borderColor = "var(--indigo)"; (e.target as HTMLButtonElement).style.background = "rgba(77,94,232,0.08)"; } }}
              onMouseLeave={(e) => { if (!disabled) { (e.target as HTMLButtonElement).style.borderColor = "var(--border2)"; (e.target as HTMLButtonElement).style.background = "transparent"; } }}
            >
              <span style={{ fontWeight: 700, color: "var(--indigo-l)", marginRight: 8 }}>{String.fromCharCode(65 + i)}.</span>
              {option}
            </button>
          ))}
        </div>
      )}

      {question.type === "vrai_faux" && (
        <div className="flex gap-3" data-testid="options-vrai-faux">
          <button
            onClick={() => onAnswer(true)}
            disabled={disabled}
            className="flex-1 py-3 rounded-xl font-bold transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ border: "2px solid rgba(61,214,191,0.3)", color: "var(--teal)", background: "transparent" }}
          >
            ✓ Vrai
          </button>
          <button
            onClick={() => onAnswer(false)}
            disabled={disabled}
            className="flex-1 py-3 rounded-xl font-bold transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ border: "2px solid rgba(239,110,90,0.3)", color: "var(--coral-l)", background: "transparent" }}
          >
            ✗ Faux
          </button>
        </div>
      )}

      {question.type === "reponse_courte" && (
        <form
          data-testid="form-reponse-courte"
          onSubmit={(e) => {
            e.preventDefault();
            if (valeur.trim()) {
              onAnswer(valeur.trim());
              setValeur("");
              setClavierOuvert(false);
            }
          }}
          className="space-y-2"
        >
          <div className="flex gap-2">
            <input
              ref={inputRef}
              name="reponse"
              type="text"
              value={valeur}
              onChange={(e) => setValeur(e.target.value)}
              placeholder="Écris ta réponse en quelques mots..."
              disabled={disabled}
              maxLength={200}
              className="flex-1 px-4 py-3 rounded-xl text-sm transition-colors disabled:opacity-50"
              style={{ background: "rgba(255,255,255,0.05)", color: "var(--text)", border: "1px solid var(--border2)", outline: "none" }}
              autoComplete="off"
            />
            {showMathKeyboard && !disabled && (
              <button
                type="button"
                onClick={() => setClavierOuvert((o) => !o)}
                title="Clavier mathématique"
                className="px-3 py-2 rounded-xl transition-colors"
                style={clavierOuvert
                  ? { border: "2px solid var(--indigo)", background: "rgba(77,94,232,0.15)", color: "var(--indigo-l)" }
                  : { border: "2px solid var(--border2)", background: "rgba(255,255,255,0.05)", color: "var(--text2)" }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M2.25 5.25a3 3 0 0 1 3-3h13.5a3 3 0 0 1 3 3V15a3 3 0 0 1-3 3h-3v.257c0 .597.237 1.17.659 1.591l.621.622a.75.75 0 0 1-.53 1.28h-9a.75.75 0 0 1-.53-1.28l.621-.622a2.25 2.25 0 0 0 .659-1.59V18h-3a3 3 0 0 1-3-3V5.25Zm1.5 0v7.5a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5v-7.5a1.5 1.5 0 0 0-1.5-1.5H5.25a1.5 1.5 0 0 0-1.5 1.5Z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>

          {showMathKeyboard && clavierOuvert && !disabled && (
            <MathKeyboard onInsert={insererSymbole} />
          )}

          <button
            type="submit"
            disabled={disabled}
            className="w-full py-3 rounded-xl font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: "var(--indigo)", color: "#fff", border: "none", cursor: "pointer" }}
          >
            Valider ma réponse
          </button>
        </form>
      )}
    </div>
  );
}
