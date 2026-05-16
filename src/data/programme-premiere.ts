import type { Matiere } from "@/types";

export const MATIERES_PREMIERE: Matiere[] = [
  {
    slug: "mathematiques",
    nom: "Mathématiques",
    emoji: "📐",
    couleur: "bg-blue-500",
    chapitres: [
      {
        slug: "suites",
        titre: "Suites numériques",
        competences: [
          { id: "pr-m1", titre: "Suites arithmétiques et géométriques" },
          { id: "pr-m2", titre: "Raisonnement par récurrence" },
          { id: "pr-m3", titre: "Limites de suites" },
        ],
      },
      {
        slug: "derivation",
        titre: "Dérivation",
        competences: [
          { id: "pr-m4", titre: "Nombre dérivé et fonction dérivée" },
          { id: "pr-m5", titre: "Règles de dérivation" },
          { id: "pr-m6", titre: "Applications : variations et extremums" },
        ],
      },
      {
        slug: "fonctions",
        titre: "Fonctions",
        competences: [
          { id: "pr-m7", titre: "Fonctions polynômes du second degré" },
          { id: "pr-m8", titre: "Fonctions trigonométriques" },
          { id: "pr-m9", titre: "Fonctions composées" },
        ],
      },
      {
        slug: "probabilites-et-statistiques",
        titre: "Probabilités et statistiques",
        competences: [
          { id: "pr-m10", titre: "Variables aléatoires discrètes" },
          { id: "pr-m11", titre: "Loi binomiale" },
          { id: "pr-m12", titre: "Espérance et variance" },
        ],
      },
    ],
  },
  {
    slug: "francais",
    nom: "Français",
    emoji: "📚",
    couleur: "bg-red-500",
    chapitres: [
      {
        slug: "le-roman",
        titre: "Le roman et le récit du XVIIIe au XXIe siècle",
        competences: [
          { id: "pr-f1", titre: "Les formes du roman" },
          { id: "pr-f2", titre: "La représentation du monde" },
          { id: "pr-f3", titre: "Les personnages de roman" },
        ],
      },
      {
        slug: "la-poesie",
        titre: "La poésie du XIXe au XXIe siècle",
        competences: [
          { id: "pr-f4", titre: "Le romantisme et le symbolisme" },
          { id: "pr-f5", titre: "Le surréalisme" },
          { id: "pr-f6", titre: "La poésie engagée" },
        ],
      },
      {
        slug: "le-theatre",
        titre: "Le théâtre du XVIIe au XXIe siècle",
        competences: [
          { id: "pr-f7", titre: "La comédie classique" },
          { id: "pr-f8", titre: "Le drame romantique" },
          { id: "pr-f9", titre: "Le théâtre de l'absurde" },
        ],
      },
      {
        slug: "littérature-idées",
        titre: "La littérature d'idées du XVIe au XVIIIe siècle",
        competences: [
          { id: "pr-f10", titre: "L'humanisme" },
          { id: "pr-f11", titre: "La philosophie des Lumières" },
          { id: "pr-f12", titre: "L'argumentation directe et indirecte" },
        ],
      },
    ],
  },
  {
    slug: "histoire-geographie",
    nom: "Histoire-Géographie",
    emoji: "🌍",
    couleur: "bg-amber-600",
    chapitres: [
      {
        slug: "xix-siecle",
        titre: "L'Europe face aux révolutions (XIXe siècle)",
        competences: [
          { id: "pr-hg1", titre: "La Révolution française et l'Empire" },
          { id: "pr-hg2", titre: "La révolution industrielle" },
          { id: "pr-hg3", titre: "Les nationalismes en Europe" },
        ],
      },
      {
        slug: "guerres-mondiales",
        titre: "La Première Guerre mondiale",
        competences: [
          { id: "pr-hg4", titre: "Les causes et le déclenchement" },
          { id: "pr-hg5", titre: "La guerre totale" },
          { id: "pr-hg6", titre: "Les conséquences" },
        ],
      },
      {
        slug: "dynamiques-mondiales",
        titre: "Dynamiques territoriales et mondialisation",
        competences: [
          { id: "pr-hg7", titre: "La mondialisation des échanges" },
          { id: "pr-hg8", titre: "Les espaces maritimes" },
          { id: "pr-hg9", titre: "La France dans la mondialisation" },
        ],
      },
    ],
  },
  {
    slug: "physique-chimie",
    nom: "Physique-Chimie (spécialité)",
    emoji: "⚗️",
    couleur: "bg-orange-500",
    chapitres: [
      {
        slug: "constitution-matiere",
        titre: "Constitution et transformations de la matière",
        competences: [
          { id: "pr-pc1", titre: "Structure des entités chimiques" },
          { id: "pr-pc2", titre: "Les transformations chimiques" },
          { id: "pr-pc3", titre: "Cinétique chimique" },
        ],
      },
      {
        slug: "mouvement-forces",
        titre: "Mouvement et interactions",
        competences: [
          { id: "pr-pc4", titre: "Les lois de Newton" },
          { id: "pr-pc5", titre: "Mouvements et référentiels" },
          { id: "pr-pc6", titre: "Énergie cinétique et travail" },
        ],
      },
      {
        slug: "ondes",
        titre: "Ondes et signaux",
        competences: [
          { id: "pr-pc7", titre: "Propagation et caractéristiques des ondes" },
          { id: "pr-pc8", titre: "Lumière et optique" },
          { id: "pr-pc9", titre: "Électricité et circuits" },
        ],
      },
    ],
  },
  {
    slug: "svt",
    nom: "SVT (spécialité)",
    emoji: "🔬",
    couleur: "bg-teal-500",
    chapitres: [
      {
        slug: "genetique-et-evolution",
        titre: "Génétique et évolution",
        competences: [
          { id: "pr-sv1", titre: "Expression du génome" },
          { id: "pr-sv2", titre: "Mécanismes de l'évolution" },
          { id: "pr-sv3", titre: "La génétique des populations" },
        ],
      },
      {
        slug: "corps-humain",
        titre: "Le corps humain et la santé",
        competences: [
          { id: "pr-sv4", titre: "Le système nerveux" },
          { id: "pr-sv5", titre: "Immunologie et maladies" },
          { id: "pr-sv6", titre: "La reproduction" },
        ],
      },
      {
        slug: "terre-et-vie",
        titre: "La Terre, la vie et l'organisation du vivant",
        competences: [
          { id: "pr-sv7", titre: "L'origine de la vie" },
          { id: "pr-sv8", titre: "Les grands équilibres de la biosphère" },
          { id: "pr-sv9", titre: "Les interactions entre êtres vivants" },
        ],
      },
    ],
  },
  {
    slug: "ses",
    nom: "SES (spécialité)",
    emoji: "📊",
    couleur: "bg-purple-500",
    chapitres: [
      {
        slug: "science-economique",
        titre: "Science économique",
        competences: [
          { id: "pr-se1", titre: "Fluctuations économiques et croissance" },
          { id: "pr-se2", titre: "Marchés et concurrence imparfaite" },
          { id: "pr-se3", titre: "Les politiques économiques" },
        ],
      },
      {
        slug: "sociologie",
        titre: "Sociologie",
        competences: [
          { id: "pr-so1", titre: "Classes sociales et stratification" },
          { id: "pr-so2", titre: "Mobilité sociale" },
          { id: "pr-so3", titre: "La socialisation différenciée" },
        ],
      },
      {
        slug: "regards-croises",
        titre: "Regards croisés",
        competences: [
          { id: "pr-rc1", titre: "Travail, emploi, chômage" },
          { id: "pr-rc2", titre: "Justice sociale et inégalités" },
        ],
      },
    ],
  },
  {
    slug: "nsi",
    nom: "NSI (spécialité)",
    emoji: "💻",
    couleur: "bg-cyan-500",
    chapitres: [
      {
        slug: "structures-de-donnees",
        titre: "Structures de données",
        competences: [
          { id: "pr-nsi1", titre: "Tableaux et dictionnaires" },
          { id: "pr-nsi2", titre: "Piles, files et listes chaînées" },
          { id: "pr-nsi3", titre: "Arbres" },
        ],
      },
      {
        slug: "algorithmique",
        titre: "Algorithmique",
        competences: [
          { id: "pr-nsi4", titre: "Algorithmes de tri" },
          { id: "pr-nsi5", titre: "Récursivité" },
          { id: "pr-nsi6", titre: "Recherche dichotomique" },
        ],
      },
      {
        slug: "systemes-et-reseaux",
        titre: "Systèmes et réseaux",
        competences: [
          { id: "pr-nsi7", titre: "Architecture des ordinateurs" },
          { id: "pr-nsi8", titre: "Systèmes d'exploitation" },
          { id: "pr-nsi9", titre: "Protocoles réseau" },
        ],
      },
    ],
  },
  {
    slug: "anglais",
    nom: "Anglais",
    emoji: "🔤",
    couleur: "bg-rose-500",
    chapitres: [
      {
        slug: "expression-complexe",
        titre: "Expression complexe",
        competences: [
          { id: "pr-an1", titre: "Les subordonnées relatives" },
          { id: "pr-an2", titre: "Le discours indirect" },
          { id: "pr-an3", titre: "Les temps complexes" },
        ],
      },
      {
        slug: "comprehension-et-expression",
        titre: "Compréhension et expression",
        competences: [
          { id: "pr-an4", titre: "L'analyse de documents" },
          { id: "pr-an5", titre: "La synthèse de textes" },
          { id: "pr-an6", titre: "L'expression écrite avancée" },
        ],
      },
    ],
  },
  {
    slug: "emc",
    nom: "EMC",
    emoji: "⚖️",
    couleur: "bg-indigo-500",
    chapitres: [
      {
        slug: "engagement-et-democratie",
        titre: "S'engager et débattre en démocratie",
        competences: [
          { id: "pr-em1", titre: "La démocratie représentative" },
          { id: "pr-em2", titre: "La participation citoyenne" },
          { id: "pr-em3", titre: "Les institutions de la Ve République" },
        ],
      },
      {
        slug: "libertés-et-sécurité",
        titre: "Libertés et sécurité",
        competences: [
          { id: "pr-em4", titre: "La protection des libertés fondamentales" },
          { id: "pr-em5", titre: "Sécurité et libertés publiques" },
        ],
      },
    ],
  },
];

export function getMatiereBySlugPremiere(slug: string): Matiere | undefined {
  return MATIERES_PREMIERE.find((m) => m.slug === slug);
}
