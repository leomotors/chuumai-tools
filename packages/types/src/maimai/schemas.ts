import { z } from "../zod";
import {
  chartTypeValues,
  comboMarkValues,
  rarityLevelValues,
  stdChartDifficultyValues,
  syncMarkValues,
} from "./values";

export const chartSchema = z
  .object({
    title: z.string().nonempty(),
    chartType: z.enum(chartTypeValues),
    difficulty: z.enum(stdChartDifficultyValues),
    score: z.number().min(0).max(1010000),
    dxScore: z.number().min(0).nullish(),
    dxScoreMax: z.number().min(0).nullish(),
    comboMark: z.enum(comboMarkValues).nullish(),
    syncMark: z.enum(syncMarkValues).nullish(),
  })
  .openapi("Chart");

export type ChartSchema = z.infer<typeof chartSchema>;

export const historyRecordSchema = chartSchema
  .extend({
    trackNo: z.number().int().min(1),
    playedAt: z.iso.datetime(),
  })
  .openapi("HistoryRecord");

export type HistoryRecordSchema = z.infer<typeof historyRecordSchema>;

export const profileWithoutLastPlayedSchema = z
  .object({
    characterImage: z.string().nonempty(),

    honorText: z.string().nonempty(),
    honorRarity: z.enum(rarityLevelValues),

    playerName: z.string().nonempty(),

    courseRank: z.number().int().nonnegative().optional(), // Course Mode
    classRank: z.number().int().nonnegative().optional(), // オトモダチ

    rating: z.number().int(),
    star: z.number().int(),

    playCountCurrent: z.number().int().optional(),
    playCountTotal: z.number().int().optional(),
  })
  .openapi("ProfileWithoutLastPlayed");

export const profileSchema = profileWithoutLastPlayedSchema
  .extend({
    lastPlayed: z.iso.datetime(),
  })
  .openapi("Profile");

export type ProfileWithoutLastPlayed = z.infer<
  typeof profileWithoutLastPlayedSchema
>;
export type ProfileSchema = z.infer<typeof profileSchema>;

export const imgGenInputSchema = z
  .object({
    profile: profileSchema,
    best: z.array(chartSchema),
    current: z.array(chartSchema),
  })
  .openapi("ImgGenInput");

export type ImgGenInput = z.infer<typeof imgGenInputSchema>;

export const fullPlayDataInputSchema = imgGenInputSchema
  .extend({
    allRecords: z.array(chartSchema),
  })
  .openapi("FullPlayDataInput");

export type FullPlayDataInput = z.infer<typeof fullPlayDataInputSchema>;
