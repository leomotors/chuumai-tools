import { z } from "@repo/types/zod";

const environmentSchema = z.object({
  USER_ID: z.string().nonempty(),
  CHUNI_DATABASE_URL: z.string().nonempty(),
  MAIMAI_DATABASE_URL: z.string().nonempty(),
});

export const environment = environmentSchema.parse(process.env);
