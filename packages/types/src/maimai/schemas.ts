import { z } from "../zod";
import {
  allChartDifficultyValues,
  chartTypeValues,
  chartTypeWithUtageValues,
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
  .omit({ score: true, chartType: true, difficulty: true })
  .extend({
    score: z.number().min(0).max(2020000),
    chartType: z.enum(chartTypeWithUtageValues),
    difficulty: z.enum(allChartDifficultyValues),
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
    scraperVersion: z.string().optional(),
  })
  .openapi("ImgGenInput");

export type ImgGenInput = z.infer<typeof imgGenInputSchema>;

export const fullPlayDataInputSchema = imgGenInputSchema
  .extend({
    allRecords: z.array(chartSchema),
    history: z.array(historyRecordSchema),
  })
  .openapi("FullPlayDataInput");

export type FullPlayDataInput = z.infer<typeof fullPlayDataInputSchema>;

export const chartForRenderSchema = chartSchema
  .extend({
    level: z.number(),
    levelSure: z.boolean(),
    rating: z.number().nullable(),
    image: z.string().nullable(),
  })
  .openapi("ChartForRender");

export type ChartForRender = z.infer<typeof chartForRenderSchema>;

export const ratingDetailSchema = z
  .object({
    bestSum: z.number().int().openapi({
      description: "Sum of best 35 songs rating",
      example: 14520,
    }),
    currentSum: z.number().int().openapi({
      description: "Sum of current 15 songs rating",
      example: 6230,
    }),
    total: z.number().int().openapi({
      description: "Total rating (bestSum + currentSum)",
      example: 20750,
    }),
  })
  .openapi("RatingDetail");

export type RatingDetail = z.infer<typeof ratingDetailSchema>;

export const rawImageGenSchema = z
  .object({
    profile: profileSchema,
    best: z.array(chartForRenderSchema).openapi({
      description: "Best 35 songs with rating info",
    }),
    current: z.array(chartForRenderSchema).openapi({
      description: "Current 15 songs with rating info",
    }),
    rating: ratingDetailSchema,
  })
  .openapi("RawImageGen");

export type RawImageGen = z.infer<typeof rawImageGenSchema>;
