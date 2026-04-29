# Révioria — Révise avec l'IA

> Plateforme web de révision scolaire propulsée par l'IA, conçue pour les élèves de Seconde, Première et Terminale en France.

**URL de production :** https://quiz-2nd-q5pu.vercel.app

---

## Présentation

Révioria génère des quiz personnalisés alignés sur les programmes officiels du lycée général en France. L'élève choisit son niveau, une matière et un chapitre, et l'IA produit instantanément un quiz corrigé avec des explications pédagogiques détaillées. La plateforme inclut gamification, suivi de progression, révision espacée scientifique, mode social, langues vivantes et scan de copies.

**Niveaux couverts :** Seconde, Première, Terminale

**Matières couvertes :** Mathématiques, Français, Histoire-Géographie, Philosophie, SES, SVT, Physique-Chimie, NSI, EMC, Anglais, Espagnol, Allemand, Italien, Portugais

*Contenus alignés sur les programmes officiels du ministère de l'Éducation nationale.*

---

## Fonctionnalités

### Quiz & Apprentissage

- **Génération IA dynamique** : questions créées à la volée par Groq `llama-3.3-70b-versatile` selon le programme officiel
- **3 types de questions** : QCM (4 options), Vrai/Faux, Réponse courte
- **Correction immédiate** : explication détaillée, étapes de résolution, méthode, erreurs fréquentes à éviter
- **Clavier mathématique** : saisie facilitée des symboles et expressions pour les matières scientifiques
- **Adaptation de difficulté** : les questions ciblent tes points faibles (localStorage)
- **Mode mock intégré** : 98 Ko de questions pré-générées, utilisable sans clé API

### 4 Modes de Quiz

| Mode | Questions | Temps par question | Scoring |
|------|-----------|-------------------|---------|
| **Entraînement** | 5 | Illimité | Points pour la correction |
| **Contrôle** | 10 | 20 s | Basé sur le temps de réponse |
| **Chrono** | 5 | Timer global | Plus vite = plus de points |
| **Rapide** | 3 | 10 s | Intensif et difficile |

### Gamification Complète

- **XP & niveaux** : 10 niveaux du Novice (0 XP) au Maître (7 000 XP), plafond de 150 XP/jour par matière
- **Badges** : 10 badges généraux + 3 badges par matière (30+ au total), débloqués selon performances et assiduité
- **Streaks** : suivi des jours consécutifs de révision avec système de "gels" (possibilité de sauter un jour sans perdre son streak)
- **Calendrier de streak** : visualisation mensuelle des jours joués et gelés
- **Notifications** : toasts XP après chaque quiz, alertes de streak perdu ou maintenu
- **XP Bar** : barre de progression discrète dans le header

### Suivi de Progression

- **Tableau de bord** : statistiques complètes par matière (score moyen, nombre de quiz, temps moyen, taux de réussite)
- **Graphiques** : évolution du score dans le temps, scores par chapitre (Recharts)
- **Historique** : tableau de tous les quiz effectués avec dates, matières, scores et temps
- **Indicateur de maîtrise** : niveau de maîtrise par chapitre (code couleur)
- **Prédiction de note** : estimation de la note probable au bac selon les performances

### Révision Intelligente (SRS)

- **Algorithme SM-2** : répétition espacée scientifiquement prouvée (utilisée par Anki)
- **Intervalles adaptatifs** : calculés dynamiquement selon la facilité perçue (facile / bien / difficile / raté)
- **Cartes de révision** : stockées localement avec métadonnées de progression
- **Planification automatique** : les chapitres à réviser sont présentés au bon moment

### Coach IA

- **Chat pédagogique** : coach en streaming qui répond aux questions selon la matière et le chapitre
- **Contexte pédagogique** : conseils personnalisés selon l'historique de révisions
- **Fallback local** : réponses offline si l'API est indisponible

### Scan & Correction

- **OCR Vision IA** : analyse une photo d'exercice ou de copie (meta-llama/llama-4-scout)
- **Correction détaillée** : note, explication, étapes de résolution, conseils méthodologiques
- **Format accepté** : image base64 (photo de smartphone)

### Langues Vivantes

- **5 langues** : Anglais, Espagnol, Allemand, Italien, Portugais
- **Reconnaissance vocale** : transcription audio en temps réel via Whisper
- **Feedback de prononciation** : comparaison mot par mot avec la cible, score de similarité
- **Dialogue conversationnel** : coach en streaming qui répond dans la langue cible

### Mode Social

- **Classement** : global et amis, triés par XP total, niveau et streak
- **Système d'amis** : envoi/acceptation de demandes, liste des amis, recherche par pseudo
- **Défis** : lancer un défi à un ami (matière + chapitre), résultats comparés, expiration 7 jours
- **Notifications** : demande d'ami, défi reçu, défi complété, streak perdu

### Authentification & Comptes

- **Email / mot de passe** : inscription et connexion via Supabase Auth
- **OAuth Google** : connexion rapide en un clic
- **Pseudo unique** : identifiant social affiché dans le classement
- **Compte mineur** : capture de l'email parental à l'inscription (RGPD)

### Conformité RGPD

- **Consentement granulaire** : bandeau cookies avec choix par catégorie
- **Retrait de consentement** : possible à tout moment depuis les paramètres
- **Export de données** : téléchargement JSON de toutes les données personnelles (Art. 20 RGPD)
- **Suppression de compte** : effacement complet en cascade (profil, badges, historique, tout)
- **Données essentielles / non-essentielles** : séparation stricte, les préférences critiques sont conservées même sans consentement
- **DPIA** : analyse d'impact vie privée documentée (`docs/DPIA.md`)

### PWA & Offline

- **Progressive Web App** : installable sur mobile (manifest.json)
- **Service Worker** : caching et support hors-ligne
- **Stockage local** : quiz-history, gamification, paramètres et révision espacée en localStorage

---

## Stack Technique

| Technologie | Rôle |
|-------------|------|
| **Next.js 16** (App Router) | Framework web full-stack |
| **React 19** | Interface utilisateur |
| **TypeScript 5** | Typage statique |
| **Tailwind CSS 4** | Styles (PostCSS) |
| **Groq API** (`llama-3.3-70b-versatile`) | Génération quiz, coaching, dialogue |
| **Groq Vision** (`llama-4-scout`) | Scan et correction de copies |
| **Whisper** | Transcription audio (prononciation) |
| **Supabase** | Base de données PostgreSQL, authentification, RLS |
| **Upstash Redis** | Rate limiting distribué |
| **Zod** | Validation des schémas de données |
| **Recharts** | Graphiques de progression |
| **Playwright** | Tests End-to-End |

---

## Structure du Projet

```
projet-Révioria/
├── src/
│   ├── app/
│   │   ├── page.tsx                      # Landing page
│   │   ├── app/page.tsx                  # Hub principal (sélecteur niveau/matière)
│   │   ├── [niveau]/[matiere]/           # Chapitres d'une matière
│   │   │   └── [chapitre]/quiz/          # Quiz runner
│   │   ├── progression/                  # Tableau de bord & statistiques
│   │   ├── revision/                     # Révision espacée (SRS)
│   │   ├── scan/                         # Scan & correction IA
│   │   ├── langues/                      # Langues vivantes
│   │   ├── social/                       # Classement, amis, défis
│   │   ├── defi/[id]/                    # Résultats d'un défi
│   │   ├── parametres/                   # Profil, objectifs, RGPD
│   │   ├── cgu/                          # CGU
│   │   ├── confidentialite/              # Politique de confidentialité
│   │   ├── mentions-legales/             # Mentions légales
│   │   └── api/
│   │       ├── quiz/generate             # Génération de quiz (IA)
│   │       ├── quiz/verify               # Correction réponse courte (IA)
│   │       ├── quiz/simplify             # Simplification de question (IA)
│   │       ├── coach                     # Chat coach pédagogique (stream)
│   │       ├── langues/dialogue          # Dialogue langue (stream)
│   │       ├── langues/prononcer         # Feedback prononciation (Whisper)
│   │       ├── scan                      # OCR & correction de copies (Vision IA)
│   │       └── user/export-data          # Export RGPD des données
│   ├── components/
│   │   ├── navigation/                   # Header, MatiereCard, ChapitreCard
│   │   ├── quiz/                         # QuizRunner, QuestionCard, ModeSelector, TimerBar, ScoreDisplay
│   │   ├── progression/                  # Graphiques, historique, statistiques
│   │   ├── gamification/                 # XPBar, XPToast, StreakDisplay, BadgeGrid, CalendrierStreak
│   │   ├── coach/                        # CoachIA (chat streaming)
│   │   ├── langues/                      # ReconnaissanceVocale, CorrectionPrononciation, DialogueLangue
│   │   ├── scan/                         # ScanCorrection
│   │   ├── social/                       # Classement, ListeAmis, CarteDefi, Notifications
│   │   ├── engagement/                   # BanniereObjectif, ServiceWorkerRegistrar
│   │   └── legal/                        # BandeauCookies
│   ├── data/
│   │   ├── programme-seconde.ts          # Matières & chapitres Seconde
│   │   ├── programme-premiere.ts         # Matières & chapitres Première
│   │   ├── programme-terminale.ts        # Matières & chapitres Terminale
│   │   └── programmes.ts                 # Fonctions d'accès aux programmes
│   ├── lib/
│   │   ├── auth.ts                       # Authentification Supabase
│   │   ├── gamification.ts               # XP, niveaux, badges, streaks
│   │   ├── performance.ts                # Scores par chapitre
│   │   ├── history.ts                    # Historique quiz
│   │   ├── revision-espacee.ts           # Algorithme SM-2
│   │   ├── coach-local.ts                # Fallback coach offline
│   │   ├── objectifs-personnalises.ts    # Objectifs de note
│   │   ├── consent.ts                    # Consentement RGPD
│   │   ├── parametres.ts                 # Préférences utilisateur
│   │   ├── social.ts                     # Amis, défis, classement
│   │   ├── streak-notifications.ts       # Notifications de streak
│   │   ├── sync.ts                       # Synchronisation Supabase
│   │   ├── ratelimit.ts                  # Rate limiting Upstash
│   │   ├── quiz-schema.ts                # Schéma Zod de validation
│   │   ├── mock-quiz.ts                  # Questions pré-générées (fallback)
│   │   └── supabase.ts                   # Client Supabase
│   └── types/
│       └── index.ts                      # Tous les types TypeScript
├── public/
│   ├── manifest.json                     # PWA manifest
│   └── sw.js                             # Service Worker
├── docs/
│   └── DPIA.md                           # Analyse d'impact (RGPD)
└── tests/
    └── e2e/                              # Tests Playwright
```

---

## Installation

### Prérequis

- [Node.js](https://nodejs.org/) v18 ou supérieur
- Compte [Groq](https://console.groq.com/) (clé API gratuite)
- Projet [Supabase](https://supabase.com/) (base de données + auth)
- Compte [Upstash](https://upstash.com/) (Redis pour rate limiting — optionnel en local)

### Étapes

**1. Cloner le dépôt**

```bash
git clone https://github.com/Ben-126/Quiz_2nd.git
cd Quiz_2nd
```

**2. Installer les dépendances**

```bash
npm install
```

**3. Configurer les variables d'environnement**

```bash
cp .env.example .env.local
```

Renseigner `.env.local` :

```env
# IA (Groq)
GROQ_API_KEY=gsk_...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...

# Rate limiting (Upstash Redis)
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# Optionnel — force le mode mock (sans appel API)
NEXT_PUBLIC_USE_MOCK=true
```

**4. Lancer l'application**

```bash
npm run dev
```

L'application est disponible sur **http://localhost:3000**.

### Variables d'environnement

| Variable | Description | Obligatoire |
|----------|-------------|-------------|
| `GROQ_API_KEY` | Clé API Groq (LLM) | Oui (en production) |
| `NEXT_PUBLIC_SUPABASE_URL` | URL du projet Supabase | Oui |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé publique Supabase | Oui |
| `UPSTASH_REDIS_REST_URL` | URL Redis Upstash | Recommandé en prod |
| `UPSTASH_REDIS_REST_TOKEN` | Token Redis Upstash | Recommandé en prod |
| `NEXT_PUBLIC_USE_MOCK` | `true` pour désactiver l'IA et utiliser les questions pré-générées | Non |

> Sans clé API, l'application bascule automatiquement en **mode mock** avec des questions prédéfinies.

---

## Utilisation

1. Ouvrir `http://localhost:3000`
2. Créer un compte ou se connecter (email ou Google)
3. Choisir son **niveau** (Seconde, Première ou Terminale)
4. Choisir une **matière** et un **chapitre**
5. Sélectionner un **mode** (Entraînement, Contrôle, Chrono, Rapide)
6. Répondre aux questions générées par l'IA
7. Consulter la correction, les explications et les points gagnés
8. Suivre sa progression dans le **tableau de bord**

---

## Rate Limiting

Protection contre les abus via Upstash Redis :

| Endpoint | Limite |
|----------|--------|
| Génération quiz | 10 req/min par IP |
| Correction réponse | 30 req/min par IP |
| Coach IA | 20 req/min par IP |
| Scan copie | 5 req/min par IP |
| Prononciation | 15 req/min par IP |
| Dialogue langues | 20 req/min par IP |

---

## Sécurité

Headers HTTP configurés dans `next.config.ts` :

- `X-Frame-Options: DENY` — protection clickjacking
- `X-Content-Type-Options: nosniff` — protection MIME sniffing
- `Strict-Transport-Security: max-age=63072000` — HSTS 2 ans
- `Content-Security-Policy` — contrôle des ressources autorisées
- `Permissions-Policy` — désactivation caméra, géolocalisation

---

## Tests

```bash
# Tests E2E (Playwright)
npm run test:e2e

# Rapport de tests
npm run test:e2e:report

# Linting
npm run lint

# Build
npm run build
```

---

## Déploiement

L'application est déployée sur **Vercel** avec les variables d'environnement configurées dans le dashboard Vercel.

```bash
# Preview
vercel

# Production
vercel --prod
```

---

## Contribuer

Les contributions sont les bienvenues !

### Processus

1. Forker le dépôt
2. Créer une branche

```bash
git checkout -b feat/ma-fonctionnalite
```

3. Faire tes modifications en respectant le style du projet
4. Vérifier que le build et les tests passent

```bash
npm run build
npm run test:e2e
```

5. Committer avec un message clair (convention ci-dessous)
6. Ouvrir une Pull Request vers `master`

### Convention de commits

| Type | Usage |
|------|-------|
| `feat` | Nouvelle fonctionnalité |
| `fix` | Correction de bug |
| `docs` | Documentation |
| `refactor` | Refactorisation |
| `test` | Tests |
| `chore` | Maintenance |
| `perf` | Performance |

### Signaler un bug

Ouvrir une [issue GitHub](https://github.com/Ben-126/Quiz_2nd/issues) avec :
- Description du problème
- Étapes pour reproduire
- Comportement attendu vs observé
