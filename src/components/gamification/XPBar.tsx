"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getProfilGamification,
  getNiveauFromXP,
  getProgressionNiveau,
} from "@/lib/gamification";

export default function XPBar() {
  const [xpTotal, setXpTotal] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const profil = getProfilGamification();
    setXpTotal(profil.xpTotal);
    setMounted(true);
  }, []);

  useEffect(() => {
    const handler = () => {
      const profil = getProfilGamification();
      setXpTotal(profil.xpTotal);
    };
    window.addEventListener("gamification-updated", handler);
    return () => window.removeEventListener("gamification-updated", handler);
  }, []);

  if (!mounted || xpTotal === 0) return null;

  const niveau      = getNiveauFromXP(xpTotal);
  const progression = getProgressionNiveau(xpTotal);

  return (
    <Link
      href="/progression"
      className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-indigo-50 transition-colors group"
      title={`Niveau ${niveau.numero} — ${niveau.nom} · ${xpTotal} XP`}
    >
      <span className="text-sm">{niveau.emoji}</span>
      <div className="hidden sm:flex flex-col gap-0.5 min-w-[80px]">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-indigo-700 leading-none">
            Niv. {niveau.numero}
          </span>
          <span className="text-xs text-indigo-400 leading-none">{xpTotal} XP</span>
        </div>
        <div className="w-full h-1.5 bg-indigo-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-500 rounded-full transition-all duration-500"
            style={{ width: `${progression.pourcentage}%` }}
          />
        </div>
      </div>
    </Link>
  );
}
