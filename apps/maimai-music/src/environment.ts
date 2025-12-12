import { z } from "@repo/types/zod";

const environmentSchema = z.object({
  DATABASE_URL: z.string().nonempty(),
  AWS_ENDPOINT: z.string().nonempty(),
  AWS_REGION: z.string().nonempty(),
  AWS_ACCESS_KEY_ID: z.string().nonempty(),
  AWS_SECRET_ACCESS_KEY: z.string().nonempty().default("us-east-1"),
  AWS_BUCKET_NAME: z.string().nonempty(),
});

export const environment = environmentSchema.parse(process.env);
