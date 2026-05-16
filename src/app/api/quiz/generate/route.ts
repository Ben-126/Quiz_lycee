import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { genererQuizMock } from "@/lib/mock-quiz";
import { checkRateLimit } from "@/lib/ratelimit";
import { getMatiereBySlugAndNiveau, type Niveau } from "@/data/programmes";
import { QuizSchema } from "@/lib/quiz-schema";
import { MAX_TOKENS_GENERATION } from "@/lib/constants";

const RequestSchema = z.object({
  matiereSlug: z.string().min(1).max(100),
  chapitreSlug: z.string().min(1).max(100),
  niveauLycee: z.enum(["seconde", "premiere", "terminale"]).optional().default("seconde"),
  niveau: z.enum(["debutant", "intermediaire", "avance"]).optional(),
  questionsRatees: z.array(z.string().max(500)).max(10).optional(),
  questionsParQuiz: z.union([z.literal(3), z.literal(5), z.literal(10)]).optional().default(5),
});

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  const { autorise } = await checkRateLimit(ip, "generate");
  if (!autorise) {
    return NextResponse.json(
      { error: "Trop de requêtes. Attendez une minute avant de réessayer." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide." }, { status: 400 });
  }

  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    // Ne pas exposer les détails Zod au client
    return NextResponse.json({ error: "Paramètres invalides." }, { status: 400 });
  }

  const { matiereSlug, chapitreSlug, niveauLycee, niveau, questionsRatees, questionsParQuiz } = parsed.data;

  const matiere = getMatiereBySlugAndNiveau(niveauLycee as Niveau, matiereSlug);
  if (!matiere) {
    return NextResponse.json({ error: "Matière introuvable." }, { status: 404 });
  }

  const chapitre = matiere.chapitres.find((c) => c.slug === chapitreSlug);
  if (!chapitre) {
    return NextResponse.json({ error: "Chapitre introuvable." }, { status: 404 });
  }

  const niveauLabel = niveauLycee === "premiere" ? "Première" : niveauLycee === "terminale" ? "Terminale" : "Seconde";

  const apiKey = process.env.GROQ_API_KEY;

  if (apiKey) {
    try {
      const { default: OpenAI } = await import("openai");
      const client = new OpenAI({ apiKey, baseURL: "https://api.groq.com/openai/v1" });
      const competences = chapitre.competences.map((c) => c.titre).join(", ");

      const niveauInstruction = niveau === "debutant"
        ? "Les questions doivent être simples et accessibles, avec des notions fondamentales et des formulations claires."
        : niveau === "avance"
        ? "Les questions doivent être plus approfondies et exigeantes, testant la compréhension fine et l'application de concepts complexes."
        : `Les questions doivent être de difficulté standard, adaptées au niveau ${niveauLabel}.`;

      const revisionInstruction = questionsRatees && questionsRatees.length > 0
        ? `\nCONTEXTE RÉVISION : L'élève a eu des difficultés sur ces questions lors du quiz précédent :\n${questionsRatees.map((q, i) => `${i + 1}. ${q}`).join("\n")}\nConçois des questions qui renforcent la compréhension de ces notions spécifiques.`
        : "";

      const matieresAvecEtapes = new Set(["mathematiques", "physique-chimie", "svt", "snt", "sciences-numeriques-et-technologie"]);
      const avecEtapes = matieresAvecEtapes.has(matiereSlug);

      const instructionExplicationAvancee = avecEtapes
        ? `- "explicationAvancee" est OBLIGATOIRE pour cette matière. Remplis les 3 champs :
  * "etapes" : liste ordonnée de 2 à 5 étapes de résolution claires et concises
  * "methode" : nom de la méthode ou technique utilisée (ex. "Identité remarquable", "Tableau de signes")
  * "erreurs_frequentes" : 2 à 3 erreurs classiques que font les élèves sur ce type de question`
        : `- "explicationAvancee" est optionnel. Si pertinent, tu peux ajouter "erreurs_frequentes" (2-3 erreurs courantes).`;

      const prompt = `Tu es un professeur expert pour la classe de ${niveauLabel} en France.
Génère exactement ${questionsParQuiz} questions de quiz sur le chapitre suivant :
- Matière : ${matiere.nom}
- Chapitre : ${chapitre.titre}
- Compétences ciblées : ${competences}

Niveau de difficulté : ${niveauInstruction}${revisionInstruction}

Génère un mélange de types : QCM (4 options), Vrai/Faux, et Réponse courte.
Les questions doivent être précises, pédagogiquement correctes et adaptées au niveau ${niveauLabel}.

RÈGLES IMPORTANTES :
- Pour les QCM : "reponseCorrecte" doit être EXACTEMENT le texte complet de l'une des options (jamais une lettre comme A, B, C ou D).
- Pour les réponses courtes : "reponseCorrecte" doit être la réponse canonique courte et précise (1 à 5 mots).
- Les 4 options d'un QCM doivent être distinctes et réalistes.
- "explication" : résumé clair en 1 à 3 phrases.
${instructionExplicationAvancee}

Réponds UNIQUEMENT avec un JSON valide, sans texte avant ou après :
{
  "questions": [
    {
      "type": "qcm",
      "question": "Développer (x + 3)(x - 3) donne :",
      "options": ["x² + 9", "x² - 9", "x² + 6x + 9", "x² - 6x + 9"],
      "reponseCorrecte": "x² - 9",
      "explication": "On utilise l'identité (a+b)(a-b) = a²-b². Ici a=x, b=3, donc x²-9.",
      "explicationAvancee": {
        "etapes": [
          "Identifier la forme (a+b)(a-b) avec a=x et b=3",
          "Appliquer l'identité remarquable : (a+b)(a-b) = a²-b²",
          "Calculer : x² - 3² = x² - 9"
        ],
        "methode": "Identité remarquable (différence de deux carrés)",
        "erreurs_frequentes": [
          "Développer terme à terme au lieu d'utiliser l'identité",
          "Oublier le signe moins : écrire x²+9 au lieu de x²-9",
          "Confondre avec (x+3)² = x²+6x+9"
        ]
      }
    },
    {
      "type": "vrai_faux",
      "question": "...",
      "reponseCorrecte": true,
      "explication": "...",
      "explicationAvancee": {
        "erreurs_frequentes": ["..."]
      }
    },
    {
      "type": "reponse_courte",
      "question": "...",
      "reponseCorrecte": "...",
      "explication": "...",
      "explicationAvancee": {
        "etapes": ["...", "..."],
        "methode": "...",
        "erreurs_frequentes": ["...", "..."]
      }
    }
  ]
}`;

      const completion = await client.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        max_tokens: MAX_TOKENS_GENERATION,
        messages: [{ role: "user", content: prompt }],
      });

      const text = completion.choices[0]?.message?.content;
      if (!text) throw new Error("Réponse inattendue de l'IA");

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("Format JSON introuvable dans la réponse");

      const rawParsed = JSON.parse(jsonMatch[0]);

      // SÉCURITÉ : valider la réponse IA avec le schéma Zod avant de l'envoyer au client
      const validated = QuizSchema.safeParse(rawParsed);
      if (!validated.success) {
        throw new Error("Réponse IA non conforme au schéma attendu");
      }

      return NextResponse.json(validated.data, { headers: { "Cache-Control": "no-store" } });
    } catch (err: unknown) {
      // Log serveur uniquement, jamais exposé au client
      if (process.env.NODE_ENV !== "production") {
        console.error("[quiz/generate] Erreur OpenAI, fallback mock:", err);
      }
      const questions = genererQuizMock(matiereSlug, chapitreSlug);
      return NextResponse.json({ questions }, { headers: { "Cache-Control": "no-store" } });
    }
  }

  const questions = genererQuizMock(matiereSlug, chapitreSlug);
  return NextResponse.json({ questions }, { headers: { "Cache-Control": "no-store" } });
}
