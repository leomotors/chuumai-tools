import { z } from "zod";

import {
  clearMarkValues,
  rarityLevelValues,
  ratingTypeValues,
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
  isHidden: z.boolean().default(false),
});

export type BaseChartSchema = z.infer<typeof chartSchema>;

export const profileSchema = z.object({
  // Must be data URL of base64 or URL from website without CORS
  characterImage: z.string().nonempty(),
  characterRarity: z.enum(rarityLevelValues),

  teamName: z.string().nullish(),
  teamEmblem: z.enum(rarityLevelValues).nullish(),

  honorText: z.string().nonempty(),
  honorRarity: z.enum(rarityLevelValues),

  playerLevel: z.coerce.number(),
  playerName: z.string().nonempty(),
  classEmblem: z.coerce.number().int().min(0).max(6).optional(),

  rating: z.coerce.number(),
  overpowerValue: z.coerce.number(),
  overpowerPercent: z.coerce.number(),

  lastPlayed: z.coerce.date(),
  playCount: z.coerce.number(),
});

export const hiddenChartSchema = z.object({
  search: z.coerce.string().nonempty(),
  difficulty: z.enum(stdChartDifficultyValues),
  ratingType: z.enum(ratingTypeValues),
  score: z.coerce.number().int().min(0).max(1010000),
  clearMark: z.enum(clearMarkValues).nullish(),
  fc: z.boolean().default(false),
  aj: z.boolean().default(false),
});

export type HiddenChart = z.infer<typeof hiddenChartSchema>;

export const imgGenInputSchema = z.object({
  profile: profileSchema,
  best: z.array(chartSchema),
  current: z.array(chartSchema),
  hidden: z.array(hiddenChartSchema).optional(),
});

export type ImgGenInput = z.infer<typeof imgGenInputSchema>;
