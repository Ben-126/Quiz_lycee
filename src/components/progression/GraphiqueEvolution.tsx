"use client";
import { useState, useEffect } from "react";
import {
  LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, ReferenceLine,
} from "recharts";
import type { EntreeHistorique } from "@/lib/history";

interface GraphiqueEvolutionProps {
  entrees: EntreeHistorique[];
}

export default function GraphiqueEvolution({ entrees }: GraphiqueEvolutionProps) {
  const [mounted, setMounted] = useState(false);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setMounted(true); }, []);

  if (!mounted) {
    return <div style={{ height: 200, background: "rgba(255,255,255,0.04)", borderRadius: "var(--r-md)" }} className="animate-pulse" />;
  }

  if (entrees.length === 0) {
    return (
      <div style={{ height: 200, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, color: "var(--text3)" }}>
        <p style={{ fontSize: 30 }}>📈</p>
        <p style={{ fontSize: 14, textAlign: "center" }}>Clique sur un chapitre pour voir son évolution</p>
      </div>
    );
  }

  const data = entrees.slice(-5).map((e) => ({
    date: new Date(e.date).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" }),
    score: e.score,
  }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
        <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#878FA8" }} />
        <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#878FA8" }} tickFormatter={(v) => `${v}%`} />
        <Tooltip
          contentStyle={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 10, color: "var(--text)" }}
          formatter={(value) => [`${value}%`, "Score"]}
        />
        <ReferenceLine
          y={80}
          stroke="#3DD6BF"
          strokeDasharray="4 2"
          label={{ value: "80%", fontSize: 9, fill: "#3DD6BF", position: "right" }}
        />
        <Line
          type="monotone"
          dataKey="score"
          stroke="#4D5EE8"
          strokeWidth={2}
          dot={{ r: 4, fill: "#4D5EE8" }}
          activeDot={{ r: 6 }}
          isAnimationActive
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
