import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Header from "@/components/navigation/Header";
import ChapitreProgressionResume from "@/components/progression/ChapitreProgressionResume";
import { NIVEAUX, getMatiereBySlugAndNiveau, type Niveau } from "@/data/programmes";

interface Props {
  params: Promise<{ niveau: string; matiere: string; chapitre: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { niveau: niveauSlug, matiere: matiereSlug, chapitre: chapitreSlug } = await params;
  const niveauInfo = NIVEAUX.find((n) => n.slug === niveauSlug);
  const matiere = getMatiereBySlugAndNiveau(niveauSlug as Niveau, matiereSlug);
  if (!niveauInfo || !matiere) return {};
  const chapitre = matiere.chapitres.find((c) => c.slug === chapitreSlug);
  if (!chapitre) return {};
  return {
    title: `${chapitre.titre} — ${matiere.nom} ${niveauInfo.label} | Révioria`,
    description: `Quiz IA sur "${chapitre.titre}" en ${matiere.nom}, classe de ${niveauInfo.label}. ${chapitre.competences.length} compétences au programme.`,
  };
}

export async function generateStaticParams() {
  return NIVEAUX.flatMap((n) =>
    n.matieres.flatMap((m) =>
      m.chapitres.map((c) => ({
        niveau: n.slug,
        matiere: m.slug,
        chapitre: c.slug,
      }))
    )
  );
}

const BASE_URL = "https://quiz-2nd-q5pu.vercel.app";

export default async function ChapitreDetailPage({ params }: Props) {
  const { niveau: niveauSlug, matiere: matiereSlug, chapitre: chapitreSlug } = await params;

  const niveauInfo = NIVEAUX.find((n) => n.slug === niveauSlug);
  if (!niveauInfo) notFound();

  const matiere = getMatiereBySlugAndNiveau(niveauSlug as Niveau, matiereSlug);
  if (!matiere) notFound();

  const chapitre = matiere.chapitres.find((c) => c.slug === chapitreSlug);
  if (!chapitre) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Quiz",
    name: `Quiz ${chapitre.titre} — ${matiere.nom} ${niveauInfo.label}`,
    description: `Quiz IA sur "${chapitre.titre}" en ${matiere.nom}, classe de ${niveauInfo.label}. ${chapitre.competences.length} compétences au programme.`,
    url: `${BASE_URL}/${niveauSlug}/${matiereSlug}/${chapitreSlug}`,
    educationalLevel: niveauInfo.label,
    about: { "@type": "Thing", name: chapitre.titre },
    provider: { "@type": "Organization", name: "Révioria", url: BASE_URL },
    isAccessibleForFree: true,
    inLanguage: "fr-FR",
  };

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <main style={{ flex: 1, maxWidth: 720, margin: "0 auto", width: "100%", padding: "24px 24px 48px" }}>

        {/* Fil d'ariane */}
        <nav aria-label="Fil d'ariane" style={{ marginBottom: 20 }}>
          <ol style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "2px 6px", listStyle: "none", padding: 0, margin: 0 }}>
            <li>
              <Link href="/app" style={{ fontFamily: "var(--f-body)", fontWeight: 600, fontSize: "0.78rem", color: "var(--text3)", textDecoration: "none" }}
                onMouseEnter={undefined} onMouseLeave={undefined}
              >
                {niveauInfo.emoji} {niveauInfo.label}
              </Link>
            </li>
            <li aria-hidden="true" style={{ color: "var(--text3)", fontSize: "0.78rem" }}>›</li>
            <li>
              <Link
                href={`/${niveauSlug}/${matiereSlug}`}
                style={{ fontFamily: "var(--f-body)", fontWeight: 600, fontSize: "0.78rem", color: "var(--text3)", textDecoration: "none", display: "flex", alignItems: "center", gap: 3 }}
              >
                <span>{matiere.emoji}</span>
                <span>{matiere.nom}</span>
              </Link>
            </li>
            <li aria-hidden="true" style={{ color: "var(--text3)", fontSize: "0.78rem" }}>›</li>
            <li style={{ fontFamily: "var(--f-body)", fontWeight: 600, fontSize: "0.78rem", color: "var(--text2)", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
              title={chapitre.titre}>
              {chapitre.titre}
            </li>
          </ol>
        </nav>

        {/* En-tête du chapitre */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
          <div className={matiere.couleur} style={{ borderRadius: "var(--r-md)", padding: "10px 12px", flexShrink: 0, opacity: 0.9 }}>
            <span style={{ fontSize: "1.8rem" }} role="img" aria-label={matiere.nom}>{matiere.emoji}</span>
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
              {matiere.nom}
            </p>
            <h1 style={{
              fontFamily: "var(--f-head)",
              fontWeight: 900,
              fontSize: "1.2rem",
              color: "var(--text)",
              lineHeight: 1.25,
            }}>
              {chapitre.titre}
            </h1>
            <p style={{ fontFamily: "var(--f-body)", fontSize: "0.8rem", color: "var(--text3)", marginTop: 2 }}>
              {chapitre.competences.length} compétence{chapitre.competences.length > 1 ? "s" : ""} au programme
            </p>
          </div>
        </div>

        {/* Progression (client) */}
        <ChapitreProgressionResume matiereSlug={matiereSlug} chapitreSlug={chapitreSlug} />

        {/* Compétences au programme */}
        <section style={{ marginBottom: 24 }} aria-labelledby="titre-competences">
          <h2
            id="titre-competences"
            style={{
              fontFamily: "var(--f-head)",
              fontWeight: 800,
              fontSize: "0.82rem",
              color: "var(--text2)",
              marginBottom: 10,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span style={{ color: "var(--indigo-l)" }} aria-hidden="true">📋</span>
            Compétences au programme
          </h2>
          <ul style={{ display: "flex", flexDirection: "column", gap: 8, padding: 0, margin: 0, listStyle: "none" }}>
            {chapitre.competences.map((comp, i) => (
              <li
                key={comp.id}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                  padding: "10px 14px",
                  background: "rgba(77,94,232,0.07)",
                  borderRadius: "var(--r-md)",
                  border: "1px solid rgba(77,94,232,0.15)",
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    flexShrink: 0,
                    width: 22,
                    height: 22,
                    background: "rgba(77,94,232,0.18)",
                    color: "var(--indigo-l)",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.72rem",
                    fontWeight: 800,
                    fontFamily: "var(--f-head)",
                  }}
                >
                  {i + 1}
                </span>
                <span style={{
                  fontFamily: "var(--f-body)",
                  fontSize: "0.88rem",
                  color: "var(--text)",
                  fontWeight: 500,
                  lineHeight: 1.45,
                }}>
                  {comp.titre}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* Bouton démarrer */}
        <Link
          href={`/${niveauSlug}/${matiereSlug}/${chapitreSlug}/quiz`}
          data-testid="btn-demarrer-quiz"
          className="btn-demarrer"
          style={{
            display: "block",
            width: "100%",
            padding: "14px",
            background: "linear-gradient(135deg, #EF6E5A 0%, #E85840 100%)",
            color: "#fff",
            borderRadius: "var(--r-pill)",
            fontFamily: "var(--f-head)",
            fontWeight: 800,
            fontSize: "1rem",
            textAlign: "center",
            textDecoration: "none",
            boxShadow: "0 4px 20px rgba(239,110,90,0.32)",
            transition: "transform .15s, box-shadow .15s",
          }}
        >
          🚀 Démarrer le quiz
        </Link>

        <p style={{
          textAlign: "center",
          fontFamily: "var(--f-body)",
          fontSize: "0.75rem",
          color: "var(--text3)",
          marginTop: 12,
        }}>
          Questions générées par IA · classe de {niveauInfo.label}
        </p>
      </main>
    </div>
  );
}
