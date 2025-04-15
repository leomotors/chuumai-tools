import { z } from "zod";

import { categoryValues } from "@repo/db-chuni/schema";

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
