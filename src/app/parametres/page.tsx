// src/app/parametres/page.tsx
"use client";
import { useState, useEffect, useRef } from "react";
import Header from "@/components/navigation/Header";
import {
  getParametres,
  saveParametres,
  PARAMETRES_DEFAUT,
  type Parametres,
  type QuestionsParQuiz,
} from "@/lib/parametres";
import {
  ajouterObjectifNote,
  supprimerObjectifNote,
  getProgressionsObjectifsNote,
  type ProgressionObjectifNote,
} from "@/lib/objectifs-personnalises";
import { NIVEAUX } from "@/data/programmes";
import { supprimerCompte } from "@/lib/auth";
import { useRouter } from "next/navigation";

// Liste de toutes les matières uniques (sans doublons) de tous les niveaux
const TOUTES_MATIERES = Array.from(
  new Map(
    NIVEAUX.flatMap((n) => n.matieres).map((m) => [m.slug, m])
  ).values()
);

export default function ParametresPage() {
  const router = useRouter();
  const [params, setParams] = useState<Parametres>(PARAMETRES_DEFAUT);
  const [mounted, setMounted] = useState(false);
  const [notifStatut, setNotifStatut] = useState<"defaut" | "accordee" | "refusee" | "non-supporte">("defaut");
  const [confirmEtape, setConfirmEtape] = useState<0 | 1 | 2>(0);
  const [confirmSuppression, setConfirmSuppression] = useState<0 | 1 | 2>(0);
  const [suppressionEnCours, setSuppressionEnCours] = useState(false);
  const [erreurSuppression, setErreurSuppression] = useState<string | null>(null);
  const [sauvegarde, setSauvegarde] = useState(false);
  const timerSauvegarde = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function handleSupprimerCompte() {
    setSuppressionEnCours(true);
    setErreurSuppression(null);
    const { erreur } = await supprimerCompte();
    if (erreur) {
      setErreurSuppression(erreur);
      setSuppressionEnCours(false);
    } else {
      router.push("/");
    }
  }

  // Objectifs personnalisés
  const [progressionsObjectifs, setProgressionsObjectifs] = useState<ProgressionObjectifNote[]>([]);
  const [formMatiereSlug, setFormMatiereSlug] = useState(TOUTES_MATIERES[0]?.slug ?? "");
  const [formNote, setFormNote] = useState(15);

  function rafraichirObjectifs() {
    setProgressionsObjectifs(getProgressionsObjectifsNote());
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setParams(getParametres());
    rafraichirObjectifs();
    setMounted(true);
    if (!("Notification" in window)) {
      setNotifStatut("non-supporte");
    } else if (Notification.permission === "granted") {
      setNotifStatut("accordee");
    } else if (Notification.permission === "denied") {
      setNotifStatut("refusee");
    }
    return () => {
      if (timerSauvegarde.current) clearTimeout(timerSauvegarde.current);
    };
  }, []);

  const handleChange = <K extends keyof Parametres>(key: K, value: Parametres[K]) => {
    const updated = { ...params, [key]: value };
    setParams(updated);
    saveParametres(updated);
    setSauvegarde(true);
    if (timerSauvegarde.current) clearTimeout(timerSauvegarde.current);
    timerSauvegarde.current = setTimeout(() => setSauvegarde(false), 1500);
  };

  const demanderPermissionNotifs = async () => {
    if (!("Notification" in window)) return;
    try {
      const result = await Notification.requestPermission();
      if (result === "granted") {
        setNotifStatut("accordee");
        handleChange("notificationsActivees", true);
        if ("serviceWorker" in navigator) {
          const reg = await navigator.serviceWorker.ready;
          reg.active?.postMessage({ type: "NOTIFS_ACTIVEES" });
        }
      } else {
        setNotifStatut("refusee");
        handleChange("notificationsActivees", false);
      }
    } catch {
      setNotifStatut("refusee");
      handleChange("notificationsActivees", false);
    }
  };

  const reinitialiserProgression = () => {
    localStorage.removeItem("quiz-performances");
    localStorage.removeItem("quiz-history");
    setConfirmEtape(0);
  };

  if (!mounted) {
    return (
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--bg)" }}>
        <Header />
        <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 32, height: 32, border: "4px solid rgba(77,94,232,0.3)", borderTopColor: "var(--indigo)", borderRadius: "50%" }} className="animate-spin" />
        </main>
      </div>
    );
  }

  const sectionStyle = {
    background: "var(--card)",
    borderRadius: "var(--r-lg)",
    border: "1px solid var(--border)",
    padding: 20,
    display: "flex",
    flexDirection: "column" as const,
    gap: 16,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--bg)" }}>
      <Header />
      <main style={{ maxWidth: 720, margin: "0 auto", width: "100%", padding: "24px 16px 48px", display: "flex", flexDirection: "column", gap: 24 }}>

        {sauvegarde && (
          <div style={{ position: "fixed", top: 64, right: 16, zIndex: 50, background: "var(--teal)", color: "#fff", fontSize: 12, fontWeight: 600, padding: "6px 12px", borderRadius: "var(--r-sm)", boxShadow: "0 4px 16px rgba(0,0,0,0.3)" }}>
            ✓ Enregistré
          </div>
        )}

        {/* Objectif quotidien */}
        <section style={sectionStyle}>
          <h2 style={{ fontWeight: 700, color: "var(--text)" }}>🎯 Objectif quotidien</h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
              <input
                type="radio"
                name="objectifType"
                checked={params.objectifType === "minimum"}
                onChange={() => handleChange("objectifType", "minimum")}
                className="accent-indigo-600"
              />
              <span style={{ fontSize: 14, color: "var(--text2)" }}>1 quiz minimum par jour</span>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
              <input
                type="radio"
                name="objectifType"
                checked={params.objectifType === "personnalise"}
                onChange={() => handleChange("objectifType", "personnalise")}
                className="accent-indigo-600"
              />
              <span style={{ fontSize: 14, color: "var(--text2)" }}>Nombre personnalisé</span>
            </label>
          </div>

          {params.objectifType === "personnalise" && (
            <div style={{ display: "flex", alignItems: "center", gap: 12, paddingLeft: 24 }}>
              <span style={{ fontSize: 14, color: "var(--text2)" }}>Nombre de quiz :</span>
              <input
                type="number"
                min={1}
                max={10}
                value={params.objectifNombre}
                onChange={(e) => handleChange("objectifNombre", Math.min(10, Math.max(1, Number(e.target.value))))}
                style={{ width: 64, border: "1px solid var(--border2)", borderRadius: "var(--r-sm)", padding: "4px 8px", fontSize: 14, textAlign: "center", background: "var(--bg2)", color: "var(--text)", outline: "none" }}
              />
              <span style={{ fontSize: 14, color: "var(--text3)" }}>/ jour</span>
            </div>
          )}

          <p style={{ fontSize: 12, color: "var(--text3)", background: "rgba(255,255,255,0.04)", borderRadius: "var(--r-sm)", padding: "8px 12px" }}>
            Seuls les quiz réussis à {params.seuilReussite}% ou plus comptent pour l&apos;objectif.
          </p>
        </section>

        {/* Notifications */}
        <section style={sectionStyle}>
          <h2 style={{ fontWeight: 700, color: "var(--text)" }}>🔔 Notifications</h2>
          <p style={{ fontSize: 14, color: "var(--text3)" }}>
            Un rappel te sera envoyé à <strong style={{ color: "var(--text2)" }}>18h00</strong> si ton objectif du jour n&apos;est pas encore atteint.
          </p>

          {notifStatut === "non-supporte" && (
            <p style={{ fontSize: 12, color: "var(--amber)", background: "rgba(245,200,64,0.1)", borderRadius: "var(--r-sm)", padding: "8px 12px" }}>
              Les notifications ne sont pas supportées par ce navigateur.
            </p>
          )}

          {notifStatut === "refusee" && (
            <p style={{ fontSize: 12, color: "var(--coral-l)", background: "rgba(239,110,90,0.1)", borderRadius: "var(--r-sm)", padding: "8px 12px" }}>
              Notifications bloquées. Autorise-les dans les paramètres de ton navigateur.
            </p>
          )}

          {notifStatut === "accordee" && (
            <p style={{ fontSize: 12, color: "var(--teal)", background: "rgba(61,214,191,0.1)", borderRadius: "var(--r-sm)", padding: "8px 12px", fontWeight: 600 }}>
              ✓ Notifications activées
            </p>
          )}

          {notifStatut === "defaut" && (
            <button
              onClick={demanderPermissionNotifs}
              style={{ padding: "8px 16px", background: "var(--indigo)", color: "#fff", fontSize: 14, fontWeight: 600, borderRadius: "var(--r-md)", border: "none", cursor: "pointer", alignSelf: "flex-start" }}
            >
              Activer les notifications
            </button>
          )}
        </section>

        {/* Autres paramètres */}
        <section style={sectionStyle}>
          <h2 style={{ fontWeight: 700, color: "var(--text)" }}>⚙️ Préférences</h2>

          {/* Seuil de réussite */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 14, fontWeight: 500, color: "var(--text2)" }}>
              Seuil de réussite minimum
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <input
                type="range"
                min={50}
                max={100}
                step={5}
                value={params.seuilReussite}
                onChange={(e) => handleChange("seuilReussite", Number(e.target.value))}
                style={{ flex: 1 }}
                className="accent-indigo-600"
              />
              <span style={{ fontSize: 14, fontWeight: 700, color: "var(--indigo-l)", width: 40, textAlign: "right" }}>
                {params.seuilReussite}%
              </span>
            </div>
            <p style={{ fontSize: 12, color: "var(--text3)" }}>
              Un quiz est considéré réussi si ton score atteint ce seuil.
            </p>
          </div>

          {/* Nombre de questions par quiz */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 14, fontWeight: 500, color: "var(--text2)" }}>
              Nombre de questions par quiz
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              {([3, 5, 10] as QuestionsParQuiz[]).map((n) => (
                <button
                  key={n}
                  onClick={() => handleChange("questionsParQuiz", n)}
                  style={{
                    padding: "6px 16px",
                    borderRadius: "var(--r-pill)",
                    fontSize: 14,
                    fontWeight: 600,
                    border: "2px solid",
                    cursor: "pointer",
                    transition: "all 0.15s",
                    ...(params.questionsParQuiz === n
                      ? { background: "var(--indigo)", color: "#fff", borderColor: "var(--indigo)" }
                      : { background: "transparent", color: "var(--indigo-l)", borderColor: "rgba(77,94,232,0.4)" })
                  }}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Niveau par défaut */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 14, fontWeight: 500, color: "var(--text2)" }}>Niveau par défaut</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {(["seconde", "premiere", "terminale"] as const).map((n) => (
                <button
                  key={n}
                  onClick={() => handleChange("niveauDefaut", n)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "var(--r-pill)",
                    fontSize: 14,
                    fontWeight: 600,
                    border: "2px solid",
                    cursor: "pointer",
                    transition: "all 0.15s",
                    ...(params.niveauDefaut === n
                      ? { background: "var(--indigo)", color: "#fff", borderColor: "var(--indigo)" }
                      : { background: "transparent", color: "var(--indigo-l)", borderColor: "rgba(77,94,232,0.4)" })
                  }}
                >
                  {n === "premiere" ? "Première" : n.charAt(0).toUpperCase() + n.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Explications avancées ouvertes par défaut */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <p style={{ fontSize: 14, fontWeight: 500, color: "var(--text2)" }}>Explications avancées ouvertes</p>
              <p style={{ fontSize: 12, color: "var(--text3)" }}>Afficher les détails dépliés après correction</p>
            </div>
            <button
              role="switch"
              aria-checked={params.explicationsAvanceesOuvertes}
              onClick={() => handleChange("explicationsAvanceesOuvertes", !params.explicationsAvanceesOuvertes)}
              style={{
                position: "relative",
                display: "inline-flex",
                height: 24,
                width: 44,
                alignItems: "center",
                borderRadius: 999,
                border: "none",
                cursor: "pointer",
                transition: "background 0.2s",
                background: params.explicationsAvanceesOuvertes ? "var(--indigo)" : "rgba(255,255,255,0.15)",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  height: 16,
                  width: 16,
                  borderRadius: "50%",
                  background: "#fff",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
                  transition: "transform 0.2s",
                  transform: params.explicationsAvanceesOuvertes ? "translateX(24px)" : "translateX(4px)",
                }}
              />
            </button>
          </div>
        </section>

        {/* Objectifs personnalisés */}
        <section style={sectionStyle}>
          <h2 style={{ fontWeight: 700, color: "var(--text)" }}>🏆 Objectifs personnalisés</h2>
          <p style={{ fontSize: 13, color: "var(--text3)" }}>
            Définis une note cible à atteindre dans une matière. La progression est calculée sur tes 10 derniers quiz.
          </p>

          {/* Formulaire d'ajout */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1, minWidth: 140 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Matière</label>
              <select
                value={formMatiereSlug}
                onChange={(e) => setFormMatiereSlug(e.target.value)}
                style={{ padding: "7px 10px", borderRadius: "var(--r-sm)", border: "1px solid var(--border2)", background: "var(--bg2)", color: "var(--text)", fontSize: 13, cursor: "pointer" }}
              >
                {TOUTES_MATIERES.map((m) => (
                  <option key={m.slug} value={m.slug}>{m.emoji} {m.nom}</option>
                ))}
              </select>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Note cible /20</label>
              <input
                type="number"
                min={1}
                max={20}
                value={formNote}
                onChange={(e) => setFormNote(Math.min(20, Math.max(1, Number(e.target.value))))}
                style={{ width: 70, padding: "7px 10px", borderRadius: "var(--r-sm)", border: "1px solid var(--border2)", background: "var(--bg2)", color: "var(--text)", fontSize: 13, textAlign: "center" }}
              />
            </div>

            <button
              onClick={() => {
                const matiere = TOUTES_MATIERES.find((m) => m.slug === formMatiereSlug);
                if (!matiere) return;
                ajouterObjectifNote(formMatiereSlug, matiere.nom, formNote);
                rafraichirObjectifs();
              }}
              style={{ padding: "8px 16px", background: "var(--indigo)", color: "#fff", fontSize: 13, fontWeight: 600, borderRadius: "var(--r-md)", border: "none", cursor: "pointer", whiteSpace: "nowrap" }}
            >
              + Ajouter
            </button>
          </div>

          {/* Liste des objectifs */}
          {progressionsObjectifs.length === 0 ? (
            <p style={{ fontSize: 13, color: "var(--text3)", fontStyle: "italic" }}>Aucun objectif défini.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {progressionsObjectifs.map(({ objectif, noteMoyenne, atteint, nombreQuiz }: ProgressionObjectifNote) => {
                const pourcentage = noteMoyenne !== null ? Math.min(100, Math.round((noteMoyenne / objectif.noteVoulue) * 100)) : 0;
                const couleur = atteint ? "var(--teal)" : pourcentage >= 60 ? "var(--amber)" : "var(--coral-l)";
                const matiere = TOUTES_MATIERES.find((m) => m.slug === objectif.matiereSlug);
                return (
                  <div key={objectif.id} style={{ background: "rgba(255,255,255,0.03)", borderRadius: "var(--r-md)", border: "1px solid var(--border)", padding: "12px 14px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 18 }}>{matiere?.emoji ?? "📚"}</span>
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{objectif.matiereName}</p>
                          <p style={{ fontSize: 11, color: "var(--text3)" }}>Objectif : {objectif.noteVoulue}/20</p>
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 15, fontWeight: 800, color: couleur }}>
                          {noteMoyenne !== null ? `${noteMoyenne}/20` : "—"}
                        </span>
                        <button
                          onClick={() => { supprimerObjectifNote(objectif.id); rafraichirObjectifs(); }}
                          style={{ fontSize: 16, background: "none", border: "none", color: "var(--text3)", cursor: "pointer", padding: "2px 6px", borderRadius: "var(--r-sm)" }}
                          aria-label="Supprimer l'objectif"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                    <div style={{ height: 4, background: "rgba(255,255,255,0.07)", borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ height: "100%", borderRadius: 4, width: `${pourcentage}%`, background: atteint ? "var(--teal)" : `linear-gradient(90deg, var(--indigo) 0%, ${couleur} 100%)`, transition: "width .5s ease" }} />
                    </div>
                    <p style={{ fontSize: 11, color: "var(--text3)", marginTop: 6 }}>
                      {nombreQuiz === 0 ? "Aucun quiz effectué dans cette matière" : atteint ? "✓ Objectif atteint !" : `Basé sur ${Math.min(nombreQuiz, 10)} quiz`}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Danger Zone */}
        <section style={{ ...sectionStyle, border: "1px solid rgba(239,110,90,0.3)" }}>
          <h2 style={{ fontWeight: 700, color: "var(--coral-l)" }}>⚠️ Zone de danger</h2>
          <p style={{ fontSize: 14, color: "var(--text3)" }}>
            La réinitialisation supprime définitivement tous tes scores, ta progression et ton historique de quiz.
          </p>
          <button
            onClick={() => setConfirmEtape(1)}
            style={{ fontSize: 14, color: "var(--coral-l)", background: "none", border: "none", cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 2, padding: 0, alignSelf: "flex-start" }}
          >
            Réinitialiser toute la progression
          </button>
          <button
            onClick={() => setConfirmSuppression(1)}
            style={{ fontSize: 14, color: "#dc2626", background: "none", border: "none", cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 2, padding: 0, alignSelf: "flex-start", marginTop: 4 }}
          >
            Supprimer mon compte
          </button>
        </section>

      </main>

      {/* Modal suppression compte étape 1 */}
      {confirmSuppression === 1 && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: "0 16px" }}>
          <div style={{ background: "var(--bg2)", borderRadius: "var(--r-lg)", border: "1px solid var(--border)", boxShadow: "0 8px 32px rgba(0,0,0,0.5)", padding: 24, maxWidth: 360, width: "100%", display: "flex", flexDirection: "column", gap: 16 }}>
            <p style={{ fontSize: 32, textAlign: "center" }}>⚠️</p>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", textAlign: "center" }}>
              Supprimer ton compte ?
            </h2>
            <p style={{ fontSize: 14, color: "var(--text3)", textAlign: "center" }}>
              Toutes tes données (progression, badges, amis, défis) seront définitivement supprimées.
            </p>
            <div style={{ display: "flex", gap: 12, paddingTop: 4 }}>
              <button
                onClick={() => setConfirmSuppression(0)}
                style={{ flex: 1, padding: "10px 0", borderRadius: "var(--r-md)", border: "2px solid var(--border2)", fontSize: 14, fontWeight: 600, color: "var(--text2)", background: "transparent", cursor: "pointer" }}
              >
                Annuler
              </button>
              <button
                onClick={() => setConfirmSuppression(2)}
                style={{ flex: 1, padding: "10px 0", borderRadius: "var(--r-md)", background: "var(--coral)", border: "none", fontSize: 14, fontWeight: 600, color: "#fff", cursor: "pointer" }}
              >
                Oui, continuer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal suppression compte étape 2 */}
      {confirmSuppression === 2 && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: "0 16px" }}>
          <div style={{ background: "var(--bg2)", borderRadius: "var(--r-lg)", border: "1px solid var(--border)", boxShadow: "0 8px 32px rgba(0,0,0,0.5)", padding: 24, maxWidth: 360, width: "100%", display: "flex", flexDirection: "column", gap: 16 }}>
            <p style={{ fontSize: 32, textAlign: "center" }}>🗑️</p>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#dc2626", textAlign: "center" }}>
              Vraiment supprimer ton compte ?
            </h2>
            <p style={{ fontSize: 14, color: "var(--text3)", textAlign: "center" }}>
              Cette action est <span style={{ fontWeight: 600, color: "var(--text2)" }}>irréversible</span>. Ton compte sera définitivement effacé.
            </p>
            {erreurSuppression && (
              <p style={{ fontSize: 13, color: "#dc2626", textAlign: "center" }}>
                Une erreur est survenue. Réessaie dans quelques instants.
              </p>
            )}
            <div style={{ display: "flex", gap: 12, paddingTop: 4 }}>
              <button
                onClick={() => { setConfirmSuppression(0); setErreurSuppression(null); }}
                disabled={suppressionEnCours}
                style={{ flex: 1, padding: "10px 0", borderRadius: "var(--r-md)", border: "2px solid var(--border2)", fontSize: 14, fontWeight: 600, color: "var(--text2)", background: "transparent", cursor: suppressionEnCours ? "not-allowed" : "pointer", opacity: suppressionEnCours ? 0.5 : 1 }}
              >
                Annuler
              </button>
              <button
                onClick={handleSupprimerCompte}
                disabled={suppressionEnCours}
                style={{ flex: 1, padding: "10px 0", borderRadius: "var(--r-md)", background: "#dc2626", border: "none", fontSize: 14, fontWeight: 600, color: "#fff", cursor: suppressionEnCours ? "not-allowed" : "pointer", opacity: suppressionEnCours ? 0.7 : 1 }}
              >
                {suppressionEnCours ? "Suppression…" : "Supprimer définitivement"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal confirmation étape 1 */}
      {confirmEtape === 1 && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: "0 16px" }}>
          <div style={{ background: "var(--bg2)", borderRadius: "var(--r-lg)", border: "1px solid var(--border)", boxShadow: "0 8px 32px rgba(0,0,0,0.5)", padding: 24, maxWidth: 360, width: "100%", display: "flex", flexDirection: "column", gap: 16 }}>
            <p style={{ fontSize: 32, textAlign: "center" }}>⚠️</p>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", textAlign: "center" }}>
              Réinitialiser la progression ?
            </h2>
            <p style={{ fontSize: 14, color: "var(--text3)", textAlign: "center" }}>
              Tous tes scores, badges et l&apos;historique des quiz seront supprimés définitivement.
            </p>
            <div style={{ display: "flex", gap: 12, paddingTop: 4 }}>
              <button
                onClick={() => setConfirmEtape(0)}
                style={{ flex: 1, padding: "10px 0", borderRadius: "var(--r-md)", border: "2px solid var(--border2)", fontSize: 14, fontWeight: 600, color: "var(--text2)", background: "transparent", cursor: "pointer" }}
              >
                Annuler
              </button>
              <button
                onClick={() => setConfirmEtape(2)}
                style={{ flex: 1, padding: "10px 0", borderRadius: "var(--r-md)", background: "var(--coral)", border: "none", fontSize: 14, fontWeight: 600, color: "#fff", cursor: "pointer" }}
              >
                Oui, continuer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal confirmation étape 2 */}
      {confirmEtape === 2 && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: "0 16px" }}>
          <div style={{ background: "var(--bg2)", borderRadius: "var(--r-lg)", border: "1px solid var(--border)", boxShadow: "0 8px 32px rgba(0,0,0,0.5)", padding: 24, maxWidth: 360, width: "100%", display: "flex", flexDirection: "column", gap: 16 }}>
            <p style={{ fontSize: 32, textAlign: "center" }}>🗑️</p>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--coral-l)", textAlign: "center" }}>
              Êtes-vous vraiment sûr ?
            </h2>
            <p style={{ fontSize: 14, color: "var(--text3)", textAlign: "center" }}>
              Cette action est <span style={{ fontWeight: 600, color: "var(--text2)" }}>irréversible</span>.
            </p>
            <div style={{ display: "flex", gap: 12, paddingTop: 4 }}>
              <button
                onClick={() => setConfirmEtape(0)}
                style={{ flex: 1, padding: "10px 0", borderRadius: "var(--r-md)", border: "2px solid var(--border2)", fontSize: 14, fontWeight: 600, color: "var(--text2)", background: "transparent", cursor: "pointer" }}
              >
                Annuler
              </button>
              <button
                onClick={reinitialiserProgression}
                style={{ flex: 1, padding: "10px 0", borderRadius: "var(--r-md)", background: "#dc2626", border: "none", fontSize: 14, fontWeight: 600, color: "#fff", cursor: "pointer" }}
              >
                Tout effacer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
