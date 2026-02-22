import { z } from "zod";

export const createQuerySchema = z
  .object({
    title: z.string().optional(),
    description: z.string(),
    hasVoiceNote: z.boolean(),
    isPrivate: z.boolean(),
    isAnonymous: z.boolean(),
    images: z.array(z.instanceof(File)),
    tags: z
      .array(z.string())
      .min(1, "Please select at least one tag for your query"),
  })
  .refine((data) => data.description.trim().length > 0 || data.hasVoiceNote, {
    message: "Please describe your issue or record a voice note",
    path: ["description"],
  });

export type CreateQueryFormData = z.infer<typeof createQuerySchema>;

export const answerSchema = z
  .object({
    bodyText: z.string(),
    hasVoiceNote: z.boolean(),
    images: z.array(z.instanceof(File)),
  })
  .refine((data) => data.bodyText.trim().length > 0 || data.hasVoiceNote, {
    message: "Please write an answer or record a voice note",
    path: ["bodyText"],
  });

export type AnswerFormData = z.infer<typeof answerSchema>;
