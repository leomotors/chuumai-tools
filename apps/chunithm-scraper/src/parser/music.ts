import {
  ChartWithFullChain,
  ClearMark,
  HistoryRecordSchema,
  stdChartDifficultyValues,
} from "@repo/types/chuni";
import { BaseChartSchema } from "@repo/types/chuni";
import { historyRecordSchema } from "@repo/types/chuni";

export function parseMusic(element: Element) {
  const musicTitle = element.querySelector(".music_title")!.textContent!;

  const score = element
    .querySelector(".play_musicdata_highscore .text_b")
    ?.textContent?.trim();

  const scoreNumber = score ? parseInt(score.replace(/,/g, "")) : 0;

  const difficulty = element
    .querySelector("input[name=diff]")!
    .getAttribute("value")!;

  const musicIdx = element
    .querySelector("input[name=idx]")!
    .getAttribute("value")!;

  return {
    musicId: parseInt(musicIdx),
    musicTitle,
    score: scoreNumber,
    difficulty: parseInt(difficulty),
  };
}

function getClearMark(src: string | undefined): ClearMark | undefined {
  if (!src) {
    return undefined;
  }

  if (src.includes("icon_catastrophy")) {
    return "CATASTROPHY";
  }

  if (src.includes("icon_absolute")) {
    return "ABSOLUTE";
  }

  if (src.includes("icon_brave")) {
    return "BRAVE";
  }

  if (src.includes("icon_hard")) {
    return "HARD";
  }

  if (src.includes("icon_clear")) {
    return "CLEAR";
  }

  return undefined;
}

export function parseRecord(element: Element) {
  const basicMusic = parseMusic(element);

  const markImg = element.querySelectorAll(".play_musicdata_icon > img");
  const markImgArray = [...markImg] as HTMLImageElement[];
  const markImgSrc = markImgArray.map((img) => img.src);

  const clearMark = getClearMark(markImgSrc[0]);

  const aj = markImgSrc.some((src) => src.includes("icon_alljustice"));
  const fc = aj || markImgSrc.some((src) => src.includes("icon_fullcombo"));

  const fullChainPlus = markImgSrc.some((src) =>
    src.includes("icon_fullchain.png"),
  );
  const fullChainGold = markImgSrc.some((src) =>
    src.includes("icon_fullchain.png"),
  );

  return {
    ...basicMusic,
    clearMark,
    fc,
    aj,
    fullChain: fullChainPlus ? 2 : fullChainGold ? 1 : 0,
  };
}

export function recordToGenInput(
  record: ReturnType<typeof parseRecord>,
): BaseChartSchema {
  return {
    id: record.musicId,
    title: record.musicTitle,
    difficulty: stdChartDifficultyValues[record.difficulty],
    score: record.score,
    clearMark: record.clearMark,
    fc: record.fc,
    aj: record.aj,
    isHidden: false,
  };
}

export function recordToGenInputWithFullChain(
  record: ReturnType<typeof parseRecord>,
): ChartWithFullChain {
  return {
    id: record.musicId,
    title: record.musicTitle,
    difficulty: stdChartDifficultyValues[record.difficulty],
    score: record.score,
    clearMark: record.clearMark,
    fc: record.fc,
    aj: record.aj,
    fullChain: record.fullChain,
    isHidden: false,
  };
}

function parseDifficultyFromImage(src: string | null): number {
  if (!src) {
    return 0; // Default to BASIC
  }

  if (src.includes("musiclevel_basic")) {
    return 0; // BASIC
  }
  if (src.includes("musiclevel_advanced")) {
    return 1; // ADVANCED
  }
  if (src.includes("musiclevel_expert")) {
    return 2; // EXPERT
  }
  if (src.includes("musiclevel_master")) {
    return 3; // MASTER
  }
  if (src.includes("musiclevel_ultima")) {
    return 4; // ULTIMA
  }
  if (src.includes("musiclevel_worldsend")) {
    return 0; // World's End -> BASIC
  }

  return 0; // Default to BASIC
}

export function parseHistory(element: Element): HistoryRecordSchema {
  // Parse track number from play_track_text (e.g., "TRACK 3")
  const trackText = element.querySelector(".play_track_text")?.textContent;
  if (!trackText) {
    throw new Error("Failed to find track text");
  }
  const trackMatch = trackText.match(/TRACK\s+(\d+)/);
  if (!trackMatch) {
    throw new Error(`Failed to parse track number from: ${trackText}`);
  }
  const trackNo = parseInt(trackMatch[1], 10);

  // Parse played time from play_datalist_date (e.g., "2026/01/13 18:43")
  // Time is in JST (+9)
  const dateText = element
    .querySelector(".play_datalist_date")
    ?.textContent?.trim();
  if (!dateText) {
    throw new Error("Failed to find play date");
  }
  const dateMatch = dateText.match(
    /(\d{4})\/(\d{2})\/(\d{2})\s+(\d{2}):(\d{2})/,
  );
  if (!dateMatch) {
    throw new Error(`Failed to parse date from: ${dateText}`);
  }
  const [, year, month, day, hour, minute] = dateMatch;
  // Time is in JST (+9), convert to UTC by adding +09:00 timezone
  const jstDate = new Date(
    `${year}-${month}-${day}T${hour}:${minute}:00+09:00`,
  );
  const playedAt = jstDate.toISOString();

  // Parse difficulty from play_track_result image
  const difficultyImg = element.querySelector(".play_track_result img");
  const difficultySrc = difficultyImg?.getAttribute("src") || null;
  const isWorldsEnd = difficultySrc?.includes("musiclevel_worldsend") || false;

  // For World's End, difficulty is null; otherwise parse from image
  const difficulty = isWorldsEnd
    ? null
    : parseDifficultyFromImage(difficultySrc);

  // Parse music title from play_musicdata_title
  const musicTitle = element
    .querySelector(".play_musicdata_title")
    ?.textContent?.trim();
  if (!musicTitle) {
    throw new Error("Failed to find music title");
  }

  // Parse score from play_musicdata_score_text
  const scoreText = element
    .querySelector(".play_musicdata_score_text")
    ?.textContent?.trim();
  if (!scoreText) {
    throw new Error("Failed to find score text");
  }
  const scoreNumber = parseInt(scoreText.replace(/,/g, ""), 10);

  // Parse clear marks and other icons
  const markImg = element.querySelectorAll(".play_musicdata_icon > img");
  const markImgArray = [...markImg] as HTMLImageElement[];
  const markImgSrc = markImgArray.map((img) => img.src);

  const clearMark = getClearMark(markImgSrc[0]);

  const aj = markImgSrc.some((src) => src.includes("icon_alljustice"));
  const fc = aj || markImgSrc.some((src) => src.includes("icon_fullcombo"));

  const fullChainPlus = markImgSrc.some((src) =>
    src.includes("icon_fullchain.png"),
  );
  const fullChainGold = markImgSrc.some((src) =>
    src.includes("icon_fullchain2.png"),
  );

  return historyRecordSchema.parse({
    title: musicTitle,
    difficulty:
      difficulty === null ? null : stdChartDifficultyValues[difficulty],
    score: scoreNumber,
    clearMark,
    fc,
    aj,
    fullChain: fullChainPlus ? 2 : fullChainGold ? 1 : 0,
    isHidden: false,
    trackNo,
    playedAt,
  });
}
