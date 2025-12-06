import { z } from "@repo/utils/zod";

const environmentSchema = z.object({
  // For Scrape
  USERNAME: z.string(),
  PASSWORD: z.string(),
  VERSION: z.string(),

  // For saving to Database (requires seed)
  DATABASE_URL: z.string().optional(),

  // For Image Generation (Suggest: https://chuni.wonderhoy.me)
  IMAGE_GEN_URL: z.string().optional(),

  // For sending image to Discord
  // Using Existing Discord Bot
  DISCORD_TOKEN: z.string().optional(),
  CHANNEL_ID: z.string().optional(),

  // Using Webhook
  DISCORD_WEBHOOK_URL: z.string().optional(),
});

export type Environment = z.infer<typeof environmentSchema>;
export const environment = environmentSchema.parse(process.env);
