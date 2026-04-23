// src/components/engagement/BanniereObjectif.tsx
"use client";
import { useState, useEffect } from "react";
import { getProgressionObjectif, type ProgressionObjectif } from "@/lib/objectif";

export default function BanniereObjectif() {
  const [progression, setProgression] = useState<ProgressionObjectif | null>(null);

  useEffect(() => {
    setProgression(getProgressionObjectif());
  }, []);

  if (!progression) return null;

  const { actuel, cible, atteint, restant } = progression;
  const pourcentage = Math.min(100, Math.round((actuel / cible) * 100));

  const accentColor = atteint ? "#3DD6BF" : pourcentage >= 50 ? "#F5C840" : "#EF6E5A";
  const accentBg = atteint
    ? "rgba(61,214,191,0.08)"
    : pourcentage >= 50
    ? "rgba(245,200,64,0.08)"
    : "rgba(239,110,90,0.08)";
  const accentBorder = atteint
    ? "rgba(61,214,191,0.20)"
    : pourcentage >= 50
    ? "rgba(245,200,64,0.20)"
    : "rgba(239,110,90,0.20)";

  const message = atteint
    ? `Objectif du jour atteint ! Bravo`
    : actuel === 0
    ? `Lance ton premier quiz du jour ! (objectif : ${cible} quiz réussi${cible > 1 ? "s" : ""})`
    : `Encore ${restant} quiz pour atteindre ton objectif !`;

  return (
    <div
      data-testid="banniere-objectif"
      style={{
        background: accentBg,
        border: `1px solid ${accentBorder}`,
        borderRadius: 14,
        padding: "12px 16px",
        marginBottom: 16,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontSize: "0.78rem", fontWeight: 700, color: accentColor, fontFamily: "var(--f-head)" }}>
          Objectif du jour
        </span>
        <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#878FA8", fontFamily: "var(--f-head)" }}>
          {actuel} / {cible} quiz réussi{cible > 1 ? "s" : ""}
        </span>
      </div>
      <div style={{ height: 3, background: "rgba(255,255,255,0.07)", borderRadius: 2, overflow: "hidden", marginBottom: 8 }}>
        <div
          style={{
            height: "100%",
            borderRadius: 2,
            width: `${pourcentage}%`,
            background: atteint
              ? "#3DD6BF"
              : pourcentage >= 50
              ? "linear-gradient(90deg, #F5C840 0%, #FAD96A 100%)"
              : "linear-gradient(90deg, #4D5EE8 0%, #EF6E5A 100%)",
            transition: "width 0.5s ease",
          }}
        />
      </div>
      <p style={{ fontSize: "0.78rem", color: "#878FA8", margin: 0, fontFamily: "var(--f-body)" }}>{message}</p>
    </div>
  );
}
