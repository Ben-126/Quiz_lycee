"use client";

import { supabase } from "./supabase";
import type { ProfilPublic, Amitie, Defi, ResultatDefi, Notification, EntreeClassement } from "@/types";

// ─── Classement ────────────────────────────────────────────────────────────────

export async function getClassementGlobal(limite = 100): Promise<EntreeClassement[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, pseudo, xp_total, niveau, streak_jours")
    .order("xp_total", { ascending: false })
    .limit(limite);

  if (error || !data) return [];

  return data.map((p, i) => ({ ...p, rang: i + 1 }));
}

export async function getClassementAmis(userId: string): Promise<EntreeClassement[]> {
  const { data: amitiés } = await supabase
    .from("friendships")
    .select("user_id, friend_id")
    .or(`user_id.eq.${userId},friend_id.eq.${userId}`)
    .eq("status", "accepted");

  if (!amitiés || amitiés.length === 0) return [];

  const amisIds = amitiés.map((a) =>
    a.user_id === userId ? a.friend_id : a.user_id
  );
  amisIds.push(userId);

  const { data, error } = await supabase
    .from("profiles")
    .select("id, pseudo, xp_total, niveau, streak_jours")
    .in("id", amisIds)
    .order("xp_total", { ascending: false });

  if (error || !data) return [];

  return data.map((p, i) => ({ ...p, rang: i + 1 }));
}

// ─── Amis ──────────────────────────────────────────────────────────────────────

export async function rechercherParPseudo(pseudo: string): Promise<ProfilPublic[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, pseudo, xp_total, niveau, streak_jours, dernier_quiz_date, created_at")
    .ilike("pseudo", `%${pseudo}%`)
    .limit(10);

  if (error || !data) return [];
  return data;
}

export async function envoyerDemandeAmi(userId: string, friendId: string): Promise<string | null> {
  const { error } = await supabase.from("friendships").insert({
    user_id: userId,
    friend_id: friendId,
    status: "pending",
  });

  if (error) return error.message;

  await supabase.from("notifications").insert({
    user_id: friendId,
    type: "friend_request",
    payload: { from_user_id: userId },
  });

  return null;
}

export async function accepterDemandeAmi(amitiéId: string): Promise<string | null> {
  const { error } = await supabase
    .from("friendships")
    .update({ status: "accepted" })
    .eq("id", amitiéId);

  return error ? error.message : null;
}

export async function refuserDemandeAmi(amitiéId: string): Promise<string | null> {
  const { error } = await supabase
    .from("friendships")
    .delete()
    .eq("id", amitiéId);

  return error ? error.message : null;
}

export async function getMesAmis(userId: string): Promise<Amitie[]> {
  const { data, error } = await supabase
    .from("friendships")
    .select("*, profil:friend_id(id, pseudo, xp_total, niveau, streak_jours)")
    .or(`user_id.eq.${userId},friend_id.eq.${userId}`)
    .eq("status", "accepted");

  if (error || !data) return [];
  return data as unknown as Amitie[];
}

export async function getDemandesRecues(userId: string): Promise<Amitie[]> {
  const { data, error } = await supabase
    .from("friendships")
    .select("*, profil:user_id(id, pseudo, xp_total, niveau)")
    .eq("friend_id", userId)
    .eq("status", "pending");

  if (error || !data) return [];
  return data as unknown as Amitie[];
}

// ─── Défis ─────────────────────────────────────────────────────────────────────

export async function creerDefi(params: {
  creator_id: string;
  target_friend_id: string | null;
  chapitre_slug: string;
  matiere_slug: string;
  niveau_scolaire: string;
  time_limit_sec: number;
}): Promise<{ defi: Defi | null; erreur: string | null }> {
  const expires_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from("challenges")
    .insert({ ...params, expires_at })
    .select()
    .single();

  if (error || !data) return { defi: null, erreur: error?.message ?? "Erreur inconnue" };

  if (params.target_friend_id) {
    await supabase.from("notifications").insert({
      user_id: params.target_friend_id,
      type: "challenge_received",
      payload: { challenge_id: data.id, from_user_id: params.creator_id },
    });
  }

  return { defi: data as Defi, erreur: null };
}

export async function getDefi(id: string): Promise<Defi | null> {
  const { data, error } = await supabase
    .from("challenges")
    .select("*, createur:creator_id(id, pseudo)")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return data as unknown as Defi;
}

export async function soumettreResultatDefi(params: {
  challenge_id: string;
  user_id: string;
  score: number;
  time_sec: number;
}): Promise<string | null> {
  const { error } = await supabase.from("challenge_results").insert(params);
  if (error) return error.message;

  const { data: defi } = await supabase
    .from("challenges")
    .select("creator_id")
    .eq("id", params.challenge_id)
    .single();

  if (defi && defi.creator_id !== params.user_id) {
    await supabase.from("notifications").insert({
      user_id: defi.creator_id,
      type: "challenge_completed",
      payload: { challenge_id: params.challenge_id, from_user_id: params.user_id, score: params.score },
    });
  }

  return null;
}

export async function getResultatsDefi(challenge_id: string): Promise<ResultatDefi[]> {
  const { data, error } = await supabase
    .from("challenge_results")
    .select("*, profil:user_id(id, pseudo)")
    .eq("challenge_id", challenge_id)
    .order("score", { ascending: false });

  if (error || !data) return [];
  return data as unknown as ResultatDefi[];
}

// ─── Notifications ─────────────────────────────────────────────────────────────

export async function getMesNotifications(userId: string): Promise<Notification[]> {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error || !data) return [];
  return data as Notification[];
}

export async function marquerNotifLue(notifId: string): Promise<void> {
  await supabase.from("notifications").update({ lu: true }).eq("id", notifId);
}

export async function marquerToutesLues(userId: string): Promise<void> {
  await supabase.from("notifications").update({ lu: true }).eq("user_id", userId).eq("lu", false);
}
