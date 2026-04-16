"use client";
import { useEffect, useState } from "react";
import type { ResultatGamification } from "@/types";
import { NIVEAUX_GAMIFICATION, BADGES_GENERAUX, getBadgesMatiere } from "@/lib/gamification";
import { NIVEAUX } from "@/data/programmes";

interface XPToastProps {
  resultat: ResultatGamification;
}

function getBadgeNom(id: string): string {
  const general = BADGES_GENERAUX.find((b) => b.id === id);
  if (general) return general.nom;
  const toutesMatières = NIVEAUX.flatMap((n) => n.matieres);
  for (const mat of toutesMatières) {
    const badges = getBadgesMatiere(mat.slug, mat.nom);
    const found = badges.find((b) => b.id === id);
    if (found) return found.nom;
  }
  return id;
}

export default function XPToast({ resultat }: XPToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  if (!visible || resultat.xpGagne === 0) return null;

  const niveauInfo = NIVEAUX_GAMIFICATION.find((n) => n.numero === resultat.niveauActuel);

  return (
    <div
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-1.5 animate-bounce-once"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-2xl shadow-lg font-bold text-base">
        <span>⚡</span>
        <span>+{resultat.xpGagne} XP</span>
      </div>

      {resultat.nouveauNiveau !== null && niveauInfo && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-400 text-yellow-900 rounded-xl shadow-md font-semibold text-sm">
          <span>{niveauInfo.emoji}</span>
          <span>Niveau {resultat.nouveauNiveau} — {niveauInfo.nom} !</span>
        </div>
      )}

      {resultat.nouveauxBadges.slice(0, 2).map((id) => (
        <div
          key={id}
          className="flex items-center gap-2 px-3 py-1.5 bg-white border-2 border-indigo-200 text-indigo-700 rounded-xl shadow-sm font-medium text-sm"
        >
          <span>🏅</span>
          <span>Badge : {getBadgeNom(id)}</span>
        </div>
      ))}
    </div>
  );
}
