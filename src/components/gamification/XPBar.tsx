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
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
      className="flex items-center gap-2 px-2 py-1 transition-colors group"
      style={{ borderRadius: "var(--r-sm)" }}
      title={`Niveau ${niveau.numero} — ${niveau.nom} · ${xpTotal} XP`}
    >
      <span className="text-sm">{niveau.emoji}</span>
      <div className="hidden sm:flex flex-col gap-0.5 min-w-[80px]">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold leading-none" style={{ color: "var(--indigo-l)" }}>
            Niv. {niveau.numero}
          </span>
          <span className="text-xs leading-none" style={{ color: "var(--text3)" }}>{xpTotal} XP</span>
        </div>
        <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(77,94,232,0.2)" }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progression.pourcentage}%`, background: "var(--indigo-l)" }}
          />
        </div>
      </div>
    </Link>
  );
}
