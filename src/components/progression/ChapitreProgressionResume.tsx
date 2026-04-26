"use client";
import { useEffect, useState } from "react";
import { getPerformance } from "@/lib/performance";
import IndicateurMaitrise from "./IndicateurMaitrise";

interface Props {
  matiereSlug: string;
  chapitreSlug: string;
}

export default function ChapitreProgressionResume({ matiereSlug, chapitreSlug }: Props) {
  const [perf, setPerf] = useState<{ scoreMoyen: number; nombreQuiz: number } | null>(null);

  useEffect(() => {
    const p = getPerformance(matiereSlug, chapitreSlug);
    if (p && p.nombreQuizCompletes > 0) {
      setPerf({ scoreMoyen: p.scoreMoyen, nombreQuiz: p.nombreQuizCompletes });
    }
  }, [matiereSlug, chapitreSlug]);

  if (!perf) return null;

  return (
    <div style={{
      marginBottom: 20,
      padding: "14px 16px",
      background: "var(--card)",
      borderRadius: "var(--r-md)",
      border: "1px solid var(--border)",
    }}>
      <p style={{
        fontFamily: "var(--f-body)",
        fontSize: "0.78rem",
        fontWeight: 600,
        color: "var(--text3)",
        marginBottom: 8,
      }}>
        Ta progression sur ce chapitre
      </p>
      <IndicateurMaitrise scoreMoyen={perf.scoreMoyen} nombreQuiz={perf.nombreQuiz} />
    </div>
  );
}
