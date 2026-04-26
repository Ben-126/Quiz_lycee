import { notFound } from "next/navigation";
import Link from "next/link";
import Header from "@/components/navigation/Header";
import QuizRunner from "@/components/quiz/QuizRunner";
import { NIVEAUX, getMatiereBySlugAndNiveau, type Niveau } from "@/data/programmes";

interface Props {
  params: Promise<{ niveau: string; matiere: string; chapitre: string }>;
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

export default async function QuizPage({ params }: Props) {
  const { niveau: niveauSlug, matiere: matiereSlug, chapitre: chapitreSlug } = await params;

  const niveauInfo = NIVEAUX.find((n) => n.slug === niveauSlug);
  if (!niveauInfo) notFound();

  const matiere = getMatiereBySlugAndNiveau(niveauSlug as Niveau, matiereSlug);
  if (!matiere) notFound();

  const chapitre = matiere.chapitres.find((c) => c.slug === chapitreSlug);
  if (!chapitre) notFound();

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header />
      <main style={{ flex: 1, maxWidth: 720, margin: "0 auto", width: "100%", padding: "24px 24px 48px" }}>

        {/* Fil d'ariane */}
        <nav aria-label="Fil d'ariane" style={{ marginBottom: 20 }}>
          <ol style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "2px 6px", listStyle: "none", padding: 0, margin: 0 }}>
            <li>
              <Link href="/app" style={{ fontFamily: "var(--f-body)", fontWeight: 600, fontSize: "0.78rem", color: "var(--text3)", textDecoration: "none" }}>
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
            <li style={{ fontFamily: "var(--f-body)", fontWeight: 600, fontSize: "0.78rem", color: "var(--text3)", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={chapitre.titre}>
              {chapitre.titre}
            </li>
            <li aria-hidden="true" style={{ color: "var(--text3)", fontSize: "0.78rem" }}>›</li>
            <li>
              <span style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                padding: "2px 8px",
                borderRadius: "var(--r-pill)",
                background: "rgba(77,94,232,0.12)",
                color: "var(--indigo-l)",
                fontFamily: "var(--f-head)",
                fontWeight: 700,
                fontSize: "0.65rem",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}>
                Quiz
              </span>
            </li>
          </ol>

          {/* Compétences évaluées */}
          {chapitre.competences.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 8 }} aria-label="Compétences évaluées">
              {chapitre.competences.map((comp) => (
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
            </div>
          )}
        </nav>

        <div
          data-testid="quiz-container"
          style={{
            background: "var(--card)",
            borderRadius: "var(--r-lg)",
            border: "1px solid var(--border)",
            padding: "20px 24px",
          }}
        >
          <QuizRunner
            matiereSlug={matiereSlug}
            chapitreSlug={chapitreSlug}
            titreChapitre={chapitre.titre}
            niveauLycee={niveauSlug}
            matiereName={matiere.nom}
            competences={chapitre.competences}
          />
        </div>

        <p style={{
          textAlign: "center",
          fontFamily: "var(--f-body)",
          fontSize: "0.75rem",
          color: "var(--text3)",
          marginTop: 16,
        }}>
          Questions générées pour la classe de {niveauInfo.label}
        </p>
      </main>
    </div>
  );
}
