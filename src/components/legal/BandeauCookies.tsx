"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const CONSENT_KEY = "cookie-consent";

export default function BandeauCookies() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consentement = localStorage.getItem(CONSENT_KEY);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!consentement) setVisible(true);
  }, []);

  const accepter = () => {
    localStorage.setItem(CONSENT_KEY, "accepted");
    setVisible(false);
  };

  const refuser = () => {
    localStorage.setItem(CONSENT_KEY, "refused");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg p-4">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <p className="text-sm text-gray-700 flex-1">
          Révioria utilise un stockage local (localStorage) pour gérer ta session de connexion et tes préférences. Aucun cookie publicitaire.{" "}
          <Link href="/confidentialite" className="text-indigo-600 hover:underline">
            Politique de confidentialité
          </Link>
        </p>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={refuser}
            className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Refuser
          </button>
          <button
            onClick={accepter}
            className="px-4 py-2 text-sm bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Accepter
          </button>
        </div>
      </div>
    </div>
  );
}
