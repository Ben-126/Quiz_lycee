import { NextRequest } from "next/server";
import { z } from "zod";

const MessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(2000),
});

const RequestSchema = z.object({
  messages: z.array(MessageSchema).min(1).max(20),
  context: z.object({
    matiere: z.string().max(100).optional(),
    chapitre: z.string().max(200).optional(),
    niveauLycee: z.enum(["seconde", "premiere", "terminale"]).optional(),
    questionCourante: z.string().max(500).optional(),
  }),
});

const rateLimit = new Map<string, { count: number; resetAt: number }>();
const MAX_REQ = 20;
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
    return new Response("Trop de requêtes. Attendez une minute avant de réessayer.", { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response("Corps de requête invalide.", { status: 400 });
  }

  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return new Response("Paramètres invalides.", { status: 400 });
  }

  const { messages, context } = parsed.data;

  const niveauLabel =
    context.niveauLycee === "premiere"
      ? "Première"
      : context.niveauLycee === "terminale"
      ? "Terminale"
      : "Seconde";

  const contexteParts: string[] = [];
  if (context.matiere) contexteParts.push(`Matière : ${context.matiere}`);
  if (context.chapitre) contexteParts.push(`Chapitre : ${context.chapitre}`);
  if (context.questionCourante) contexteParts.push(`Question actuelle : ${context.questionCourante}`);

  const contexteStr = contexteParts.length > 0
    ? `\nContexte de l'élève :\n${contexteParts.join("\n")}`
    : "";

  const systemPrompt = `Tu es un coach pédagogique bienveillant et expert pour les élèves de lycée en France (niveau ${niveauLabel}).
Ton rôle est d'expliquer, clarifier et aider l'élève à comprendre les notions du cours de manière personnalisée.${contexteStr}

Règles :
- Réponds toujours en français
- Sois encourageant et pédagogue
- Adapte ton niveau de langage à un lycéen
- Donne des exemples concrets quand c'est utile
- Si la question porte sur un exercice, guide sans donner directement la réponse
- Sois concis (3-5 phrases max sauf si une explication longue est vraiment nécessaire)
- N'invente pas de faits scientifiques ou mathématiques`;

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    const fallback = "Je suis le Coach IA, mais je ne suis pas encore configuré sur ce serveur. Demande à ton professeur de configurer la clé API.";
    return new Response(fallback, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  try {
    const { default: OpenAI } = await import("openai");
    const client = new OpenAI({ apiKey });

    const stream = await client.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 500,
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
      stream: true,
    });

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content ?? "";
            if (text) controller.enqueue(new TextEncoder().encode(text));
          }
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readableStream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (err: unknown) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[coach] Erreur OpenAI:", err);
    }
    return new Response("Désolé, le coach est momentanément indisponible. Réessaie dans quelques instants.", {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}
