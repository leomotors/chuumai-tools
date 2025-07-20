import { z } from "zod";

import { stdChartDifficultyValues } from "@repo/db-chuni/schema";

/*
Examples:

STD Chart Only

{
  "artist": "削除",
  "catcode": "maimai",
  "image_url": "35b2760a42a8eebe.png",
  "release": "000000",
  "lev_bas": "7+",
  "lev_adv": "11",
  "lev_exp": "13+",
  "lev_mas": "14+",
  "lev_remas": "15",
  "sort": "1145",
  "title": "PANDORA PARADOXXX",
  "title_kana": "PANDORAPARADOXXX",
  "version": "19998"
},

DX Chart Only

{
  "artist": "rintaro soma",
  "catcode": "maimai",
  "dx_lev_bas": "7",
  "dx_lev_adv": "10",
  "dx_lev_exp": "13+",
  "dx_lev_mas": "14+",
  "dx_lev_remas": "15",
  "image_url": "1ace9e4612c5e020.png",
  "release": "000000",
  "sort": "1256",
  "title": "系ぎて",
  "title_kana": "ツナキテ",
  "version": "24015"
},

Both Versions

{
  "artist": "xi",
  "catcode": "ゲーム＆バラエティ",
  "dx_lev_bas": "3",
  "dx_lev_adv": "8",
  "dx_lev_exp": "11",
  "dx_lev_mas": "13",
  "image_url": "4e2279e433710717.png",
  "release": "000000",
  "lev_bas": "6",
  "lev_adv": "8+",
  "lev_exp": "12",
  "lev_mas": "14",
  "sort": "709",
  "title": "Halcyon",
  "title_kana": "HALCYON",
  "version": "22501"
},
 */

// Only field we need
export const musicSchema = z.object({
  title: z.string(),
  artist: z.string(),
  catcode: z.string(),
  image_url: z.string(),

  // STD
  lev_bas: z.string().optional(),
  lev_adv: z.string().optional(),
  lev_exp: z.string().optional(),
  lev_mas: z.string().optional(),
  lev_remas: z.string().optional(),

  // DX
  dx_lev_bas: z.string().optional(),
  dx_lev_adv: z.string().optional(),
  dx_lev_exp: z.string().optional(),
  dx_lev_mas: z.string().optional(),
  dx_lev_remas: z.string().optional(),
});

export const musicJsonSchema = z.array(musicSchema);

// Using only field we need, from: https://arcade-songs.zetaraku.dev/maimai/
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
