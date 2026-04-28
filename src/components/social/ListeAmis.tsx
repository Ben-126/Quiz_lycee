"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getMesAmis,
  getDemandesRecues,
  rechercherParPseudo,
  envoyerDemandeAmi,
  accepterDemandeAmi,
  refuserDemandeAmi,
} from "@/lib/social";
import type { Amitie, ProfilPublic } from "@/types";

interface ListeAmisProps {
  userId: string;
}

export default function ListeAmis({ userId }: ListeAmisProps) {
  const [amis, setAmis] = useState<Amitie[]>([]);
  const [demandes, setDemandes] = useState<Amitie[]>([]);
  const [recherche, setRecherche] = useState("");
  const [resultatsRecherche, setResultatsRecherche] = useState<ProfilPublic[]>([]);
  const [chargement, setChargement] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const charger = useCallback(async () => {
    setChargement(true);
    const [mesAmis, demandesRecues] = await Promise.all([
      getMesAmis(userId),
      getDemandesRecues(userId),
    ]);
    setAmis(mesAmis);
    setDemandes(demandesRecues);
    setChargement(false);
  }, [userId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    charger();
  }, [charger]);

  const handleRecherche = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recherche.trim()) return;
    const resultats = await rechercherParPseudo(recherche.trim());
    setResultatsRecherche(resultats.filter((p) => p.id !== userId));
  };

  const handleEnvoyerDemande = async (friendId: string) => {
    const erreur = await envoyerDemandeAmi(userId, friendId);
    if (erreur) {
      setMessage(`Erreur : ${erreur}`);
    } else {
      setMessage("Demande d'ami envoyée !");
      setResultatsRecherche([]);
      setRecherche("");
    }
    setTimeout(() => setMessage(null), 3000);
  };

  const handleAccepter = async (amitiéId: string) => {
    await accepterDemandeAmi(amitiéId);
    charger();
  };

  const handleRefuser = async (amitiéId: string) => {
    await refuserDemandeAmi(amitiéId);
    charger();
  };

  const lienInvitation = `${typeof window !== "undefined" ? window.location.origin : ""}/social?inviter=${userId}`;

  return (
    <div className="space-y-6">
      {/* Lien d'invitation */}
      <div className="rounded-xl p-4 space-y-2" style={{ background: "rgba(77,94,232,0.08)", border: "1px solid rgba(77,94,232,0.2)" }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: "var(--indigo-l)" }}>Inviter un ami</p>
        <p style={{ fontSize: 12, color: "var(--text2)" }}>Partage ce lien pour qu&apos;un ami te rejoigne :</p>
        <div className="flex gap-2">
          <input
            readOnly
            value={lienInvitation}
            className="flex-1 text-xs rounded-lg px-3 py-2"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--border2)", color: "var(--text2)", outline: "none" }}
          />
          <button
            onClick={() => navigator.clipboard.writeText(lienInvitation)}
            className="px-3 py-2 text-xs font-semibold rounded-lg transition-colors"
            style={{ background: "var(--indigo)", color: "#fff", border: "none", cursor: "pointer" }}
          >
            Copier
          </button>
        </div>
      </div>

      {/* Recherche par pseudo */}
      <form onSubmit={handleRecherche} className="flex gap-2">
        <input
          type="text"
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          placeholder="Rechercher un ami par pseudo..."
          className="flex-1 px-4 py-2 rounded-xl text-sm"
          style={{ background: "rgba(255,255,255,0.05)", color: "var(--text)", border: "1px solid var(--border2)", outline: "none" }}
        />
        <button
          type="submit"
          className="px-4 py-2 text-sm font-semibold rounded-xl transition-colors"
          style={{ background: "var(--indigo)", color: "#fff", border: "none", cursor: "pointer" }}
        >
          Chercher
        </button>
      </form>

      {message && (
        <p className="text-sm text-center font-medium" style={{ color: "var(--indigo-l)" }}>{message}</p>
      )}

      {resultatsRecherche.length > 0 && (
        <ul className="space-y-2">
          {resultatsRecherche.map((p) => (
            <li key={p.id} className="flex items-center justify-between px-4 py-3 rounded-xl" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
              <span style={{ fontSize: 14, fontWeight: 500, color: "var(--text)" }}>{p.pseudo}</span>
              <button
                onClick={() => handleEnvoyerDemande(p.id)}
                className="text-xs px-3 py-1.5 rounded-lg transition-colors"
                style={{ background: "var(--indigo)", color: "#fff", border: "none", cursor: "pointer" }}
              >
                + Ajouter
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Demandes reçues */}
      {demandes.length > 0 && (
        <div className="space-y-2">
          <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text2)" }}>Demandes reçues ({demandes.length})</h3>
          {demandes.map((d) => (
            <div key={d.id} className="flex items-center justify-between px-4 py-3 rounded-xl" style={{ background: "rgba(245,200,64,0.08)", border: "1px solid rgba(245,200,64,0.25)" }}>
              <span style={{ fontSize: 14, fontWeight: 500, color: "var(--text)" }}>{(d.profil as ProfilPublic | undefined)?.pseudo ?? "Utilisateur"}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleAccepter(d.id)}
                  className="text-xs px-3 py-1.5 rounded-lg transition-colors"
                  style={{ background: "rgba(61,214,191,0.15)", color: "var(--teal)", border: "1px solid rgba(61,214,191,0.3)", cursor: "pointer" }}
                >
                  Accepter
                </button>
                <button
                  onClick={() => handleRefuser(d.id)}
                  className="text-xs px-3 py-1.5 rounded-lg transition-colors"
                  style={{ background: "rgba(255,255,255,0.06)", color: "var(--text2)", border: "1px solid var(--border)", cursor: "pointer" }}
                >
                  Refuser
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Liste d'amis */}
      <div className="space-y-2">
        <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text2)" }}>
          Mes amis ({chargement ? "..." : amis.length})
        </h3>
        {!chargement && amis.length === 0 && (
          <p className="text-sm text-center py-4" style={{ color: "var(--text3)" }}>
            Tu n&apos;as pas encore d&apos;amis. Utilise la recherche ou partage ton lien !
          </p>
        )}
        {amis.map((a) => {
          const profil = a.profil as ProfilPublic | undefined;
          return (
            <div key={a.id} className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
              <span className="text-lg">👤</span>
              <div className="flex-1">
                <p style={{ fontSize: 14, fontWeight: 500, color: "var(--text)" }}>{profil?.pseudo ?? "Ami"}</p>
                <p style={{ fontSize: 12, color: "var(--text3)" }}>{profil?.xp_total ?? 0} XP · Niveau {profil?.niveau ?? 1}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
