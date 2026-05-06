"use client";

import { supabase } from "./supabase";
import { effacerToutesLesDonnees } from "./consent";
import type { ProfilPublic } from "@/types";

export interface ResultatAuth {
  erreur: string | null;
}

export async function inscrire(
  email: string,
  motDePasse: string,
  pseudo: string,
  emailParent?: string
): Promise<ResultatAuth> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password: motDePasse,
    options: {
      data: {
        pseudo,
        age_minor: !!emailParent,
        ...(emailParent ? { parent_email: emailParent } : {}),
        consent_date: new Date().toISOString(),
      },
    },
  });

  if (error) {
    return { erreur: error.message };
  }

  if (!data.user) {
    return { erreur: "Erreur lors de la création du compte." };
  }

  const { error: profileError } = await supabase.from("profiles").insert({
    id: data.user.id,
    pseudo,
    xp_total: 0,
    niveau: 1,
    streak_jours: 0,
    dernier_quiz_date: null,
  });

  if (profileError) {
    if (profileError.code === "23505") {
      return { erreur: "Ce pseudo est déjà pris. Choisis-en un autre." };
    }
    return { erreur: "Erreur lors de la création du profil. Réessaie." };
  }

  return { erreur: null };
}

export async function connecter(
  email: string,
  motDePasse: string
): Promise<ResultatAuth> {
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password: motDePasse,
  });
  return { erreur: error ? error.message : null };
}

export async function deconnecter(): Promise<ResultatAuth> {
  const { error } = await supabase.auth.signOut();
  return { erreur: error ? error.message : null };
}

export async function getProfilConnecte(): Promise<ProfilPublic | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error && error.code !== "PGRST116") {
    return null;
  }

  return data ?? null;
}

export async function connexionGoogle(): Promise<ResultatAuth> {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/app`,
    },
  });
  return { erreur: error ? error.message : null };
}

export async function supprimerCompte(): Promise<ResultatAuth> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { erreur: "Non connecté." };

  // Appelle l'Edge Function qui supprime profil + compte auth.users côté serveur
  const { error } = await supabase.functions.invoke("delete-account", {
    headers: { Authorization: `Bearer ${session.access_token}` },
  });

  if (error) return { erreur: error.message };

  // RGPD : vider TOUTES les données locales de l'appareil
  effacerToutesLesDonnees();

  await supabase.auth.signOut();
  return { erreur: null };
}
