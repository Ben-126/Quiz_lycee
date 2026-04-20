"use client";

import { useState, useEffect } from "react";
import {
  getCartesAReviser,
  enregistrerRevision,
  getStatsRevision,
  type CarteRevision,
  type QualiteRevision,
  type StatsRevision,
} from "@/lib/revision-espacee";

// ─── État de la session ────────────────────────────────────────────────────

type EtatRevision = "accueil" | "question" | "reponse" | "terminee";

// ─── Composant principal ───────────────────────────────────────────────────

export default function RevisionIntelligente() {
  const [stats, setStats] = useState<StatsRevision | null>(null);
  const [cartes, setCartes] = useState<CarteRevision[]>([]);
  const [index, setIndex] = useState(0);
  const [etat, setEtat] = useState<EtatRevision>("accueil");
  const [reponseVisible, setReponseVisible] = useState(false);

  useEffect(() => {
    setStats(getStatsRevision());
  }, []);

  function demarrer() {
    const cartesAReviser = getCartesAReviser();
    setCartes(cartesAReviser);
    setIndex(0);
    setReponseVisible(false);
    setEtat(cartesAReviser.length > 0 ? "question" : "terminee");
  }

  function evaluerCarte(qualite: QualiteRevision) {
    const carte = cartes[index];
    enregistrerRevision(carte.id, qualite);

    const suivant = index + 1;
    if (suivant >= cartes.length) {
      setStats(getStatsRevision());
      setEtat("terminee");
    } else {
      setIndex(suivant);
      setReponseVisible(false);
      setEtat("question");
    }
  }

  // ── Accueil ──────────────────────────────────────────────────────────────

  if (etat === "accueil") {
    return <Accueil stats={stats} onDemarrer={demarrer} />;
  }

  // ── Session terminée ─────────────────────────────────────────────────────

  if (etat === "terminee") {
    return <SessionTerminee stats={getStatsRevision()} totalRevise={cartes.length} onRecommencer={demarrer} />;
  }

  // ── Question ─────────────────────────────────────────────────────────────

  const carte = cartes[index];
  const progression = `${index + 1} / ${cartes.length}`;

  return (
    <div className="max-w-xl mx-auto px-4 py-8 space-y-6">
      {/* Barre de progression */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>🧠 Révision intelligente</span>
        <span>{progression}</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2">
        <div
          className="bg-indigo-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${((index) / cartes.length) * 100}%` }}
        />
      </div>

      {/* Contexte */}
      <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
        {carte.matiereName} · {carte.chapitreNom}
      </p>

      {/* Carte question */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-4">
        <p className="text-base font-semibold text-gray-800 leading-relaxed">
          {carte.question}
        </p>

        {/* Options QCM (affichées dès le début) */}
        {carte.type === "qcm" && carte.options && !reponseVisible && (
          <ul className="space-y-2 mt-2">
            {carte.options.map((opt, i) => (
              <li key={i} className="text-sm text-gray-700 bg-gray-50 rounded-lg px-4 py-2">
                {opt}
              </li>
            ))}
          </ul>
        )}

        {/* Vrai/Faux hint */}
        {carte.type === "vrai_faux" && !reponseVisible && (
          <p className="text-sm text-gray-400 italic">Vrai ou Faux ?</p>
        )}

        {/* Réponse et explication (après révélation) */}
        {reponseVisible && (
          <div className="border-t border-gray-100 pt-4 space-y-3">
            <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3">
              <p className="text-xs font-semibold text-green-700 mb-1">Bonne réponse</p>
              <p className="text-sm text-green-900 font-medium">
                {typeof carte.reponseCorrecte === "boolean"
                  ? carte.reponseCorrecte ? "Vrai ✓" : "Faux ✗"
                  : carte.reponseCorrecte}
              </p>
            </div>
            <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
              <p className="text-xs font-semibold text-blue-700 mb-1">Explication</p>
              <p className="text-sm text-blue-900">{carte.explication}</p>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      {!reponseVisible ? (
        <button
          onClick={() => setReponseVisible(true)}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-colors"
        >
          Voir la réponse
        </button>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-center text-gray-500 font-medium">
            Comment ça s'est passé ?
          </p>
          <div className="grid grid-cols-2 gap-3">
            <BoutonQualite
              qualite="rate"
              label="Raté"
              emoji="😣"
              couleur="bg-red-100 hover:bg-red-200 text-red-800"
              onClick={evaluerCarte}
            />
            <BoutonQualite
              qualite="difficile"
              label="Difficile"
              emoji="😓"
              couleur="bg-orange-100 hover:bg-orange-200 text-orange-800"
              onClick={evaluerCarte}
            />
            <BoutonQualite
              qualite="bien"
              label="Bien"
              emoji="🙂"
              couleur="bg-blue-100 hover:bg-blue-200 text-blue-800"
              onClick={evaluerCarte}
            />
            <BoutonQualite
              qualite="facile"
              label="Facile"
              emoji="😄"
              couleur="bg-green-100 hover:bg-green-200 text-green-800"
              onClick={evaluerCarte}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Sous-composants ───────────────────────────────────────────────────────

interface BoutonQualiteProps {
  qualite: QualiteRevision;
  label: string;
  emoji: string;
  couleur: string;
  onClick: (q: QualiteRevision) => void;
}

function BoutonQualite({ qualite, label, emoji, couleur, onClick }: BoutonQualiteProps) {
  return (
    <button
      onClick={() => onClick(qualite)}
      className={`flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-colors ${couleur}`}
    >
      <span>{emoji}</span>
      <span>{label}</span>
    </button>
  );
}

interface AccueilProps {
  stats: StatsRevision | null;
  onDemarrer: () => void;
}

function Accueil({ stats, onDemarrer }: AccueilProps) {
  const aucuneCarte = !stats || stats.totalCartes === 0;
  const aJour = stats && stats.cartesAujourdhui === 0 && stats.totalCartes > 0;

  return (
    <div className="max-w-xl mx-auto px-4 py-8 space-y-6">
      <div className="text-center space-y-2">
        <div className="text-4xl">🧠</div>
        <h1 className="text-2xl font-bold text-gray-900">Révision intelligente</h1>
        <p className="text-gray-500 text-sm">
          Répétition espacée · Les questions difficiles reviennent plus souvent
        </p>
      </div>

      {/* Statistiques */}
      {stats && (
        <div className="grid grid-cols-3 gap-3">
          <StatCard valeur={stats.totalCartes} label="Cartes" emoji="🃏" />
          <StatCard valeur={stats.cartesAujourdhui} label="À réviser" emoji="📅" accent />
          <StatCard valeur={stats.cartesApprises} label="Maîtrisées" emoji="✅" />
        </div>
      )}

      {/* Message contextuel */}
      {aucuneCarte && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
          <p className="font-semibold mb-1">Aucune carte pour l'instant</p>
          <p>
            Fais des quiz d'entraînement — les questions ratées seront automatiquement
            ajoutées ici pour révision espacée.
          </p>
        </div>
      )}

      {aJour && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-800">
          <p className="font-semibold mb-1">🎉 Tu es à jour !</p>
          {stats.prochaineSession && (
            <p>Prochaine révision prévue le {formatDate(stats.prochaineSession)}.</p>
          )}
        </div>
      )}

      <button
        onClick={onDemarrer}
        disabled={aucuneCarte || (aJour ?? false)}
        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors"
      >
        {stats && stats.cartesAujourdhui > 0
          ? `Commencer (${stats.cartesAujourdhui} carte${stats.cartesAujourdhui > 1 ? "s" : ""})`
          : "Commencer"}
      </button>
    </div>
  );
}

interface SessionTermineeProps {
  stats: StatsRevision;
  totalRevise: number;
  onRecommencer: () => void;
}

function SessionTerminee({ stats, totalRevise, onRecommencer }: SessionTermineeProps) {
  return (
    <div className="max-w-xl mx-auto px-4 py-8 space-y-6 text-center">
      <div className="text-5xl">🎉</div>
      <h2 className="text-2xl font-bold text-gray-900">Session terminée !</h2>
      <p className="text-gray-500">
        Tu as révisé {totalRevise} carte{totalRevise > 1 ? "s" : ""} aujourd'hui.
      </p>

      <div className="grid grid-cols-3 gap-3">
        <StatCard valeur={stats.totalCartes} label="Cartes" emoji="🃏" />
        <StatCard valeur={stats.cartesAujourdhui} label="Restantes" emoji="📅" />
        <StatCard valeur={stats.cartesApprises} label="Maîtrisées" emoji="✅" />
      </div>

      {stats.prochaineSession && (
        <p className="text-sm text-gray-500">
          Prochaine session le <strong>{formatDate(stats.prochaineSession)}</strong>
        </p>
      )}

      {stats.cartesAujourdhui > 0 ? (
        <button
          onClick={onRecommencer}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-colors"
        >
          Continuer ({stats.cartesAujourdhui} restante{stats.cartesAujourdhui > 1 ? "s" : ""})
        </button>
      ) : (
        <p className="text-sm text-green-700 font-medium">
          ✅ Toutes les cartes du jour sont révisées !
        </p>
      )}
    </div>
  );
}

interface StatCardProps {
  valeur: number;
  label: string;
  emoji: string;
  accent?: boolean;
}

function StatCard({ valeur, label, emoji, accent }: StatCardProps) {
  return (
    <div className={`rounded-xl p-3 text-center border ${accent ? "bg-indigo-50 border-indigo-200" : "bg-gray-50 border-gray-200"}`}>
      <div className="text-lg">{emoji}</div>
      <div className={`text-xl font-bold ${accent ? "text-indigo-700" : "text-gray-800"}`}>{valeur}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
}

function formatDate(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: year !== new Date().getFullYear() ? "numeric" : undefined,
  }).format(new Date(year, month - 1, day));
}
