import { z } from "zod";

const environmentSchema = z.object({
  // For Scrape
  USERNAME: z.string(),
  PASSWORD: z.string(),
  VERSION: z.string(),

  // For Image Generation and saving data (Requires URL only for image gen, both for saving)
  CHUNI_SERVICE_URL: z.string().optional(),
  CHUNI_SERVICE_API_KEY: z.string().optional(),

  // For sending image to Discord
  // Using Existing Discord Bot
  DISCORD_TOKEN: z.string().optional(),
  CHANNEL_ID: z.string().optional(),

  // Using Webhook
  DISCORD_WEBHOOK_URL: z.string().optional(),
});

export type Environment = z.infer<typeof environmentSchema>;
export const environment = environmentSchema.parse(process.env);
