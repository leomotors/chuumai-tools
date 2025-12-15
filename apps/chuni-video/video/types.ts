import { clearMarkValues, stdChartDifficultyValues } from "@repo/types/chuni";
import { z } from "zod";

// Schema for RecordView
export const chartForVideoSchemaZod3 = z.object({
  id: z.coerce.number(),
  title: z.string().nonempty(),
  artist: z.string(),
  difficulty: z.enum(stdChartDifficultyValues),
  score: z.coerce.number().int().min(0).max(1010000),
  clearMark: z.enum(clearMarkValues).nullish(),
  fc: z.boolean().default(false),
  aj: z.boolean().default(false),
  constant: z.number(),
  constantSure: z.boolean(),
  rating: z.number().nullable(),
  image: z.string().nullable(),
});

export const videoSchema = z.object({
  url: z.string(),
  offset: z.number(),
});

export const detailSchema = z.object({
  comment: z.string(),
  rankType: z.enum(["Best", "Current"]),
  rankInType: z.number(),
  rankTotal: z.number(),
});

export const recordViewWithoutVideoSchema = z.object({
  version: z.string(),
  chart: chartForVideoSchemaZod3,
  detail: detailSchema,
});

export const recordViewSchema = recordViewWithoutVideoSchema.extend({
  video: videoSchema,
});

// Schema for RecordSequence
export const videoMappingSchema = z.array(
  z.object({
    id: z.coerce.number(),
    title: z.string(),
    difficulty: z.enum(stdChartDifficultyValues),
    url: z.string(),
    offset: z.number(),
  }),
);

export const videoConfigSchema = z.object({
  durationPerSong: z.number().int().min(1),
});

export const recordSequenceSchema = z.object({
  songs: z.array(recordViewWithoutVideoSchema),
  videoMapping: videoMappingSchema,
  videoConfig: videoConfigSchema,
});
