import fs from "node:fs/promises";

import { sendImage } from "../utils/discord.js";
import type { scrapePlayerData } from "./2-playerdata";

export async function sendDiscordImage(
  imageLocation: string | undefined,
  playerData: Awaited<ReturnType<typeof scrapePlayerData>>["playerData"],
) {
  if (!imageLocation) {
    console.warn(
      "Image location is not provided. Skipping Discord image sending.",
    );
    return;
  }

  const image = await fs.readFile(imageLocation);
  const blob = new Blob([image], { type: "image/png" });

  const message = `## Your Music for Rating Image is here!
**Name**: ${playerData.playerName}
**Level**: ${playerData.playerLevel}
**Play Count**: ${playerData.playCount}
**Rating**: ${playerData.rating.toFixed(2)}
**Last Played**: ${playerData.lastPlayed}`;

  await sendImage(
    message,
    blob,
    imageLocation.split("/").pop() || "image.png",
  ).catch((err) => {
    console.error(`Discord API Error: ${err}`);
  });
}
