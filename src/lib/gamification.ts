import { z } from "zod";
import { getToutesPerformances } from "./performance";
import { getHistorique } from "./history";
import type { ProfilGamification, BadgeDebloque, ResultatGamification } from "@/types";

// ─── Constantes niveaux ────────────────────────────────────────────────────────

export interface NiveauGamification {
  numero: number;
  nom: string;
  emoji: string;
  xpRequis: number;
}

export const NIVEAUX_GAMIFICATION: NiveauGamification[] = [
  { numero: 1,  nom: "Novice",    emoji: "🌱", xpRequis: 0    },
  { numero: 2,  nom: "Apprenti",  emoji: "📖", xpRequis: 100  },
  { numero: 3,  nom: "Étudiant",  emoji: "🎒", xpRequis: 250  },
  { numero: 4,  nom: "Appliqué",  emoji: "✏️", xpRequis: 500  },
  { numero: 5,  nom: "Studieux",  emoji: "📚", xpRequis: 900  },
  { numero: 6,  nom: "Brillant",  emoji: "💡", xpRequis: 1400 },
  { numero: 7,  nom: "Expert",    emoji: "🎯", xpRequis: 2100 },
  { numero: 8,  nom: "Savant",    emoji: "🔬", xpRequis: 3000 },
  { numero: 9,  nom: "Génie",     emoji: "🧠", xpRequis: 4500 },
  { numero: 10, nom: "Maître",    emoji: "🏆", xpRequis: 7000 },
];

// ─── Constantes badges ─────────────────────────────────────────────────────────

export interface BadgeInfo {
  id: string;
  nom: string;
  description: string;
  emoji: string;
}

export const BADGES_GENERAUX: BadgeInfo[] = [
  { id: "premier-pas",      nom: "Premier Pas",        description: "Terminer son 1er quiz",           emoji: "🎯"  },
  { id: "dizaine",          nom: "Décuplé",             description: "Compléter 10 quiz",               emoji: "🔟"  },
  { id: "cinquantaine",     nom: "Centurion",           description: "Compléter 50 quiz",               emoji: "🏅"  },
  { id: "score-parfait",    nom: "Score Parfait",       description: "Obtenir 100% une fois",           emoji: "⭐"  },
  { id: "perfectionniste",  nom: "Perfectionniste",     description: "Obtenir 3 scores parfaits",       emoji: "💎"  },
  { id: "serie-3",          nom: "Série ×3",            description: "Jouer 3 jours de suite",          emoji: "🔥"  },
  { id: "serie-7",          nom: "Série ×7",            description: "Jouer 7 jours de suite",          emoji: "🔥🔥"},
  { id: "assidu",           nom: "Assidu",              description: "Jouer 30 jours de suite",         emoji: "🏆"  },
  { id: "niveau-5",         nom: "Studieux Confirmé",   description: "Atteindre le niveau Studieux",    emoji: "🌟"  },
];

export function getBadgesMatiere(matiereSlug: string, matiereNom: string): BadgeInfo[] {
  return [
    { id: `apprenti-${matiereSlug}`, nom: `Apprenti ${matiereNom}`,  description: `Terminer 3 quiz en ${matiereNom}`,                   emoji: "📚" },
    { id: `expert-${matiereSlug}`,   nom: `Expert ${matiereNom}`,    description: `Score moyen ≥ 80 % sur 5+ quiz en ${matiereNom}`,    emoji: "🎓" },
    { id: `as-${matiereSlug}`,       nom: `As de ${matiereNom}`,     description: `Obtenir 100 % en ${matiereNom}`,                     emoji: "💫" },
  ];
}

// ─── Schema Zod ────────────────────────────────────────────────────────────────

const BadgeDebloqueSchema = z.object({
  id: z.string(),
  dateObtention: z.string(),
});

const ProfilGamificationSchema = z.object({
  xpTotal:          z.number().int().min(0),
  dernierQuizDate:  z.string().nullable(),
  streakJours:      z.number().int().min(0),
  badgesDebloques:  z.array(BadgeDebloqueSchema),
  xpDuJour:         z.number().int().min(0),
  quizXpDuJour:     z.array(z.string()),
});

const PROFIL_DEFAULT: ProfilGamification = {
  xpTotal: 0,
  dernierQuizDate: null,
  streakJours: 0,
  badgesDebloques: [],
  xpDuJour: 0,
  quizXpDuJour: [],
};

const STORAGE_KEY = "gamification-profil";
const PLAFOND_XP_JOUR = 150;

// ─── Storage ───────────────────────────────────────────────────────────────────

export function getProfilGamification(): ProfilGamification {
  if (typeof window === "undefined") return { ...PROFIL_DEFAULT };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...PROFIL_DEFAULT };
    const parsed = ProfilGamificationSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : { ...PROFIL_DEFAULT };
  } catch {
    return { ...PROFIL_DEFAULT };
  }
}

function saveProfilGamification(profil: ProfilGamification): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profil));
  } catch {}
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function getDateAujourdhuiISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function hierISO(aujourd: string): string {
  const d = new Date(aujourd);
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

// ─── Niveaux ───────────────────────────────────────────────────────────────────

export function getNiveauFromXP(xp: number): NiveauGamification {
  for (let i = NIVEAUX_GAMIFICATION.length - 1; i >= 0; i--) {
    if (xp >= NIVEAUX_GAMIFICATION[i].xpRequis) return NIVEAUX_GAMIFICATION[i];
  }
  return NIVEAUX_GAMIFICATION[0];
}

export function getProgressionNiveau(xp: number): {
  xpDansNiveau: number;
  xpPourMonter: number;
  pourcentage: number;
} {
  const niveau = getNiveauFromXP(xp);
  const index = NIVEAUX_GAMIFICATION.findIndex((n) => n.numero === niveau.numero);

  if (index === NIVEAUX_GAMIFICATION.length - 1) {
    return { xpDansNiveau: xp - niveau.xpRequis, xpPourMonter: 0, pourcentage: 100 };
  }

  const suivant = NIVEAUX_GAMIFICATION[index + 1];
  const xpDansNiveau = xp - niveau.xpRequis;
  const xpPourMonter = suivant.xpRequis - niveau.xpRequis;
  return {
    xpDansNiveau,
    xpPourMonter,
    pourcentage: Math.round((xpDansNiveau / xpPourMonter) * 100),
  };
}

// ─── Calcul XP ─────────────────────────────────────────────────────────────────

function calculerXPBrut(
  scorePourcentage: number,
  modeControle: boolean,
  streakActif: boolean,
): number {
  const base = 10;
  const bonusScore   = Math.floor(scorePourcentage / 10);       // 0–10
  const bonusParfait = scorePourcentage === 100 ? 15 : 0;
  const bonusStreak  = streakActif ? 5 : 0;
  const brut = base + bonusScore + bonusParfait + bonusStreak;
  return modeControle ? Math.floor(brut * 1.5) : brut;
}

// ─── Streak ────────────────────────────────────────────────────────────────────

function mettreAJourStreak(profil: ProfilGamification, aujourd: string): number {
  if (!profil.dernierQuizDate) return 1;
  if (profil.dernierQuizDate === aujourd) return profil.streakJours;   // même jour
  if (profil.dernierQuizDate === hierISO(aujourd)) return profil.streakJours + 1; // lendemain
  return 1; // cassé
}

// ─── Badges ────────────────────────────────────────────────────────────────────

function verifierNouveauxBadges(
  profil: ProfilGamification,
  matiereSlug: string,
  nouveauXPTotal: number,
): string[] {
  const deja = new Set(profil.badgesDebloques.map((b) => b.id));
  const nouveaux: string[] = [];

  const performances = getToutesPerformances();
  const historique   = getHistorique();

  const totalQuiz = Object.values(performances).reduce(
    (sum, p) => sum + p.nombreQuizCompletes, 0,
  );
  const scoreParfaitCount = historique.filter((e) => e.score === 100).length;
  const niveauActuel      = getNiveauFromXP(nouveauXPTotal);

  // Badges généraux
  const check = (id: string, cond: boolean) => { if (!deja.has(id) && cond) nouveaux.push(id); };
  check("premier-pas",     totalQuiz >= 1);
  check("dizaine",         totalQuiz >= 10);
  check("cinquantaine",    totalQuiz >= 50);
  check("score-parfait",   scoreParfaitCount >= 1);
  check("perfectionniste", scoreParfaitCount >= 3);
  check("serie-3",         profil.streakJours >= 3);
  check("serie-7",         profil.streakJours >= 7);
  check("assidu",          profil.streakJours >= 30);
  check("niveau-5",        niveauActuel.numero >= 5);

  // Badges matière
  const quizMat = Object.entries(performances)
    .filter(([cle]) => cle.startsWith(`${matiereSlug}/`));
  const totalQuizMat = quizMat.reduce((sum, [, p]) => sum + p.nombreQuizCompletes, 0);
  const scoreMoyenMat = totalQuizMat > 0
    ? Math.round(quizMat.reduce((sum, [, p]) => sum + p.scoreMoyen * p.nombreQuizCompletes, 0) / totalQuizMat)
    : 0;
  const aParfaitMat = historique.some(
    (e) => e.matiereSlug === matiereSlug && e.score === 100,
  );

  check(`apprenti-${matiereSlug}`, totalQuizMat >= 3);
  check(`expert-${matiereSlug}`,   totalQuizMat >= 5 && scoreMoyenMat >= 80);
  check(`as-${matiereSlug}`,       aParfaitMat);

  return nouveaux;
}

// ─── Entrée principale ─────────────────────────────────────────────────────────

export function enregistrerQuizGamification(params: {
  matiereSlug: string;
  chapitreSlug: string;
  scorePourcentage: number;
  modeControle: boolean;
}): ResultatGamification {
  if (typeof window === "undefined") {
    return { xpGagne: 0, nouveauNiveau: null, nouveauxBadges: [], xpTotal: 0, niveauActuel: 1 };
  }

  const { matiereSlug, chapitreSlug, scorePourcentage, modeControle } = params;
  const profil   = getProfilGamification();
  const aujourd  = getDateAujourdhuiISO();
  const cleQuiz  = `${matiereSlug}/${chapitreSlug}`;

  // Streak
  const nouveauStreak = mettreAJourStreak(profil, aujourd);
  const streakActif   = profil.dernierQuizDate === hierISO(aujourd); // bonus XP si nouvel jour avec streak

  // Reset quotidien si nouveau jour
  const estNouveauJour   = profil.dernierQuizDate !== aujourd;
  const quizXpDuJour     = estNouveauJour ? [] : profil.quizXpDuJour;
  const xpDuJour         = estNouveauJour ? 0  : profil.xpDuJour;

  // Déduplication et plafond
  const dejaGagneXP   = quizXpDuJour.includes(cleQuiz);
  const plafondAtteint = xpDuJour >= PLAFOND_XP_JOUR;

  let xpGagne           = 0;
  let quizXpDuJourFinal = quizXpDuJour;
  let xpDuJourFinal     = xpDuJour;

  if (!dejaGagneXP && !plafondAtteint) {
    const xpCalcule  = calculerXPBrut(scorePourcentage, modeControle, streakActif);
    xpGagne          = Math.min(xpCalcule, PLAFOND_XP_JOUR - xpDuJour);
    quizXpDuJourFinal = [...quizXpDuJour, cleQuiz];
    xpDuJourFinal    = xpDuJour + xpGagne;
  }

  const ancienNiveau   = getNiveauFromXP(profil.xpTotal).numero;
  const nouveauXPTotal = profil.xpTotal + xpGagne;
  const niveauApres    = getNiveauFromXP(nouveauXPTotal);
  const levelUp        = niveauApres.numero > ancienNiveau ? niveauApres.numero : null;

  // Profil intermédiaire (streak à jour) pour la vérification des badges
  const profilInter: ProfilGamification = {
    ...profil,
    xpTotal:       nouveauXPTotal,
    dernierQuizDate: aujourd,
    streakJours:   nouveauStreak,
    xpDuJour:      xpDuJourFinal,
    quizXpDuJour:  quizXpDuJourFinal,
  };

  const nouveauxBadgeIds = verifierNouveauxBadges(profilInter, matiereSlug, nouveauXPTotal);
  const nouveauxBadges: BadgeDebloque[] = nouveauxBadgeIds.map((id) => ({
    id,
    dateObtention: aujourd,
  }));

  saveProfilGamification({
    ...profilInter,
    badgesDebloques: [...profil.badgesDebloques, ...nouveauxBadges],
  });

  return {
    xpGagne,
    nouveauNiveau: levelUp,
    nouveauxBadges: nouveauxBadgeIds,
    xpTotal:       nouveauXPTotal,
    niveauActuel:  niveauApres.numero,
  };
}
