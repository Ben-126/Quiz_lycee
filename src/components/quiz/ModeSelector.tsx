"use client";
import type { ModeQuiz } from "@/types";

interface ModeSelectorProps {
  titreChapitre: string;
  onSelectMode: (mode: ModeQuiz) => void;
}

export default function ModeSelector({ titreChapitre, onSelectMode }: ModeSelectorProps) {
  return (
    <div className="space-y-6" data-testid="mode-selector">
      <div className="text-center">
        <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wider mb-1">
          {titreChapitre}
        </p>
        <h2 className="text-xl font-bold text-gray-800">Choisir un mode</h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {/* Mode Entraînement */}
        <button
          onClick={() => onSelectMode("entrainement")}
          data-testid="btn-mode-entrainement"
          className="group relative flex flex-col items-center text-center gap-3 p-6 rounded-2xl border-2 border-indigo-200 hover:border-indigo-500 bg-white hover:bg-indigo-50 transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <span className="text-4xl">🎯</span>
          <div>
            <p className="font-bold text-gray-800 text-base">Entraînement</p>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              Correction après chaque question · Indices · Révision des erreurs
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-1 mt-1">
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700">
              Correction immédiate
            </span>
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
              Adaptatif
            </span>
          </div>
        </button>

        {/* Mode Contrôle */}
        <button
          onClick={() => onSelectMode("controle")}
          data-testid="btn-mode-controle"
          className="group relative flex flex-col items-center text-center gap-3 p-6 rounded-2xl border-2 border-orange-200 hover:border-orange-500 bg-white hover:bg-orange-50 transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <span className="text-4xl">📝</span>
          <div>
            <p className="font-bold text-gray-800 text-base">Contrôle</p>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              Temps limité · 10 questions · Note sur 20
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-1 mt-1">
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
              Conditions réelles
            </span>
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-700">
              Chronomètre
            </span>
          </div>
        </button>
        {/* Mode Chrono */}
        <button
          onClick={() => onSelectMode("chrono")}
          data-testid="btn-mode-chrono"
          className="group relative flex flex-col items-center text-center gap-3 p-6 rounded-2xl border-2 border-yellow-300 hover:border-yellow-400 bg-white hover:bg-yellow-50 transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <span className="text-4xl">⚡</span>
          <div>
            <p className="font-bold text-gray-800 text-base">Chrono</p>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              Course contre la montre · Réponds vite pour gagner plus de points !
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-1 mt-1">
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">
              30s par question
            </span>
          </div>
        </button>
      </div>
    </div>
  );
}
