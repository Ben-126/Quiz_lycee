"use client";

import { supabase } from "./supabase";
import { aAccepte } from "./consent";

const SYNC_QUEUE_KEY = "sync-queue";

interface SyncEntry {
  xp_total: number;
  nouveaux_badges: string[];
  timestamp: number;
}

function getSyncQueue(): SyncEntry[] {
  try {
    const raw = localStorage.getItem(SYNC_QUEUE_KEY);
    return raw ? (JSON.parse(raw) as SyncEntry[]) : [];
  } catch {
    return [];
  }
}

function saveSyncQueue(queue: SyncEntry[]): void {
  if (!aAccepte()) return;
  try {
    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
  } catch {}
}

export function ajouterALaQueue(xp_total: number, nouveaux_badges: string[]): void {
  const queue = getSyncQueue();
  // On garde uniquement la dernière entrée (la plus à jour)
  saveSyncQueue([{ xp_total, nouveaux_badges, timestamp: Date.now() }]);
  // Tenter la sync immédiate si online
  if (navigator.onLine) {
    void flushSyncQueue();
  }
  void queue; // évite unused warning
}

export async function flushSyncQueue(): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const queue = getSyncQueue();
  if (queue.length === 0) return;

  const derniere = queue[queue.length - 1];

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      xp_total: derniere.xp_total,
    })
    .eq("id", user.id);

  if (profileError) return;

  if (derniere.nouveaux_badges.length > 0) {
    const today = new Date().toISOString().slice(0, 10);
    await supabase.from("user_badges").upsert(
      derniere.nouveaux_badges.map((badge_id) => ({
        user_id: user.id,
        badge_id,
        date_obtention: today,
      })),
      { onConflict: "user_id,badge_id", ignoreDuplicates: true }
    );
  }

  saveSyncQueue([]);
}

export function setupOnlineListener(): () => void {
  const handler = () => {
    void flushSyncQueue();
  };
  window.addEventListener("online", handler);
  return () => window.removeEventListener("online", handler);
}
