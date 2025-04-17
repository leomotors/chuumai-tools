import { z } from "zod";

import { chartSchema, profileSchema } from "@repo/types-chuni";

export const chartForRenderSchema = chartSchema.extend({
  constant: z.number(),
  constantSure: z.boolean(),
  rating: z.number(),
  image: z.string(),
});

export type ChartForRender = z.infer<typeof chartForRenderSchema>;

export const rawImageGenSchema = z.object({
  profile: profileSchema,
  best: z.array(chartForRenderSchema),
  current: z.array(chartForRenderSchema),
  rating: z.object({
    bestAvg: z.number(),
    currentAvg: z.number(),
    totalAvg: z.number(),
  }),
});

export type RawImageGen = z.infer<typeof rawImageGenSchema>;
