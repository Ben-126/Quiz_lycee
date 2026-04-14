"use client";
import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface CoachIAProps {
  matiere?: string;
  chapitre?: string;
  niveauLycee?: string;
  questionCourante?: string;
}

export default function CoachIA({ matiere, chapitre, niveauLycee, questionCourante }: CoachIAProps) {
  const [ouvert, setOuvert] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [enCours, setEnCours] = useState(false);
  const [reponseEnCours, setReponseEnCours] = useState("");
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
          context: { matiere, chapitre, niveauLycee, questionCourante },
        }),
      });

      if (!res.ok || !res.body) {
        const erreur = await res.text();
        setMessages((prev) => [...prev, { role: "assistant", content: erreur || "Une erreur est survenue." }]);
        return;
      }

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

  return (
    <>
      {/* Panneau de chat */}
      {ouvert && (
        <div className="fixed bottom-20 right-4 z-50 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
          style={{ maxHeight: "70vh" }}>
          {/* En-tête */}
          <div className="flex items-center justify-between px-4 py-3 bg-indigo-600 text-white">
            <div className="flex items-center gap-2">
              <span className="text-lg" aria-hidden="true">🧠</span>
              <div>
                <p className="font-semibold text-sm leading-tight">Coach IA</p>
                {chapitre && (
                  <p className="text-indigo-200 text-xs truncate max-w-[180px]">{chapitre}</p>
                )}
              </div>
            </div>
            <button
              onClick={() => setOuvert(false)}
              className="text-indigo-200 hover:text-white transition-colors p-1 rounded"
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
                <p className="text-gray-600 text-sm font-medium">Bonjour ! Je suis ton coach.</p>
                <p className="text-gray-400 text-xs">
                  Pose-moi une question sur le cours, demande une explication ou de l&apos;aide sur un exercice.
                </p>
                {questionCourante && (
                  <button
                    onClick={() => setInput(`Explique-moi cette question : "${questionCourante}"`)}
                    className="mt-2 text-xs text-indigo-600 hover:text-indigo-700 underline"
                  >
                    Aide-moi avec la question actuelle
                  </button>
                )}
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "bg-indigo-600 text-white rounded-br-sm"
                      : "bg-gray-100 text-gray-800 rounded-bl-sm"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {/* Réponse en cours (streaming) */}
            {reponseEnCours && (
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-2xl rounded-bl-sm px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap bg-gray-100 text-gray-800">
                  {reponseEnCours}
                  <span className="inline-block w-1 h-4 ml-0.5 bg-gray-400 animate-pulse align-middle" />
                </div>
              </div>
            )}

            {/* Indicateur de chargement sans streaming visible */}
            {enCours && !reponseEnCours && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-3 py-2">
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

          {/* Zone de saisie */}
          <div className="border-t border-gray-100 p-3 flex gap-2 items-end">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Pose ta question..."
              rows={1}
              disabled={enCours}
              className="flex-1 resize-none rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-50 max-h-24 overflow-y-auto"
              style={{ fieldSizing: "content" } as React.CSSProperties}
            />
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
      )}

      {/* Bouton flottant */}
      <button
        onClick={() => setOuvert((v) => !v)}
        className={`fixed bottom-4 right-4 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 ${
          ouvert
            ? "bg-gray-600 hover:bg-gray-700"
            : "bg-indigo-600 hover:bg-indigo-700"
        } text-white`}
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
