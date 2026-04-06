"use client";
import { useState, useRef } from "react";
import type { Question } from "@/types";
import MathKeyboard from "./MathKeyboard";

interface QuestionCardProps {
  question: Question;
  index: number;
  total: number;
  onAnswer: (reponse: string | boolean) => void;
  disabled: boolean;
  showMathKeyboard?: boolean;
}

export default function QuestionCard({ question, index, total, onAnswer, disabled, showMathKeyboard = false }: QuestionCardProps) {
  const [valeur, setValeur] = useState("");
  const [clavierOuvert, setClavierOuvert] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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
        <span className="text-sm font-medium text-indigo-600">Question {index + 1}/{total}</span>
        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-500 rounded-full transition-all duration-500"
            style={{ width: `${((index + 1) / total) * 100}%` }}
          />
        </div>
      </div>

      <p className="text-gray-800 font-medium text-base leading-relaxed" data-testid="question-texte">
        {question.question}
      </p>

      {question.type === "qcm" && (
        <div className="grid gap-2" data-testid="options-qcm">
          {question.options.map((option, i) => (
            <button
              key={i}
              onClick={() => onAnswer(option)}
              disabled={disabled}
              className="text-left px-4 py-3 rounded-xl border-2 border-gray-200 hover:border-indigo-400 hover:bg-indigo-50 transition-all duration-150 text-sm font-medium text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="font-bold text-indigo-500 mr-2">{String.fromCharCode(65 + i)}.</span>
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
            className="flex-1 py-3 rounded-xl border-2 border-green-200 hover:border-green-500 hover:bg-green-50 text-green-700 font-bold transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ✓ Vrai
          </button>
          <button
            onClick={() => onAnswer(false)}
            disabled={disabled}
            className="flex-1 py-3 rounded-xl border-2 border-red-200 hover:border-red-500 hover:bg-red-50 text-red-700 font-bold transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
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
              className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-indigo-400 focus:outline-none text-sm text-gray-900 placeholder-gray-400 transition-colors disabled:opacity-50"
              autoComplete="off"
            />
            {showMathKeyboard && !disabled && (
              <button
                type="button"
                onClick={() => setClavierOuvert((o) => !o)}
                title="Clavier mathématique"
                className={`px-3 py-2 rounded-xl border-2 transition-colors ${
                  clavierOuvert
                    ? "border-blue-500 bg-blue-100 text-blue-700"
                    : "border-gray-300 bg-gray-100 text-gray-600 hover:border-blue-400 hover:bg-blue-50"
                }`}
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
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Valider ma réponse
          </button>
        </form>
      )}
    </div>
  );
}
