import fs from "node:fs/promises";

import { getClassRankName, getCourseRankName } from "@repo/core/maimai";
import { logger } from "@repo/core/utils";
import type { RawImageGen } from "@repo/types/maimai";

import type { ApiClient } from "../api.js";
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
  apiClient: ApiClient | null,
) {
  if (!imageLocation) {
    logger.warn(
      "Image location is not provided. Skipping Discord image sending.",
    );
    return;
  }

  const image = await fs.readFile(imageLocation);
  const blob = new Blob([new Uint8Array(image)], { type: "image/png" });

  const parts: string[] = [];
  if (apiClient && environment.MAIMAI_SERVICE_API_KEY) {
    const { data, error } = await apiClient.GET("/api/users/playCount", {
      params: {
        query: { currentPlayCount: playerData.playCountTotal },
      },
    });

    if (error) {
      logger.warn(
        `Could not fetch play count periods for Discord: ${error.message ?? JSON.stringify(error)}`,
      );
    } else if (data) {
      if (typeof data.today === "number") {
        parts.push(`Today: ${data.today}`);
      }
      if (typeof data.thisWeek === "number") {
        parts.push(`This week: ${data.thisWeek}`);
      }
    }
  }

  parts.push(`This Version: ${playerData.playCountCurrent}`);
  const playCountPeriods = ` (${parts.join(" | ")})`;

  const message = `## Your Music for Rating Image is here!
**Scraper Version**: ${APP_VERSION} @ ${environment.VERSION}\t\t**Cached Login**: ${loginCached ? "Yes :white_check_mark:" : "No :arrows_clockwise:"}
**Player Name**: ${playerData.playerName}\t\t**Rating**: ${playerData.rating}${rawImgGen?.rating.total && playerData.rating !== rawImgGen?.rating.total ? ` (Calculated: ${rawImgGen?.rating.total})` : ""}
**Course & Class Rank**: ${getCourseRankName(playerData.courseRank ?? -1)} | ${getClassRankName(playerData.classRank ?? -1)}\t\t
**Star**: ${playerData.star}\t\t**Play Count**: ${playerData.playCountTotal}${playCountPeriods}
${rawImgGen?.profile.lastPlayed ? `**Last Played**: <t:${Math.floor(new Date(rawImgGen?.profile.lastPlayed).getTime() / 1000)}:F>` : ""}
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
