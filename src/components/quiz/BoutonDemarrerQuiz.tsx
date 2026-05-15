"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function BoutonDemarrerQuiz({ href }: { href: string }) {
  const [chargement, setChargement] = useState(false);
  const router = useRouter();

  return (
    <button
      data-testid="btn-demarrer-quiz"
      disabled={chargement}
      onClick={() => {
        if (chargement) return;
        setChargement(true);
        router.push(href);
      }}
      className="btn-demarrer"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        width: "100%",
        padding: "14px",
        background: chargement
          ? "linear-gradient(135deg, rgba(239,110,90,0.55) 0%, rgba(232,88,64,0.55) 100%)"
          : "linear-gradient(135deg, #EF6E5A 0%, #E85840 100%)",
        color: "#fff",
        borderRadius: "var(--r-pill)",
        fontFamily: "var(--f-head)",
        fontWeight: 800,
        fontSize: "1rem",
        textAlign: "center",
        border: "none",
        cursor: chargement ? "not-allowed" : "pointer",
        boxShadow: "0 4px 20px rgba(239,110,90,0.32)",
        transition: "transform .15s, box-shadow .15s",
      }}
    >
      {chargement ? (
        <>
          <div
            className="animate-spin"
            style={{
              width: 16,
              height: 16,
              border: "2px solid rgba(255,255,255,0.35)",
              borderTopColor: "#fff",
              borderRadius: "50%",
              flexShrink: 0,
            }}
          />
          <span>Chargement...</span>
        </>
      ) : (
        <span>🚀 Démarrer le quiz</span>
      )}
    </button>
  );
}
