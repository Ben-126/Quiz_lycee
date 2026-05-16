import type { Matiere } from "@/types";

export const MATIERES: Matiere[] = [
  {
    slug: "mathematiques",
    nom: "Mathématiques",
    emoji: "📐",
    couleur: "bg-blue-500",
    chapitres: [
      {
        slug: "nombres-et-calculs",
        titre: "Nombres et calculs",
        competences: [
          { id: "nc1", titre: "Ensembles de nombres réels et intervalles" },
          { id: "nc2", titre: "Les identités remarquables" },
          { id: "nc3", titre: "Équations et inéquations" },
          { id: "nc4", titre: "Puissances et racines carrées" },
        ],
      },
      {
        slug: "geometrie",
        titre: "Géométrie",
        competences: [
          { id: "ge1", titre: "Géométrie dans le plan" },
          { id: "ge2", titre: "Vecteurs" },
          { id: "ge3", titre: "Droites et équations" },
        ],
      },
      {
        slug: "fonctions",
        titre: "Fonctions",
        competences: [
          { id: "fn1", titre: "Notion de fonction" },
          { id: "fn2", titre: "Fonctions de référence" },
          { id: "fn3", titre: "Variations et extremums" },
        ],
      },
      {
        slug: "statistiques-et-probabilites",
        titre: "Statistiques et probabilités",
        competences: [
          { id: "sp1", titre: "Statistiques descriptives" },
          { id: "sp2", titre: "Probabilités" },
          { id: "sp3", titre: "Loi des grands nombres" },
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
        slug: "poesie-moyen-age-xviiie",
        titre: "La poésie du Moyen Âge au XVIIIe siècle",
        competences: [
          { id: "po1", titre: "Les formes poétiques" },
          { id: "po2", titre: "Les figures de style" },
          { id: "po3", titre: "La versification" },
        ],
      },
      {
        slug: "litterature-idees-presse",
        titre: "La littérature d'idées et la presse",
        competences: [
          { id: "li1", titre: "L'argumentation" },
          { id: "li2", titre: "Les genres de l'argumentation" },
          { id: "li3", titre: "Les Lumières" },
        ],
      },
      {
        slug: "roman-et-recit",
        titre: "Le roman et le récit du XVIIIe au XXIe siècle",
        competences: [
          { id: "ro1", titre: "Les genres romanesques" },
          { id: "ro2", titre: "Le point de vue narratif" },
          { id: "ro3", titre: "Les personnages" },
        ],
      },
      {
        slug: "theatre",
        titre: "Le théâtre du XVIIe au XXIe siècle",
        competences: [
          { id: "th1", titre: "Les genres théâtraux" },
          { id: "th2", titre: "La mise en scène" },
          { id: "th3", titre: "Le dialogue théâtral" },
        ],
      },
    ],
  },
  {
    slug: "histoire",
    nom: "Histoire",
    emoji: "🏛️",
    couleur: "bg-amber-600",
    chapitres: [
      {
        slug: "mediterranee-antique",
        titre: "La Méditerranée antique",
        competences: [
          { id: "ha1", titre: "La démocratie athénienne" },
          { id: "ha2", titre: "L'Empire romain" },
          { id: "ha3", titre: "La Méditerranée chrétienne" },
        ],
      },
      {
        slug: "mediterranee-medievale",
        titre: "La Méditerranée médiévale",
        competences: [
          { id: "hm1", titre: "Échanges et conflits au Moyen Âge" },
          { id: "hm2", titre: "Les civilisations médiévales" },
        ],
      },
      {
        slug: "renaissance-humanisme",
        titre: "Renaissance, Humanisme et réformes religieuses",
        competences: [
          { id: "hr1", titre: "La Renaissance" },
          { id: "hr2", titre: "L'Humanisme" },
          { id: "hr3", titre: "Les réformes protestantes" },
        ],
      },
      {
        slug: "lumieres-et-sciences",
        titre: "Les Lumières et le développement des sciences",
        competences: [
          { id: "hl1", titre: "La philosophie des Lumières" },
          { id: "hl2", titre: "L'essor scientifique" },
          { id: "hl3", titre: "La révolution industrielle" },
        ],
      },
    ],
  },
  {
    slug: "geographie",
    nom: "Géographie",
    emoji: "🌍",
    couleur: "bg-green-600",
    chapitres: [
      {
        slug: "societes-et-environnements",
        titre: "Sociétés et environnements : des équilibres fragiles",
        competences: [
          { id: "ga1", titre: "Les risques naturels" },
          { id: "ga2", titre: "Le changement climatique" },
          { id: "ga3", titre: "Les inégalités face aux risques" },
        ],
      },
      {
        slug: "territoires-et-population",
        titre: "Territoires et population : un défi pour le développement",
        competences: [
          { id: "gt1", titre: "La croissance démographique" },
          { id: "gt2", titre: "Les inégalités de développement" },
        ],
      },
      {
        slug: "mobilites-humaines",
        titre: "Des mobilités humaines généralisées",
        competences: [
          { id: "gm1", titre: "Les migrations internationales" },
          { id: "gm2", titre: "Le tourisme mondial" },
        ],
      },
      {
        slug: "afrique-australe",
        titre: "L'Afrique australe : un espace en mutation",
        competences: [
          { id: "gaf1", titre: "La fin de l'apartheid" },
          { id: "gaf2", titre: "Les défis du développement" },
        ],
      },
    ],
  },
  {
    slug: "ses",
    nom: "SES",
    emoji: "📊",
    couleur: "bg-purple-500",
    chapitres: [
      {
        slug: "comment-creer-richesses",
        titre: "Comment crée-t-on des richesses et comment les mesure-t-on ?",
        competences: [
          { id: "se1", titre: "La production de richesses" },
          { id: "se2", titre: "Le PIB et ses limites" },
          { id: "se3", titre: "La valeur ajoutée" },
        ],
      },
      {
        slug: "formation-des-prix",
        titre: "Comment se forment les prix sur un marché ?",
        competences: [
          { id: "sm1", titre: "L'offre et la demande" },
          { id: "sm2", titre: "L'équilibre du marché" },
          { id: "sm3", titre: "Les défaillances du marché" },
        ],
      },
      {
        slug: "acteurs-sociaux",
        titre: "Comment devenons-nous des acteurs sociaux ?",
        competences: [
          { id: "ss1", titre: "La socialisation" },
          { id: "ss2", titre: "Les groupes sociaux" },
          { id: "ss3", titre: "La culture" },
        ],
      },
      {
        slug: "diplome-emploi-salaire",
        titre: "Quelles relations entre le diplôme, l'emploi et le salaire ?",
        competences: [
          { id: "sd1", titre: "Le marché du travail" },
          { id: "sd2", titre: "Le rôle du diplôme" },
          { id: "sd3", titre: "Les inégalités salariales" },
        ],
      },
    ],
  },
  {
    slug: "svt",
    nom: "SVT",
    emoji: "🔬",
    couleur: "bg-teal-500",
    chapitres: [
      {
        slug: "cellule-unite-du-vivant",
        titre: "La cellule, unité du vivant",
        competences: [
          { id: "sv1", titre: "La structure cellulaire" },
          { id: "sv2", titre: "ADN et information génétique" },
          { id: "sv3", titre: "La division cellulaire" },
        ],
      },
      {
        slug: "biodiversite-et-evolution",
        titre: "Biodiversité, résultat et étape de l'évolution",
        competences: [
          { id: "sb1", titre: "La théorie de l'évolution" },
          { id: "sb2", titre: "La sélection naturelle" },
          { id: "sb3", titre: "La classification du vivant" },
        ],
      },
      {
        slug: "microorganismes-et-sante",
        titre: "Microorganismes et santé",
        competences: [
          { id: "sm1", titre: "Les agents pathogènes" },
          { id: "sm2", titre: "Le système immunitaire" },
          { id: "sm3", titre: "La vaccination" },
        ],
      },
      {
        slug: "nourrir-humanite",
        titre: "Nourrir l'humanité : vers une agriculture durable",
        competences: [
          { id: "sn1", titre: "La production agricole" },
          { id: "sn2", titre: "Les enjeux environnementaux" },
          { id: "sn3", titre: "L'agriculture durable" },
        ],
      },
    ],
  },
  {
    slug: "physique-chimie",
    nom: "Physique-chimie",
    emoji: "⚗️",
    couleur: "bg-orange-500",
    chapitres: [
      {
        slug: "constitution-et-transformation",
        titre: "Constitution et transformation de la matière",
        competences: [
          { id: "pc1", titre: "Corps purs et mélanges" },
          { id: "pc2", titre: "La structure de l'atome" },
          { id: "pc3", titre: "Les réactions chimiques" },
        ],
      },
      {
        slug: "mouvements-et-interactions",
        titre: "Mouvements et interactions",
        competences: [
          { id: "pm1", titre: "Les forces" },
          { id: "pm2", titre: "La loi de Newton" },
          { id: "pm3", titre: "La gravitation universelle" },
        ],
      },
      {
        slug: "ondes-et-signaux",
        titre: "Ondes et signaux",
        competences: [
          { id: "po1", titre: "Les ondes mécaniques" },
          { id: "po2", titre: "Les ondes électromagnétiques" },
          { id: "po3", titre: "Le son" },
        ],
      },
      {
        slug: "vision-et-image",
        titre: "Vision et image",
        competences: [
          { id: "pv1", titre: "La lumière et les lentilles" },
          { id: "pv2", titre: "La réfraction" },
          { id: "pv3", titre: "La formation des images" },
        ],
      },
    ],
  },
  {
    slug: "snt",
    nom: "Sciences numériques et technologie",
    emoji: "💻",
    couleur: "bg-cyan-500",
    chapitres: [
      {
        slug: "connecter",
        titre: "Connecter",
        competences: [
          { id: "sn1", titre: "Internet et l'adressage IP" },
          { id: "sn2", titre: "Le protocole TCP/IP" },
          { id: "sn3", titre: "Client-serveur vs pair-à-pair" },
        ],
      },
      {
        slug: "naviguer",
        titre: "Naviguer",
        competences: [
          { id: "snav1", titre: "Le protocole HTTP et HTML/CSS" },
          { id: "snav2", titre: "La sécurité sur le web" },
          { id: "snav3", titre: "Les moteurs de recherche" },
        ],
      },
      {
        slug: "memoriser-et-traiter",
        titre: "Mémoriser et traiter",
        competences: [
          { id: "smt1", titre: "L'open data" },
          { id: "smt2", titre: "Le cloud computing" },
        ],
      },
      {
        slug: "numeriser",
        titre: "Numériser",
        competences: [
          { id: "snum1", titre: "L'image numérique" },
          { id: "snum2", titre: "La représentation des données" },
        ],
      },
    ],
  },
  {
    slug: "emc",
    nom: "Enseignement moral et civique",
    emoji: "⚖️",
    couleur: "bg-indigo-500",
    chapitres: [
      {
        slug: "etat-de-droit",
        titre: "L'État de droit : garant des droits et libertés",
        competences: [
          { id: "em1", titre: "Les droits fondamentaux" },
          { id: "em2", titre: "L'État de droit" },
          { id: "em3", titre: "La démocratie" },
        ],
      },
      {
        slug: "libertes-et-information",
        titre: "Libertés et responsabilité : l'information",
        competences: [
          { id: "ei1", titre: "La liberté de la presse" },
          { id: "ei2", titre: "Les fake news" },
          { id: "ei3", titre: "La responsabilité numérique" },
        ],
      },
      {
        slug: "droit-et-environnement",
        titre: "Droit et responsabilité : la protection de l'environnement",
        competences: [
          { id: "ee1", titre: "Le droit de l'environnement" },
          { id: "ee2", titre: "La biodiversité et sa protection" },
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
        slug: "groupe-nominal",
        titre: "Le groupe nominal",
        competences: [
          { id: "an1", titre: "Les déterminants" },
          { id: "an2", titre: "L'expression de la quantité" },
          { id: "an3", titre: "Les adjectifs qualificatifs" },
        ],
      },
      {
        slug: "les-temps",
        titre: "Les temps",
        competences: [
          { id: "at1", titre: "Le présent simple et continu" },
          { id: "at2", titre: "Le prétérit" },
          { id: "at3", titre: "Le present perfect" },
          { id: "at4", titre: "Le futur et le conditionnel" },
        ],
      },
      {
        slug: "groupe-verbal",
        titre: "Le groupe verbal",
        competences: [
          { id: "av1", titre: "Les auxiliaires modaux" },
          { id: "av2", titre: "L'infinitif et le gérondif" },
          { id: "av3", titre: "La voix passive" },
        ],
      },
      {
        slug: "la-phrase",
        titre: "La phrase",
        competences: [
          { id: "ap1", titre: "Les questions" },
          { id: "ap2", titre: "Les comparatifs et superlatifs" },
          { id: "ap3", titre: "Les subordonnées" },
        ],
      },
    ],
  },
  {
    slug: "espagnol",
    nom: "Espagnol",
    emoji: "🌺",
    couleur: "bg-yellow-500",
    chapitres: [
      {
        slug: "grammaire-de-base",
        titre: "Grammaire de base",
        competences: [
          { id: "es1", titre: "Les articles et les noms" },
          { id: "es2", titre: "Les verbes ser et estar" },
          { id: "es3", titre: "Les temps du présent" },
        ],
      },
      {
        slug: "les-temps-espagnol",
        titre: "Les temps en espagnol",
        competences: [
          { id: "est1", titre: "Le prétérit indéfini" },
          { id: "est2", titre: "L'imparfait" },
          { id: "est3", titre: "Le futur" },
        ],
      },
      {
        slug: "vocabulaire-et-culture",
        titre: "Vocabulaire et culture hispanique",
        competences: [
          { id: "ev1", titre: "La famille et la vie quotidienne" },
          { id: "ev2", titre: "Les pays hispanophones" },
        ],
      },
    ],
  },
  {
    slug: "allemand",
    nom: "Allemand",
    emoji: "📜",
    couleur: "bg-gray-600",
    chapitres: [
      {
        slug: "grammaire-allemande",
        titre: "Grammaire allemande",
        competences: [
          { id: "al1", titre: "Les cas allemands (Nominatif, Accusatif)" },
          { id: "al2", titre: "Les articles définis et indéfinis" },
          { id: "al3", titre: "Les verbes réguliers et irréguliers" },
        ],
      },
      {
        slug: "les-temps-allemand",
        titre: "Les temps en allemand",
        competences: [
          { id: "alt1", titre: "Le Präsens" },
          { id: "alt2", titre: "Le Perfekt" },
          { id: "alt3", titre: "Le Präteritum" },
        ],
      },
      {
        slug: "vocabulaire-et-culture-allemande",
        titre: "Vocabulaire et culture allemande",
        competences: [
          { id: "av1", titre: "La vie quotidienne en Allemagne" },
          { id: "av2", titre: "Les pays germanophones" },
        ],
      },
    ],
  },
];

export function getMatiereBySlug(slug: string): Matiere | undefined {
  return MATIERES.find((m) => m.slug === slug);
}

export function getChapitreBySlug(
  matiereSlug: string,
  chapitreSlug: string
): { matiere: Matiere; chapitre: Matiere["chapitres"][0] } | undefined {
  const matiere = getMatiereBySlug(matiereSlug);
  if (!matiere) return undefined;
  const chapitre = matiere.chapitres.find((c) => c.slug === chapitreSlug);
  if (!chapitre) return undefined;
  return { matiere, chapitre };
}
