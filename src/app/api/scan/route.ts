import { NextRequest } from "next/server";
import { z } from "zod";

const RequestSchema = z.object({
  image: z.string().min(100).max(10_000_000), // base64
  mimeType: z.enum(["image/jpeg", "image/png", "image/webp", "image/gif"]).default("image/jpeg"),
  matiere: z.string().max(100).optional(),
  niveau: z.enum(["seconde", "premiere", "terminale"]).optional(),
});

export type ScanResultat = {
  correction: string;
  note: string;
  explication: string;
  etapes: string[];
  conseils: string[];
};

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

const SYSTEM_PROMPT = `Tu es un professeur expert qui corrige des exercices scolaires français (lycée).
Analyse l'image de l'exercice et fournis une correction complète au format JSON strict.

Retourne UNIQUEMENT un objet JSON valide avec ces champs :
{
  "correction": "La correction complète et détaillée de l'exercice",
  "note": "Une appréciation de la difficulté ou du type d'exercice (ex: 'Exercice de niveau moyen en algèbre')",
  "explication": "L'explication du concept clé mis en jeu dans cet exercice",
  "etapes": ["Étape 1 : ...", "Étape 2 : ...", "Étape 3 : ..."],
  "conseils": ["Conseil méthodologique 1", "Conseil méthodologique 2"]
}

Règles :
- Toujours en français
- Adapté au niveau lycée
- Si l'image n'est pas un exercice scolaire, retourne un JSON avec correction = "Image non reconnue comme exercice scolaire."
- Sois précis et pédagogue
- Maximum 3 étapes et 2 conseils`;

function fallbackSansApiKey(): ScanResultat {
  return {
    correction: "Le service de correction est temporairement indisponible. Réessaie dans quelques instants.",
    note: "Service indisponible",
    explication: "Notre IA de correction rencontre un problème technique. Cela devrait être résolu rapidement.",
    etapes: [],
    conseils: ["Réessaie dans quelques minutes", "Si le problème persiste, contacte le support"],
  };
}

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  if (!checkRateLimit(ip)) {
    return Response.json({ error: "Trop de requêtes. Attendez une minute avant de réessayer." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Corps de requête invalide." }, { status: 400 });
  }

  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Paramètres invalides.", details: parsed.error.flatten() }, { status: 400 });
  }

  const { image, mimeType, matiere, niveau } = parsed.data;

  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey || !apiKey.startsWith("sk-")) {
    return Response.json(fallbackSansApiKey());
  }

  const niveauLabel = niveau === "premiere" ? "Première" : niveau === "terminale" ? "Terminale" : "Seconde";
  const contexte = [
    matiere ? `Matière : ${matiere}` : null,
    niveau ? `Niveau : ${niveauLabel}` : null,
  ].filter(Boolean).join(", ");

  const userContent = contexte
    ? `Corrige cet exercice scolaire. Contexte : ${contexte}`
    : "Corrige cet exercice scolaire.";

  try {
    const { default: OpenAI } = await import("openai");
    const client = new OpenAI({ apiKey });

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 1000,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: [
            { type: "text", text: userContent },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${image}`,
                detail: "high",
              },
            },
          ],
        },
      ],
      response_format: { type: "json_object" },
    });

    const raw = response.choices[0]?.message?.content ?? "{}";
    let resultat: ScanResultat;

    try {
      const parsedResult = JSON.parse(raw) as Partial<ScanResultat>;
      resultat = {
        correction: parsedResult.correction ?? "Correction non disponible.",
        note: parsedResult.note ?? "",
        explication: parsedResult.explication ?? "",
        etapes: Array.isArray(parsedResult.etapes) ? parsedResult.etapes : [],
        conseils: Array.isArray(parsedResult.conseils) ? parsedResult.conseils : [],
      };
    } catch {
      resultat = {
        correction: raw,
        note: "",
        explication: "",
        etapes: [],
        conseils: [],
      };
    }

    return Response.json(resultat);
  } catch (err: unknown) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[scan] Erreur OpenAI:", err);
    }
    // Clé invalide ou quota dépassé → fallback au lieu d'une erreur 500
    const status = (err as { status?: number })?.status;
    if (status === 401 || status === 403 || status === 429) {
      return Response.json(fallbackSansApiKey());
    }
    return Response.json({ error: "Erreur lors de l'analyse. Veuillez réessayer." }, { status: 500 });
  }
}
