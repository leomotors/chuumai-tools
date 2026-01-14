import { logger } from "@repo/core/utils";
import type { FullPlayDataInput, ImgGenInput } from "@repo/types/maimai";

import type { ApiClient } from "../api.js";
import { environment } from "../environment.js";
import type { scrapeMusicRecord } from "./3-music.js";

type Params = {
  imgGenInput: ImgGenInput;
  recordData: Awaited<ReturnType<typeof scrapeMusicRecord>>["recordData"];
  fullPlayDataInput: FullPlayDataInput;
  playerDataHtml: string;
  allMusicRecordHtml: string;
  calculatedRating: number | undefined;
  lastPlayed: string;
};

export async function saveDataToService(
  jobId: number,
  apiClient: NonNullable<ApiClient>,
  {
    imgGenInput,
    recordData,
    fullPlayDataInput,
    playerDataHtml,
    allMusicRecordHtml,
    calculatedRating,
    lastPlayed,
  }: Params,
) {
  logger.log("Saving data to service via API...");

  const playerData = fullPlayDataInput.profile;

  const response = await apiClient.POST("/api/jobs/data", {
    body: {
      jobId,
      playerData: {
        ...playerData,
        courseRank: playerData.courseRank ?? 0,
        classRank: playerData.classRank ?? 0,
        playCountCurrent: playerData.playCountCurrent ?? 0,
        playCountTotal: playerData.playCountTotal ?? 0,
        lastPlayed: lastPlayed,
      },
      recordData: {
        best: recordData.bestSongs,
        current: recordData.currentSongs,
        selectionBest: recordData.selectionBestSongs,
        selectionCurrent: recordData.selectionCurrentSongs,
        allRecords: recordData.allRecords,
        history: fullPlayDataInput.history,
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
