import Link from "next/link";
import type { Matiere } from "@/types";
import IndicateurMaitrise from "@/components/progression/IndicateurMaitrise";

interface ChapitreCardProps {
  matiere: Matiere;
  chapitre: Matiere["chapitres"][0];
  niveau: string;
  progression?: { scoreMoyen: number; nombreQuiz: number } | null;
}

const MAX_COMPETENCES_VISIBLES = 3;

export default function ChapitreCard({ matiere, chapitre, niveau, progression }: ChapitreCardProps) {
  const competencesVisibles = chapitre.competences.slice(0, MAX_COMPETENCES_VISIBLES);
  const surplus = chapitre.competences.length - MAX_COMPETENCES_VISIBLES;

  return (
    <Link
      href={`/${niveau}/${matiere.slug}/${chapitre.slug}`}
      data-testid="chapitre-card"
      className="chapitre-card"
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 14,
        padding: "14px 16px",
        background: "var(--card)",
        borderRadius: "var(--r-lg)",
        border: "1px solid var(--border)",
        textDecoration: "none",
        transition: "transform .2s, border-color .2s, box-shadow .2s",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLAnchorElement;
        el.style.transform = "translateY(-2px)";
        el.style.borderColor = "rgba(77,94,232,0.28)";
        el.style.boxShadow = "0 6px 20px rgba(0,0,0,0.25)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLAnchorElement;
        el.style.transform = "translateY(0)";
        el.style.borderColor = "var(--border)";
        el.style.boxShadow = "none";
      }}
    >
      <div className={matiere.couleur} style={{ borderRadius: "var(--r-sm)", padding: "7px 9px", flexShrink: 0, marginTop: 1, opacity: 0.85 }}>
        <span className="card-emoji" style={{ fontSize: "1.4rem" }} role="img" aria-label={matiere.nom}>{matiere.emoji}</span>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <h3 style={{
          fontFamily: "var(--f-head)",
          fontWeight: 700,
          fontSize: "0.9rem",
          color: "var(--text)",
          lineHeight: 1.3,
        }}>
          {chapitre.titre}
        </h3>
        <IndicateurMaitrise
          scoreMoyen={progression?.scoreMoyen ?? null}
          nombreQuiz={progression?.nombreQuiz ?? 0}
        />
        {/* Tags des compétences */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 8 }} aria-label="Compétences du chapitre">
          {competencesVisibles.map((comp) => (
            <span
              key={comp.id}
              style={{
                display: "inline-block",
                padding: "2px 8px",
                fontSize: "0.68rem",
                fontFamily: "var(--f-body)",
                fontWeight: 500,
                borderRadius: "var(--r-pill)",
                background: "rgba(77,94,232,0.1)",
                color: "var(--indigo-l)",
                border: "1px solid rgba(77,94,232,0.18)",
                lineHeight: 1.6,
              }}
            >
              {comp.titre}
            </span>
          ))}
          {surplus > 0 && (
            <span style={{
              display: "inline-block",
              padding: "2px 8px",
              fontSize: "0.68rem",
              fontFamily: "var(--f-body)",
              fontWeight: 500,
              borderRadius: "var(--r-pill)",
              background: "rgba(255,255,255,0.05)",
              color: "var(--text3)",
              lineHeight: 1.6,
            }}>
              +{surplus}
            </span>
          )}
        </div>
      </div>
      <svg
        className="arrow-chevron"
        style={{ color: "var(--text3)", flexShrink: 0, marginTop: 2 }}
        width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2"
      >
        <path d="M8 4l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </Link>
  );
}
