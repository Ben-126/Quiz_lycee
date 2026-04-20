import { z } from "zod";
import type { Question } from "@/types";

// ─── Types ─────────────────────────────────────────────────────────────────

export interface CarteRevision {
  id: string;
  chapitreSlug: string;
  matiereSlug: string;
  niveauScolaire: string;
  matiereName: string;
  chapitreNom: string;
  question: string;
  reponseCorrecte: string | boolean;
  explication: string;
  type: "qcm" | "vrai_faux" | "reponse_courte";
  options?: string[];

  // SM-2 fields
  intervalle: number;   // jours avant la prochaine révision
  facilite: number;     // ease factor (1.3 – 2.5)
  repetitions: number;  // nombre de bonnes réponses consécutives

  prochaineRevision: string; // "YYYY-MM-DD"
  dateCreation: string;      // "YYYY-MM-DD"
  nombreRevisions: number;
  dernierResultat: "correct" | "partiel" | "incorrect" | null;
}

export type QualiteRevision = "facile" | "bien" | "difficile" | "rate";

// ─── Schéma Zod ────────────────────────────────────────────────────────────

const CarteRevisionSchema = z.object({
  id: z.string(),
  chapitreSlug: z.string(),
  matiereSlug: z.string(),
  niveauScolaire: z.string(),
  matiereName: z.string(),
  chapitreNom: z.string(),
  question: z.string(),
  reponseCorrecte: z.union([z.string(), z.boolean()]),
  explication: z.string(),
  type: z.enum(["qcm", "vrai_faux", "reponse_courte"]),
  options: z.array(z.string()).optional(),
  intervalle: z.number().int().min(1),
  facilite: z.number().min(1.3).max(2.5),
  repetitions: z.number().int().min(0),
  prochaineRevision: z.string(),
  dateCreation: z.string(),
  nombreRevisions: z.number().int().min(0),
  dernierResultat: z.enum(["correct", "partiel", "incorrect"]).nullable(),
});

const StorageSchema = z.record(CarteRevisionSchema);

// ─── Constantes ────────────────────────────────────────────────────────────

const STORAGE_KEY = "revision-espacee";
const EASE_INITIAL = 2.5;
const EASE_MIN = 1.3;

// ─── Utilitaires ───────────────────────────────────────────────────────────

function dateAujourdhui(): string {
  return new Date().toISOString().slice(0, 10);
}

function dateDansNJours(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

function genererIdCarte(matiereSlug: string, chapitreSlug: string, question: string): string {
  // Identifiant stable basé sur le contenu
  const base = `${matiereSlug}/${chapitreSlug}/${question}`;
  let hash = 0;
  for (let i = 0; i < base.length; i++) {
    const chr = base.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0;
  }
  return `carte_${Math.abs(hash).toString(36)}`;
}

// ─── Stockage ──────────────────────────────────────────────────────────────

function getStorage(): Record<string, CarteRevision> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = StorageSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : {};
  } catch {
    return {};
  }
}

function saveStorage(data: Record<string, CarteRevision>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // localStorage indisponible
  }
}

// ─── Algorithme SM-2 ───────────────────────────────────────────────────────

/**
 * Convertit la qualité perçue en score 0-5 (notation SM-2).
 * facile=5, bien=4, difficile=3, raté=1
 */
function qualiteEnScore(qualite: QualiteRevision): number {
  switch (qualite) {
    case "facile": return 5;
    case "bien": return 4;
    case "difficile": return 3;
    case "rate": return 1;
  }
}

function appliquerSM2(carte: CarteRevision, qualite: QualiteRevision): CarteRevision {
  const q = qualiteEnScore(qualite);

  let { intervalle, facilite, repetitions } = carte;

  if (q >= 3) {
    // Succès
    if (repetitions === 0) {
      intervalle = 1;
    } else if (repetitions === 1) {
      intervalle = 6;
    } else {
      intervalle = Math.round(intervalle * facilite);
    }
    repetitions += 1;
    facilite = Math.max(EASE_MIN, facilite + 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  } else {
    // Échec — réinitialisation
    repetitions = 0;
    intervalle = 1;
    facilite = Math.max(EASE_MIN, facilite - 0.2);
  }

  const dernierResultat: CarteRevision["dernierResultat"] =
    q >= 4 ? "correct" : q === 3 ? "partiel" : "incorrect";

  return {
    ...carte,
    intervalle,
    facilite,
    repetitions,
    prochaineRevision: dateDansNJours(intervalle),
    nombreRevisions: carte.nombreRevisions + 1,
    dernierResultat,
  };
}

// ─── API publique ──────────────────────────────────────────────────────────

/**
 * Ajoute une question au système de révision espacée (depuis un quiz raté).
 */
export function ajouterCarteRevision(
  question: Question,
  matiereSlug: string,
  chapitreSlug: string,
  niveauScolaire: string,
  matiereName: string,
  chapitreNom: string,
): void {
  const data = getStorage();
  const id = genererIdCarte(matiereSlug, chapitreSlug, question.question);

  // Ne pas écraser une carte existante (conserver la progression SM-2)
  if (data[id]) return;

  const nouvelle: CarteRevision = {
    id,
    chapitreSlug,
    matiereSlug,
    niveauScolaire,
    matiereName,
    chapitreNom,
    question: question.question,
    reponseCorrecte: question.reponseCorrecte,
    explication: question.explication,
    type: question.type,
    options: question.type === "qcm" ? question.options : undefined,
    intervalle: 1,
    facilite: EASE_INITIAL,
    repetitions: 0,
    prochaineRevision: dateAujourdhui(),
    dateCreation: dateAujourdhui(),
    nombreRevisions: 0,
    dernierResultat: null,
  };

  saveStorage({ ...data, [id]: nouvelle });
}

/**
 * Récupère les cartes à réviser aujourd'hui (prochaineRevision <= aujourd'hui).
 */
export function getCartesAReviser(): CarteRevision[] {
  const data = getStorage();
  const aujourd = dateAujourdhui();
  return Object.values(data)
    .filter((c) => c.prochaineRevision <= aujourd)
    .sort((a, b) => a.prochaineRevision.localeCompare(b.prochaineRevision));
}

/**
 * Met à jour une carte après révision avec la qualité perçue.
 */
export function enregistrerRevision(carteId: string, qualite: QualiteRevision): void {
  const data = getStorage();
  const carte = data[carteId];
  if (!carte) return;
  saveStorage({ ...data, [carteId]: appliquerSM2(carte, qualite) });
}

/**
 * Statistiques globales pour l'affichage.
 */
export interface StatsRevision {
  totalCartes: number;
  cartesAujourdhui: number;
  cartesApprises: number; // repetitions >= 2
  prochaineSession: string | null; // date de la prochaine carte à venir
}

export function getStatsRevision(): StatsRevision {
  const data = getStorage();
  const cartes = Object.values(data);
  const aujourd = dateAujourdhui();

  const cartesAujourdhui = cartes.filter((c) => c.prochaineRevision <= aujourd).length;
  const cartesApprises = cartes.filter((c) => c.repetitions >= 2).length;

  const futures = cartes
    .filter((c) => c.prochaineRevision > aujourd)
    .map((c) => c.prochaineRevision)
    .sort();

  return {
    totalCartes: cartes.length,
    cartesAujourdhui,
    cartesApprises,
    prochaineSession: futures[0] ?? null,
  };
}

/**
 * Supprime toutes les cartes de révision (réinitialisation).
 */
export function reinitialiserRevisions(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // localStorage indisponible
  }
}
