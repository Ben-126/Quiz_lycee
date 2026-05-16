"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import type { SpeechRecognitionInstance, SpeechRecognitionResultEvent, SpeechRecognitionErrorEvent } from "./speech-types";

const LANGUES = [
  { code: "en-GB", nom: "Anglais", emoji: "🔤" },
  { code: "es-ES", nom: "Espagnol", emoji: "🌺" },
  { code: "de-DE", nom: "Allemand", emoji: "📜" },
  { code: "it-IT", nom: "Italien", emoji: "🍕" },
  { code: "pt-PT", nom: "Portugais", emoji: "🌊" },
];

export default function ReconnaissanceVocale() {
  const [langue, setLangue] = useState("en-GB");
  const [enCours, setEnCours] = useState(false);
  const [transcriptionFinale, setTranscriptionFinale] = useState("");
  const [transcriptionVive, setTranscriptionVive] = useState("");
  const [supporte, setSupporte] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  useEffect(() => {
    const supported = !!(window.SpeechRecognition ?? window.webkitSpeechRecognition);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!supported) setSupporte(false);
  }, []);

  const arreter = useCallback(() => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setEnCours(false);
  }, []);

  const MESSAGES_ERREUR: Record<string, string> = {
    "not-allowed": "Microphone refusé. Autorisez l'accès dans les paramètres du navigateur.",
    "no-speech": "Aucune voix détectée. Parlez plus fort ou vérifiez votre micro.",
    "audio-capture": "Aucun microphone détecté.",
    "network": "Erreur réseau. La reconnaissance vocale nécessite une connexion internet.",
    "aborted": "Reconnaissance annulée.",
  };

  const demarrer = () => {
    setErreur(null);
    const API = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!API) {
      setErreur("Navigateur non compatible. Utilisez Chrome ou Edge.");
      return;
    }

    const rec = new API();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = langue;

    rec.onresult = (event: SpeechRecognitionResultEvent) => {
      setErreur(null);
      let interim = "";
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript;
        if (event.results[i].isFinal) final += text;
        else interim += text;
      }
      if (final) setTranscriptionFinale((prev) => prev + (prev ? " " : "") + final.trim());
      setTranscriptionVive(interim);
    };

    rec.onerror = (event: SpeechRecognitionErrorEvent) => {
      recognitionRef.current = null;
      setEnCours(false);
      if (event.error !== "aborted") {
        setErreur(MESSAGES_ERREUR[event.error] ?? `Erreur : ${event.error}`);
      }
    };

    rec.onend = () => {
      recognitionRef.current = null;
      setEnCours(false);
      setTranscriptionVive("");
    };

    recognitionRef.current = rec;
    // Appel synchrone dans le handler du clic — conserve le contexte "user gesture"
    rec.start();
    setEnCours(true);
  };

  const changerLangue = (code: string) => {
    if (enCours) arreter();
    setLangue(code);
    setTranscriptionFinale("");
    setTranscriptionVive("");
  };

  if (!supporte) {
    return (
      <div className="text-center py-10 space-y-2" style={{ color: "var(--text3)" }}>
        <p className="text-4xl">⚠️</p>
        <p className="font-medium" style={{ color: "var(--text2)" }}>Navigateur non compatible</p>
        <p className="text-sm">La reconnaissance vocale nécessite Chrome ou Edge.</p>
      </div>
    );
  }

  const texteComplet = transcriptionFinale + (transcriptionVive ? " " + transcriptionVive : "");

  return (
    <div className="space-y-6">
      <p className="text-sm text-center" style={{ color: "var(--text3)" }}>
        Sélectionnez une langue et parlez — votre discours sera transcrit en temps réel.
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

      {/* Bouton micro */}
      <div className="flex flex-col items-center gap-3">
        <button
          onClick={enCours ? arreter : demarrer}
          className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl transition-all duration-200 ${enCours ? "scale-110" : ""}`}
          style={{
            background: enCours ? "rgba(239,110,90,0.9)" : "var(--indigo)",
            color: "#fff",
            boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
          }}
          aria-label={enCours ? "Arrêter" : "Démarrer la reconnaissance vocale"}
        >
          {enCours ? "⏹" : "🎤"}
        </button>
        <p className="text-sm" style={{ color: "var(--text3)" }}>
          {enCours ? (
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse inline-block" />
              Parlez maintenant…
            </span>
          ) : (
            "Cliquez pour commencer"
          )}
        </p>
      </div>

      {/* Zone transcription */}
      <div
        className="p-4 min-h-[100px]"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", borderRadius: "var(--r-md)" }}
      >
        {texteComplet ? (
          <p className="leading-relaxed text-base" style={{ color: "var(--text)" }}>
            {transcriptionFinale}
            {transcriptionVive && (
              <span className="italic" style={{ color: "var(--text3)" }}> {transcriptionVive}</span>
            )}
          </p>
        ) : (
          <p className="text-sm italic text-center pt-6" style={{ color: "var(--text3)" }}>
            La transcription apparaîtra ici…
          </p>
        )}
      </div>

      {/* Erreur */}
      {erreur && (
        <div
          className="p-3 text-sm text-center rounded-xl"
          style={{ background: "rgba(239,110,90,0.1)", border: "1px solid rgba(239,110,90,0.2)", color: "var(--coral-l)" }}
        >
          {erreur}
        </div>
      )}

      {transcriptionFinale && (
        <div className="flex justify-end">
          <button
            onClick={() => { setTranscriptionFinale(""); setTranscriptionVive(""); }}
            className="text-sm underline transition-colors"
            style={{ color: "var(--text3)" }}
          >
            Effacer
          </button>
        </div>
      )}
    </div>
  );
}
