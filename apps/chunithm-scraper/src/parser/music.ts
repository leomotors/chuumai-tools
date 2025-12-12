import { ClearMark, stdChartDifficultyValues } from "@repo/types/chuni";
import { BaseChartSchema } from "@repo/types/chuni";

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
): BaseChartSchema & { fullChain: number } {
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
