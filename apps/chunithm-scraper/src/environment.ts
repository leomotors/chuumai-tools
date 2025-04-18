import { z } from "zod";

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
  DISCORD_TOKEN: z.string().optional(),
  CHANNEL_ID: z.string().optional(),
});

export const environment = environmentSchema.parse(process.env);
