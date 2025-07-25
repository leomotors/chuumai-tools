import fs from "node:fs/promises";

import type { RawImageGen } from "@/app/chuni-web/src/lib/types.js";

import { environment } from "../environment.js";
import { sendFiles } from "../utils/discord.js";
import { logger } from "../utils/logger.js";
import type { scrapePlayerData } from "./2-playerdata.js";

export async function sendDiscordImage(
  imageLocation: string | undefined,
  playerData: Awaited<ReturnType<typeof scrapePlayerData>>["playerData"],
  rawImgGen: RawImageGen | undefined,
) {
  if (!imageLocation) {
    logger.warn(
      "Image location is not provided. Skipping Discord image sending.",
    );
    return;
  }

  const image = await fs.readFile(imageLocation);
  const blob = new Blob([image], { type: "image/png" });

  const message = `## Your Music for Rating Image is here!
**Scraper Version**: ${APP_VERSION} @ ${environment.VERSION}
**Name**: ${playerData.playerName}
**Level**: ${playerData.playerLevel}
**Play Count**: ${playerData.playCount}
**Rating**: ${playerData.rating.toFixed(2)}${rawImgGen ? ` (${rawImgGen.rating.totalAvg.toFixed(4)})` : ""}
**Last Played**: ${playerData.lastPlayed}`;

  await sendFiles(message, [
    {
      blob,
      fileName: imageLocation.split("/").pop() || "image.png",
    },
  ]).catch((err) => {
    logger.error(`Discord API Error: ${err}`);
  });
}
