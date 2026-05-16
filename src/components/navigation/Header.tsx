"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { deconnecter } from "@/lib/auth";
import { setupOnlineListener } from "@/lib/sync";
import AuthModal from "@/components/auth/AuthModal";
import ClochNotif from "@/components/social/ClochNotif";
import XPBar from "@/components/gamification/XPBar";
import { getStatsRevision } from "@/lib/revision-espacee";
import type { User } from "@supabase/supabase-js";

export default function Header() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [menuOuvert, setMenuOuvert] = useState(false);
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

  // Fermer le menu au changement de route
  useEffect(() => {
    setMenuOuvert(false);
  }, [pathname]);

  const handleDeconnexion = async () => {
    await deconnecter();
    setUser(null);
  };

  const navLinks = [
    { href: "/progression", icon: "📈", label: "Progression" },
    { href: "/revision",    icon: "🧠", label: "Révision", badge: cartesAReviser > 0 ? (cartesAReviser > 9 ? "9+" : String(cartesAReviser)) : null },
    { href: "/scan",        icon: "📷", label: "Scan" },
    { href: "/langues",     icon: "🌍", label: "Langues" },
    ...(user ? [{ href: "/social", icon: "👥", label: "Social" }] : []),
  ] as Array<{ href: string; icon: string; label: string; badge?: string | null }>;

  const isActive = (href: string) => pathname === href || (href !== "/" && pathname.startsWith(href));

  const getLinkStyle = (href: string): React.CSSProperties => ({
    fontFamily: "var(--f-body)",
    fontWeight: 600,
    fontSize: "0.88rem",
    textDecoration: "none",
    padding: "6px 12px",
    borderRadius: "var(--r-pill)",
    transition: "background .15s, color .15s",
    display: "flex",
    alignItems: "center",
    gap: 6,
    position: "relative",
    color: isActive(href) ? "var(--indigo-l)" : "var(--text2)",
    background: isActive(href) ? "rgba(77,94,232,0.12)" : "transparent",
  });

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
        <Link href="/app" className="logo-link" style={{
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

        {/* Navigation desktop */}
        <nav className="hidden sm:flex" style={{ alignItems: "center", gap: 2 }}>
          {navLinks.map(({ href, icon, label, badge }) => (
            <Link
              key={href}
              href={href}
              style={getLinkStyle(href)}
              onMouseEnter={(e) => {
                const active = isActive(href);
                (e.currentTarget as HTMLAnchorElement).style.background = active ? "rgba(77,94,232,0.2)" : "rgba(255,255,255,0.06)";
                if (!active) (e.currentTarget as HTMLAnchorElement).style.color = "var(--text)";
              }}
              onMouseLeave={(e) => {
                const active = isActive(href);
                (e.currentTarget as HTMLAnchorElement).style.background = active ? "rgba(77,94,232,0.12)" : "transparent";
                (e.currentTarget as HTMLAnchorElement).style.color = active ? "var(--indigo-l)" : "var(--text2)";
              }}
            >
              <span>{icon}</span>
              <span>{label}</span>
              {badge && (
                <span className="badge-pulse" style={{
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
        </nav>

        {/* Actions droite */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <XPBar />

          <Link
            href="/parametres"
            aria-label="Paramètres"
            className="hidden sm:flex"
            style={{
              alignItems: "center",
              justifyContent: "center",
              width: 44,
              height: 44,
              borderRadius: "var(--r-sm)",
              color: isActive("/parametres") ? "var(--indigo-l)" : "var(--text3)",
              transition: "background .15s, color .15s",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.06)"; (e.currentTarget as HTMLAnchorElement).style.color = "var(--text2)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "transparent"; (e.currentTarget as HTMLAnchorElement).style.color = isActive("/parametres") ? "var(--indigo-l)" : "var(--text3)"; }}
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
                className="hidden sm:flex"
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
                  alignItems: "center",
                  gap: 6,
                  minHeight: 44,
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,110,90,0.1)"; (e.currentTarget as HTMLButtonElement).style.color = "var(--coral)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; (e.currentTarget as HTMLButtonElement).style.color = "var(--text3)"; }}
              >
                <span>🚪</span>
                <span>Déconnexion</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => setShowAuth(true)}
              className="hidden sm:flex"
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
                alignItems: "center",
                gap: 6,
                minHeight: 44,
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 6px 20px rgba(239,110,90,0.4)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 14px rgba(239,110,90,0.28)"; }}
            >
              <span>🔑</span>
              <span>Connexion</span>
            </button>
          )}

          {/* Bouton hamburger mobile */}
          <button
            className="sm:hidden"
            onClick={() => setMenuOuvert((v) => !v)}
            aria-label={menuOuvert ? "Fermer le menu" : "Ouvrir le menu"}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 44,
              height: 44,
              borderRadius: "var(--r-sm)",
              background: menuOuvert ? "rgba(77,94,232,0.12)" : "transparent",
              border: "none",
              cursor: "pointer",
              color: "var(--text2)",
              fontSize: 20,
              transition: "background .15s",
            }}
          >
            {menuOuvert ? "✕" : "☰"}
          </button>
        </div>
      </div>
    </header>

    {/* Menu mobile drawer */}
    {menuOuvert && (
      <>
        {/* Overlay */}
        <div
          onClick={() => setMenuOuvert(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 45,
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(4px)",
          }}
        />
        {/* Panneau */}
        <div style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          background: "var(--bg2)",
          borderTop: "1px solid var(--border2)",
          borderRadius: "var(--r-lg) var(--r-lg) 0 0",
          padding: "20px 24px 32px",
          display: "flex",
          flexDirection: "column",
          gap: 8,
          animation: "slideUpDrawer 0.22s ease-out both",
        }}>
          {/* Poignée */}
          <div style={{ width: 36, height: 4, background: "var(--border2)", borderRadius: 999, margin: "0 auto 12px" }} />

          {navLinks.map(({ href, icon, label, badge }) => (
            <Link
              key={href}
              href={href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "13px 16px",
                borderRadius: "var(--r-md)",
                textDecoration: "none",
                fontFamily: "var(--f-body)",
                fontWeight: 600,
                fontSize: "1rem",
                color: isActive(href) ? "var(--indigo-l)" : "var(--text)",
                background: isActive(href) ? "rgba(77,94,232,0.12)" : "rgba(255,255,255,0.03)",
                border: isActive(href) ? "1px solid rgba(77,94,232,0.25)" : "1px solid transparent",
                position: "relative",
              }}
            >
              <span style={{ fontSize: 20 }}>{icon}</span>
              <span>{label}</span>
              {badge && (
                <span style={{
                  marginLeft: "auto",
                  background: "var(--coral)",
                  color: "#fff",
                  fontSize: "0.7rem",
                  fontWeight: 800,
                  padding: "1px 7px",
                  borderRadius: 999,
                }}>{badge}</span>
              )}
              {isActive(href) && (
                <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--indigo-l)" }}>●</span>
              )}
            </Link>
          ))}

          <div style={{ height: 1, background: "var(--border)", margin: "4px 0" }} />

          <Link
            href="/parametres"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "13px 16px",
              borderRadius: "var(--r-md)",
              textDecoration: "none",
              fontFamily: "var(--f-body)",
              fontWeight: 600,
              fontSize: "1rem",
              color: isActive("/parametres") ? "var(--indigo-l)" : "var(--text2)",
              background: isActive("/parametres") ? "rgba(77,94,232,0.12)" : "transparent",
              border: isActive("/parametres") ? "1px solid rgba(77,94,232,0.25)" : "1px solid transparent",
            }}
          >
            <span style={{ fontSize: 20 }}>⚙️</span>
            <span>Paramètres</span>
          </Link>

          {user ? (
            <button
              onClick={() => { handleDeconnexion(); setMenuOuvert(false); }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "13px 16px",
                borderRadius: "var(--r-md)",
                fontFamily: "var(--f-body)",
                fontWeight: 600,
                fontSize: "1rem",
                color: "var(--coral-l)",
                background: "rgba(239,110,90,0.07)",
                border: "1px solid transparent",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <span style={{ fontSize: 20 }}>🚪</span>
              <span>Déconnexion</span>
            </button>
          ) : (
            <button
              onClick={() => { setShowAuth(true); setMenuOuvert(false); }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                padding: "14px 16px",
                borderRadius: "var(--r-pill)",
                fontFamily: "var(--f-head)",
                fontWeight: 800,
                fontSize: "1rem",
                color: "#fff",
                background: "linear-gradient(135deg, #EF6E5A 0%, #E85840 100%)",
                border: "none",
                cursor: "pointer",
              }}
            >
              <span>🔑</span>
              <span>Connexion</span>
            </button>
          )}
        </div>
      </>
    )}

      {showAuth && (
        <AuthModal
          onFermer={() => setShowAuth(false)}
          onConnecte={() => setShowAuth(false)}
        />
      )}
    </>
  );
}
