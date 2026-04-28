"use client";
import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export interface CoachIAProps {
  matiere?: string;
  chapitre?: string;
  niveauLycee?: string;
  questionCourante?: string;
  // Données de la question après correction (débloquées pour le coach)
  explication?: string;
  etapes?: string[];
  methode?: string;
  erreursFrequentes?: string[];
}

export default function CoachIA({
  matiere,
  chapitre,
  niveauLycee,
  questionCourante,
  explication,
  etapes,
  methode,
  erreursFrequentes,
}: CoachIAProps) {
  const [ouvert, setOuvert] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [enCours, setEnCours] = useState(false);
  const [reponseEnCours, setReponseEnCours] = useState("");
  const [modeLocal, setModeLocal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, reponseEnCours]);

  useEffect(() => {
    if (ouvert) inputRef.current?.focus();
  }, [ouvert]);

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
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nouveauxMessages,
          context: {
            matiere,
            chapitre,
            niveauLycee,
            questionCourante,
            explication,
            etapes,
            methode,
            erreursFrequentes,
          },
        }),
      });

      if (!res.ok) {
        const erreur = await res.text();
        setMessages((prev) => [...prev, { role: "assistant", content: erreur || "Une erreur est survenue." }]);
        return;
      }

      const estLocal = res.headers.get("X-Coach-Mode") === "local";
      if (estLocal) setModeLocal(true);

      if (res.body) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let reponse = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          reponse += chunk;
          setReponseEnCours(reponse);
        }

        setMessages((prev) => [...prev, { role: "assistant", content: reponse }]);
        setReponseEnCours("");
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Impossible de contacter le coach. Vérifie ta connexion." },
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

  const contextueRiche = !!(explication || etapes?.length || erreursFrequentes?.length);

  return (
    <>
      {/* Panneau de chat */}
      {ouvert && (
        <div
          className="fixed bottom-20 right-4 z-50 w-80 sm:w-96 flex flex-col overflow-hidden"
          style={{ maxHeight: "70vh", background: "var(--card)", borderRadius: "var(--r-lg)", border: "1px solid var(--border)", boxShadow: "0 4px 16px rgba(0,0,0,0.3)" }}
        >
          {/* En-tête */}
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ background: "var(--indigo)", color: "#fff" }}
          >
            <div className="flex items-center gap-2">
              <span className="text-lg" aria-hidden="true">🧠</span>
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="font-semibold text-sm leading-tight">Coach IA</p>
                  {modeLocal && (
                    <span
                      className="text-[10px] px-1.5 py-0.5 font-medium leading-none"
                      style={{ background: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.8)", borderRadius: "var(--r-pill)" }}
                    >
                      local
                    </span>
                  )}
                </div>
                {chapitre && (
                  <p className="text-xs truncate max-w-[180px]" style={{ color: "rgba(255,255,255,0.7)" }}>{chapitre}</p>
                )}
              </div>
            </div>
            <button
              onClick={() => setOuvert(false)}
              className="p-1 transition-colors"
              style={{ color: "rgba(255,255,255,0.7)", borderRadius: 4 }}
              aria-label="Fermer le coach"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
            {messages.length === 0 && !reponseEnCours && (
              <div className="text-center py-6 space-y-2">
                <p className="text-3xl">👋</p>
                <p className="text-sm font-medium" style={{ color: "var(--text2)" }}>Bonjour ! Je suis ton coach.</p>
                <p className="text-xs" style={{ color: "var(--text3)" }}>
                  Pose-moi une question sur le cours, demande une explication ou de l&apos;aide sur un exercice.
                </p>
                {questionCourante && (
                  <button
                    onClick={() => setInput(`Explique-moi cette question : "${questionCourante}"`)}
                    className="mt-2 text-xs underline"
                    style={{ color: "var(--indigo-l)" }}
                  >
                    Aide-moi avec la question actuelle
                  </button>
                )}
                {contextueRiche && (
                  <div className="flex flex-wrap gap-1 justify-center mt-2">
                    {explication && (
                      <button
                        onClick={() => setInput("Explique-moi ce point du cours")}
                        className="text-xs underline"
                        style={{ color: "var(--indigo-l)" }}
                      >
                        Voir l&apos;explication
                      </button>
                    )}
                    {etapes && etapes.length > 0 && (
                      <button
                        onClick={() => setInput("Comment résoudre ce type de question ?")}
                        className="text-xs underline"
                        style={{ color: "var(--indigo-l)" }}
                      >
                        Voir les étapes
                      </button>
                    )}
                    {erreursFrequentes && erreursFrequentes.length > 0 && (
                      <button
                        onClick={() => setInput("Quelles sont les erreurs à éviter ?")}
                        className="text-xs underline"
                        style={{ color: "var(--indigo-l)" }}
                      >
                        Erreurs fréquentes
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className="max-w-[85%] px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap"
                  style={
                    msg.role === "user"
                      ? { background: "var(--indigo)", color: "#fff", borderRadius: "16px 16px 4px 16px" }
                      : { background: "rgba(255,255,255,0.06)", color: "var(--text)", borderRadius: "16px 16px 16px 4px" }
                  }
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {/* Réponse en cours (streaming) */}
            {reponseEnCours && (
              <div className="flex justify-start">
                <div
                  className="max-w-[85%] px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap"
                  style={{ background: "rgba(255,255,255,0.06)", color: "var(--text)", borderRadius: "16px 16px 16px 4px" }}
                >
                  {reponseEnCours}
                  <span className="inline-block w-1 h-4 ml-0.5 animate-pulse align-middle" style={{ background: "var(--text3)" }} />
                </div>
              </div>
            )}

            {/* Indicateur chargement */}
            {enCours && !reponseEnCours && (
              <div className="flex justify-start">
                <div
                  className="px-3 py-2"
                  style={{ background: "rgba(255,255,255,0.06)", borderRadius: "16px 16px 16px 4px" }}
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
            <div className="px-3 pb-1">
              <p className="text-[10px] text-center" style={{ color: "var(--text3)" }}>
                Mode local · <a href="#" className="underline" onClick={(e) => e.preventDefault()}>Configurer une clé API</a> pour un coach IA complet
              </p>
            </div>
          )}

          {/* Zone de saisie */}
          <div
            className="p-3 flex gap-2 items-end"
            style={{ borderTop: "1px solid var(--border)" }}
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Pose ta question..."
              rows={1}
              disabled={enCours}
              className="flex-1 resize-none px-3 py-2 text-sm focus:outline-none disabled:opacity-50 max-h-24 overflow-y-auto"
              style={{ background: "rgba(255,255,255,0.05)", color: "var(--text)", border: "1px solid var(--border2)", borderRadius: "var(--r-sm)", fieldSizing: "content" } as React.CSSProperties}
            />
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
      )}

      {/* Bouton flottant */}
      <button
        onClick={() => setOuvert((v) => !v)}
        className="fixed bottom-4 right-4 z-50 w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 text-white"
        style={{
          background: ouvert ? "rgba(255,255,255,0.15)" : "var(--indigo)",
          boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
        }}
        aria-label={ouvert ? "Fermer le coach IA" : "Ouvrir le coach IA"}
        title="Coach IA"
      >
        {ouvert ? (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
            <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
          </svg>
        ) : (
          <span className="text-2xl leading-none" aria-hidden="true">🧠</span>
        )}
      </button>
    </>
  );
}
