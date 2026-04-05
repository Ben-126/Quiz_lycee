# Application de Quiz IA — Programme Seconde

Collaboration entre Ben et Dan.

## C'est quoi ?

Une application web de révision pour les élèves de Seconde. L'IA génère des quiz personnalisés alignés avec le programme scolaire officiel, couvrant toutes les matières : Mathématiques, Français, Histoire-Géographie, SES, SVT, Physique-chimie, SNT, EMC, Anglais, Espagnol et Allemand.

## Comment ça marche ?

1. L'élève choisit une matière
2. Il sélectionne un chapitre
3. L'IA génère des questions (QCM, Vrai/Faux, Réponse courte)
4. Chaque réponse est corrigée immédiatement avec une explication
5. Un score final est affiché à la fin du quiz

## Fonctionnalités

- Quiz générés dynamiquement par Claude (Anthropic)
- Correction immédiate avec explication détaillée
- Toutes les matières du programme officiel de Seconde
- Interface responsive (mobile & desktop)
- Mode mock pour tester sans clé API

## Stack technique

- **Framework** : Next.js 15 (App Router)
- **Langage** : TypeScript
- **Style** : Tailwind CSS
- **IA** : Claude API (Anthropic)
- **Validation** : Zod
- **Tests E2E** : Playwright

## Structure du projet

```
projet-Ben-Dan/
└── quiz-app/          # Application Next.js
    ├── src/
    │   ├── app/       # Pages et routes API
    │   ├── components/# Composants React
    │   ├── data/      # Programme scolaire (matières & chapitres)
    │   ├── lib/       # Utilitaires, schémas, constantes
    │   └── types/     # Types TypeScript
    └── tests/
        └── e2e/       # Tests Playwright
```

## Installation

**1. Cloner le dépôt**

```bash
git clone https://github.com/Ben-126/Quiz_2nd.git
cd Quiz_2nd
```

**2. Installer les dépendances**

```bash
cd quiz-app
npm install
```

**3. Configurer les variables d'environnement**

```bash
copy .env.example .env.local
```

Ouvrir `.env.local` et renseigner ta clé API Anthropic :

```
ANTHROPIC_API_KEY=sk-ant-...
```

**4. Lancer l'application**

```bash
npm run dev
```

L'application est disponible sur `http://localhost:3000`.

## Variables d'environnement

| Variable | Description |
|----------|-------------|
| `ANTHROPIC_API_KEY` | Clé API Anthropic (requise en production) |
| `NEXT_PUBLIC_USE_MOCK` | `true` pour utiliser les données mock (dev) |
