import Link from "next/link";
import type { Matiere } from "@/types";

interface MatiereCardProps {
  matiere: Matiere;
  niveau: string;
}

export default function MatiereCard({ matiere, niveau }: MatiereCardProps) {
  return (
    <Link
      href={`/${niveau}/${matiere.slug}`}
      data-testid="matiere-card"
      className="group block rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-0.5"
      style={{
        background: "rgba(14,16,26,0.92)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(77,94,232,0.28)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; }}
    >
      <div className={`${matiere.couleur} p-4 flex items-center justify-center opacity-90`}>
        <span className="text-4xl" role="img" aria-label={matiere.nom}>{matiere.emoji}</span>
      </div>
      <div className="p-3 text-center">
        <h2
          className="text-sm leading-tight"
          style={{ fontFamily: "var(--f-head)", fontWeight: 800, color: "#ECEDF5", letterSpacing: "-0.01em" }}
        >
          {matiere.nom}
        </h2>
        <p className="text-xs mt-1" style={{ color: "#484F68" }}>
          {matiere.chapitres.length} chapitres
        </p>
      </div>
    </Link>
  );
}
