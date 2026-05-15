"use client";

import { useState } from "react";
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
  const [stats, setStats] = useState<StatsRevision | null>(
    () => (typeof window !== "undefined" ? getStatsRevision() : null)
  );
  const [cartes, setCartes] = useState<CarteRevision[]>([]);
  const [index, setIndex] = useState(0);
  const [etat, setEtat] = useState<EtatRevision>("accueil");
  const [reponseVisible, setReponseVisible] = useState(false);

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
      <div className="flex items-center justify-between text-sm" style={{ color: "var(--text3)" }}>
        <span>🧠 Révision intelligente</span>
        <span>{progression}</span>
      </div>
      <div className="w-full rounded-full h-2" style={{ background: "rgba(255,255,255,0.08)" }}>
        <div
          className="h-2 rounded-full transition-all duration-300"
          style={{ width: `${((index) / cartes.length) * 100}%`, background: "var(--indigo)" }}
        />
      </div>

      {/* Contexte */}
      <p style={{ fontSize: 12, color: "var(--text3)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em" }}>
        {carte.matiereName} · {carte.chapitreNom}
      </p>

      {/* Carte question */}
      <div className="rounded-2xl p-6 space-y-4" style={{ background: "var(--card)", border: "1px solid var(--border)", boxShadow: "0 4px 16px rgba(0,0,0,0.3)" }}>
        <p style={{ fontSize: 16, fontWeight: 600, color: "var(--text)", lineHeight: 1.6 }}>
          {carte.question}
        </p>

        {/* Options QCM (affichées dès le début) */}
        {carte.type === "qcm" && carte.options && !reponseVisible && (
          <ul className="space-y-2 mt-2">
            {carte.options.map((opt, i) => (
              <li key={i} className="text-sm rounded-lg px-4 py-2" style={{ color: "var(--text2)", background: "rgba(255,255,255,0.04)" }}>
                {opt}
              </li>
            ))}
          </ul>
        )}

        {/* Vrai/Faux hint */}
        {carte.type === "vrai_faux" && !reponseVisible && (
          <p style={{ fontSize: 14, color: "var(--text3)", fontStyle: "italic" }}>Vrai ou Faux ?</p>
        )}

        {/* Réponse et explication (après révélation) */}
        {reponseVisible && (
          <div key="reponse" className="answer-reveal space-y-3" style={{ borderTop: "1px solid var(--border)", paddingTop: 16 }}>
            <div className="rounded-xl px-4 py-3" style={{ background: "rgba(61,214,191,0.08)", border: "1px solid rgba(61,214,191,0.25)" }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: "var(--teal)", marginBottom: 4 }}>Bonne réponse</p>
              <p style={{ fontSize: 14, color: "var(--teal)", fontWeight: 500 }}>
                {typeof carte.reponseCorrecte === "boolean"
                  ? carte.reponseCorrecte ? "Vrai ✓" : "Faux ✗"
                  : carte.reponseCorrecte}
              </p>
            </div>
            <div className="rounded-xl px-4 py-3" style={{ background: "rgba(77,94,232,0.08)", border: "1px solid rgba(77,94,232,0.15)" }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: "var(--indigo-l)", marginBottom: 4 }}>Explication</p>
              <p style={{ fontSize: 14, color: "var(--text2)" }}>{carte.explication}</p>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      {!reponseVisible ? (
        <button
          onClick={() => setReponseVisible(true)}
          className="w-full font-semibold py-3 rounded-xl transition-colors"
          style={{ background: "var(--indigo)", color: "#fff", border: "none", cursor: "pointer" }}
        >
          Voir la réponse
        </button>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-center font-medium" style={{ color: "var(--text3)" }}>
            Comment ça s&apos;est passé ?
          </p>
          <div className="grid grid-cols-2 gap-3">
            <BoutonQualite
              qualite="rate"
              label="Raté"
              emoji="😣"
              bgColor="rgba(239,110,90,0.12)"
              hoverBg="rgba(239,110,90,0.2)"
              textColor="var(--coral-l)"
              onClick={evaluerCarte}
            />
            <BoutonQualite
              qualite="difficile"
              label="Difficile"
              emoji="😓"
              bgColor="rgba(245,200,64,0.1)"
              hoverBg="rgba(245,200,64,0.18)"
              textColor="var(--amber)"
              onClick={evaluerCarte}
            />
            <BoutonQualite
              qualite="bien"
              label="Bien"
              emoji="🙂"
              bgColor="rgba(77,94,232,0.1)"
              hoverBg="rgba(77,94,232,0.18)"
              textColor="var(--indigo-l)"
              onClick={evaluerCarte}
            />
            <BoutonQualite
              qualite="facile"
              label="Facile"
              emoji="😄"
              bgColor="rgba(61,214,191,0.1)"
              hoverBg="rgba(61,214,191,0.18)"
              textColor="var(--teal)"
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
  bgColor: string;
  hoverBg: string;
  textColor: string;
  onClick: (q: QualiteRevision) => void;
}

function BoutonQualite({ qualite, label, emoji, bgColor, textColor, onClick }: BoutonQualiteProps) {
  return (
    <button
      onClick={() => onClick(qualite)}
      className="flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-colors"
      style={{ background: bgColor, color: textColor, border: "none", cursor: "pointer" }}
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
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--text)" }}>Révision intelligente</h1>
        <p style={{ color: "var(--text3)", fontSize: 14 }}>
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
        <div className="rounded-xl p-4 text-sm" style={{ background: "rgba(245,200,64,0.08)", border: "1px solid rgba(245,200,64,0.25)", color: "var(--amber)" }}>
          <p style={{ fontWeight: 600, marginBottom: 4 }}>Aucune carte pour l&apos;instant</p>
          <p style={{ color: "var(--text2)" }}>
            Fais des quiz d&apos;entraînement — les questions ratées seront automatiquement
            ajoutées ici pour révision espacée.
          </p>
        </div>
      )}

      {aJour && (
        <div className="rounded-xl p-4 text-sm" style={{ background: "rgba(61,214,191,0.08)", border: "1px solid rgba(61,214,191,0.25)", color: "var(--teal)" }}>
          <p style={{ fontWeight: 600, marginBottom: 4 }}>🎉 Tu es à jour !</p>
          {stats.prochaineSession && (
            <p style={{ color: "var(--text2)" }}>Prochaine révision prévue le {formatDate(stats.prochaineSession)}.</p>
          )}
        </div>
      )}

      <button
        onClick={onDemarrer}
        disabled={aucuneCarte || (aJour ?? false)}
        className="w-full font-semibold py-3 rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ background: "var(--indigo)", color: "#fff", border: "none", cursor: "pointer" }}
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
      <h2 style={{ fontSize: 24, fontWeight: 700, color: "var(--text)" }}>Session terminée !</h2>
      <p style={{ color: "var(--text2)" }}>
        Tu as révisé {totalRevise} carte{totalRevise > 1 ? "s" : ""} aujourd&apos;hui.
      </p>

      <div className="grid grid-cols-3 gap-3">
        <StatCard valeur={stats.totalCartes} label="Cartes" emoji="🃏" />
        <StatCard valeur={stats.cartesAujourdhui} label="Restantes" emoji="📅" />
        <StatCard valeur={stats.cartesApprises} label="Maîtrisées" emoji="✅" />
      </div>

      {stats.prochaineSession && (
        <p style={{ fontSize: 14, color: "var(--text3)" }}>
          Prochaine session le <strong style={{ color: "var(--text2)" }}>{formatDate(stats.prochaineSession)}</strong>
        </p>
      )}

      {stats.cartesAujourdhui > 0 ? (
        <button
          onClick={onRecommencer}
          className="w-full font-semibold py-3 rounded-xl transition-colors"
          style={{ background: "var(--indigo)", color: "#fff", border: "none", cursor: "pointer" }}
        >
          Continuer ({stats.cartesAujourdhui} restante{stats.cartesAujourdhui > 1 ? "s" : ""})
        </button>
      ) : (
        <p style={{ fontSize: 14, color: "var(--teal)", fontWeight: 500 }}>
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
    <div className="rounded-xl p-3 text-center" style={accent
      ? { background: "rgba(77,94,232,0.1)", border: "1px solid rgba(77,94,232,0.2)" }
      : { background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)" }}>
      <div className="text-lg">{emoji}</div>
      <div style={{ fontSize: 20, fontWeight: 700, color: accent ? "var(--indigo-l)" : "var(--text)" }}>{valeur}</div>
      <div style={{ fontSize: 12, color: "var(--text3)" }}>{label}</div>
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
