"use client";

import { useState } from "react";
import Header from "@/components/navigation/Header";
import MatiereCard from "@/components/navigation/MatiereCard";
import { NIVEAUX, type Niveau } from "@/data/programmes";
import BanniereObjectif from "@/components/engagement/BanniereObjectif";
import { getParametres } from "@/lib/parametres";

export default function HomePage() {
  const [niveauActif, setNiveauActif] = useState<Niveau>(
    () => (typeof window !== "undefined" ? getParametres().niveauDefaut : "seconde")
  );

  const niveauInfo = NIVEAUX.find((n) => n.slug === niveauActif)!;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6">
        <BanniereObjectif />
        <div className="text-center mb-8">
          {/* Logo PNG — icône cerveau */}
          <div className="flex justify-center mb-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Révioria Academy" className="w-28 h-28 sm:w-36 sm:h-36 object-contain" />
          </div>
          {/* Logo texte SVG */}
          <h1 className="flex items-center justify-center mb-2">
            <span className="font-serif font-light tracking-[0.14em] text-5xl sm:text-6xl text-[#0F172A]">Révioria</span>
            <span className="inline-block w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-[#2563EB] ml-2 sm:ml-3 self-end mb-2 sm:mb-3 shrink-0" />
          </h1>
          <p className="text-gray-500 text-sm sm:text-base">
            Révise avec l&apos;IA · Choisis ton niveau puis une matière pour commencer
          </p>
        </div>

        {/* Sélecteur de niveau */}
        <div className="flex justify-center gap-2 mb-8" role="tablist" aria-label="Niveau scolaire">
          {NIVEAUX.map((niveau) => (
            <button
              key={niveau.slug}
              role="tab"
              aria-selected={niveauActif === niveau.slug}
              onClick={() => setNiveauActif(niveau.slug)}
              className={`px-4 py-2 rounded-full font-semibold text-sm sm:text-base transition-colors border-2 ${
                niveauActif === niveau.slug
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-indigo-600 border-indigo-300 hover:border-indigo-500"
              }`}
            >
              {niveau.emoji} {niveau.label}
            </button>
          ))}
        </div>

        <div
          className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-4 gap-3 sm:gap-4"
          data-testid="liste-matieres"
        >
          {niveauInfo.matieres.map((matiere) => (
            <MatiereCard key={matiere.slug} matiere={matiere} niveau={niveauActif} />
          ))}
        </div>

        <p className="text-center text-xs text-gray-400 mt-8">
          Contenus inspirés des{" "}
          <a
            href="https://www.education.gouv.fr/reussir-au-lycee/les-programmes-du-lycee-general-et-technologique-9812"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-indigo-500"
          >
            programmes officiels du ministère de l&apos;Éducation nationale
          </a>
        </p>
      </main>
    </div>
  );
}
