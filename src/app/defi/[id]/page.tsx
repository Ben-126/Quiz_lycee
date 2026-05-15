"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getDefi, getResultatsDefi } from "@/lib/social";
import Header from "@/components/navigation/Header";
import CarteDefi from "@/components/social/CarteDefi";
import type { Defi, ResultatDefi } from "@/types";
import type { User } from "@supabase/supabase-js";

export default function PageDefi() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [user, setUser] = useState<User | null>(null);
  const [defi, setDefi] = useState<Defi | null>(null);
  const [resultats, setResultats] = useState<ResultatDefi[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      const [d, r] = await Promise.all([getDefi(id), getResultatsDefi(id)]);

      if (!d) {
        setErreur("Défi introuvable ou expiré.");
      } else {
        setDefi(d);
        setResultats(r);
      }
      setChargement(false);
    };
    init();
  }, [id]);

  if (chargement) {
    return (
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--bg)" }}>
        <Header />
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 40, height: 40, border: "4px solid rgba(77,94,232,0.3)", borderTopColor: "var(--indigo)", borderRadius: "50%" }} className="animate-spin" />
        </div>
      </div>
    );
  }

  if (erreur || !defi) {
    return (
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--bg)" }}>
        <Header />
        <main style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
          <p style={{ fontSize: 40 }}>😕</p>
          <p style={{ color: "var(--text2)", fontWeight: 500 }}>{erreur ?? "Défi introuvable"}</p>
          <button onClick={() => router.push("/")} style={{ color: "var(--indigo-l)", fontSize: 14, background: "none", border: "none", cursor: "pointer" }}>
            Retour à l&apos;accueil
          </button>
        </main>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--bg)" }}>
        <Header />
        <main style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: "0 16px" }}>
          <p style={{ fontSize: 40 }}>🔒</p>
          <p style={{ color: "var(--text2)", fontWeight: 500, textAlign: "center" }}>
            Connecte-toi pour relever ce défi !
          </p>
          <CarteDefi defi={defi} resultats={resultats} userId="" />
        </main>
      </div>
    );
  }

  const dejaFait = resultats.some((r) => r.user_id === user.id);
  const expire = new Date(defi.expires_at) < new Date();

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--bg)" }}>
      <Header />
      <main style={{ flex: 1, maxWidth: 560, margin: "0 auto", width: "100%", padding: "24px 16px", display: "flex", flexDirection: "column", gap: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: "var(--text)" }}>Défi reçu</h1>
        <CarteDefi defi={defi} resultats={resultats} userId={user.id} />

        {!dejaFait && !expire && (
          <button
            onClick={() => router.push(`/${defi.niveau_scolaire}/${defi.matiere_slug}/${defi.chapitre_slug}/quiz?defi=${defi.id}&timer=${defi.time_limit_sec}`)}
            style={{ width: "100%", padding: "14px", background: "var(--indigo)", color: "#fff", fontWeight: 600, borderRadius: 14, border: "none", cursor: "pointer", fontSize: 16 }}
          >
            ⚡ Commencer le défi
          </button>
        )}

        {dejaFait && (
          <p style={{ textAlign: "center", color: "var(--teal)", fontWeight: 600 }}>Tu as déjà relevé ce défi !</p>
        )}
        {expire && (
          <p style={{ textAlign: "center", color: "var(--text3)" }}>Ce défi est expiré.</p>
        )}
      </main>
    </div>
  );
}
