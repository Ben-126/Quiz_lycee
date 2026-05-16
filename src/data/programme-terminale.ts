import type { Matiere } from "@/types";

export const MATIERES_TERMINALE: Matiere[] = [
  {
    slug: "mathematiques",
    nom: "Mathématiques (spécialité)",
    emoji: "📐",
    couleur: "bg-blue-500",
    chapitres: [
      {
        slug: "analyse",
        titre: "Analyse",
        competences: [
          { id: "te-m1", titre: "Limites et continuité" },
          { id: "te-m2", titre: "Dérivation et convexité" },
          { id: "te-m3", titre: "Fonctions exponentielle et logarithme" },
          { id: "te-m4", titre: "Intégration" },
        ],
      },
      {
        slug: "algebre-combinatoire",
        titre: "Algèbre et combinatoire",
        competences: [
          { id: "te-m5", titre: "Calcul matriciel" },
          { id: "te-m6", titre: "Combinatoire et dénombrement" },
          { id: "te-m7", titre: "Arithmétique" },
        ],
      },
      {
        slug: "probabilites",
        titre: "Probabilités et statistiques",
        competences: [
          { id: "te-m8", titre: "Variables aléatoires continues" },
          { id: "te-m9", titre: "Loi normale" },
          { id: "te-m10", titre: "Estimation et tests statistiques" },
        ],
      },
    ],
  },
  {
    slug: "philosophie",
    nom: "Philosophie",
    emoji: "🦉",
    couleur: "bg-violet-500",
    chapitres: [
      {
        slug: "le-sujet",
        titre: "Le sujet",
        competences: [
          { id: "te-ph1", titre: "La conscience et l'inconscient" },
          { id: "te-ph2", titre: "La perception et le temps" },
          { id: "te-ph3", titre: "La liberté et le déterminisme" },
        ],
      },
      {
        slug: "la-culture",
        titre: "La culture",
        competences: [
          { id: "te-ph4", titre: "La culture et la nature" },
          { id: "te-ph5", titre: "Le langage et la vérité" },
          { id: "te-ph6", titre: "L'art et la technique" },
          { id: "te-ph7", titre: "La religion et la raison" },
        ],
      },
      {
        slug: "la-raison",
        titre: "La raison et le réel",
        competences: [
          { id: "te-ph8", titre: "Théorie et expérience" },
          { id: "te-ph9", titre: "La démonstration" },
          { id: "te-ph10", titre: "La vérité" },
        ],
      },
      {
        slug: "la-politique",
        titre: "La politique",
        competences: [
          { id: "te-ph11", titre: "La société et l'État" },
          { id: "te-ph12", titre: "La justice et le droit" },
          { id: "te-ph13", titre: "L'État et la guerre" },
        ],
      },
      {
        slug: "la-morale",
        titre: "La morale",
        competences: [
          { id: "te-ph14", titre: "La liberté et la responsabilité" },
          { id: "te-ph15", titre: "Le devoir et le bonheur" },
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
        slug: "entre-deux-guerres",
        titre: "L'entre-deux-guerres et la Seconde Guerre mondiale",
        competences: [
          { id: "te-hg1", titre: "La montée des totalitarismes" },
          { id: "te-hg2", titre: "La Seconde Guerre mondiale" },
          { id: "te-hg3", titre: "La Shoah et les crimes de guerre" },
        ],
      },
      {
        slug: "guerre-froide",
        titre: "La Guerre froide et le monde bipolaire",
        competences: [
          { id: "te-hg4", titre: "L'affrontement Est-Ouest" },
          { id: "te-hg5", titre: "La décolonisation" },
          { id: "te-hg6", titre: "La fin de la Guerre froide" },
        ],
      },
      {
        slug: "france-depuis-1945",
        titre: "La France depuis 1945",
        competences: [
          { id: "te-hg7", titre: "La IVe et Ve République" },
          { id: "te-hg8", titre: "La société française en mutation" },
          { id: "te-hg9", titre: "La France et la construction européenne" },
        ],
      },
      {
        slug: "enjeux-mondiaux",
        titre: "Les enjeux du monde contemporain",
        competences: [
          { id: "te-hg10", titre: "La puissance américaine" },
          { id: "te-hg11", titre: "Les grandes puissances émergentes" },
          { id: "te-hg12", titre: "Les défis climatiques" },
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
        slug: "thermodynamique",
        titre: "Thermodynamique",
        competences: [
          { id: "te-pc1", titre: "Les échanges d'énergie" },
          { id: "te-pc2", titre: "Le premier principe de la thermodynamique" },
          { id: "te-pc3", titre: "Transferts thermiques" },
        ],
      },
      {
        slug: "chimie-organique",
        titre: "Chimie organique",
        competences: [
          { id: "te-pc4", titre: "Isomérie et nomenclature" },
          { id: "te-pc5", titre: "Les grandes familles de réactions" },
          { id: "te-pc6", titre: "Synthèse organique" },
        ],
      },
      {
        slug: "electrochimie",
        titre: "Électrochimie et circuits",
        competences: [
          { id: "te-pc7", titre: "Oxydoréduction" },
          { id: "te-pc8", titre: "Piles et accumulateurs" },
          { id: "te-pc9", titre: "Circuits électriques avancés" },
        ],
      },
      {
        slug: "mecanique",
        titre: "Mécanique avancée",
        competences: [
          { id: "te-pc10", titre: "Mouvement dans un champ de forces" },
          { id: "te-pc11", titre: "Énergie potentielle et mécanique" },
          { id: "te-pc12", titre: "Les oscillations" },
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
        slug: "genetique-et-epigenetique",
        titre: "Génétique et épigénétique",
        competences: [
          { id: "te-sv1", titre: "L'expression des gènes" },
          { id: "te-sv2", titre: "L'épigénétique" },
          { id: "te-sv3", titre: "La variabilité génétique" },
        ],
      },
      {
        slug: "neurosciences",
        titre: "Neurosciences",
        competences: [
          { id: "te-sv4", titre: "Le fonctionnement du neurone" },
          { id: "te-sv5", titre: "La synapse" },
          { id: "te-sv6", titre: "Plasticité cérébrale et mémoire" },
        ],
      },
      {
        slug: "ecologie",
        titre: "Écologie et développement durable",
        competences: [
          { id: "te-sv7", titre: "Les écosystèmes" },
          { id: "te-sv8", titre: "Le cycle du carbone" },
          { id: "te-sv9", titre: "La biodiversité et sa conservation" },
        ],
      },
      {
        slug: "geologie",
        titre: "Géologie",
        competences: [
          { id: "te-sv10", titre: "La tectonique des plaques" },
          { id: "te-sv11", titre: "Le magmatisme et le métamorphisme" },
          { id: "te-sv12", titre: "Les ressources naturelles" },
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
        slug: "macroeconomie",
        titre: "Macroéconomie",
        competences: [
          { id: "te-se1", titre: "La croissance économique" },
          { id: "te-se2", titre: "Le financement de l'économie" },
          { id: "te-se3", titre: "Les déséquilibres économiques" },
        ],
      },
      {
        slug: "sociologie-avancee",
        titre: "Sociologie avancée",
        competences: [
          { id: "te-so1", titre: "Les transformations du lien social" },
          { id: "te-so2", titre: "Les inégalités et la stratification" },
          { id: "te-so3", titre: "La structure sociale" },
        ],
      },
      {
        slug: "institutions-et-politiques",
        titre: "Institutions, gouvernance et politiques",
        competences: [
          { id: "te-rc1", titre: "Les politiques sociales" },
          { id: "te-rc2", titre: "La gouvernance mondiale" },
          { id: "te-rc3", titre: "L'État et ses missions" },
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
        slug: "structures-avancees",
        titre: "Structures de données avancées",
        competences: [
          { id: "te-nsi1", titre: "Graphes et algorithmes de parcours" },
          { id: "te-nsi2", titre: "Algorithmes sur les arbres" },
          { id: "te-nsi3", titre: "Bases de données relationnelles" },
        ],
      },
      {
        slug: "programmation-avancee",
        titre: "Programmation avancée",
        competences: [
          { id: "te-nsi4", titre: "Paradigmes de programmation" },
          { id: "te-nsi5", titre: "Programmation orientée objet" },
          { id: "te-nsi6", titre: "Diviser pour régner" },
        ],
      },
      {
        slug: "systemes",
        titre: "Systèmes et réseaux avancés",
        competences: [
          { id: "te-nsi7", titre: "Sécurité informatique" },
          { id: "te-nsi8", titre: "Processus et ordonnancement" },
          { id: "te-nsi9", titre: "Protocoles de communication" },
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
        slug: "expression-avancee",
        titre: "Expression et analyse avancées",
        competences: [
          { id: "te-an1", titre: "L'expression de la nuance" },
          { id: "te-an2", titre: "Les structures complexes" },
          { id: "te-an3", titre: "La modalité et l'hypothèse" },
        ],
      },
      {
        slug: "culture-et-civilisation",
        titre: "Culture et civilisation",
        competences: [
          { id: "te-an4", titre: "Le monde anglophone contemporain" },
          { id: "te-an5", titre: "Littérature et arts anglophones" },
          { id: "te-an6", titre: "Enjeux politiques et sociaux" },
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
        slug: "citoyennete-et-democratie",
        titre: "Citoyenneté et démocratie",
        competences: [
          { id: "te-em1", titre: "Les formes de démocratie" },
          { id: "te-em2", titre: "La citoyenneté européenne" },
          { id: "te-em3", titre: "Les enjeux de la démocratie numérique" },
        ],
      },
      {
        slug: "enjeux-ethiques",
        titre: "Enjeux éthiques contemporains",
        competences: [
          { id: "te-em4", titre: "Bioéthique et progrès scientifique" },
          { id: "te-em5", titre: "Responsabilité écologique" },
        ],
      },
    ],
  },
];

export function getMatiereBySlugTerminale(slug: string): Matiere | undefined {
  return MATIERES_TERMINALE.find((m) => m.slug === slug);
}
