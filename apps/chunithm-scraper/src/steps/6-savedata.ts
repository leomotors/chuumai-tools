import { logger } from "@repo/core/utils";
import type { FullPlayDataInput, ImgGenInput } from "@repo/types/chuni";

import type { ApiClient } from "../api.js";
import { environment } from "../environment.js";
import { recordToGenInputWithFullChain } from "../parser/music.js";
import type { scrapePlayerData } from "./2-playerdata.js";
import type { scrapeMusicRecord } from "./3-music.js";

type Params = {
  playerData: Awaited<ReturnType<typeof scrapePlayerData>>["playerData"];
  recordData: Awaited<ReturnType<typeof scrapeMusicRecord>>["recordData"];
  fullPlayDataInput: FullPlayDataInput;
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
    fullPlayDataInput,
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
        characterRarity: playerData.characterRarity,
        characterImage: playerData.characterImage,
        teamName: playerData.teamName ?? null,
        teamEmblem: playerData.teamEmblem ?? null,
        mainHonorText: playerData.mainHonorText,
        mainHonorRarity: playerData.mainHonorRarity,
        subHonor1Text: playerData.subHonor1Text ?? null,
        subHonor1Rarity: playerData.subHonor1Rarity ?? null,
        subHonor2Text: playerData.subHonor2Text ?? null,
        subHonor2Rarity: playerData.subHonor2Rarity ?? null,
        playerLevel: playerData.playerLevel,
        playerName: playerData.playerName,
        classBand: playerData.classBand ?? null,
        classEmblem: playerData.classEmblem ?? null,
        rating: playerData.rating,
        overpowerValue: playerData.overpowerValue,
        overpowerPercent: playerData.overpowerPercent,
        lastPlayed: playerData.lastPlayed.toISOString(),
        currentCurrency: playerData.currentCurrency,
        totalCurrency: playerData.totalCurrency,
        playCount: playerData.playCount,
      },
      recordData: {
        best: recordData.bestSongs.map(recordToGenInputWithFullChain),
        current: recordData.currentSongs.map(recordToGenInputWithFullChain),
        selectionBest: recordData.selectionBestSongs.map(
          recordToGenInputWithFullChain,
        ),
        selectionCurrent: recordData.selectionCurrentSongs.map(
          recordToGenInputWithFullChain,
        ),
        allRecords: recordData.allRecords.map(recordToGenInputWithFullChain),
        history: fullPlayDataInput.history,
      },
      playerDataHtml,
      allMusicRecordHtml,
      imgGenInput: {
        ...imgGenInput,
        profile: {
          ...imgGenInput.profile,
          lastPlayed: playerData.lastPlayed.toISOString(),
        },
      },
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
