import { z } from "zod";

const ExplicationAvanceeSchema = z.object({
  etapes: z.array(z.string().max(500)).max(10).optional(),
  methode: z.string().max(300).optional(),
  erreurs_frequentes: z.array(z.string().max(300)).max(5).optional(),
});

export const QuestionQCMSchema = z.object({
  type: z.literal("qcm"),
  question: z.string().min(5).max(500),
  options: z.array(z.string().max(200)).length(4),
  reponseCorrecte: z.string().max(200),
  explication: z.string().min(10).max(1000),
  explicationAvancee: ExplicationAvanceeSchema.optional(),
});

export const QuestionVraiFauxSchema = z.object({
  type: z.literal("vrai_faux"),
  question: z.string().min(5).max(500),
  reponseCorrecte: z.boolean(),
  explication: z.string().min(10).max(1000),
  explicationAvancee: ExplicationAvanceeSchema.optional(),
});

export const QuestionReponseCourteSchema = z.object({
  type: z.literal("reponse_courte"),
  question: z.string().min(5).max(500),
  reponseCorrecte: z.string().min(1).max(200),
  explication: z.string().min(10).max(1000),
  explicationAvancee: ExplicationAvanceeSchema.optional(),
});

export const QuestionSchema = z.discriminatedUnion("type", [
  QuestionQCMSchema,
  QuestionVraiFauxSchema,
  QuestionReponseCourteSchema,
]);

export const QuizSchema = z.object({
  questions: z.array(QuestionSchema).min(1).max(10),
});

export type QuizValidated = z.infer<typeof QuizSchema>;
