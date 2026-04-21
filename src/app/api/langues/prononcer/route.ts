import { NextRequest } from "next/server";

const LANGUES_WHISPER: Record<string, string> = {
  en: "en",
  es: "es",
  de: "de",
  it: "it",
  pt: "pt",
};

const NOMS_LANGUES: Record<string, string> = {
  en: "l'anglais",
  es: "l'espagnol",
  de: "l'allemand",
  it: "l'italien",
  pt: "le portugais",
};

function normaliserMot(mot: string): string {
  return mot.toLowerCase().replace(/[.,!?;:'"«»]/g, "").trim();
}

function calculerSimilarite(attendu: string, transcrit: string): number {
  const mots1 = attendu.split(/\s+/).map(normaliserMot).filter(Boolean);
  const mots2 = transcrit.split(/\s+/).map(normaliserMot).filter(Boolean);
  if (mots1.length === 0) return 0;
  let corrects = 0;
  for (let i = 0; i < Math.min(mots1.length, mots2.length); i++) {
    if (mots1[i] === mots2[i]) corrects++;
  }
  return corrects / mots1.length;
}

interface MotResultat {
  mot: string;
  correct: boolean;
  transcrit: string;
}

function comparerMots(attendu: string, transcrit: string): MotResultat[] {
  const motsAttendus = attendu.split(/\s+/).filter(Boolean);
  const motsTranscrits = transcrit.split(/\s+/).map(normaliserMot).filter(Boolean);

  return motsAttendus.map((mot, i) => {
    const motNorm = normaliserMot(mot);
    const transcritMot = motsTranscrits[i] ?? "";
    return { mot, correct: motNorm === transcritMot, transcrit: transcritMot };
  });
}

export async function POST(req: NextRequest) {
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return Response.json({ error: "Corps de requête invalide." }, { status: 400 });
  }

  const audio = formData.get("audio");
  const texte = formData.get("texte");
  const langue = formData.get("langue");

  if (!(audio instanceof Blob) || typeof texte !== "string" || typeof langue !== "string") {
    return Response.json({ error: "Paramètres manquants." }, { status: 400 });
  }

  if (texte.length > 500 || texte.length === 0) {
    return Response.json({ error: "Texte invalide." }, { status: 400 });
  }

  const codeWhisper = LANGUES_WHISPER[langue];
  if (!codeWhisper) {
    return Response.json({ error: "Langue non supportée." }, { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return Response.json({
      transcrit: "",
      similitude: 0,
      mots: comparerMots(texte, texte),
      feedback:
        "Clé API OpenAI non configurée. Ajoutez OPENAI_API_KEY dans votre fichier .env.local pour activer la correction de prononciation.",
      modeLocal: true,
    });
  }

  try {
    const { default: OpenAI } = await import("openai");
    const client = new OpenAI({ apiKey });

    const audioFile = new File([audio], "audio.webm", {
      type: audio.type || "audio/webm",
    });

    const transcription = await client.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
      language: codeWhisper,
      prompt: texte,
    });

    const transcrit = transcription.text.trim();
    const similitude = calculerSimilarite(texte, transcrit);
    const mots = comparerMots(texte, transcrit);

    let feedback: string;

    if (similitude >= 0.95) {
      feedback = "Excellent ! Votre prononciation est parfaite. Continuez comme ça !";
    } else if (similitude >= 0.75) {
      const erreurs = mots
        .filter((m) => !m.correct && m.transcrit)
        .map((m) => `"${m.mot}" → "${m.transcrit}"`)
        .slice(0, 3)
        .join(", ");

      const prompt = `Un élève français apprend ${NOMS_LANGUES[langue] ?? "une langue étrangère"}.
Il devait lire : "${texte}"
On a compris : "${transcrit}"
Légères différences : ${erreurs || "minimes"}
Donne un feedback de prononciation bienveillant et court (2-3 phrases en français) avec des conseils concrets.`;

      const res = await client.chat.completions.create({
        model: "gpt-4o-mini",
        max_tokens: 120,
        messages: [{ role: "user", content: prompt }],
      });
      feedback = res.choices[0]?.message?.content ?? "Bonne prononciation, quelques légères erreurs à corriger.";
    } else {
      const erreurs = mots
        .filter((m) => !m.correct && m.transcrit)
        .map((m) => `"${m.mot}" → "${m.transcrit}"`)
        .slice(0, 5)
        .join(", ");

      const prompt = `Un élève français apprend ${NOMS_LANGUES[langue] ?? "une langue étrangère"}.
Il devait lire : "${texte}"
On a compris : "${transcrit}"
Erreurs de prononciation : ${erreurs || "nombreuses"}
Donne un feedback constructif (3-4 phrases en français), identifie les principales erreurs et donne des conseils pratiques.`;

      const res = await client.chat.completions.create({
        model: "gpt-4o-mini",
        max_tokens: 150,
        messages: [{ role: "user", content: prompt }],
      });
      feedback = res.choices[0]?.message?.content ?? "Il y a des erreurs à corriger. Réessayez en articulant mieux.";
    }

    return Response.json({ transcrit, similitude, mots, feedback });
  } catch (err: unknown) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[prononcer] Erreur:", err);
    }
    return Response.json(
      { error: "Erreur lors de l'analyse de prononciation. Réessayez." },
      { status: 500 }
    );
  }
}
