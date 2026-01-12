import { JSDOM } from "jsdom";
import { Page } from "playwright";

import { mapMaimaiTitleWithCategory } from "@repo/core/maimai";
import { fetchPath } from "@repo/core/scraper";
import { logger } from "@repo/core/utils";
import { Category, categoryValues, ChartSchema } from "@repo/types/maimai";

import { mobileBaseURL } from "../constants.js";
import { parseMusic } from "../parser/music.js";

function fillMarkInfo(original: Array<ChartSchema>, data: Array<ChartSchema>) {
  const result = original.map((music) => {
    const record = data.find(
      (record) =>
        (record.title === music.title ||
          (music.title === "Link" && record.title.startsWith("Link"))) &&
        record.chartType === music.chartType &&
        record.difficulty === music.difficulty &&
        record.score === music.score,
    );
    if (record) {
      return record;
    }

    throw new Error(
      `Step 3 Error: Music ${music.title} with difficulty ${music.chartType} ${music.difficulty} not found in records`,
    );
  });
  return result;
}

function handleDuplicateTitle(chart: ChartSchema, category: Category) {
  chart.title = mapMaimaiTitleWithCategory(chart.title, category);
  return chart;
}

export async function scrapeMusicRecord(page: Page) {
  const ratingTargetPageHTML = await fetchPath(
    page,
    mobileBaseURL + "home/ratingTargetMusic/",
  );

  let totalHTML = "<!-- For Rating -->\n";
  totalHTML += ratingTargetPageHTML;

  // Part 3.1: Parse rating target page
  const ratingTargetDom = new JSDOM(ratingTargetPageHTML);
  const mainWrapper = ratingTargetDom.window.document.querySelector(
    ".wrapper.main_wrapper",
  );

  if (!mainWrapper) {
    throw new Error(
      `Step 3.1 Error: Failed to find main_wrapper\nHTML: ${ratingTargetPageHTML}`,
    );
  }

  const bestMusic = [] as Array<ChartSchema>;
  const currentMusic = [] as Array<ChartSchema>;
  const selectionBestMusic = [] as Array<ChartSchema>;
  const selectionCurrentMusic = [] as Array<ChartSchema>;

  let currentSection:
    | "best"
    | "current"
    | "selectionBest"
    | "selectionCurrent"
    | null = null;

  // Iterate through all children to find screw_block divs and music divs
  for (const child of mainWrapper.children) {
    if ([...child.classList].includes("screw_block")) {
      const text = child.textContent?.trim();
      if (text?.includes("Songs for Rating(New)")) {
        currentSection = "current";
        logger.log("Step 3.1: Found Songs for Rating(New) section");
      } else if (text?.includes("Songs for Rating(Others)")) {
        currentSection = "best";
        logger.log("Step 3.1: Found Songs for Rating(Others) section");
      } else if (text?.includes("Songs for Rating Selection(New)")) {
        currentSection = "selectionCurrent";
        logger.log("Step 3.1: Found Songs for Rating Selection(New) section");
      } else if (text?.includes("Songs for Rating Selection(Others)")) {
        currentSection = "selectionBest";
        logger.log(
          "Step 3.1: Found Songs for Rating Selection(Others) section",
        );
      }
    }

    // Check if this is a music list box
    if (
      [...child.classList].some((c) => c.includes("_score_back")) &&
      currentSection
    ) {
      const parsed = parseMusic(child);
      switch (currentSection) {
        case "best":
          bestMusic.push(parsed);
          break;
        case "current":
          currentMusic.push(parsed);
          break;
        case "selectionBest":
          selectionBestMusic.push(parsed);
          break;
        case "selectionCurrent":
          selectionCurrentMusic.push(parsed);
          break;
      }
    }
  }

  logger.log(
    `Step 3.1: Parsed ${bestMusic.length} best, ${currentMusic.length} current, ${selectionBestMusic.length} selection best, ${selectionCurrentMusic.length} selection current`,
  );

  // Part 3.2: All Records

  logger.log("Step 3.2: Fetching all records by rating");
  const allRecords = [] as Array<ChartSchema>;

  const difficultyNames = [
    "Basic",
    "Advanced",
    "Expert",
    "Master",
    "Re:Master",
  ];

  for (let diffIndex = 0; diffIndex < difficultyNames.length; diffIndex++) {
    const diffName = difficultyNames[diffIndex];

    const ratingDiffPageHTML = await fetchPath(
      page,
      `${mobileBaseURL}record/musicGenre/search/?genre=99&diff=${diffIndex}`,
    );

    totalHTML += `\n<!-- ${diffName} -->\n${ratingDiffPageHTML}`;

    const diffDom = new JSDOM(ratingDiffPageHTML);
    const mainWrapper = diffDom.window.document.querySelector(
      ".wrapper.main_wrapper",
    );

    if (!mainWrapper) {
      throw new Error(
        `Step 3.2 Error: Failed to find main_wrapper for difficulty ${diffName}\nHTML: ${ratingDiffPageHTML}`,
      );
    }

    let categoryCount = 0;

    // Iterate through all children to find screw_block (categories) and music divs
    for (const child of mainWrapper.children) {
      if ([...child.classList].includes("screw_block")) {
        categoryCount++;
      }

      // Check if this is a music list box
      const classList = [...child.classList];
      const isMusicBox =
        classList.includes("w_450") && classList.includes("m_15");
      if (isMusicBox) {
        allRecords.push(
          handleDuplicateTitle(
            parseMusic(child),
            categoryValues[categoryCount - 1],
          ),
        );
      }
    }

    if (categoryCount !== 6) {
      throw new Error(
        `Step 3.2 Error: Expected 6 categories for difficulty ${diffName}, got ${categoryCount}\nPage Content: ${ratingDiffPageHTML}`,
      );
    }

    logger.log(`Step 3.2: ${diffName} done`);
  }

  const combined = [
    ...bestMusic,
    ...currentMusic,
    ...selectionBestMusic,
    ...selectionCurrentMusic,
  ];

  const toAppend = [] as Array<ChartSchema>;
  for (const music of combined) {
    const record = allRecords.find(
      (record) =>
        (record.title === music.title ||
          (music.title === "Link" && record.title.startsWith("Link"))) &&
        record.chartType === music.chartType &&
        record.difficulty === music.difficulty &&
        record.score === music.score,
    );
    if (record) {
      continue;
    }

    logger.warn(
      `Step 3 Warning: Music "${music.title}" (${music.chartType}) with difficulty ${music.difficulty} not found in records. This likely because you don't unlock this legend/kaleidxscope song yet, appending it with no dx score or marks.`,
    );
    toAppend.push(music);
  }

  allRecords.push(...toAppend);

  return {
    recordData: {
      bestSongs: fillMarkInfo(bestMusic, allRecords),
      currentSongs: fillMarkInfo(currentMusic, allRecords),
      selectionBestSongs: fillMarkInfo(selectionBestMusic, allRecords),
      selectionCurrentSongs: fillMarkInfo(selectionCurrentMusic, allRecords),
      allRecords: allRecords,
    },
    recordHtml: totalHTML,
  };
}
