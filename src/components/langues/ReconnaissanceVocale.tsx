"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import type { SpeechRecognitionInstance, SpeechRecognitionResultEvent, SpeechRecognitionErrorEvent } from "./speech-types";

const LANGUES = [
  { code: "en-GB", nom: "Anglais", emoji: "🇬🇧" },
  { code: "es-ES", nom: "Espagnol", emoji: "🇪🇸" },
  { code: "de-DE", nom: "Allemand", emoji: "🇩🇪" },
  { code: "it-IT", nom: "Italien", emoji: "🇮🇹" },
  { code: "pt-PT", nom: "Portugais", emoji: "🇵🇹" },
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

  const demarrer = async () => {
    setErreur(null);
    const API = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!API) {
      setErreur("Navigateur non compatible. Utilisez Chrome ou Edge.");
      return;
    }

    // Demande explicite de permission micro → déclenche la popup du navigateur
    let permStream: MediaStream | null = null;
    try {
      permStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setErreur("Microphone refusé. Cliquez sur l'icône 🔒 dans la barre d'adresse → Microphone → Autoriser, puis rechargez.");
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
      const msg = MESSAGES_ERREUR[event.error] ?? `Erreur : ${event.error}`;
      setErreur(msg);
      recognitionRef.current = null;
      setEnCours(false);
    };
    rec.onend = () => {
      recognitionRef.current = null;
      setEnCours(false);
      setTranscriptionVive("");
    };

    recognitionRef.current = rec;
    try {
      rec.start();
      setEnCours(true);
      // On libère le stream getUserMedia après le démarrage pour éviter le conflit de permission
      permStream.getTracks().forEach((t) => t.stop());
    } catch (e) {
      permStream.getTracks().forEach((t) => t.stop());
      setErreur(`Impossible de démarrer : ${e instanceof Error ? e.message : String(e)}`);
    }
  };

  const changerLangue = (code: string) => {
    if (enCours) arreter();
    setLangue(code);
    setTranscriptionFinale("");
    setTranscriptionVive("");
  };

  if (!supporte) {
    return (
      <div className="text-center py-10 text-gray-500 space-y-2">
        <p className="text-4xl">⚠️</p>
        <p className="font-medium">Navigateur non compatible</p>
        <p className="text-sm">La reconnaissance vocale nécessite Chrome ou Edge.</p>
      </div>
    );
  }

  const texteComplet = transcriptionFinale + (transcriptionVive ? " " + transcriptionVive : "");

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-500 text-center">
        Sélectionnez une langue et parlez — votre discours sera transcrit en temps réel.
      </p>

      {/* Sélecteur de langue */}
      <div className="flex flex-wrap gap-2 justify-center">
        {LANGUES.map((l) => (
          <button
            key={l.code}
            onClick={() => changerLangue(l.code)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium border-2 transition-colors ${
              langue === l.code
                ? "bg-indigo-600 text-white border-indigo-600"
                : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300"
            }`}
          >
            {l.emoji} {l.nom}
          </button>
        ))}
      </div>

      {/* Bouton micro */}
      <div className="flex flex-col items-center gap-3">
        <button
          onClick={enCours ? arreter : demarrer}
          className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl shadow-lg transition-all duration-200 ${
            enCours
              ? "bg-red-500 hover:bg-red-600 scale-110"
              : "bg-indigo-600 hover:bg-indigo-700"
          } text-white`}
          aria-label={enCours ? "Arrêter" : "Démarrer la reconnaissance vocale"}
        >
          {enCours ? "⏹" : "🎤"}
        </button>
        <p className="text-sm text-gray-500">
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
      <div className="bg-gray-50 rounded-xl p-4 min-h-[100px] border border-gray-200">
        {texteComplet ? (
          <p className="text-gray-800 leading-relaxed text-base">
            {transcriptionFinale}
            {transcriptionVive && (
              <span className="text-gray-400 italic"> {transcriptionVive}</span>
            )}
          </p>
        ) : (
          <p className="text-gray-400 text-sm italic text-center pt-6">
            La transcription apparaîtra ici…
          </p>
        )}
      </div>

      {/* Erreur */}
      {erreur && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700 text-center">
          {erreur}
        </div>
      )}

      {transcriptionFinale && (
        <div className="flex justify-end">
          <button
            onClick={() => { setTranscriptionFinale(""); setTranscriptionVive(""); }}
            className="text-sm text-gray-400 hover:text-red-500 underline transition-colors"
          >
            Effacer
          </button>
        </div>
      )}
    </div>
  );
}
