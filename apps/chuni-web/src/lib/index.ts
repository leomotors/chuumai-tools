import { z } from "zod";

import { stdChartDifficultyValues } from "@repo/db-chuni/schema";

export const chartSchema = z.object({
  id: z.coerce.number(),
  title: z.string().nonempty(),
  difficulty: z.enum(stdChartDifficultyValues),
  score: z.coerce.number().int().min(0).max(1010000),
  clearMark: z
    .enum(["CLEAR", "HARD", "ABSOLUTE", "ABSOLUTE+", "CATASTROPHY"])
    .nullish(),
  fc: z.boolean().default(false),
  aj: z.boolean().default(false),
});

export type BaseChartSchema = z.infer<typeof chartSchema>;

export const inputSchema = z.object({
  playerName: z.string().nonempty(),
  playerRating: z.coerce.number(),
  playerLevel: z.coerce.number(),
  lastPlayed: z.coerce.date(),
  characterImage: z.string(),
  characterFrame: z.string(),
  honorText: z.string(),
  honorLevel: z.string(),
  classEmblem: z.number().int().optional(),
  best: z.array(chartSchema),
  new: z.array(chartSchema),
});

export type Input = z.infer<typeof inputSchema>;
