"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { inscrire, connecter, connexionGoogle } from "@/lib/auth";

interface AuthModalProps {
  onFermer: () => void;
  onConnecte: () => void;
}

type Onglet = "connexion" | "inscription";

export default function AuthModal({ onFermer, onConnecte }: AuthModalProps) {
  const router = useRouter();
  const [onglet, setOnglet] = useState<Onglet>("connexion");
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [pseudo, setPseudo] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [chargement, setChargement] = useState(false);
  const [chargementGoogle, setChargementGoogle] = useState(false);
  const [voirMotDePasse, setVoirMotDePasse] = useState(false);
  const [ageMoinsQuinze, setAgeMoinsQuinze] = useState<boolean | null>(null);
  const [emailParent, setEmailParent] = useState("");

  const handleGoogle = async () => {
    setChargementGoogle(true);
    const { erreur } = await connexionGoogle();
    if (erreur) {
      setErreur(erreur);
      setChargementGoogle(false);
    }
    // Pas de setChargementGoogle(false) en cas de succès — la page redirige
  };

  const handleSoumettre = async (e: React.FormEvent) => {
    e.preventDefault();
    setErreur(null);
    setChargement(true);

    if (onglet === "connexion") {
      const { erreur: err } = await connecter(email, motDePasse);
      if (err) {
        setErreur(err);
      } else {
        onConnecte();
        onFermer();
        router.push("/app");
      }
    } else {
      if (pseudo.trim().length < 3) {
        setErreur("Le pseudo doit faire au moins 3 caractères.");
        setChargement(false);
        return;
      }
      if (ageMoinsQuinze === null) {
        setErreur("Indique si tu as 15 ans ou plus.");
        setChargement(false);
        return;
      }
      if (ageMoinsQuinze && !emailParent.trim()) {
        setErreur("L'email de ton parent ou tuteur légal est obligatoire si tu as moins de 15 ans.");
        setChargement(false);
        return;
      }
      const parentEmailValide = ageMoinsQuinze ? emailParent.trim() : undefined;
      const { erreur: err } = await inscrire(email, motDePasse, pseudo.trim(), parentEmailValide);
      if (err) {
        setErreur(err);
      } else {
        onConnecte();
        onFermer();
        router.push("/app");
      }
    }

    setChargement(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onFermer(); }}
    >
      <div
        className="w-full max-w-md p-6 space-y-6 overflow-y-auto max-h-[90vh]"
        style={{ background: "var(--card)", borderRadius: "var(--r-lg)", border: "1px solid var(--border)", boxShadow: "0 4px 16px rgba(0,0,0,0.3)" }}
      >
        {/* Onglets */}
        <div className="flex" style={{ borderBottom: "1px solid var(--border)" }}>
          {(["connexion", "inscription"] as Onglet[]).map((o) => (
            <button
              key={o}
              onClick={() => { setOnglet(o); setErreur(null); }}
              className="flex-1 py-2 text-sm font-semibold capitalize transition-colors"
              style={
                onglet === o
                  ? { borderBottom: "2px solid var(--indigo)", color: "var(--indigo-l)", marginBottom: -1 }
                  : { color: "var(--text3)" }
              }
            >
              {o === "connexion" ? "Connexion" : "Créer un compte"}
            </button>
          ))}
        </div>

        {/* Bouton Google */}
        <button
          type="button"
          onClick={handleGoogle}
          disabled={chargementGoogle}
          className="w-full py-3 font-semibold rounded-xl flex items-center justify-center gap-3 transition-colors"
          style={{ background: "rgba(255,255,255,0.07)", color: "var(--text)", border: "1px solid var(--border2)", opacity: chargementGoogle ? 0.7 : 1, cursor: chargementGoogle ? "not-allowed" : "pointer" }}
        >
          {!chargementGoogle && (
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
          )}
          {chargementGoogle ? "Redirection..." : "Continuer avec Google"}
        </button>

        <div className="flex items-center gap-3">
          <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
          <span style={{ fontSize: 12, color: "var(--text3)" }}>ou</span>
          <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
        </div>

        <form onSubmit={handleSoumettre} className="space-y-4">
          {onglet === "inscription" && (
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--text2)" }}>
                Pseudo (visible publiquement)
              </label>
              <input
                type="text"
                value={pseudo}
                onChange={(e) => setPseudo(e.target.value)}
                placeholder="ex: SuperEleve42"
                required
                minLength={3}
                maxLength={20}
                className="w-full px-4 py-2 rounded-xl focus:outline-none"
                style={{ background: "rgba(255,255,255,0.05)", color: "var(--text)", border: "1px solid var(--border2)" }}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--text2)" }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-xl focus:outline-none"
              style={{ background: "rgba(255,255,255,0.05)", color: "var(--text)", border: "1px solid var(--border2)" }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--text2)" }}>Mot de passe</label>
            <div className="relative">
              <input
                type={voirMotDePasse ? "text" : "password"}
                value={motDePasse}
                onChange={(e) => setMotDePasse(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-2 pr-11 rounded-xl focus:outline-none"
                style={{ background: "rgba(255,255,255,0.05)", color: "var(--text)", border: "1px solid var(--border2)" }}
              />
              <button
                type="button"
                onClick={() => setVoirMotDePasse((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                style={{ color: "var(--text3)" }}
                aria-label={voirMotDePasse ? "Masquer le mot de passe" : "Voir le mot de passe"}
              >
                {voirMotDePasse ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {onglet === "inscription" && (
            <div className="space-y-3">
              <p className="text-xs font-medium" style={{ color: "var(--text2)" }}>Ton âge (obligatoire)</p>
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="age"
                    checked={ageMoinsQuinze === false}
                    onChange={() => { setAgeMoinsQuinze(false); setEmailParent(""); }}
                    className="h-4 w-4 accent-indigo-500"
                  />
                  <span className="text-xs" style={{ color: "var(--text3)" }}>
                    J&apos;ai <strong>15 ans ou plus</strong>
                  </span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="age"
                    checked={ageMoinsQuinze === true}
                    onChange={() => setAgeMoinsQuinze(true)}
                    className="h-4 w-4 accent-indigo-500"
                  />
                  <span className="text-xs" style={{ color: "var(--text3)" }}>
                    J&apos;ai <strong>moins de 15 ans</strong>
                  </span>
                </label>
              </div>

              {ageMoinsQuinze === true && (
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: "var(--text2)" }}>
                    Email du parent ou tuteur légal <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={emailParent}
                    onChange={(e) => setEmailParent(e.target.value)}
                    placeholder="email@parent.fr"
                    required
                    className="w-full px-4 py-2 rounded-xl focus:outline-none text-sm"
                    style={{ background: "rgba(255,255,255,0.05)", color: "var(--text)", border: "1px solid var(--border2)" }}
                  />
                  <p className="text-xs mt-1" style={{ color: "var(--text3)" }}>
                    Requis par le RGPD (art. 8). L&apos;accord d&apos;un adulte est nécessaire pour les moins de 15 ans.
                  </p>
                </div>
              )}

              <p className="text-xs" style={{ color: "var(--text3)", lineHeight: 1.5 }}>
                En créant un compte, j&apos;accepte les{" "}
                <a href="/cgu" target="_blank" rel="noopener noreferrer" style={{ color: "var(--indigo-l)" }}>CGU</a>
                {" "}et la{" "}
                <a href="/confidentialite" target="_blank" rel="noopener noreferrer" style={{ color: "var(--indigo-l)" }}>politique de confidentialité</a>.
              </p>
            </div>
          )}

          {erreur && (
            <p
              className="text-sm px-3 py-2 rounded-lg"
              style={{ color: "var(--coral-l)", background: "rgba(239,110,90,0.1)" }}
            >
              {erreur}
            </p>
          )}

          <button
            type="submit"
            disabled={chargement}
            className="w-full py-3 font-semibold rounded-xl transition-colors"
            style={{ background: chargement ? "rgba(77,94,232,0.4)" : "var(--indigo)", color: "#fff" }}
          >
            {chargement ? "Chargement..." : onglet === "connexion" ? "Se connecter" : "Créer le compte"}
          </button>
        </form>
      </div>
    </div>
  );
}
