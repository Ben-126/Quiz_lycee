"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import XPBar from "@/components/gamification/XPBar";

interface HeaderProps {
  titre?: string;
  showBack?: boolean;
  backHref?: string;
}

export default function Header({ titre, showBack, backHref }: HeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (backHref) {
      router.push(backHref);
    } else {
      router.back();
    }
  };

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-white/60 sticky top-0 z-10 shadow-sm">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
        {showBack && (
          <button
            onClick={handleBack}
            aria-label="Retour"
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-900"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 4l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
        <Link href="/" className="flex items-center gap-2 font-bold text-lg text-indigo-700 hover:text-indigo-900">
          🎓 QuizLycée
        </Link>
        {titre && (
          <>
            <span className="text-gray-400">/</span>
            <span className="text-gray-700 font-medium text-sm truncate">{titre}</span>
          </>
        )}
        <div className="ml-auto flex items-center gap-1">
          <XPBar />
          <Link
            href="/progression"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-indigo-600 hover:bg-indigo-50 transition-colors"
          >
            <span>📊</span>
            <span className="hidden sm:inline">Progression</span>
          </Link>
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
        </div>
      </div>
    </header>
  );
}
