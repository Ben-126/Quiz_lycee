export interface Competence {
  id: string;
  titre: string;
}

export interface Chapitre {
  slug: string;
  titre: string;
  competences: Competence[];
}

export interface Matiere {
  slug: string;
  nom: string;
  emoji: string;
  couleur: string;
  chapitres: Chapitre[];
}

export type TypeQuestion = "qcm" | "vrai_faux" | "reponse_courte";

export interface ExplicationAvancee {
  etapes?: string[];
  methode?: string;
  erreurs_frequentes?: string[];
}

export interface QuestionQCM {
  type: "qcm";
  question: string;
  options: string[];
  reponseCorrecte: string;
  explication: string;
  explicationAvancee?: ExplicationAvancee;
}

export interface QuestionVraiFaux {
  type: "vrai_faux";
  question: string;
  reponseCorrecte: boolean;
  explication: string;
  explicationAvancee?: ExplicationAvancee;
}

export interface QuestionReponseCourte {
  type: "reponse_courte";
  question: string;
  reponseCorrecte: string;
  explication: string;
  explicationAvancee?: ExplicationAvancee;
}

export type Question = QuestionQCM | QuestionVraiFaux | QuestionReponseCourte;

export interface Quiz {
  matiere: string;
  chapitre: string;
  questions: Question[];
}

export type NiveauCorrection = "correct" | "partiel" | "incorrect";

export interface FeedbackDetaille {
  pointsPositifs?: string;   // Ce qui est correct dans la réponse
  pointsManquants?: string;  // Ce qui manque ou est inexact
  pourquoi?: string;         // Pourquoi c'est faux, lié à la réponse de l'élève
}

export interface ReponseUtilisateur {
  questionIndex: number;
  reponse: string | boolean;
  correcte: boolean;
  niveauCorrection: NiveauCorrection;
  tempsMs: number;
  pointsObtenus: number; // 0-100
}

export interface ResultatQuiz {
  score: number;
  total: number;
  reponses: ReponseUtilisateur[];
}

export type ModeQuiz = "entrainement" | "controle" | "chrono";

export interface BadgeDebloque {
  id: string;
  dateObtention: string; // "YYYY-MM-DD"
}

export interface ProfilGamification {
  xpTotal: number;
  dernierQuizDate: string | null; // "YYYY-MM-DD"
  streakJours: number;
  badgesDebloques: BadgeDebloque[];
  xpDuJour: number;          // XP cumulés aujourd'hui (plafond 150)
  quizXpDuJour: string[];    // "matiereSlug/chapitreSlug" ayant déjà rapporté XP aujourd'hui
  gelsRestants: number;      // 0-3, gels disponibles ce mois
  gelsUtilises: number;      // gels utilisés ce mois (pour affichage historique)
  dateDerniereRechargeGels: string | null; // "YYYY-MM" (ex: "2026-04")
  joursJoues: string[];      // dates "YYYY-MM-DD" où un quiz a été fait (calendrier)
  joursGeles: string[];      // dates "YYYY-MM-DD" où un gel a été utilisé automatiquement
}

export interface ResultatGamification {
  xpGagne: number;
  nouveauNiveau: number | null; // numéro du nouveau niveau, null si pas de level-up
  nouveauxBadges: string[];     // IDs des badges débloqués
  xpTotal: number;
  niveauActuel: number;
}

// ─── Types sociaux ─────────────────────────────────────────────────────────────

export interface ProfilPublic {
  id: string;
  pseudo: string;
  xp_total: number;
  niveau: number;
  streak_jours: number;
  dernier_quiz_date: string | null;
  created_at: string;
}

export type StatutAmitie = "pending" | "accepted";

export interface Amitie {
  id: string;
  user_id: string;
  friend_id: string;
  status: StatutAmitie;
  created_at: string;
  profil?: ProfilPublic; // profil de l'autre utilisateur, jointure optionnelle
}

export interface Defi {
  id: string;
  creator_id: string;
  target_friend_id: string | null;
  chapitre_slug: string;
  matiere_slug: string;
  niveau_scolaire: string;
  time_limit_sec: number;
  expires_at: string;
  created_at: string;
  createur?: ProfilPublic;
}

export interface ResultatDefi {
  id: string;
  challenge_id: string;
  user_id: string;
  score: number;
  time_sec: number;
  completed_at: string;
  profil?: ProfilPublic;
}

export type TypeNotification =
  | "friend_request"
  | "challenge_received"
  | "challenge_completed"
  | "streak_rappel"
  | "streak_perdu"
  | "streak_gel_utilise";

export interface Notification {
  id: string;
  user_id: string;
  type: TypeNotification;
  payload: Record<string, unknown> | null;
  lu: boolean;
  created_at: string;
}

export interface EntreeClassement {
  id: string;
  pseudo: string;
  xp_total: number;
  niveau: number;
  streak_jours: number;
  rang?: number;
}
