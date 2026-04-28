/**
 * Coach local — fonctionne sans clé API.
 * Utilise le contexte de la question courante (explication, étapes, erreurs fréquentes)
 * et une détection d'intention simple pour répondre à l'élève.
 */

export interface CoachContextLocal {
  matiere?: string;
  chapitre?: string;
  niveauLycee?: string;
  questionCourante?: string;
  explication?: string;
  etapes?: string[];
  methode?: string;
  erreursFrequentes?: string[];
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

type Intention =
  | "explication"
  | "etapes"
  | "exemple"
  | "erreurs"
  | "aide"
  | "encouragement"
  | "autre";

function detecterIntention(message: string): Intention {
  const m = message.toLowerCase();

  if (/comment (faire|résoudre|calcul|procéder|appliquer|trouver)|étape|méthode|démarche|procédé|pas à pas/.test(m))
    return "etapes";

  if (/expliqu|comprend|c'est quoi|qu'est[- ]ce que|définiti|définir|signifi|veux dire/.test(m))
    return "explication";

  if (/exempl|illustr|concret|cas pratique/.test(m))
    return "exemple";

  if (/erreur|piège|éviter|faux|tromper|confondre|oublier/.test(m))
    return "erreurs";

  if (/bravo|merci|super|génial|parfait|j'ai compris|ok|d'accord/.test(m))
    return "encouragement";

  if (/aide|aidez|bloqué|coincé|perdu|sais pas|comprends pas|difficile|dur/.test(m))
    return "aide";

  return "autre";
}

function construireReponse(messages: Message[], ctx: CoachContextLocal): string {
  const dernierMessage = messages[messages.length - 1]?.content ?? "";
  const intention = detecterIntention(dernierMessage);

  const contexteDisponible =
    ctx.explication || ctx.etapes?.length || ctx.erreursFrequentes?.length;

  // Encouragement
  if (intention === "encouragement") {
    return "Avec plaisir ! Continue comme ça, la régularité est la clé de la réussite.";
  }

  // Demande d'étapes — priorité si dispo
  if (intention === "etapes") {
    if (ctx.etapes && ctx.etapes.length > 0) {
      const lignes = ctx.etapes.map((e, i) => `${i + 1}. ${e}`).join("\n");
      const methodePart = ctx.methode ? `\nMéthode : **${ctx.methode}**` : "";
      return `Voici la démarche à suivre :\n\n${lignes}${methodePart}`;
    }
    if (ctx.explication) {
      return `Je n'ai pas d'étapes détaillées pour cette question, mais voici l'essentiel à retenir :\n\n${ctx.explication}`;
    }
    return `Pour ce type de question en ${ctx.matiere ?? "cette matière"}, commence par identifier ce qui est donné et ce qui est demandé. Ensuite, cherche la formule ou la règle qui relie ces éléments.`;
  }

  // Demande d'explication
  if (intention === "explication") {
    if (ctx.explication) {
      return ctx.explication;
    }
    if (ctx.chapitre) {
      return `Ce point du chapitre « ${ctx.chapitre} » est important. Relis attentivement le cours sur ce sujet et repère les définitions clés.`;
    }
    return "Peux-tu me préciser quelle partie tu ne comprends pas ? Je ferai de mon mieux pour t'aider.";
  }

  // Demande d'exemples
  if (intention === "exemple") {
    if (ctx.explication) {
      return `Voici l'explication de cette notion :\n\n${ctx.explication}\n\nPour t'entraîner, essaie d'appliquer cette règle sur un exemple de ton cours.`;
    }
    return `Les exemples concrets se trouvent souvent dans ton manuel. Cherche la partie sur « ${ctx.chapitre ?? "ce chapitre"} » pour en trouver.`;
  }

  // Erreurs fréquentes
  if (intention === "erreurs") {
    if (ctx.erreursFrequentes && ctx.erreursFrequentes.length > 0) {
      const liste = ctx.erreursFrequentes.map((e) => `• ${e}`).join("\n");
      return `Voici les erreurs les plus courantes sur ce type de question :\n\n${liste}`;
    }
    return "Les pièges classiques sont souvent liés aux signes, aux unités ou aux formules mal appliquées. Relis attentivement l'énoncé avant de répondre.";
  }

  // Demande d'aide générale
  if (intention === "aide") {
    if (contexteDisponible) {
      const parties: string[] = ["Je suis là ! Voici ce qui peut t'aider :"];
      if (ctx.explication) parties.push(ctx.explication);
      if (ctx.etapes?.length) {
        parties.push("Étapes :\n" + ctx.etapes.map((e, i) => `${i + 1}. ${e}`).join("\n"));
      }
      if (ctx.erreursFrequentes?.length) {
        parties.push("Attention à :\n" + ctx.erreursFrequentes.map((e) => `• ${e}`).join("\n"));
      }
      return parties.join("\n\n");
    }
    if (ctx.chapitre) {
      return `Pour le chapitre « ${ctx.chapitre} », commence par relire tes notes de cours, identifie les formules ou définitions clés, puis applique-les à la question.`;
    }
    return "Prends le temps de relire l'énoncé doucement. Identifie ce qui est donné, ce qui est demandé, et cherche la règle ou formule qui s'applique.";
  }

  // Intention non reconnue — réponse générique avec contexte si dispo
  if (contexteDisponible) {
    if (ctx.explication) return ctx.explication;
    if (ctx.etapes?.length) {
      return "Démarche :\n" + ctx.etapes.map((e, i) => `${i + 1}. ${e}`).join("\n");
    }
  }

  if (ctx.questionCourante) {
    return `Pour répondre à cette question, commence par bien lire l'énoncé et identifie ce qui est demandé. Réponds, puis je pourrai t'expliquer la méthode en détail.`;
  }

  return `Pose-moi une question précise sur le cours ou sur ce que tu ne comprends pas, je ferai de mon mieux pour t'aider !`;
}

export function repondreLocalement(messages: Message[], ctx: CoachContextLocal): string {
  return construireReponse(messages, ctx);
}
