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
      className="matiere-card"
      style={{
        display: "block",
        textDecoration: "none",
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: "var(--r-lg)",
        overflow: "hidden",
        transition: "transform .2s, border-color .2s, box-shadow .2s",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLAnchorElement;
        el.style.transform = "translateY(-3px)";
        el.style.borderColor = "rgba(77,94,232,0.28)";
        el.style.boxShadow = "0 8px 24px rgba(0,0,0,0.3)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLAnchorElement;
        el.style.transform = "translateY(0)";
        el.style.borderColor = "var(--border)";
        el.style.boxShadow = "none";
      }}
    >
      {/* Zone emoji */}
      <div style={{
        padding: "20px 8px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(77,94,232,0.06)",
        borderBottom: "1px solid var(--border)",
      }}>
        <span className="card-emoji" style={{ fontSize: "2rem" }} role="img" aria-label={matiere.nom}>
          {matiere.emoji}
        </span>
      </div>

      {/* Infos */}
      <div style={{ padding: "10px 10px 12px", textAlign: "center" }}>
        <h2 style={{
          fontFamily: "var(--f-head)",
          fontWeight: 800,
          fontSize: "0.82rem",
          color: "var(--text)",
          lineHeight: 1.3,
          marginBottom: 4,
        }}>
          {matiere.nom}
        </h2>
        <p style={{
          fontFamily: "var(--f-body)",
          fontSize: "0.72rem",
          color: "var(--text3)",
        }}>
          {matiere.chapitres.length} chapitres
        </p>
      </div>
    </Link>
  );
}
