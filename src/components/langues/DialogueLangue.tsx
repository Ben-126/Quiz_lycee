"use client";
import { useState, useRef, useEffect } from "react";
import type { SpeechRecognitionInstance, SpeechRecognitionResultEvent, SpeechRecognitionErrorEvent } from "./speech-types";

const LANGUES = [
  { code: "en", bcp47: "en-GB", nom: "Anglais", emoji: "🔤" },
  { code: "es", bcp47: "es-ES", nom: "Espagnol", emoji: "🌺" },
  { code: "de", bcp47: "de-DE", nom: "Allemand", emoji: "📜" },
  { code: "it", bcp47: "it-IT", nom: "Italien", emoji: "🍕" },
  { code: "pt", bcp47: "pt-PT", nom: "Portugais", emoji: "🌊" },
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
    setReponseEnCours("");
    if (ecouteVocale) arreterEcoute();
  };

  const demarrerEcoute = () => {
    const API = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!API) return;

    const rec = new API();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = langueInfo.bcp47;

    rec.onresult = (event: SpeechRecognitionResultEvent) => {
      const texte = event.results[0]?.[0]?.transcript ?? "";
      if (texte) setInput((prev) => prev + (prev ? " " : "") + texte);
    };
    rec.onerror = (event: SpeechRecognitionErrorEvent) => {
      recognitionRef.current = null;
      setEcouteVocale(false);
      if (event.error === "not-allowed") {
        navigator.mediaDevices.getUserMedia({ audio: true })
          .then((stream) => { stream.getTracks().forEach((t) => t.stop()); })
          .catch(() => {});
      }
    };
    rec.onend = () => { recognitionRef.current = null; setEcouteVocale(false); };

    recognitionRef.current = rec;
    // Synchrone dans le handler du clic
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
      <p className="text-sm text-center" style={{ color: "var(--text3)" }}>
        Conversez avec l&apos;IA dans la langue de votre choix — vos erreurs seront corrigées.
      </p>

      {/* Réglages */}
      <div className="flex flex-wrap gap-3 items-center justify-center">
        <div className="flex flex-wrap gap-1.5">
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
        <select
          value={niveau}
          onChange={(e) => setNiveau(e.target.value)}
          className="text-sm px-2 py-1.5 focus:outline-none"
          style={{ background: "rgba(255,255,255,0.05)", color: "var(--text)", border: "1px solid var(--border2)", borderRadius: "var(--r-sm)" }}
        >
          {NIVEAUX.map((n) => (
            <option key={n.code} value={n.code}>{n.label}</option>
          ))}
        </select>
      </div>

      {/* Zone de conversation */}
      <div
        className="overflow-hidden flex flex-col"
        style={{ minHeight: "320px", border: "1px solid var(--border)", borderRadius: "var(--r-md)" }}
      >
        {/* Messages */}
        <div
          className="flex-1 overflow-y-auto p-4 space-y-3"
          style={{ maxHeight: "360px", background: "var(--bg2)" }}
        >
          {messages.length === 0 && !reponseEnCours && (
            <div className="text-center py-8 space-y-2">
              <p className="text-3xl">{langueInfo.emoji}</p>
              <p className="text-sm font-medium" style={{ color: "var(--text2)" }}>
                Commencez à écrire en {langueInfo.nom.toLowerCase()} !
              </p>
              <p className="text-xs" style={{ color: "var(--text3)" }}>
                L&apos;IA répondra en {langueInfo.nom.toLowerCase()} et corrigera vos erreurs.
              </p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className="max-w-[85%] px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap"
                style={
                  msg.role === "user"
                    ? { background: "var(--indigo)", color: "#fff", borderRadius: "16px 16px 4px 16px" }
                    : { background: "var(--card)", color: "var(--text)", border: "1px solid var(--border)", borderRadius: "16px 16px 16px 4px" }
                }
              >
                {msg.content}
              </div>
            </div>
          ))}

          {reponseEnCours && (
            <div className="flex justify-start">
              <div
                className="max-w-[85%] px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap"
                style={{ background: "var(--card)", color: "var(--text)", border: "1px solid var(--border)", borderRadius: "16px 16px 16px 4px" }}
              >
                {reponseEnCours}
                <span className="inline-block w-1 h-4 ml-0.5 animate-pulse align-middle" style={{ background: "var(--text3)" }} />
              </div>
            </div>
          )}

          {enCours && !reponseEnCours && (
            <div className="flex justify-start">
              <div
                className="px-3 py-2"
                style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "16px 16px 16px 4px" }}
              >
                <div className="flex gap-1 items-center h-5">
                  <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: "var(--text3)", animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: "var(--text3)", animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: "var(--text3)", animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Note mode local */}
        {modeLocal && (
          <div
            className="px-3 py-1"
            style={{ background: "rgba(245,200,64,0.1)", borderTop: "1px solid rgba(245,200,64,0.15)" }}
          >
            <p className="text-[10px] text-center" style={{ color: "var(--amber)" }}>
              Dialogue IA temporairement indisponible — réessayez dans quelques instants
            </p>
          </div>
        )}

        {/* Zone de saisie */}
        <div
          className="p-3 flex gap-2 items-end"
          style={{ borderTop: "1px solid var(--border)", background: "var(--card)" }}
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Écrivez en ${langueInfo.nom.toLowerCase()}…`}
            rows={1}
            disabled={enCours}
            className="flex-1 resize-none px-3 py-2 text-sm focus:outline-none disabled:opacity-50 max-h-24 overflow-y-auto"
            style={{ background: "rgba(255,255,255,0.05)", color: "var(--text)", border: "1px solid var(--border2)", borderRadius: "var(--r-sm)", fieldSizing: "content" } as React.CSSProperties}
          />
          {hasSpeechRecognition && (
            <button
              onClick={ecouteVocale ? arreterEcoute : demarrerEcoute}
              disabled={enCours}
              className="flex-shrink-0 w-9 h-9 flex items-center justify-center transition-colors disabled:opacity-40"
              style={
                ecouteVocale
                  ? { background: "rgba(239,110,90,0.9)", color: "#fff", borderRadius: "var(--r-sm)" }
                  : { background: "rgba(255,255,255,0.07)", color: "var(--text2)", borderRadius: "var(--r-sm)" }
              }
              aria-label={ecouteVocale ? "Arrêter la saisie vocale" : "Dicter"}
            >
              🎤
            </button>
          )}
          <button
            onClick={envoyerMessage}
            disabled={!input.trim() || enCours}
            className="flex-shrink-0 w-9 h-9 transition-colors flex items-center justify-center"
            style={{
              background: !input.trim() || enCours ? "rgba(255,255,255,0.07)" : "var(--indigo)",
              color: !input.trim() || enCours ? "var(--text3)" : "#fff",
              borderRadius: "var(--r-sm)",
            }}
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
            className="text-xs underline transition-colors"
            style={{ color: "var(--text3)" }}
          >
            Effacer la conversation
          </button>
        </div>
      )}
    </div>
  );
}
