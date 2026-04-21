"use client";
import { useState, useRef, useEffect } from "react";

const LANGUES = [
  { code: "en", bcp47: "en-GB", nom: "Anglais", emoji: "🇬🇧" },
  { code: "es", bcp47: "es-ES", nom: "Espagnol", emoji: "🇪🇸" },
  { code: "de", bcp47: "de-DE", nom: "Allemand", emoji: "🇩🇪" },
  { code: "it", bcp47: "it-IT", nom: "Italien", emoji: "🇮🇹" },
  { code: "pt", bcp47: "pt-PT", nom: "Portugais", emoji: "🇵🇹" },
];

const NIVEAUX = [
  { code: "debutant", label: "Débutant (A1/A2)" },
  { code: "intermediaire", label: "Intermédiaire (B1/B2)" },
  { code: "avance", label: "Avancé (B2/C1)" },
];

interface Message {
  role: "user" | "assistant";
  content: string;
}

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

export default function DialogueLangue() {
  const [langue, setLangue] = useState("en");
  const [niveau, setNiveau] = useState("intermediaire");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [enCours, setEnCours] = useState(false);
  const [reponseEnCours, setReponseEnCours] = useState("");
  const [modeLocal, setModeLocal] = useState(false);
  const [ecouteVocale, setEcouteVocale] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, reponseEnCours]);

  const langueInfo = LANGUES.find((l) => l.code === langue)!;

  const changerLangue = (code: string) => {
    setLangue(code);
    setMessages([]);
    setInput("");
    setModeLocal(false);
    if (ecouteVocale) arreterEcoute();
  };

  const demarrerEcoute = () => {
    const API = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!API) return;

    // Nouvelle instance à chaque écoute
    const rec = new API();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = langueInfo.bcp47;

    rec.onresult = (event: SpeechRecognitionEvent) => {
      const texte = event.results[0]?.[0]?.transcript ?? "";
      if (texte) setInput((prev) => prev + (prev ? " " : "") + texte);
    };
    rec.onerror = () => { recognitionRef.current = null; setEcouteVocale(false); };
    rec.onend = () => { recognitionRef.current = null; setEcouteVocale(false); };

    recognitionRef.current = rec;
    rec.start();
    setEcouteVocale(true);
  };

  const arreterEcoute = () => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setEcouteVocale(false);
  };

  const envoyerMessage = async () => {
    const texte = input.trim();
    if (!texte || enCours) return;

    const nouveauMessage: Message = { role: "user", content: texte };
    const nouveauxMessages = [...messages, nouveauMessage];
    setMessages(nouveauxMessages);
    setInput("");
    setEnCours(true);
    setReponseEnCours("");

    try {
      const res = await fetch("/api/langues/dialogue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nouveauxMessages, langue, niveau }),
      });

      if (!res.ok) {
        const txt = await res.text();
        setMessages((prev) => [...prev, { role: "assistant", content: txt || "Une erreur est survenue." }]);
        return;
      }

      if (res.headers.get("X-Mode") === "local") setModeLocal(true);

      if (res.body) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let reponse = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          reponse += decoder.decode(value, { stream: true });
          setReponseEnCours(reponse);
        }
        setMessages((prev) => [...prev, { role: "assistant", content: reponse }]);
        setReponseEnCours("");
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Impossible de contacter le serveur. Vérifiez votre connexion." },
      ]);
    } finally {
      setEnCours(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      envoyerMessage();
    }
  };

  const hasSpeechRecognition =
    typeof window !== "undefined" &&
    !!(window.SpeechRecognition ?? window.webkitSpeechRecognition);

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500 text-center">
        Conversez avec l&apos;IA dans la langue de votre choix — vos erreurs seront corrigées.
      </p>

      {/* Réglages */}
      <div className="flex flex-wrap gap-3 items-center justify-center">
        <div className="flex flex-wrap gap-1.5">
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
        <select
          value={niveau}
          onChange={(e) => setNiveau(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          {NIVEAUX.map((n) => (
            <option key={n.code} value={n.code}>{n.label}</option>
          ))}
        </select>
      </div>

      {/* Zone de conversation */}
      <div className="border border-gray-200 rounded-xl overflow-hidden flex flex-col" style={{ minHeight: "320px" }}>
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50" style={{ maxHeight: "360px" }}>
          {messages.length === 0 && !reponseEnCours && (
            <div className="text-center py-8 space-y-2">
              <p className="text-3xl">{langueInfo.emoji}</p>
              <p className="text-gray-600 text-sm font-medium">
                Commencez à écrire en {langueInfo.nom.toLowerCase()} !
              </p>
              <p className="text-gray-400 text-xs">
                L&apos;IA répondra en {langueInfo.nom.toLowerCase()} et corrigera vos erreurs.
              </p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-indigo-600 text-white rounded-br-sm"
                    : "bg-white text-gray-800 rounded-bl-sm border border-gray-200"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {reponseEnCours && (
            <div className="flex justify-start">
              <div className="max-w-[85%] rounded-2xl rounded-bl-sm px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap bg-white text-gray-800 border border-gray-200">
                {reponseEnCours}
                <span className="inline-block w-1 h-4 ml-0.5 bg-gray-400 animate-pulse align-middle" />
              </div>
            </div>
          )}

          {enCours && !reponseEnCours && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-3 py-2">
                <div className="flex gap-1 items-center h-5">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Note mode local */}
        {modeLocal && (
          <div className="px-3 py-1 bg-amber-50 border-t border-amber-100">
            <p className="text-[10px] text-amber-600 text-center">
              Mode hors ligne — configurez OPENAI_API_KEY pour un dialogue IA complet
            </p>
          </div>
        )}

        {/* Zone de saisie */}
        <div className="border-t border-gray-200 p-3 flex gap-2 items-end bg-white">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Écrivez en ${langueInfo.nom.toLowerCase()}…`}
            rows={1}
            disabled={enCours}
            className="flex-1 resize-none rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-50 max-h-24 overflow-y-auto"
            style={{ fieldSizing: "content" } as React.CSSProperties}
          />
          {hasSpeechRecognition && (
            <button
              onClick={ecouteVocale ? arreterEcoute : demarrerEcoute}
              disabled={enCours}
              className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                ecouteVocale
                  ? "bg-red-500 hover:bg-red-600 text-white"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-600"
              } disabled:opacity-40`}
              aria-label={ecouteVocale ? "Arrêter la saisie vocale" : "Dicter"}
            >
              🎤
            </button>
          )}
          <button
            onClick={envoyerMessage}
            disabled={!input.trim() || enCours}
            className="flex-shrink-0 w-9 h-9 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-200 text-white disabled:text-gray-400 transition-colors flex items-center justify-center"
            aria-label="Envoyer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
            </svg>
          </button>
        </div>
      </div>

      {messages.length > 0 && (
        <div className="flex justify-end">
          <button
            onClick={() => { setMessages([]); setModeLocal(false); }}
            className="text-xs text-gray-400 hover:text-red-500 underline transition-colors"
          >
            Effacer la conversation
          </button>
        </div>
      )}
    </div>
  );
}
