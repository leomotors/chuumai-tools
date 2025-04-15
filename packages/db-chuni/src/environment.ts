import { z } from "zod";

export const EnvironmentSchema = z.object({
  DATABASE_URL: z.string(),
});

export type Environment = z.infer<typeof EnvironmentSchema>;

export const environment = EnvironmentSchema.parse(process.env);
