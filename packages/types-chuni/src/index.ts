import { z } from "zod";

import {
  clearMarkValues,
  rarityLevelValues,
  stdChartDifficultyValues,
} from "@repo/db-chuni/schema";

export const chartSchema = z.object({
  id: z.coerce.number(),
  title: z.string().nonempty(),
  difficulty: z.enum(stdChartDifficultyValues),
  score: z.coerce.number().int().min(0).max(1010000),
  clearMark: z.enum(clearMarkValues).nullish(),
  fc: z.boolean().default(false),
  aj: z.boolean().default(false),
});

export type BaseChartSchema = z.infer<typeof chartSchema>;

export const profileSchema = z.object({
  // Must be data URL of base64 or URL from website without CORS
  characterImage: z.string().nonempty(),
  characterRarity: z.enum(rarityLevelValues),

  teamName: z.string().nullish(),
  teamEmblem: z.enum(rarityLevelValues).nullish(),

  honorText: z.string().nonempty(),
  honorLevel: z.enum(rarityLevelValues),

  playerLevel: z.coerce.number(),
  playerName: z.string().nonempty(),
  classEmblem: z.coerce.number().int().min(1).max(6).optional(),

  rating: z.coerce.number(),
  overpowerValue: z.coerce.number(),
  overpowerPercent: z.coerce.number(),

  lastPlayed: z.coerce.date(),
  playCount: z.coerce.number(),
});

export const imgGenInputSchema = z.object({
  profile: profileSchema,
  best: z.array(chartSchema),
  new: z.array(chartSchema),
});

export type ImgGenInput = z.infer<typeof imgGenInputSchema>;
