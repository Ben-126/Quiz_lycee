import { notFound } from "next/navigation";
import Header from "@/components/navigation/Header";
import ChapitresAvecProgression from "@/components/navigation/ChapitresAvecProgression";
import StatsMatiere from "@/components/progression/StatsMatiere";
import { NIVEAUX, getMatiereBySlugAndNiveau, type Niveau } from "@/data/programmes";

interface Props {
  params: Promise<{ niveau: string; matiere: string }>;
}

export async function generateStaticParams() {
  return NIVEAUX.flatMap((n) =>
    n.matieres.map((m) => ({ niveau: n.slug, matiere: m.slug }))
  );
}

export default async function MatierePage({ params }: Props) {
  const { niveau: niveauSlug, matiere: matiereSlug } = await params;

  const niveauInfo = NIVEAUX.find((n) => n.slug === niveauSlug);
  if (!niveauInfo) notFound();

  const matiere = getMatiereBySlugAndNiveau(niveauSlug as Niveau, matiereSlug);
  if (!matiere) notFound();

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header />
      <main style={{ flex: 1, maxWidth: 720, margin: "0 auto", width: "100%", padding: "24px 24px 48px" }}>

        {/* En-tête matière */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 8 }}>
          <div className={matiere.couleur} style={{ borderRadius: "var(--r-md)", padding: "10px 12px", flexShrink: 0, opacity: 0.9 }}>
            <span style={{ fontSize: "1.8rem" }}>{matiere.emoji}</span>
          </div>
          <div>
            <p style={{
              fontFamily: "var(--f-head)",
              fontWeight: 700,
              fontSize: "0.72rem",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--text3)",
              marginBottom: 2,
            }}>
              {niveauInfo.emoji} {niveauInfo.label}
            </p>
            <h1 style={{
              fontFamily: "var(--f-head)",
              fontWeight: 900,
              fontSize: "1.3rem",
              color: "var(--text)",
              lineHeight: 1.2,
            }}>
              {matiere.nom}
            </h1>
            <p style={{ fontFamily: "var(--f-body)", fontSize: "0.82rem", color: "var(--text3)", marginTop: 2 }}>
              {matiere.chapitres.length} chapitres disponibles
            </p>
          </div>
        </div>

        <div style={{ marginTop: 20 }}>
          <StatsMatiere matiereSlug={matiereSlug} chapitres={matiere.chapitres} />
        </div>

        <p style={{
          fontFamily: "var(--f-body)",
          fontSize: "0.82rem",
          fontWeight: 600,
          color: "var(--text2)",
          marginBottom: 10,
          marginTop: 8,
        }}>
          Choisir un chapitre :
        </p>

        <ChapitresAvecProgression matiere={matiere} niveau={niveauSlug} />
      </main>
    </div>
  );
}
