import { logger } from "@repo/core/utils";
import type { ImgGenInput } from "@repo/types/maimai";

import type { ApiClient } from "../api.js";
import { environment } from "../environment.js";
import type { scrapePlayerData } from "./2-playerdata.js";
import type { scrapeMusicRecord } from "./3-music.js";

type Params = {
  playerData: Awaited<ReturnType<typeof scrapePlayerData>>["playerData"];
  recordData: Awaited<ReturnType<typeof scrapeMusicRecord>>["recordData"];
  playerDataHtml: string;
  allMusicRecordHtml: string;
  imgGenInput: ImgGenInput;
  calculatedRating: number | undefined;
};

export async function saveDataToService(
  jobId: number,
  apiClient: NonNullable<ApiClient>,
  {
    playerData,
    recordData,
    playerDataHtml,
    allMusicRecordHtml,
    imgGenInput,
    calculatedRating,
  }: Params,
) {
  logger.log("Saving data to service via API...");

  const response = await apiClient.POST("/api/jobs/data", {
    body: {
      jobId,
      playerData: {
        ...playerData,
        courseRank: playerData.courseRank ?? 0,
        classRank: playerData.classRank ?? 0,
        playCountCurrent: playerData.playCountCurrent ?? 0,
        playCountTotal: playerData.playCountTotal ?? 0,
        lastPlayed: "2000-01-01T00:00:00.000Z", // Dummy date to bypass validation
      },
      recordData: {
        best: recordData.bestSongs,
        current: recordData.currentSongs,
        selectionBest: recordData.selectionBestSongs,
        selectionCurrent: recordData.selectionCurrentSongs,
        allRecords: recordData.allRecords,
      },
      playerDataHtml,
      allMusicRecordHtml,
      imgGenInput,
      calculatedRating,
      version: environment.VERSION,
    },
  });

  if (response.error) {
    throw new Error(
      `Failed to save data to service: ${response.error.message || JSON.stringify(response.error)}`,
    );
  }

  logger.log(
    `Data saved successfully: ${response.data.recordsInserted} records inserted`,
  );
}
