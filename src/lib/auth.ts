"use client";

import { supabase } from "./supabase";
import type { ProfilPublic } from "@/types";

export interface ResultatAuth {
  erreur: string | null;
}

export async function inscrire(
  email: string,
  motDePasse: string,
  pseudo: string
): Promise<ResultatAuth> {
  // Vérifier que le pseudo est disponible
  const { data: existant } = await supabase
    .from("profiles")
    .select("id")
    .eq("pseudo", pseudo)
    .maybeSingle();

  if (existant) {
    return { erreur: "Ce pseudo est déjà pris. Choisis-en un autre." };
  }

  const { data, error } = await supabase.auth.signUp({ email, password: motDePasse });

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
    return { erreur: "Compte créé mais profil introuvable. Contactez le support." };
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

export async function deconnecter(): Promise<void> {
  await supabase.auth.signOut();
}

export async function getProfilConnecte(): Promise<ProfilPublic | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return data ?? null;
}

export async function supprimerCompte(): Promise<ResultatAuth> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { erreur: "Non connecté." };

  // Supprimer le profil (cascade supprime tout le reste via FK)
  const { error } = await supabase.from("profiles").delete().eq("id", user.id);
  if (error) return { erreur: error.message };

  await supabase.auth.signOut();
  return { erreur: null };
}
