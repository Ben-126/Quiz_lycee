"use client";
import { useEffect, useState } from "react";
import ChapitreCard from "./ChapitreCard";
import type { Matiere } from "@/types";
import { getToutesPerformances } from "@/lib/performance";

interface ChapitresAvecProgressionProps {
  matiere: Matiere;
  niveau: string;
}

type ProgressionMap = Record<string, { scoreMoyen: number; nombreQuiz: number } | null>;

export default function ChapitresAvecProgression({ matiere, niveau }: ChapitresAvecProgressionProps) {
  const [progressions, setProgressions] = useState<ProgressionMap>({});

  useEffect(() => {
    const data = getToutesPerformances();
    const result: ProgressionMap = {};
    for (const chapitre of matiere.chapitres) {
      const cle = `${matiere.slug}/${chapitre.slug}`;
      const perf = data[cle];
      result[chapitre.slug] =
        perf && perf.nombreQuizCompletes > 0
          ? { scoreMoyen: perf.scoreMoyen, nombreQuiz: perf.nombreQuizCompletes }
          : null;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setProgressions(result);
  }, [matiere]);

  return (
    <div className="space-y-3" data-testid="liste-chapitres">
      {matiere.chapitres.map((chapitre) => (
        <ChapitreCard
          key={chapitre.slug}
          niveau={niveau}
          matiere={matiere}
          chapitre={chapitre}
          progression={progressions[chapitre.slug] ?? null}
        />
      ))}
    </div>
  );
}
