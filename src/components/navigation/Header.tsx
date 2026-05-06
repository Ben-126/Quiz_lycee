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
  const [cartesAReviser] = useState(
    () => (typeof window !== "undefined" ? getStatsRevision().cartesAujourdhui : 0)
  );

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    const cleanup = setupOnlineListener();

    return () => {
      subscription.unsubscribe();
      cleanup();
    };
  }, []);

  const handleDeconnexion = async () => {
    await deconnecter();
    setUser(null);
  };

  const navLinkStyle: React.CSSProperties = {
    fontFamily: "var(--f-body)",
    fontWeight: 600,
    fontSize: "0.88rem",
    color: "var(--text2)",
    textDecoration: "none",
    padding: "6px 12px",
    borderRadius: "var(--r-pill)",
    transition: "background .15s, color .15s",
    display: "flex",
    alignItems: "center",
    gap: 6,
    position: "relative",
  };

  return (
    <>
    <header style={{
      position: "sticky",
      top: 0,
      zIndex: 40,
      background: "rgba(13,15,27,0.92)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      borderBottom: "1px solid var(--border)",
    }}>
      <div style={{
        maxWidth: 1100,
        margin: "0 auto",
        padding: "10px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
      }}>
        {/* Logo */}
        <Link href="/app" style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          textDecoration: "none",
          flexShrink: 0,
        }}>
          <div style={{
            background: "rgba(255,255,255,0.9)",
            borderRadius: "var(--r-sm)",
            width: 30,
            height: 30,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}>
            <Image src="/logo-seul.png" alt="Révioria" width={26} height={26} style={{ objectFit: "contain" }} />
          </div>
          <span style={{ fontFamily: "var(--f-head)", fontWeight: 900, fontSize: "1rem", color: "var(--text)" }}>
            Révioria
          </span>
        </Link>

        {/* Navigation */}
        <nav style={{ display: "flex", alignItems: "center", gap: 2 }}>
          {[
            { href: "/progression", icon: "📈", label: "Progression" },
            { href: "/revision", icon: "🧠", label: "Révision", badge: cartesAReviser > 0 ? (cartesAReviser > 9 ? "9+" : String(cartesAReviser)) : null },
            { href: "/scan", icon: "📷", label: "Scan" },
            { href: "/langues", icon: "🌍", label: "Langues" },
          ].map(({ href, icon, label, badge }) => (
            <Link
              key={href}
              href={href}
              style={navLinkStyle}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.06)";
                (e.currentTarget as HTMLAnchorElement).style.color = "var(--text)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                (e.currentTarget as HTMLAnchorElement).style.color = "var(--text2)";
              }}
            >
              <span>{icon}</span>
              <span className="hidden sm:inline">{label}</span>
              {badge && (
                <span style={{
                  position: "absolute",
                  top: 2,
                  right: 2,
                  background: "var(--coral)",
                  color: "#fff",
                  fontSize: "0.6rem",
                  fontWeight: 800,
                  width: 14,
                  height: 14,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>{badge}</span>
              )}
            </Link>
          ))}

          {user && (
            <Link
              href="/social"
              style={navLinkStyle}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.06)"; (e.currentTarget as HTMLAnchorElement).style.color = "var(--text)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "transparent"; (e.currentTarget as HTMLAnchorElement).style.color = "var(--text2)"; }}
            >
              <span>👥</span>
              <span className="hidden sm:inline">Social</span>
            </Link>
          )}
        </nav>

        {/* Actions droite */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <XPBar />

          <Link
            href="/parametres"
            aria-label="Paramètres"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 32,
              height: 32,
              borderRadius: "var(--r-sm)",
              color: "var(--text3)",
              transition: "background .15s, color .15s",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.06)"; (e.currentTarget as HTMLAnchorElement).style.color = "var(--text2)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "transparent"; (e.currentTarget as HTMLAnchorElement).style.color = "var(--text3)"; }}
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
                style={{
                  fontFamily: "var(--f-head)",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  color: "var(--text3)",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: "6px 12px",
                  borderRadius: "var(--r-pill)",
                  transition: "background .15s, color .15s",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,110,90,0.1)"; (e.currentTarget as HTMLButtonElement).style.color = "var(--coral)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; (e.currentTarget as HTMLButtonElement).style.color = "var(--text3)"; }}
              >
                <span>🚪</span>
                <span className="hidden sm:inline">Déconnexion</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => setShowAuth(true)}
              style={{
                fontFamily: "var(--f-head)",
                fontWeight: 800,
                fontSize: "0.88rem",
                color: "#fff",
                background: "linear-gradient(135deg, #EF6E5A 0%, #E85840 100%)",
                border: "none",
                cursor: "pointer",
                padding: "7px 18px",
                borderRadius: "var(--r-pill)",
                boxShadow: "0 4px 14px rgba(239,110,90,0.28)",
                transition: "transform .15s, box-shadow .15s",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 6px 20px rgba(239,110,90,0.4)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 14px rgba(239,110,90,0.28)"; }}
            >
              <span>🔑</span>
              <span>Connexion</span>
            </button>
          )}
        </div>
      </div>

    </header>

      {showAuth && (
        <AuthModal
          onFermer={() => setShowAuth(false)}
          onConnecte={() => setShowAuth(false)}
        />
      )}
    </>
  );
}
