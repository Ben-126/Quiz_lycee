"use client";
import { useEffect, useState } from "react";
import { getToutesPerformances } from "@/lib/performance";
import type { Chapitre } from "@/types";

interface StatsMatiereProps {
  matiereSlug: string;
  chapitres: Chapitre[];
}

interface Stats {
  totalQuiz: number;
  scoreMoyen: number | null;
  chapitresMaitrises: number;
}

export default function StatsMatiere({ matiereSlug, chapitres }: StatsMatiereProps) {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    const data = getToutesPerformances();
    let totalQuiz = 0;
    let sommeScores = 0;
    let chapitresAvecDonnees = 0;
    let chapitresMaitrises = 0;

    for (const chapitre of chapitres) {
      const cle = `${matiereSlug}/${chapitre.slug}`;
      const perf = data[cle];
      if (perf && perf.nombreQuizCompletes > 0) {
        totalQuiz += perf.nombreQuizCompletes;
        sommeScores += perf.scoreMoyen;
        chapitresAvecDonnees++;
        if (perf.scoreMoyen >= 80) chapitresMaitrises++;
      }
    }

    setStats({
      totalQuiz,
      scoreMoyen: chapitresAvecDonnees > 0 ? Math.round(sommeScores / chapitresAvecDonnees) : null,
      chapitresMaitrises,
    });
  }, [matiereSlug, chapitres]);

  if (!stats || stats.totalQuiz === 0) return null;

  return (
    <div style={{
      display: "flex",
      gap: 0,
      padding: "12px 16px",
      background: "rgba(77,94,232,0.07)",
      borderRadius: "var(--r-md)",
      border: "1px solid rgba(77,94,232,0.15)",
      marginBottom: 16,
    }}>
      <div style={{ flex: 1, textAlign: "center" }}>
        <p style={{ fontFamily: "var(--f-head)", fontWeight: 900, fontSize: "1.1rem", color: "var(--indigo-l)" }}>
          {stats.totalQuiz}
        </p>
        <p style={{ fontFamily: "var(--f-body)", fontSize: "0.72rem", color: "var(--text3)" }}>quiz complétés</p>
      </div>
      <div style={{ width: 1, background: "rgba(77,94,232,0.2)" }} />
      <div style={{ flex: 1, textAlign: "center" }}>
        <p style={{ fontFamily: "var(--f-head)", fontWeight: 900, fontSize: "1.1rem", color: "var(--indigo-l)" }}>
          {stats.scoreMoyen ?? "—"}%
        </p>
        <p style={{ fontFamily: "var(--f-body)", fontSize: "0.72rem", color: "var(--text3)" }}>score moyen</p>
      </div>
      <div style={{ width: 1, background: "rgba(77,94,232,0.2)" }} />
      <div style={{ flex: 1, textAlign: "center" }}>
        <p style={{ fontFamily: "var(--f-head)", fontWeight: 900, fontSize: "1.1rem", color: "var(--indigo-l)" }}>
          {stats.chapitresMaitrises}/{chapitres.length}
        </p>
        <p style={{ fontFamily: "var(--f-body)", fontSize: "0.72rem", color: "var(--text3)" }}>maîtrisés</p>
      </div>
    </div>
  );
}
