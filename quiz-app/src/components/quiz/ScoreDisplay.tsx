"use client";
import Link from "next/link";

interface ScoreDisplayProps {
  score: number;
  total: number;
  matiereSlug: string;
  chapitreSlug: string;
  questionsRatees?: string[];
  modeRevision?: boolean;
  onRecommencer: () => void;
  onReviserErreurs?: () => void;
}

export default function ScoreDisplay({
  score,
  total,
  matiereSlug,
  questionsRatees = [],
  modeRevision = false,
  onRecommencer,
  onReviserErreurs,
}: ScoreDisplayProps) {
  const pourcentage = Math.round((score / total) * 100);

  const getMessage = () => {
    if (pourcentage >= 80) return { texte: "Excellent travail ! Tu maîtrises ce chapitre.", emoji: "🏆" };
    if (pourcentage >= 60) return { texte: "Bon travail ! Continue à réviser.", emoji: "👍" };
    if (pourcentage >= 40) return { texte: "Pas mal ! Un peu plus de révisions s'impose.", emoji: "📚" };
    return { texte: "Ce chapitre nécessite plus de révisions. Courage !", emoji: "💪" };
  };

  const { texte, emoji } = getMessage();

  const couleurBarre =
    pourcentage >= 80 ? "bg-green-500" :
    pourcentage >= 60 ? "bg-yellow-500" :
    pourcentage >= 40 ? "bg-orange-500" : "bg-red-500";

  return (
    <div className="text-center space-y-6" data-testid="score-display">
      <div>
        <span className="text-6xl">{emoji}</span>
      </div>

      <div>
        <p className="text-5xl font-bold text-gray-800" data-testid="score-valeur">
          {score}<span className="text-3xl text-gray-400">/{total}</span>
        </p>
        <p className="text-lg text-gray-500 mt-1" data-testid="score-pourcentage">{pourcentage}%</p>
      </div>

      <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${couleurBarre} rounded-full transition-all duration-700`}
          style={{ width: `${pourcentage}%` }}
        />
      </div>

      <p className="text-gray-600 font-medium">{texte}</p>

      {modeRevision && questionsRatees.length === 0 && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-sm text-green-700 font-medium">
          Bravo ! Tu as réussi toutes les questions de révision.
        </div>
      )}

      <div className="flex flex-col gap-3">
        {onReviserErreurs && questionsRatees.length > 0 && (
          <button
            onClick={onReviserErreurs}
            data-testid="btn-reviser-erreurs"
            className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold transition-colors"
          >
            📝 Réviser mes erreurs ({questionsRatees.length})
          </button>
        )}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onRecommencer}
            data-testid="btn-recommencer"
            className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-colors"
          >
            🔄 Refaire le quiz
          </button>
          <Link
            href={`/${matiereSlug}`}
            data-testid="btn-retour-chapitres"
            className="flex-1 py-3 bg-white border-2 border-gray-200 hover:border-indigo-300 text-gray-700 hover:text-indigo-700 rounded-xl font-semibold transition-colors text-center"
          >
            ← Retour aux chapitres
          </Link>
        </div>
      </div>
    </div>
  );
}
