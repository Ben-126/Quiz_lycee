"use client";
import type { Question } from "@/types";

interface QuestionCardProps {
  question: Question;
  index: number;
  total: number;
  onAnswer: (reponse: string | boolean) => void;
  disabled: boolean;
}

export default function QuestionCard({ question, index, total, onAnswer, disabled }: QuestionCardProps) {
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
            const input = (e.currentTarget.elements.namedItem("reponse") as HTMLInputElement);
            if (input.value.trim()) {
              onAnswer(input.value.trim());
            }
          }}
          className="space-y-2"
        >
          <input
            name="reponse"
            type="text"
            placeholder="Écris ta réponse en quelques mots..."
            disabled={disabled}
            maxLength={200}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-indigo-400 focus:outline-none text-sm text-gray-900 placeholder-gray-400 transition-colors disabled:opacity-50"
            autoComplete="off"
          />
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
