"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { deconnecter } from "@/lib/auth";
import { setupOnlineListener } from "@/lib/sync";
import AuthModal from "@/components/auth/AuthModal";
import ClochNotif from "@/components/social/ClochNotif";
import XPBar from "@/components/gamification/XPBar";
import { getStatsRevision } from "@/lib/revision-espacee";
import type { User } from "@supabase/supabase-js";

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [cartesAReviser, setCartesAReviser] = useState(0);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    const cleanup = setupOnlineListener();

    // Charger le nombre de cartes à réviser
    setCartesAReviser(getStatsRevision().cartesAujourdhui);

    return () => {
      subscription.unsubscribe();
      cleanup();
    };
  }, []);

  const handleDeconnexion = async () => {
    await deconnecter();
    setUser(null);
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Image src="/logo.png" alt="Révioria" width={32} height={32} className="object-contain mix-blend-multiply" />
          <span className="font-bold text-indigo-700 text-lg hidden sm:block">Révioria</span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-2">
          <Link
            href="/progression"
            className="text-sm text-gray-600 hover:text-indigo-600 font-medium px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors flex items-center gap-1.5"
          >
            <span>📈</span>
            <span className="hidden sm:inline">Progression</span>
          </Link>

          <Link
            href="/revision"
            className="relative text-sm text-gray-600 hover:text-indigo-600 font-medium px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors flex items-center gap-1.5"
          >
            <span>🧠</span>
            <span className="hidden sm:inline">Révision</span>
            {cartesAReviser > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {cartesAReviser > 9 ? "9+" : cartesAReviser}
              </span>
            )}
          </Link>

          <Link
            href="/scan"
            className="text-sm text-gray-600 hover:text-indigo-600 font-medium px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors flex items-center gap-1.5"
          >
            <span>📷</span>
            <span className="hidden sm:inline">Scan</span>
          </Link>

          {user && (
            <Link
              href="/social"
              className="text-sm text-gray-600 hover:text-indigo-600 font-medium px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors flex items-center gap-1.5"
            >
              <span>👥</span>
              <span className="hidden sm:inline">Social</span>
            </Link>
          )}
        </nav>

        {/* Actions droite */}
        <div className="flex items-center gap-2 shrink-0">
          <XPBar />
          <Link
            href="/parametres"
            aria-label="Paramètres"
            className="flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </Link>
          {user ? (
            <>
              <ClochNotif />
              <button
                onClick={handleDeconnexion}
                className="text-sm text-gray-500 hover:text-red-600 font-medium px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-1.5"
              >
                <span>🚪</span>
                <span className="hidden sm:inline">Déconnexion</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => setShowAuth(true)}
              className="text-sm bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <span>🔑</span>
              <span>Connexion</span>
            </button>
          )}
        </div>
      </div>

      {showAuth && (
        <AuthModal
          onFermer={() => setShowAuth(false)}
          onConnecte={() => setShowAuth(false)}
        />
      )}
    </header>
  );
}
