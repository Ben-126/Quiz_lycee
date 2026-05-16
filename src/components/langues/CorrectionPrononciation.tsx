"use client";
import { useState, useRef, useEffect } from "react";

const AUDIO_GROQ_CONSENT_KEY = "audio-groq-consent";

const LANGUES = [
  { code: "en", bcp47: "en-GB", nom: "Anglais", emoji: "🔤" },
  { code: "es", bcp47: "es-ES", nom: "Espagnol", emoji: "🌺" },
  { code: "de", bcp47: "de-DE", nom: "Allemand", emoji: "📜" },
  { code: "it", bcp47: "it-IT", nom: "Italien", emoji: "🍕" },
  { code: "pt", bcp47: "pt-PT", nom: "Portugais", emoji: "🌊" },
];

const PHRASES: Record<string, string[]> = {
  en: [
    "The weather is beautiful today.",
    "I would like to order a coffee, please.",
    "Could you repeat that more slowly?",
    "My name is… and I am a student.",
    "Where is the nearest train station?",
  ],
  es: [
    "Buenos días, ¿cómo estás hoy?",
    "Me gustaría pedir un café, por favor.",
    "¿Puede repetir eso más despacio?",
    "Me llamo… y soy estudiante.",
    "¿Dónde está la estación de tren más cercana?",
  ],
  de: [
    "Das Wetter ist heute wunderschön.",
    "Ich möchte bitte einen Kaffee bestellen.",
    "Könnten Sie das langsamer wiederholen?",
    "Mein Name ist… und ich bin Schüler.",
    "Wo ist der nächste Bahnhof?",
  ],
  it: [
    "Il tempo è bellissimo oggi.",
    "Vorrei ordinare un caffè, per favore.",
    "Potrebbe ripetere più lentamente?",
    "Mi chiamo… e sono studente.",
    "Dov'è la stazione ferroviaria più vicina?",
  ],
  pt: [
    "O tempo está lindo hoje.",
    "Eu gostaria de pedir um café, por favor.",
    "Pode repetir isso mais devagar?",
    "Meu nome é… e sou estudante.",
    "Onde fica a estação de trem mais próxima?",
  ],
};

interface MotResultat {
  mot: string;
  correct: boolean;
  transcrit: string;
}

interface ResultatAnalyse {
  transcrit: string;
  similitude: number;
  mots: MotResultat[];
  feedback: string;
  modeLocal?: boolean;
}

export default function CorrectionPrononciation() {
  const [langue, setLangue] = useState("en");
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [enregistrement, setEnregistrement] = useState(false);
  const [analyse, setAnalyse] = useState(false);
  const [resultat, setResultat] = useState<ResultatAnalyse | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [consentementAudio, setConsentementAudio] = useState<"accepted" | "refused" | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(AUDIO_GROQ_CONSENT_KEY);
    if (stored === "accepted" || stored === "refused") {
      setConsentementAudio(stored);
    }
    // null = jamais donné → panneau de consentement affiché
  }, []);

  const accepterConsentementAudio = () => {
    localStorage.setItem(AUDIO_GROQ_CONSENT_KEY, "accepted");
    setConsentementAudio("accepted");
  };

  const refuserConsentementAudio = () => {
    localStorage.setItem(AUDIO_GROQ_CONSENT_KEY, "refused");
    setConsentementAudio("refused");
  };

  const phrase = PHRASES[langue][phraseIndex];

  const changerLangue = (code: string) => {
    setLangue(code);
    setPhraseIndex(0);
    setResultat(null);
    setErreur(null);
    if (enregistrement) arreterEnregistrement();
  };

  const phraseAleatoire = () => {
    const phrases = PHRASES[langue];
    const newIndex = (phraseIndex + 1) % phrases.length;
    setPhraseIndex(newIndex);
    setResultat(null);
    setErreur(null);
  };

  const demarrerEnregistrement = async () => {
    setResultat(null);
    setErreur(null);
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = () => { stream.getTracks().forEach((t) => t.stop()); envoyerAudio(); };
      mr.start();
      mediaRecorderRef.current = mr;
      setEnregistrement(true);
    } catch {
      setErreur("Microphone refusé. Cliquez sur l'icône 🔒 dans la barre d'adresse → Microphone → Autoriser, puis rechargez.");
    }
  };

  const arreterEnregistrement = () => {
    mediaRecorderRef.current?.stop();
    setEnregistrement(false);
  };

  const envoyerAudio = async () => {
    setAnalyse(true);
    try {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      const fd = new FormData();
      fd.append("audio", blob);
      fd.append("texte", phrase);
      fd.append("langue", langue);

      const res = await fetch("/api/langues/prononcer", { method: "POST", body: fd });
      const data = await res.json() as ResultatAnalyse & { error?: string };

      if (!res.ok || data.error) {
        setErreur(data.error ?? "Erreur lors de l'analyse.");
        return;
      }
      setResultat(data);
    } catch {
      setErreur("Impossible de contacter le serveur. Vérifiez votre connexion.");
    } finally {
      setAnalyse(false);
    }
  };

  const scoreStyle = (similitude: number): React.CSSProperties => {
    if (similitude >= 0.9) return { color: "var(--teal)" };
    if (similitude >= 0.65) return { color: "var(--amber)" };
    return { color: "var(--coral-l)" };
  };

  const scoreLabel = (similitude: number) => {
    if (similitude >= 0.9) return "Excellent";
    if (similitude >= 0.75) return "Bien";
    if (similitude >= 0.5) return "À améliorer";
    return "Difficile";
  };

  // Panneau de consentement audio (RGPD — consentement spécifique requis pour envoi audio à Groq USA)
  if (consentementAudio === null) {
    return (
      <div
        className="p-5 space-y-4 rounded-xl"
        style={{ background: "rgba(77,94,232,0.06)", border: "1px solid rgba(77,94,232,0.25)" }}
      >
        <p className="font-semibold text-sm" style={{ color: "var(--text)" }}>
          Analyse de prononciation — information RGPD
        </p>
        <p className="text-sm" style={{ color: "var(--text2)", lineHeight: 1.6 }}>
          Cette fonctionnalité enregistre ta voix et transmet l&apos;audio à{" "}
          <strong>Groq Inc. (États-Unis)</strong> via le modèle Whisper pour analyse de prononciation.
        </p>
        <ul className="text-xs space-y-1" style={{ color: "var(--text3)" }}>
          <li>• L&apos;audio est traité <strong>immédiatement</strong> et n&apos;est pas conservé par Groq</li>
          <li>• Groq ne l&apos;utilise pas pour entraîner ses modèles</li>
          <li>• Le transfert est encadré par des Clauses Contractuelles Types (CCT, art. 46 RGPD)</li>
          <li>• Tu peux retirer ce consentement à tout moment depuis les paramètres</li>
        </ul>
        <div className="flex gap-3 pt-1">
          <button
            onClick={refuserConsentementAudio}
            className="flex-1 py-2 text-sm font-semibold rounded-lg"
            style={{ background: "rgba(255,255,255,0.07)", color: "var(--text2)", border: "1px solid var(--border2)" }}
          >
            Non merci
          </button>
          <button
            onClick={accepterConsentementAudio}
            className="flex-1 py-2 text-sm font-semibold rounded-lg"
            style={{ background: "var(--indigo)", color: "#fff" }}
          >
            Accepter et continuer
          </button>
        </div>
      </div>
    );
  }

  // Consentement refusé — afficher alternative sans audio
  if (consentementAudio === "refused") {
    return (
      <div
        className="p-5 space-y-3 rounded-xl text-center"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)" }}
      >
        <p className="text-sm" style={{ color: "var(--text3)" }}>
          L&apos;analyse de prononciation est désactivée (envoi audio vers Groq refusé).
        </p>
        <button
          onClick={() => {
            localStorage.removeItem(AUDIO_GROQ_CONSENT_KEY);
            setConsentementAudio(null);
          }}
          className="text-xs underline"
          style={{ color: "var(--indigo-l)" }}
        >
          Modifier mon choix
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-center" style={{ color: "var(--text3)" }}>
        Lisez la phrase à voix haute — l&apos;IA analysera votre prononciation.
      </p>

      {/* Sélecteur de langue */}
      <div className="flex flex-wrap gap-2 justify-center">
        {LANGUES.map((l) => (
          <button
            key={l.code}
            onClick={() => changerLangue(l.code)}
            className="px-3 py-1.5 text-sm font-medium transition-colors"
            style={
              langue === l.code
                ? { background: "var(--indigo)", color: "#fff", borderRadius: "var(--r-pill)", border: "2px solid var(--indigo)" }
                : { background: "transparent", color: "var(--text2)", borderRadius: "var(--r-pill)", border: "2px solid var(--border2)" }
            }
          >
            {l.emoji} {l.nom}
          </button>
        ))}
      </div>

      {/* Phrase à prononcer */}
      <div
        className="p-5 text-center space-y-3"
        style={{ background: "rgba(77,94,232,0.08)", border: "1px solid rgba(77,94,232,0.2)", borderRadius: "var(--r-md)" }}
      >
        <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--indigo-l)" }}>
          Phrase à prononcer
        </p>
        <p className="text-xl font-semibold" style={{ color: "var(--text)" }}>&ldquo;{phrase}&rdquo;</p>
        <button
          onClick={phraseAleatoire}
          className="text-xs underline transition-colors"
          style={{ color: "var(--indigo-l)" }}
        >
          Autre phrase →
        </button>
      </div>

      {/* Bouton enregistrement */}
      <div className="flex flex-col items-center gap-3">
        {!analyse ? (
          <>
            <button
              onClick={enregistrement ? arreterEnregistrement : demarrerEnregistrement}
              className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl transition-all duration-200 ${enregistrement ? "scale-110" : ""}`}
              style={{
                background: enregistrement ? "rgba(239,110,90,0.9)" : "var(--indigo)",
                color: "#fff",
                boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
              }}
              aria-label={enregistrement ? "Arrêter l'enregistrement" : "Commencer l'enregistrement"}
            >
              {enregistrement ? "⏹" : "🎤"}
            </button>
            <p className="text-sm" style={{ color: "var(--text3)" }}>
              {enregistrement ? (
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse inline-block" />
                  Enregistrement en cours…
                </span>
              ) : (
                "Cliquez pour enregistrer"
              )}
            </p>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div
              className="w-10 h-10 rounded-full animate-spin"
              style={{ border: "4px solid rgba(77,94,232,0.2)", borderTopColor: "var(--indigo)" }}
            />
            <p className="text-sm" style={{ color: "var(--text3)" }}>Analyse en cours…</p>
          </div>
        )}
      </div>

      {/* Erreur */}
      {erreur && (
        <div
          className="p-4 text-sm rounded-xl"
          style={{ background: "rgba(239,110,90,0.1)", border: "1px solid rgba(239,110,90,0.2)", color: "var(--coral-l)" }}
        >
          {erreur}
        </div>
      )}

      {/* Résultat */}
      {resultat && (
        <div className="space-y-4">
          {/* Score */}
          <div
            className="flex items-center justify-between p-4 rounded-xl"
            style={{ background: "var(--card)", border: "1px solid var(--border)" }}
          >
            <div>
              <p className="text-xs font-medium" style={{ color: "var(--text3)" }}>Score de prononciation</p>
              <p className="text-2xl font-bold" style={scoreStyle(resultat.similitude)}>
                {Math.round(resultat.similitude * 100)}%
                <span className="text-base font-medium ml-1">
                  — {scoreLabel(resultat.similitude)}
                </span>
              </p>
            </div>
            {resultat.similitude >= 0.9 && <span className="text-3xl">🏆</span>}
            {resultat.similitude >= 0.75 && resultat.similitude < 0.9 && <span className="text-3xl">👍</span>}
            {resultat.similitude < 0.75 && <span className="text-3xl">💪</span>}
          </div>

          {/* Mots mot-à-mot */}
          {resultat.mots.length > 0 && (
            <div
              className="p-4 space-y-2 rounded-xl"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)" }}
            >
              <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text3)" }}>
                Analyse mot par mot
              </p>
              <div className="flex flex-wrap gap-2">
                {resultat.mots.map((m, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 rounded-lg text-sm font-medium"
                    style={
                      m.correct
                        ? { background: "rgba(61,214,191,0.1)", color: "var(--teal)" }
                        : { background: "rgba(239,110,90,0.1)", color: "var(--coral-l)" }
                    }
                    title={!m.correct && m.transcrit ? `Compris : "${m.transcrit}"` : undefined}
                  >
                    {m.mot}
                    {!m.correct && <span className="text-xs ml-0.5 opacity-70">✗</span>}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Ce qui a été compris */}
          {resultat.transcrit && (
            <div
              className="p-4 space-y-1 rounded-xl"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)" }}
            >
              <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text3)" }}>
                Ce qui a été compris
              </p>
              <p className="italic" style={{ color: "var(--text2)" }}>&ldquo;{resultat.transcrit}&rdquo;</p>
            </div>
          )}

          {/* Feedback */}
          <div
            className="p-4 space-y-1 rounded-xl"
            style={{ background: "rgba(77,94,232,0.08)", border: "1px solid rgba(77,94,232,0.2)" }}
          >
            <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--indigo-l)" }}>
              Feedback du coach
            </p>
            <p className="text-sm leading-relaxed" style={{ color: "var(--text2)" }}>{resultat.feedback}</p>
          </div>

          {resultat.modeLocal && (
            <p className="text-xs text-center" style={{ color: "var(--text3)" }}>
              Analyse indisponible — réessayez dans quelques instants
            </p>
          )}
        </div>
      )}
    </div>
  );
}
