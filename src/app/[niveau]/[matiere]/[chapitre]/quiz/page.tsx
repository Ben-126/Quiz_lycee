import { notFound } from "next/navigation";
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
    <div className="flex flex-col min-h-screen">
      <Header
        titre={chapitre.titre}
        showBack
        backHref={`/${niveauSlug}/${matiereSlug}`}
      />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6">
        <div className="flex items-center gap-2 mb-6">
          <span className="text-xl">{matiere.emoji}</span>
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
              {niveauInfo.emoji} {niveauInfo.label} · {matiere.nom}
            </p>
            <h1 className="text-base font-bold text-gray-800 leading-tight">{chapitre.titre}</h1>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6" data-testid="quiz-container">
          <QuizRunner
            matiereSlug={matiereSlug}
            chapitreSlug={chapitreSlug}
            titreChapitre={chapitre.titre}
            niveauLycee={niveauSlug}
          />
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          Questions générées pour la classe de {niveauInfo.label}
        </p>
      </main>
    </div>
  );
}
