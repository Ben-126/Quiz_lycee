"use client";
import { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip,
} from "recharts";

interface ChapitreData {
  slug: string;
  nom: string;
  scoreMoyen: number | null;
}

interface GraphiqueChapitresProps {
  chapitres: ChapitreData[];
  chapitreActifSlug: string | null;
  onSelectChapitre: (slug: string) => void;
}

export default function GraphiqueChapitres({
  chapitres,
  chapitreActifSlug,
  onSelectChapitre,
}: GraphiqueChapitresProps) {
  const [mounted, setMounted] = useState(false);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setMounted(true); }, []);

  if (!mounted) {
    return <div style={{ height: 200, background: "rgba(255,255,255,0.04)", borderRadius: "var(--r-md)" }} className="animate-pulse" />;
  }

  if (chapitres.length === 0) {
    return (
      <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text3)", fontSize: 14 }}>
        Aucun chapitre disponible
      </div>
    );
  }

  const data = chapitres.map((c) => ({
    slug: c.slug,
    nom: c.nom.length > 18 ? c.nom.slice(0, 18) + "…" : c.nom,
    score: c.scoreMoyen ?? 0,
    nonFait: c.scoreMoyen === null,
  }));

  return (
    <ResponsiveContainer width="100%" height={Math.max(200, chapitres.length * 36)}>
      <BarChart
        layout="vertical"
        data={data}
        margin={{ top: 0, right: 24, left: 0, bottom: 0 }}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onClick={(payload: any) => {
          if (payload?.activePayload?.[0]?.payload?.slug) {
            onSelectChapitre(payload.activePayload[0].payload.slug as string);
          }
        }}
      >
        <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: "#878FA8" }} tickFormatter={(v) => `${v}%`} />
        <YAxis type="category" dataKey="nom" tick={{ fontSize: 10, fill: "#878FA8" }} width={90} />
        <Tooltip
          contentStyle={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 10, color: "var(--text)" }}
          formatter={(value) => [`${value}%`, "Score moyen"]}
        />
        <Bar dataKey="score" radius={[0, 4, 4, 0]} cursor="pointer" isAnimationActive>
          {data.map((entry) => (
            <Cell
              key={entry.slug}
              fill={
                entry.slug === chapitreActifSlug
                  ? "#4D5EE8"
                  : entry.nonFait
                  ? "rgba(255,255,255,0.08)"
                  : "rgba(77,94,232,0.45)"
              }
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
