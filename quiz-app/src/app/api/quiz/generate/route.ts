import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { genererQuizMock } from "@/lib/mock-quiz";
import { getMatiereBySlug, getChapitreBySlug } from "@/data/programme-seconde";
import { QuizSchema } from "@/lib/quiz-schema";
import { QUESTIONS_PAR_QUIZ } from "@/lib/constants";

const RequestSchema = z.object({
  matiereSlug: z.string().min(1).max(100),
  chapitreSlug: z.string().min(1).max(100),
  niveau: z.enum(["debutant", "intermediaire", "avance"]).optional(),
  questionsRatees: z.array(z.string().max(500)).max(10).optional(),
});

const rateLimit = new Map<string, { count: number; resetAt: number }>();
const MAX_REQ = 10;
const WINDOW_MS = 60_000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimit.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimit.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }

  if (entry.count >= MAX_REQ) return false;
  entry.count++;
  return true;
}

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  if (!checkRateLimit(ip)) {
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

  const { matiereSlug, chapitreSlug, niveau, questionsRatees } = parsed.data;

  if (!getMatiereBySlug(matiereSlug)) {
    return NextResponse.json({ error: "Matière introuvable." }, { status: 404 });
  }

  if (!getChapitreBySlug(matiereSlug, chapitreSlug)) {
    return NextResponse.json({ error: "Chapitre introuvable." }, { status: 404 });
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (apiKey) {
    try {
      const { default: OpenAI } = await import("openai");
      const client = new OpenAI({ apiKey });

      const matiere = getMatiereBySlug(matiereSlug)!;
      const { chapitre } = getChapitreBySlug(matiereSlug, chapitreSlug)!;
      const competences = chapitre.competences.map((c) => c.titre).join(", ");

      const niveauInstruction = niveau === "debutant"
        ? "Les questions doivent être simples et accessibles, avec des notions fondamentales et des formulations claires."
        : niveau === "avance"
        ? "Les questions doivent être plus approfondies et exigeantes, testant la compréhension fine et l'application de concepts complexes."
        : "Les questions doivent être de difficulté standard, adaptées au niveau Seconde.";

      const revisionInstruction = questionsRatees && questionsRatees.length > 0
        ? `\nCONTEXTE RÉVISION : L'élève a eu des difficultés sur ces questions lors du quiz précédent :\n${questionsRatees.map((q, i) => `${i + 1}. ${q}`).join("\n")}\nConçois des questions qui renforcent la compréhension de ces notions spécifiques.`
        : "";

      const prompt = `Tu es un professeur expert pour la classe de Seconde en France.
Génère exactement ${QUESTIONS_PAR_QUIZ} questions de quiz sur le chapitre suivant :
- Matière : ${matiere.nom}
- Chapitre : ${chapitre.titre}
- Compétences ciblées : ${competences}

Niveau de difficulté : ${niveauInstruction}${revisionInstruction}

Génère un mélange de types : QCM (4 options), Vrai/Faux, et Réponse courte.
Les questions doivent être précises, pédagogiquement correctes et adaptées au niveau Seconde.

RÈGLES IMPORTANTES :
- Pour les QCM : "reponseCorrecte" doit être EXACTEMENT le texte complet de l'une des options (jamais une lettre comme A, B, C ou D).
- Pour les réponses courtes : "reponseCorrecte" doit être la réponse canonique courte et précise (1 à 5 mots).
- Les 4 options d'un QCM doivent être distinctes et réalistes.

Réponds UNIQUEMENT avec un JSON valide, sans texte avant ou après :
{
  "questions": [
    {
      "type": "qcm",
      "question": "Quelle est la formule de l'eau ?",
      "options": ["CO2", "H2O", "NaCl", "O2"],
      "reponseCorrecte": "H2O",
      "explication": "L'eau est composée de 2 atomes d'hydrogène et 1 atome d'oxygène."
    },
    {
      "type": "vrai_faux",
      "question": "...",
      "reponseCorrecte": true,
      "explication": "..."
    },
    {
      "type": "reponse_courte",
      "question": "...",
      "reponseCorrecte": "...",
      "explication": "..."
    }
  ]
}`;

      const completion = await client.chat.completions.create({
        model: "gpt-4o-mini",
        max_tokens: 2048,
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
