export type NiveauDifficulte = "debutant" | "intermediaire" | "avance";

export interface PerformanceChapitre {
  nombreQuizCompletes: number;
  scoreMoyen: number; // pourcentage 0-100
  derniersScores: number[]; // jusqu'à 5 derniers pourcentages
  dernieresErreurs: string[]; // questions du dernier quiz non réussies
}

const STORAGE_KEY = "quiz-performances";
const MAX_SCORES = 5;

function getStorage(): Record<string, PerformanceChapitre> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, PerformanceChapitre>) : {};
  } catch {
    return {};
  }
}

function saveStorage(data: Record<string, PerformanceChapitre>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // localStorage indisponible (ex: mode privé saturé)
  }
}

function clePerformance(matiereSlug: string, chapitreSlug: string): string {
  return `${matiereSlug}/${chapitreSlug}`;
}

export function getPerformance(
  matiereSlug: string,
  chapitreSlug: string
): PerformanceChapitre | null {
  const data = getStorage();
  return data[clePerformance(matiereSlug, chapitreSlug)] ?? null;
}

export function sauvegarderPerformance(
  matiereSlug: string,
  chapitreSlug: string,
  scorePourcentage: number,
  questionsRatees: string[]
): void {
  const data = getStorage();
  const cle = clePerformance(matiereSlug, chapitreSlug);
  const existant = data[cle];

  const derniersScores = existant
    ? [...existant.derniersScores.slice(-(MAX_SCORES - 1)), scorePourcentage]
    : [scorePourcentage];

  const scoreMoyen = Math.round(
    derniersScores.reduce((a, b) => a + b, 0) / derniersScores.length
  );

  data[cle] = {
    nombreQuizCompletes: (existant?.nombreQuizCompletes ?? 0) + 1,
    scoreMoyen,
    derniersScores,
    dernieresErreurs: questionsRatees,
  };

  saveStorage(data);
}

export function getNiveau(performance: PerformanceChapitre | null): NiveauDifficulte {
  if (!performance || performance.nombreQuizCompletes === 0) return "intermediaire";
  if (performance.scoreMoyen >= 80) return "avance";
  if (performance.scoreMoyen >= 40) return "intermediaire";
  return "debutant";
}
