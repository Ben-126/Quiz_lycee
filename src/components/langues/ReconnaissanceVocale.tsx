"use client";
import { useState, useEffect, useRef, useCallback } from "react";

const LANGUES = [
  { code: "en-GB", nom: "Anglais", emoji: "🇬🇧" },
  { code: "es-ES", nom: "Espagnol", emoji: "🇪🇸" },
  { code: "de-DE", nom: "Allemand", emoji: "🇩🇪" },
  { code: "it-IT", nom: "Italien", emoji: "🇮🇹" },
  { code: "pt-PT", nom: "Portugais", emoji: "🇵🇹" },
];

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
  }
}

export default function ReconnaissanceVocale() {
  const [langue, setLangue] = useState("en-GB");
  const [enCours, setEnCours] = useState(false);
  const [transcriptionFinale, setTranscriptionFinale] = useState("");
  const [transcriptionVive, setTranscriptionVive] = useState("");
  const [supporte, setSupporte] = useState(true);
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

  const demarrer = () => {
    const API = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!API) return;

    // Nouvelle instance à chaque démarrage
    const rec = new API();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = langue;

    rec.onresult = (event: SpeechRecognitionEvent) => {
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
    rec.onerror = () => { recognitionRef.current = null; setEnCours(false); };
    rec.onend = () => { recognitionRef.current = null; setEnCours(false); setTranscriptionVive(""); };

    recognitionRef.current = rec;
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
