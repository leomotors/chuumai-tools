import {
  categoryValues,
  StdChartDifficulty,
  stdChartDifficultyValues,
} from "@repo/db-chuni/schema";
import { z } from "@repo/utils/zod";

export const musicSchema = z.object({
  id: z.coerce.number(),
  catname: z.enum(categoryValues),
  newflag: z.coerce.number(),
  title: z.string(),
  reading: z.string(),
  artist: z.string(),
  lev_bas: z.string(),
  lev_adv: z.string(),
  lev_exp: z.string(),
  lev_mas: z.string(),
  lev_ult: z.string(),
  we_kanji: z.string(),
  we_star: z.string(),
  image: z.string(),
});

export const musicJsonSchema = z.array(musicSchema);

// Using only field we need, from: https://arcade-songs.zetaraku.dev/chunithm/
const zSheet = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("std"),
    difficulty: z.enum(stdChartDifficultyValues),
    internalLevel: z.string().nullable(),
  }),
  z.object({
    type: z.literal("we"),
    difficulty: z.string(),
  }),
]);

const zSong = z.object({
  title: z.string(),
  sheets: z.array(zSheet),
});

export const zSchema = z.object({
  songs: z.array(zSong),
});

export const threeAlphaDiffValues = [
  "BAS",
  "ADV",
  "EXP",
  "MAS",
  "ULT",
] as const;
export type ThreeAlphaDiff = (typeof threeAlphaDiffValues)[number];

export const diffMapping: Record<ThreeAlphaDiff, StdChartDifficulty> = {
  BAS: "basic",
  ADV: "advanced",
  EXP: "expert",
  MAS: "master",
  ULT: "ultima",
};

// https://chuni-penguin.beerpsi.cc/developer/api/
// Only field I use
export const beerSchema = z.object({
  id: z.number(),
  title: z.string(),
  charts: z.array(
    z.object({
      difficulty: z.enum([...threeAlphaDiffValues, "WE"]),
      const: z.number().nullable(),
    }),
  ),
});
