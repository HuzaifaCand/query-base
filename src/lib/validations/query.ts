import { z } from "zod";

export const createQuerySchema = z
  .object({
    description: z.string().default(""),
    hasVoiceNote: z.boolean().default(false),
    isPrivate: z.boolean().default(false),
    images: z.array(z.instanceof(File)).default([]),
  })
  .refine((data) => data.description.trim().length > 0 || data.hasVoiceNote, {
    message: "Please describe your issue or record a voice note",
    path: ["description"],
  });

export type CreateQueryFormData = z.infer<typeof createQuerySchema>;
