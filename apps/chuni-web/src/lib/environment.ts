import { z } from "zod";

import { env as privateEnv } from "$env/dynamic/private";
import { env as publicEnv } from "$env/dynamic/public";

const environmentSchema = z.object({
  DATABASE_URL: z.string().url(),
  PUBLIC_VERSION: z.string().nonempty(),
  MUSIC_IMAGE_URL: z.string().url(),
});

export const environment = environmentSchema.parse({
  DATABASE_URL: privateEnv.DATABASE_URL,
  PUBLIC_VERSION: publicEnv.PUBLIC_VERSION,
  MUSIC_IMAGE_URL: privateEnv.MUSIC_IMAGE_URL,
});
