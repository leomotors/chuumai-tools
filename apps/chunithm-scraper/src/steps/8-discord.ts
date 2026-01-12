import fs from "node:fs/promises";

import { logger } from "@repo/core/utils";
import type { RawImageGen } from "@repo/types/chuni";

import { environment } from "../environment.js";
import { sendFiles } from "../utils/discord.js";
import type { scrapePlayerData } from "./2-playerdata.js";

type TimeResult = {
  startTime: number;
  scrapeTimeMs: number;
  imageGenTimeMs: number;
};

export async function sendDiscordImage(
  imageLocation: string | undefined,
  playerData: Awaited<ReturnType<typeof scrapePlayerData>>["playerData"],
  rawImgGen: RawImageGen | undefined,
  loginCached: boolean,
  timeResult: TimeResult,
) {
  if (!imageLocation) {
    logger.warn(
      "Image location is not provided. Skipping Discord image sending.",
    );
    return;
  }

  const image = await fs.readFile(imageLocation);
  const blob = new Blob([new Uint8Array(image)], { type: "image/png" });

  const message = `## Your Music for Rating Image is here!
**Scraper Version**: ${APP_VERSION} @ ${environment.VERSION}\t\t**Cached Login**: ${loginCached ? "Yes :white_check_mark:" : "No :arrows_clockwise:"}
**Player Name**: ${playerData.playerName}\t\t**Rating**: ${playerData.rating.toFixed(2)}${rawImgGen ? ` (${rawImgGen.rating.totalAvg.toFixed(4)})` : ""}
**Level**: ${playerData.playerLevel}\t\t**Play Count**: ${playerData.playCount}
**Last Played**: <t:${Math.floor(playerData.lastPlayed.getTime() / 1000)}:F>
**Time Taken**: ${((performance.now() - timeResult.startTime) / 1000).toFixed(3)}s (Scrape: ${(timeResult.scrapeTimeMs / 1000).toFixed(3)}s | Image Gen: ${(timeResult.imageGenTimeMs / 1000).toFixed(3)}s)`;

  await sendFiles(message, [
    {
      blob,
      fileName: imageLocation.split("/").pop() || "image.png",
    },
  ]).catch((err) => {
    logger.error(`Discord API Error: ${err}`);
  });
}
