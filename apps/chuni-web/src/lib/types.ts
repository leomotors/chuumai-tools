import type { musicDataTable, musicLevelTable } from "@repo/db-chuni/schema";
import { chartSchema, profileSchema } from "@repo/types/chuni";
import { z } from "@repo/utils/zod";

export const chartForRenderSchema = chartSchema
  .extend({
    constant: z.number(),
    constantSure: z.boolean(),
    rating: z.number().nullable(),
    image: z.string().nullable(),
  })
  .openapi("ChartForRender");

export type ChartForRender = z.infer<typeof chartForRenderSchema>;

export const rawImageGenSchema = z
  .object({
    profile: profileSchema,
    best: z.array(chartForRenderSchema),
    current: z.array(chartForRenderSchema),
    rating: z.object({
      bestAvg: z.number(),
      currentAvg: z.number(),
      totalAvg: z.number(),
    }),
  })
  .openapi("CalcRatingResponse");

export type RawImageGen = z.infer<typeof rawImageGenSchema>;

export type ChartConstantData = (typeof musicLevelTable.$inferSelect)[];
export type MusicData = Pick<
  typeof musicDataTable.$inferSelect,
  "id" | "title" | "image"
>[];
