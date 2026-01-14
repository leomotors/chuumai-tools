import { z } from "../zod";
import {
  clearMarkValues,
  rarityLevelValues,
  ratingTypeValues,
  stdChartDifficultyValues,
  teamRarityLevelValues,
} from "./values";

export const chartSchema = z
  .object({
    id: z.number(),
    title: z.string().nonempty(),
    difficulty: z.enum(stdChartDifficultyValues),
    score: z.number().int().min(0).max(1010000),
    clearMark: z.enum(clearMarkValues).nullish(),
    fc: z.boolean().default(false),
    aj: z.boolean().default(false),
    isHidden: z.boolean().default(false),
  })
  .openapi("Chart");

export type BaseChartSchema = z.infer<typeof chartSchema>;

export const chartSchemaWithFullChain = chartSchema
  .extend({
    fullChain: z.number().int().min(0).max(2).openapi({
      description: "Full Chain Status (0: None, 1: Gold, 2: Platinum)",
      example: 2,
    }),
  })
  .openapi("ChartWithFullChain");

export type ChartWithFullChain = z.infer<typeof chartSchemaWithFullChain>;

export const profileSchema = z
  .object({
    // Must be data URL of base64 or URL from website without CORS
    characterImage: z.string().nonempty(),
    characterRarity: z.enum(rarityLevelValues),

    teamName: z.string().nullish(),
    teamEmblem: z.enum(teamRarityLevelValues).nullish(),

    honorText: z.string().nonempty(),
    honorRarity: z.enum(rarityLevelValues),

    playerLevel: z.number(),
    playerName: z.string().nonempty(),
    classBand: z.number().int().min(0).max(6).optional(),
    // Actually classMedal (can't rename, it will be breaking change)
    classEmblem: z.number().int().min(0).max(6).optional(),

    rating: z.number(),
    overpowerValue: z.number(),
    overpowerPercent: z.number(),

    lastPlayed: z.coerce.date(),
    playCount: z.number(),
  })
  .openapi("Profile");

export const hiddenChartSchema = z
  .object({
    search: z.string().nonempty(),
    difficulty: z.enum(stdChartDifficultyValues),
    ratingType: z.enum(ratingTypeValues),
    score: z.number().int().min(0).max(1010000),
    clearMark: z.enum(clearMarkValues).nullish(),
    fc: z.boolean().default(false),
    aj: z.boolean().default(false),
  })
  .openapi("HiddenChart");

export type HiddenChart = z.infer<typeof hiddenChartSchema>;

export const imgGenInputSchema = z.object({
  profile: profileSchema,
  best: z.array(chartSchema),
  current: z.array(chartSchema),
  hidden: z.array(hiddenChartSchema).optional(),
  scraperVersion: z.string().optional(),
});

export const fullPlayDataInputSchema = imgGenInputSchema.extend({
  allRecords: z.array(chartSchema),
});

export type ImgGenInput = z.infer<typeof imgGenInputSchema>;
export type FullPlayDataInput = z.infer<typeof fullPlayDataInputSchema>;

export const chartForRenderSchema = chartSchema
  .extend({
    constant: z.number(),
    constantSure: z.boolean(),
    rating: z.number().nullable(),
    image: z.string().nullable(),
  })
  .openapi("ChartForRender");

export const chartForVideoSchema = chartForRenderSchema
  .extend({
    artist: z.string(),
  })
  .openapi("ChartForVideo");

export type ChartForRender = z.infer<typeof chartForRenderSchema>;

export const ratingDetailSchema = z
  .object({
    bestAvg: z.number(),
    currentAvg: z.number(),
    totalAvg: z.number(),
  })
  .openapi("RatingDetail");

export const rawImageGenSchema = z
  .object({
    profile: profileSchema,
    best: z.array(chartForRenderSchema),
    current: z.array(chartForRenderSchema),
    rating: ratingDetailSchema,
  })
  .openapi("RawImageGen");

export type RawImageGen = z.infer<typeof rawImageGenSchema>;
