import "server-only";

import { z } from "zod";

export const WordSchema = z.string().trim().min(1).max(64);
export const WordsSchema = z.array(WordSchema).length(26);
export const LetterSchema = z.string().trim().min(1).max(1);

export const GenerateBodySchema = z
  .object({
    words: WordsSchema,
    used: z.array(WordSchema).optional().default([]),
    favoriteLetter: z.string().optional().default(""),
    pTwoHop: z.number().optional().default(0.28),
  })
  .strict();
