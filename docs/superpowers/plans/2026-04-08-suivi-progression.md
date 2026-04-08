# Suivi de Progression V1 — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ajouter un suivi de progression complet : indicateurs de maîtrise sur les chapitres, statistiques et graphiques par matière, historique des quiz, page `/progression` dédiée.

**Architecture:** Nouvelle clé localStorage `quiz-history` pour l'historique daté, sans toucher à `quiz-performances`. Composants `"use client"` avec `useEffect` pour lire le localStorage sans erreur d'hydratation Next.js. Graphiques Recharts avec `mounted` guard pour éviter les erreurs SSR.

**Tech Stack:** Next.js 15 App Router, TypeScript, Recharts, TailwindCSS, localStorage

---

## Fichiers créés / modifiés

| Fichier | Action |
|---------|--------|
| `src/lib/history.ts` | Créer — lecture/écriture `quiz-history` |
| `src/lib/performance.ts` | Modifier — exporter `getToutesPerformances`, enrichir `sauvegarderPerformance` avec meta |
| `src/app/[niveau]/[matiere]/[chapitre]/quiz/page.tsx` | Modifier — passer `matiereName` à QuizRunner |
| `src/components/quiz/QuizRunner.tsx` | Modifier — accepter `matiereName`, passer meta à `sauvegarderPerformance` |
| `src/components/progression/IndicateurMaitrise.tsx` | Créer — badge couleur + barre de progression (presentational) |
| `src/components/navigation/ChapitreCard.tsx` | Modifier — accepter prop `progression` optionnelle |
| `src/components/navigation/ChapitresAvecProgression.tsx` | Créer — wrapper client qui lit localStorage et enrichit les ChapitreCards |
| `src/app/[niveau]/[matiere]/page.tsx` | Modifier — utiliser `ChapitresAvecProgression` |
| `src/components/progression/StatsMatiere.tsx` | Créer — résumé stats matière (client) |
| `src/components/progression/GraphiqueChapitres.tsx` | Créer — BarChart horizontal Recharts |
| `src/components/progression/GraphiqueEvolution.tsx` | Créer — LineChart Recharts |
| `src/components/progression/HistoriqueQuiz.tsx` | Créer — liste historique groupée par date |
| `src/app/progression/page.tsx` | Créer — page `/progression` complète |
| `src/components/navigation/Header.tsx` | Modifier — ajouter lien Progression |

---

## Task 1 : Installer Recharts

**Files:**
- Modify: `package.json` (via npm)

- [ ] **Step 1 : Installer la dépendance**

```bash
npm install recharts
```

Expected output: `added X packages` sans erreurs.

- [ ] **Step 2 : Vérifier l'installation**

```bash
node -e "require('recharts'); console.log('OK')"
```

Expected: `OK`

- [ ] **Step 3 : Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: installer recharts pour les graphiques de progression"
```

---

## Task 2 : Couche données — history.ts + mise à jour performance.ts + QuizRunner + QuizPage

**Files:**
- Create: `src/lib/history.ts`
- Modify: `src/lib/performance.ts`
- Modify: `src/components/quiz/QuizRunner.tsx`
- Modify: `src/app/[niveau]/[matiere]/[chapitre]/quiz/page.tsx`

- [ ] **Step 1 : Créer `src/lib/history.ts`**

```typescript
export interface EntreeHistorique {
  date: string;        // ISO 8601, ex: "2026-04-08T14:32:00.000Z"
  niveau: string;      // "seconde" | "premiere" | "terminale"
  matiereSlug: string;
  matiereName: string;
  chapitreSlug: string;
  chapitreNom: string;
  score: number;       // pourcentage 0–100
}

const HISTORY_KEY = "quiz-history";
const MAX_ENTRIES = 100;

export function getHistorique(): EntreeHistorique[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as EntreeHistorique[]) : [];
  } catch {
    return [];
  }
}

export function ajouterHistorique(entree: EntreeHistorique): void {
  try {
    const history = getHistorique();
    const updated = [entree, ...history].slice(0, MAX_ENTRIES);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch {
    // localStorage indisponible ou saturé
  }
}
```

- [ ] **Step 2 : Mettre à jour `src/lib/performance.ts`**

Ajouter l'import en haut du fichier, ajouter `getToutesPerformances`, et enrichir `sauvegarderPerformance` avec un paramètre `meta` optionnel :

```typescript
import { ajouterHistorique } from "./history";

export type NiveauDifficulte = "debutant" | "intermediaire" | "avance";

export interface PerformanceChapitre {
  nombreQuizCompletes: number;
  scoreMoyen: number;
  derniersScores: number[];
  dernieresErreurs: string[];
}

const STORAGE_KEY = "quiz-performances";
const MAX_SCORES = 5;

function getStorage(): Record<string, PerformanceChapitre> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, PerformanceChapitre>) : {};
  } catch {
    return {};
  }
}

function saveStorage(data: Record<string, PerformanceChapitre>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // localStorage indisponible (ex: mode privé saturé)
  }
}

function clePerformance(matiereSlug: string, chapitreSlug: string): string {
  return `${matiereSlug}/${chapitreSlug}`;
}

export function getToutesPerformances(): Record<string, PerformanceChapitre> {
  return getStorage();
}

export function getPerformance(
  matiereSlug: string,
  chapitreSlug: string
): PerformanceChapitre | null {
  const data = getStorage();
  return data[clePerformance(matiereSlug, chapitreSlug)] ?? null;
}

export function sauvegarderPerformance(
  matiereSlug: string,
  chapitreSlug: string,
  scorePourcentage: number,
  questionsRatees: string[],
  meta?: { niveau: string; matiereName: string; chapitreNom: string }
): void {
  const data = getStorage();
  const cle = clePerformance(matiereSlug, chapitreSlug);
  const existant = data[cle];

  const derniersScores = existant
    ? [...existant.derniersScores.slice(-(MAX_SCORES - 1)), scorePourcentage]
    : [scorePourcentage];

  const scoreMoyen = Math.round(
    derniersScores.reduce((a, b) => a + b, 0) / derniersScores.length
  );

  data[cle] = {
    nombreQuizCompletes: (existant?.nombreQuizCompletes ?? 0) + 1,
    scoreMoyen,
    derniersScores,
    dernieresErreurs: questionsRatees,
  };

  saveStorage(data);

  if (meta) {
    ajouterHistorique({
      date: new Date().toISOString(),
      niveau: meta.niveau,
      matiereSlug,
      matiereName: meta.matiereName,
      chapitreSlug,
      chapitreNom: meta.chapitreNom,
      score: scorePourcentage,
    });
  }
}

export function getNiveau(performance: PerformanceChapitre | null): NiveauDifficulte {
  if (!performance || performance.nombreQuizCompletes === 0) return "intermediaire";
  if (performance.scoreMoyen >= 80) return "avance";
  if (performance.scoreMoyen >= 40) return "intermediaire";
  return "debutant";
}
```

- [ ] **Step 3 : Mettre à jour `src/components/quiz/QuizRunner.tsx`**

Ajouter `matiereName` dans l'interface props et le passer à `sauvegarderPerformance` :

Remplacer l'interface :
```typescript
interface QuizRunnerProps {
  matiereSlug: string;
  chapitreSlug: string;
  titreChapitre: string;
  niveauLycee?: string;
  matiereName?: string;
}
```

Remplacer la signature du composant :
```typescript
export default function QuizRunner({ matiereSlug, chapitreSlug, titreChapitre, niveauLycee = "seconde", matiereName = "" }: QuizRunnerProps) {
```

Remplacer le corps de `handleTerminer` :
```typescript
const handleTerminer = useCallback((reponsesFinales: ReponseUtilisateur[]) => {
  const totalPoints = reponsesFinales.reduce((sum, r) => sum + r.pointsObtenus, 0);
  const maxPoints = questions.length * 100;
  const pourcentage = Math.round((totalPoints / maxPoints) * 100);
  const ratees = reponsesFinales
    .filter((r) => !r.correcte)
    .map((r) => questions[r.questionIndex]?.question ?? "")
    .filter(Boolean);

  sauvegarderPerformance(matiereSlug, chapitreSlug, pourcentage, ratees, {
    niveau: niveauLycee,
    matiereName,
    chapitreNom: titreChapitre,
  });
  setEtat("termine");
}, [questions, matiereSlug, chapitreSlug, niveauLycee, matiereName, titreChapitre]);
```

- [ ] **Step 4 : Mettre à jour `src/app/[niveau]/[matiere]/[chapitre]/quiz/page.tsx`**

Ajouter `matiereName` dans le `<QuizRunner>` :

```tsx
<QuizRunner
  matiereSlug={matiereSlug}
  chapitreSlug={chapitreSlug}
  titreChapitre={chapitre.titre}
  niveauLycee={niveauSlug}
  matiereName={matiere.nom}
/>
```

- [ ] **Step 5 : Commit**

```bash
git add src/lib/history.ts src/lib/performance.ts src/components/quiz/QuizRunner.tsx src/app/[niveau]/[matiere]/[chapitre]/quiz/page.tsx
git commit -m "feat: couche données historique — history.ts + meta dans sauvegarderPerformance"
```

---

## Task 3 : Composant IndicateurMaitrise

**Files:**
- Create: `src/components/progression/IndicateurMaitrise.tsx`

- [ ] **Step 1 : Créer `src/components/progression/IndicateurMaitrise.tsx`**

```tsx
interface IndicateurMaitriseProps {
  scoreMoyen: number | null;
  nombreQuiz: number;
}

export default function IndicateurMaitrise({ scoreMoyen, nombreQuiz }: IndicateurMaitriseProps) {
  if (nombreQuiz === 0 || scoreMoyen === null) {
    return (
      <div className="flex items-center gap-1.5 mt-1.5">
        <span className="w-2 h-2 rounded-full bg-gray-300 inline-block" />
        <span className="text-xs text-gray-400">Pas encore fait</span>
      </div>
    );
  }

  const couleurBarre =
    scoreMoyen >= 80 ? "bg-green-500" :
    scoreMoyen < 40 ? "bg-red-500" : "bg-orange-400";

  const couleurTexte =
    scoreMoyen >= 80 ? "text-green-700" :
    scoreMoyen < 40 ? "text-red-600" : "text-orange-600";

  const couleurFond =
    scoreMoyen >= 80 ? "bg-green-100" :
    scoreMoyen < 40 ? "bg-red-50" : "bg-orange-50";

  const badge =
    scoreMoyen >= 80 ? "🟢" :
    scoreMoyen < 40 ? "🔴" : "🟡";

  return (
    <div className="mt-1.5 space-y-1">
      <span className={`inline-block text-xs font-semibold px-1.5 py-0.5 rounded-full ${couleurFond} ${couleurTexte}`}>
        {badge} {scoreMoyen}% · {nombreQuiz} quiz
      </span>
      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${couleurBarre} rounded-full transition-all duration-700`}
          style={{ width: `${scoreMoyen}%` }}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 2 : Commit**

```bash
git add src/components/progression/IndicateurMaitrise.tsx
git commit -m "feat: composant IndicateurMaitrise — badge couleur + barre de progression"
```

---

## Task 4 : Enrichir ChapitreCard + créer ChapitresAvecProgression + mettre à jour MatierePage

**Files:**
- Modify: `src/components/navigation/ChapitreCard.tsx`
- Create: `src/components/navigation/ChapitresAvecProgression.tsx`
- Modify: `src/app/[niveau]/[matiere]/page.tsx`

- [ ] **Step 1 : Mettre à jour `src/components/navigation/ChapitreCard.tsx`**

Remplacer le fichier entier :

```tsx
import Link from "next/link";
import type { Matiere } from "@/types";
import IndicateurMaitrise from "@/components/progression/IndicateurMaitrise";

interface ChapitreCardProps {
  matiere: Matiere;
  chapitre: Matiere["chapitres"][0];
  niveau: string;
  progression?: { scoreMoyen: number; nombreQuiz: number } | null;
}

export default function ChapitreCard({ matiere, chapitre, niveau, progression }: ChapitreCardProps) {
  return (
    <Link
      href={`/${niveau}/${matiere.slug}/${chapitre.slug}/quiz`}
      data-testid="chapitre-card"
      className="group flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-200"
    >
      <div className={`${matiere.couleur} rounded-lg p-2 shrink-0`}>
        <span className="text-2xl" role="img" aria-label={matiere.nom}>{matiere.emoji}</span>
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-800 group-hover:text-indigo-700 transition-colors text-sm leading-tight">
          {chapitre.titre}
        </h3>
        <p className="text-xs text-gray-400 mt-0.5">
          {chapitre.competences.length} compétences · 5 questions
        </p>
        <IndicateurMaitrise
          scoreMoyen={progression?.scoreMoyen ?? null}
          nombreQuiz={progression?.nombreQuiz ?? 0}
        />
      </div>
      <svg
        className="text-gray-300 group-hover:text-indigo-400 transition-colors shrink-0"
        width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2"
      >
        <path d="M8 4l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </Link>
  );
}
```

- [ ] **Step 2 : Créer `src/components/navigation/ChapitresAvecProgression.tsx`**

```tsx
"use client";
import { useEffect, useState } from "react";
import ChapitreCard from "./ChapitreCard";
import type { Matiere } from "@/types";
import { getToutesPerformances } from "@/lib/performance";

interface ChapitresAvecProgressionProps {
  matiere: Matiere;
  niveau: string;
}

type ProgressionMap = Record<string, { scoreMoyen: number; nombreQuiz: number } | null>;

export default function ChapitresAvecProgression({ matiere, niveau }: ChapitresAvecProgressionProps) {
  const [progressions, setProgressions] = useState<ProgressionMap>({});

  useEffect(() => {
    const data = getToutesPerformances();
    const result: ProgressionMap = {};
    for (const chapitre of matiere.chapitres) {
      const cle = `${matiere.slug}/${chapitre.slug}`;
      const perf = data[cle];
      result[chapitre.slug] =
        perf && perf.nombreQuizCompletes > 0
          ? { scoreMoyen: perf.scoreMoyen, nombreQuiz: perf.nombreQuizCompletes }
          : null;
    }
    setProgressions(result);
  }, [matiere]);

  return (
    <div className="space-y-3" data-testid="liste-chapitres">
      {matiere.chapitres.map((chapitre) => (
        <ChapitreCard
          key={chapitre.slug}
          niveau={niveau}
          matiere={matiere}
          chapitre={chapitre}
          progression={progressions[chapitre.slug] ?? null}
        />
      ))}
    </div>
  );
}
```

- [ ] **Step 3 : Mettre à jour `src/app/[niveau]/[matiere]/page.tsx`**

Remplacer le fichier entier :

```tsx
import { notFound } from "next/navigation";
import Header from "@/components/navigation/Header";
import ChapitresAvecProgression from "@/components/navigation/ChapitresAvecProgression";
import StatsMatiere from "@/components/progression/StatsMatiere";
import { NIVEAUX, getMatiereBySlugAndNiveau, type Niveau } from "@/data/programmes";

interface Props {
  params: Promise<{ niveau: string; matiere: string }>;
}

export async function generateStaticParams() {
  return NIVEAUX.flatMap((n) =>
    n.matieres.map((m) => ({ niveau: n.slug, matiere: m.slug }))
  );
}

export default async function MatierePage({ params }: Props) {
  const { niveau: niveauSlug, matiere: matiereSlug } = await params;

  const niveauInfo = NIVEAUX.find((n) => n.slug === niveauSlug);
  if (!niveauInfo) notFound();

  const matiere = getMatiereBySlugAndNiveau(niveauSlug as Niveau, matiereSlug);
  if (!matiere) notFound();

  return (
    <div className="flex flex-col min-h-screen">
      <Header titre={matiere.nom} showBack backHref="/" />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6">
        <div className="flex items-center gap-3 mb-2">
          <div className={`${matiere.couleur} rounded-xl p-3`}>
            <span className="text-3xl">{matiere.emoji}</span>
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
              {niveauInfo.emoji} {niveauInfo.label}
            </p>
            <h1 className="text-xl font-bold text-gray-800">{matiere.nom}</h1>
            <p className="text-sm text-gray-500">{matiere.chapitres.length} chapitres disponibles</p>
          </div>
        </div>

        <div className="mt-6">
          <StatsMatiere matiereSlug={matiereSlug} chapitres={matiere.chapitres} />
        </div>

        <p className="text-sm text-gray-600 font-medium mb-3 mt-2">Choisir un chapitre :</p>

        <ChapitresAvecProgression matiere={matiere} niveau={niveauSlug} />
      </main>
    </div>
  );
}
```

- [ ] **Step 4 : Commit**

```bash
git add src/components/navigation/ChapitreCard.tsx src/components/navigation/ChapitresAvecProgression.tsx src/app/[niveau]/[matiere]/page.tsx
git commit -m "feat: IndicateurMaitrise sur les ChapitreCards avec wrapper client"
```

---

## Task 5 : Composant StatsMatiere

**Files:**
- Create: `src/components/progression/StatsMatiere.tsx`

- [ ] **Step 1 : Créer `src/components/progression/StatsMatiere.tsx`**

```tsx
"use client";
import { useEffect, useState } from "react";
import { getToutesPerformances } from "@/lib/performance";
import type { Chapitre } from "@/types";

interface StatsMatiereProps {
  matiereSlug: string;
  chapitres: Chapitre[];
}

interface Stats {
  totalQuiz: number;
  scoreMoyen: number | null;
  chapitresMaitrises: number;
}

export default function StatsMatiere({ matiereSlug, chapitres }: StatsMatiereProps) {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    const data = getToutesPerformances();
    let totalQuiz = 0;
    let sommeScores = 0;
    let chapitresAvecDonnees = 0;
    let chapitresMaitrises = 0;

    for (const chapitre of chapitres) {
      const cle = `${matiereSlug}/${chapitre.slug}`;
      const perf = data[cle];
      if (perf && perf.nombreQuizCompletes > 0) {
        totalQuiz += perf.nombreQuizCompletes;
        sommeScores += perf.scoreMoyen;
        chapitresAvecDonnees++;
        if (perf.scoreMoyen >= 80) chapitresMaitrises++;
      }
    }

    setStats({
      totalQuiz,
      scoreMoyen: chapitresAvecDonnees > 0 ? Math.round(sommeScores / chapitresAvecDonnees) : null,
      chapitresMaitrises,
    });
  }, [matiereSlug, chapitres]);

  if (!stats || stats.totalQuiz === 0) return null;

  return (
    <div className="flex gap-3 p-3 bg-indigo-50 rounded-xl border border-indigo-100 mb-4">
      <div className="flex-1 text-center">
        <p className="text-lg font-bold text-indigo-700">{stats.totalQuiz}</p>
        <p className="text-xs text-indigo-500">quiz complétés</p>
      </div>
      <div className="w-px bg-indigo-200" />
      <div className="flex-1 text-center">
        <p className="text-lg font-bold text-indigo-700">{stats.scoreMoyen ?? "—"}%</p>
        <p className="text-xs text-indigo-500">score moyen</p>
      </div>
      <div className="w-px bg-indigo-200" />
      <div className="flex-1 text-center">
        <p className="text-lg font-bold text-indigo-700">{stats.chapitresMaitrises}/{chapitres.length}</p>
        <p className="text-xs text-indigo-500">maîtrisés</p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2 : Commit**

```bash
git add src/components/progression/StatsMatiere.tsx
git commit -m "feat: composant StatsMatiere — résumé quiz/score/maîtrise"
```

---

## Task 6 : Composant GraphiqueChapitres (BarChart Recharts)

**Files:**
- Create: `src/components/progression/GraphiqueChapitres.tsx`

- [ ] **Step 1 : Créer `src/components/progression/GraphiqueChapitres.tsx`**

```tsx
"use client";
import { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip,
} from "recharts";

interface ChapitreData {
  slug: string;
  nom: string;
  scoreMoyen: number | null;
}

interface GraphiqueChapitresProps {
  chapitres: ChapitreData[];
  chapitreActifSlug: string | null;
  onSelectChapitre: (slug: string) => void;
}

export default function GraphiqueChapitres({
  chapitres,
  chapitreActifSlug,
  onSelectChapitre,
}: GraphiqueChapitresProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-[200px] bg-gray-50 rounded-xl animate-pulse" />;
  }

  if (chapitres.length === 0) {
    return (
      <div className="h-[200px] flex items-center justify-center text-gray-400 text-sm">
        Aucun chapitre disponible
      </div>
    );
  }

  const data = chapitres.map((c) => ({
    slug: c.slug,
    nom: c.nom.length > 18 ? c.nom.slice(0, 18) + "…" : c.nom,
    score: c.scoreMoyen ?? 0,
    nonFait: c.scoreMoyen === null,
  }));

  return (
    <ResponsiveContainer width="100%" height={Math.max(200, chapitres.length * 36)}>
      <BarChart
        layout="vertical"
        data={data}
        margin={{ top: 0, right: 24, left: 0, bottom: 0 }}
        onClick={(payload) => {
          if (payload?.activePayload?.[0]?.payload?.slug) {
            onSelectChapitre(payload.activePayload[0].payload.slug);
          }
        }}
      >
        <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} tickFormatter={(v) => `${v}%`} />
        <YAxis type="category" dataKey="nom" tick={{ fontSize: 10 }} width={90} />
        <Tooltip formatter={(value: number) => [`${value}%`, "Score moyen"]} />
        <Bar dataKey="score" radius={[0, 4, 4, 0]} cursor="pointer" isAnimationActive>
          {data.map((entry) => (
            <Cell
              key={entry.slug}
              fill={
                entry.slug === chapitreActifSlug
                  ? "#6366f1"
                  : entry.nonFait
                  ? "#e5e7eb"
                  : "#a5b4fc"
              }
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
```

- [ ] **Step 2 : Commit**

```bash
git add src/components/progression/GraphiqueChapitres.tsx
git commit -m "feat: composant GraphiqueChapitres — BarChart Recharts horizontal"
```

---

## Task 7 : Composant GraphiqueEvolution (LineChart Recharts)

**Files:**
- Create: `src/components/progression/GraphiqueEvolution.tsx`

- [ ] **Step 1 : Créer `src/components/progression/GraphiqueEvolution.tsx`**

```tsx
"use client";
import { useState, useEffect } from "react";
import {
  LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, ReferenceLine, Dot,
} from "recharts";
import type { EntreeHistorique } from "@/lib/history";

interface GraphiqueEvolutionProps {
  entrees: EntreeHistorique[];
}

export default function GraphiqueEvolution({ entrees }: GraphiqueEvolutionProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-[200px] bg-gray-50 rounded-xl animate-pulse" />;
  }

  if (entrees.length === 0) {
    return (
      <div className="h-[200px] flex flex-col items-center justify-center gap-2 text-gray-400">
        <p className="text-3xl">📈</p>
        <p className="text-sm">Clique sur un chapitre pour voir son évolution</p>
      </div>
    );
  }

  const data = entrees.slice(-5).map((e) => ({
    date: new Date(e.date).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
    }),
    score: e.score,
  }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
        <XAxis dataKey="date" tick={{ fontSize: 10 }} />
        <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} tickFormatter={(v) => `${v}%`} />
        <Tooltip formatter={(value: number) => [`${value}%`, "Score"]} />
        <ReferenceLine y={80} stroke="#22c55e" strokeDasharray="4 2" label={{ value: "80%", fontSize: 9, fill: "#22c55e" }} />
        <Line
          type="monotone"
          dataKey="score"
          stroke="#6366f1"
          strokeWidth={2}
          dot={<Dot r={4} fill="#6366f1" />}
          activeDot={{ r: 6 }}
          isAnimationActive
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
```

- [ ] **Step 2 : Commit**

```bash
git add src/components/progression/GraphiqueEvolution.tsx
git commit -m "feat: composant GraphiqueEvolution — LineChart Recharts avec ligne 80%"
```

---

## Task 8 : Composant HistoriqueQuiz

**Files:**
- Create: `src/components/progression/HistoriqueQuiz.tsx`

- [ ] **Step 1 : Créer `src/components/progression/HistoriqueQuiz.tsx`**

```tsx
import type { EntreeHistorique } from "@/lib/history";

interface HistoriqueQuizProps {
  entrees: EntreeHistorique[];
}

function labelDate(isoDate: string): string {
  const entreeDate = new Date(isoDate).toDateString();
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  if (entreeDate === today) return "Aujourd'hui";
  if (entreeDate === yesterday) return "Hier";
  return new Date(isoDate).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function badgeScore(score: number): string {
  if (score >= 80) return "🟢";
  if (score >= 40) return "🟡";
  return "🔴";
}

export default function HistoriqueQuiz({ entrees }: HistoriqueQuizProps) {
  if (entrees.length === 0) {
    return (
      <p className="text-sm text-gray-400 text-center py-4">
        Aucun quiz complété pour l'instant.
      </p>
    );
  }

  // Grouper par label de date
  const groups: { label: string; entrees: EntreeHistorique[] }[] = [];
  for (const entree of entrees) {
    const label = labelDate(entree.date);
    const existing = groups.find((g) => g.label === label);
    if (existing) {
      existing.entrees.push(entree);
    } else {
      groups.push({ label, entrees: [entree] });
    }
  }

  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <div key={group.label}>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
            {group.label}
          </p>
          <div className="space-y-2">
            {group.entrees.map((e, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {e.matiereName} · {e.chapitreNom}
                  </p>
                  <p className="text-xs text-gray-400 capitalize">{e.niveau}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-3">
                  <span className="text-sm font-bold text-gray-700">{e.score}%</span>
                  <span>{badgeScore(e.score)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 2 : Commit**

```bash
git add src/components/progression/HistoriqueQuiz.tsx
git commit -m "feat: composant HistoriqueQuiz — liste groupée par date"
```

---

## Task 9 : Page /progression

**Files:**
- Create: `src/app/progression/page.tsx`

- [ ] **Step 1 : Créer `src/app/progression/page.tsx`**

```tsx
"use client";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Header from "@/components/navigation/Header";
import StatsMatiere from "@/components/progression/StatsMatiere";
import GraphiqueChapitres from "@/components/progression/GraphiqueChapitres";
import GraphiqueEvolution from "@/components/progression/GraphiqueEvolution";
import HistoriqueQuiz from "@/components/progression/HistoriqueQuiz";
import { NIVEAUX, type Niveau } from "@/data/programmes";
import { getToutesPerformances, type PerformanceChapitre } from "@/lib/performance";
import { getHistorique, type EntreeHistorique } from "@/lib/history";

export default function ProgressionPage() {
  const [niveauActif, setNiveauActif] = useState<Niveau>("seconde");
  const [matiereActiveSlug, setMatiereActiveSlug] = useState<string>(
    NIVEAUX.find((n) => n.slug === "seconde")?.matieres[0]?.slug ?? ""
  );
  const [chapitreActifSlug, setChapitreActifSlug] = useState<string | null>(null);
  const [historique, setHistorique] = useState<EntreeHistorique[]>([]);
  const [performances, setPerformances] = useState<Record<string, PerformanceChapitre>>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setHistorique(getHistorique());
    setPerformances(getToutesPerformances());
    setMounted(true);
  }, []);

  // Réinitialiser la matière quand le niveau change
  useEffect(() => {
    const niveauInfo = NIVEAUX.find((n) => n.slug === niveauActif);
    if (niveauInfo && niveauInfo.matieres.length > 0) {
      setMatiereActiveSlug(niveauInfo.matieres[0].slug);
      setChapitreActifSlug(null);
    }
  }, [niveauActif]);

  const niveauInfo = NIVEAUX.find((n) => n.slug === niveauActif)!;
  const matiereActive = niveauInfo.matieres.find((m) => m.slug === matiereActiveSlug);

  const totalQuiz = useMemo(() => {
    return Object.values(performances)
      .filter((p) => p.nombreQuizCompletes > 0)
      .reduce((sum, p) => sum + p.nombreQuizCompletes, 0);
  }, [performances]);

  const scoreMoyenGlobal = useMemo(() => {
    const avec = Object.values(performances).filter((p) => p.nombreQuizCompletes > 0);
    return avec.length > 0
      ? Math.round(avec.reduce((sum, p) => sum + p.scoreMoyen, 0) / avec.length)
      : null;
  }, [performances]);

  const chapitresData = useMemo(() => {
    if (!matiereActive) return [];
    return matiereActive.chapitres.map((c) => {
      const cle = `${matiereActiveSlug}/${c.slug}`;
      const perf = performances[cle];
      return {
        slug: c.slug,
        nom: c.titre,
        scoreMoyen: perf && perf.nombreQuizCompletes > 0 ? perf.scoreMoyen : null,
      };
    });
  }, [matiereActive, matiereActiveSlug, performances]);

  const entreesEvolution = useMemo(() => {
    if (!chapitreActifSlug) return [];
    return historique.filter(
      (e) => e.chapitreSlug === chapitreActifSlug && e.matiereSlug === matiereActiveSlug
    );
  }, [historique, chapitreActifSlug, matiereActiveSlug]);

  // Spinner pendant le montage (évite le flash de l'état vide)
  if (!mounted) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header titre="Ma Progression" showBack backHref="/" />
        <main className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        </main>
      </div>
    );
  }

  // État vide
  if (totalQuiz === 0 && historique.length === 0) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header titre="Ma Progression" showBack backHref="/" />
        <main className="flex-1 flex flex-col items-center justify-center px-4 text-center gap-4">
          <p className="text-6xl">📊</p>
          <h2 className="text-xl font-bold text-gray-800">Aucune progression pour l&apos;instant</h2>
          <p className="text-gray-500 text-sm max-w-xs">
            Lance ton premier quiz pour voir ta progression ici 🚀
          </p>
          <Link
            href="/"
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
          >
            Choisir une matière
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header titre="Ma Progression" showBack backHref="/" />
      <main className="max-w-4xl mx-auto w-full px-4 py-6 space-y-6">

        {/* Résumé global */}
        {totalQuiz > 0 && (
          <div className="flex gap-3 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100">
            <div className="flex-1 text-center">
              <p className="text-2xl font-bold text-indigo-700">{totalQuiz}</p>
              <p className="text-xs text-indigo-500">quiz complétés</p>
            </div>
            <div className="w-px bg-indigo-200" />
            <div className="flex-1 text-center">
              <p className="text-2xl font-bold text-indigo-700">
                {scoreMoyenGlobal !== null ? `${scoreMoyenGlobal}%` : "—"}
              </p>
              <p className="text-xs text-indigo-500">score moyen global</p>
            </div>
          </div>
        )}

        {/* Filtre niveau */}
        <div className="flex gap-2 flex-wrap" role="tablist">
          {NIVEAUX.map((n) => (
            <button
              key={n.slug}
              role="tab"
              aria-selected={niveauActif === n.slug}
              onClick={() => setNiveauActif(n.slug)}
              className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-colors border-2 ${
                niveauActif === n.slug
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-indigo-600 border-indigo-300 hover:border-indigo-500"
              }`}
            >
              {n.emoji} {n.label}
            </button>
          ))}
        </div>

        {/* Sélecteur matière */}
        <div className="flex gap-2 flex-wrap">
          {niveauInfo.matieres.map((m) => (
            <button
              key={m.slug}
              onClick={() => {
                setMatiereActiveSlug(m.slug);
                setChapitreActifSlug(null);
              }}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                matiereActiveSlug === m.slug
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {m.emoji} {m.nom}
            </button>
          ))}
        </div>

        {/* Stats + Graphiques */}
        {matiereActive && (
          <div className="space-y-4">
            <StatsMatiere matiereSlug={matiereActiveSlug} chapitres={matiereActive.chapitres} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Score par chapitre
                </h3>
                <GraphiqueChapitres
                  chapitres={chapitresData}
                  chapitreActifSlug={chapitreActifSlug}
                  onSelectChapitre={setChapitreActifSlug}
                />
                <p className="text-xs text-gray-400 mt-2 text-center">
                  Clique sur un chapitre pour voir son évolution →
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  {chapitreActifSlug
                    ? `Évolution — ${matiereActive.chapitres.find((c) => c.slug === chapitreActifSlug)?.titre ?? ""}`
                    : "Évolution du score"}
                </h3>
                <GraphiqueEvolution entrees={entreesEvolution} />
              </div>
            </div>
          </div>
        )}

        {/* Historique */}
        {historique.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Historique récent</h3>
            <HistoriqueQuiz entrees={historique.slice(0, 20)} />
          </div>
        )}

      </main>
    </div>
  );
}
```

- [ ] **Step 2 : Commit**

```bash
git add src/app/progression/page.tsx
git commit -m "feat: page /progression — stats globales, graphiques et historique"
```

---

## Task 10 : Mettre à jour le Header

**Files:**
- Modify: `src/components/navigation/Header.tsx`

- [ ] **Step 1 : Mettre à jour `src/components/navigation/Header.tsx`**

Remplacer le fichier entier :

```tsx
"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface HeaderProps {
  titre?: string;
  showBack?: boolean;
  backHref?: string;
}

export default function Header({ titre, showBack, backHref }: HeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (backHref) {
      router.push(backHref);
    } else {
      router.back();
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
        {showBack && (
          <button
            onClick={handleBack}
            aria-label="Retour"
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-900"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 4l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
        <Link href="/" className="flex items-center gap-2 font-bold text-lg text-indigo-700 hover:text-indigo-900">
          🎓 QuizLycée
        </Link>
        {titre && (
          <>
            <span className="text-gray-400">/</span>
            <span className="text-gray-700 font-medium text-sm truncate">{titre}</span>
          </>
        )}
        <div className="ml-auto">
          <Link
            href="/progression"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-indigo-600 hover:bg-indigo-50 transition-colors"
          >
            <span>📊</span>
            <span className="hidden sm:inline">Progression</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
```

- [ ] **Step 2 : Vérifier le build**

```bash
npm run build
```

Expected: `✓ Compiled successfully` sans erreurs TypeScript.

- [ ] **Step 3 : Commit final**

```bash
git add src/components/navigation/Header.tsx
git commit -m "feat: lien Progression dans le Header"
```

- [ ] **Step 4 : Push**

```bash
git push origin master
```

---

## Checklist de vérification finale

- [ ] Ouvrir `/` — le Header affiche "📊 Progression"
- [ ] Cliquer sur une matière — les ChapitreCards affichent ⚪ "Pas encore fait" sur tous les chapitres
- [ ] Compléter un quiz — revenir sur la matière, vérifier badge 🔴/🟡/🟢 + barre sur le chapitre
- [ ] Ouvrir `/progression` — état vide si aucun quiz, sinon stats + graphiques
- [ ] Sur `/progression` : cliquer sur une barre de chapitre → le LineChart se met à jour avec l'évolution
- [ ] Vérifier mobile (320px) : graphiques responsives, pas de débordement
