import { JSDOM } from "jsdom";
import { Page } from "playwright";

import { parseMusic, parseRecord } from "../parser/music.js";
import { fetchPath } from "../scraper.js";
import { logger } from "../utils/logger.js";

function fillMarkInfo(
  original: Array<ReturnType<typeof parseMusic>>,
  data: Array<ReturnType<typeof parseRecord>>,
) {
  const result = original.map((music) => {
    const record = data.find(
      (record) =>
        record.musicId === music.musicId &&
        record.difficulty === music.difficulty,
    );
    if (record) {
      return {
        ...music,
        ...record,
      };
    }

    throw new Error(
      `Step 3 Error: Music ${music.musicId} with difficulty ${music.difficulty} not found in records`,
    );
  });
  return result;
}

export async function scrapeMusicRecord(page: Page) {
  const ratingBestPageHTML = await fetchPath(
    page,
    "home/playerData/ratingDetailBest",
  );

  let totalHTML = "<!-- BEST -->\n";

  const best = new JSDOM(ratingBestPageHTML).window.document.querySelector(
    ".box05.w400",
  );
  if (!best) {
    throw new Error(
      `Step 3 Error: Best songs not found in ratingBest page. You need at least 1 best song for this to work.\nHTML: ${ratingBestPageHTML}`,
    );
  }
  totalHTML += best.innerHTML;
  const bestDom = new JSDOM(best.innerHTML);

  const bestMusic = [] as Array<ReturnType<typeof parseMusic>>;
  for (const element of bestDom.window.document.querySelectorAll(
    ".w388.musiclist_box",
  )) {
    bestMusic.push(parseMusic(element));
  }
  logger.log("Step 3.1.1: Best Songs done");

  // Current (New) Songs
  const ratingCurrentPageHTML = await fetchPath(
    page,
    "home/playerData/ratingDetailRecent",
  );

  // warning: error if no current songs
  const current = new JSDOM(
    ratingCurrentPageHTML,
  ).window.document.querySelector(".box05.w400");
  if (!current) {
    throw new Error(
      `Step 3 Error: Current songs not found in ratingCurrent page. You need at least 1 current song for this to work.\nHTML: ${ratingCurrentPageHTML}`,
    );
  }
  totalHTML += `\n<!-- NEW -->\n${current.innerHTML}`;
  const currentDom = new JSDOM(current.innerHTML);

  const currentMusic = [] as Array<ReturnType<typeof parseMusic>>;
  for (const element of currentDom.window.document.querySelectorAll(
    ".w388.musiclist_box",
  )) {
    currentMusic.push(parseMusic(element));
  }
  logger.log("Step 3.1.2: Current Songs done");

  // Selection
  const ratingSelectionPageHTML = await fetchPath(
    page,
    "home/playerData/ratingDetailNext",
  );

  const selection = new JSDOM(
    ratingSelectionPageHTML,
  ).window.document.querySelectorAll(".w420.box01");

  if (selection.length !== 2) {
    throw new Error(
      `Step 3 Error: Expected 2 elements in selection page, got ${selection.length}\nPage Content: ${ratingSelectionPageHTML}`,
    );
  }

  const selectionBestHTML = selection[0].innerHTML;
  totalHTML += `\n<!-- SELECTION BEST -->\n${selectionBestHTML}`;
  const selectionBestDom = new JSDOM(selectionBestHTML);
  const selectionBestMusic = [] as Array<ReturnType<typeof parseMusic>>;
  for (const element of selectionBestDom.window.document.querySelectorAll(
    ".w388.musiclist_box",
  )) {
    selectionBestMusic.push(parseMusic(element));
  }

  const selectionCurrentHTML = selection[1].innerHTML;
  totalHTML += `\n<!-- SELECTION BEST -->\n${selectionCurrentHTML}`;
  const selectionCurrentDom = new JSDOM(selectionCurrentHTML);
  const selectionCurrentMusic = [] as Array<ReturnType<typeof parseMusic>>;
  for (const element of selectionCurrentDom.window.document.querySelectorAll(
    ".w388.musiclist_box",
  )) {
    selectionCurrentMusic.push(parseMusic(element));
  }
  logger.log("Step 3.1.3: Selection Songs done");

  // Part 3.2: All Records
  const ratingAllPageHTML = await fetchPath(page, "record/musicGenre");
  totalHTML += `\n<!-- All Music Home Page -->\n${ratingAllPageHTML}`;
  const tokenInput = new JSDOM(ratingAllPageHTML).window.document.querySelector(
    "input[name=token]",
  );
  if (!tokenInput) {
    throw new Error(
      `Step 3.2 Error: Failed to get token input\nHTML: ${ratingAllPageHTML}`,
    );
  }

  const token = (tokenInput as HTMLInputElement).value;

  const allRecords = [] as Array<ReturnType<typeof parseRecord>>;

  const difficulties = ["Basic", "Advanced", "Expert", "Master", "Ultima"];

  for (const diff of difficulties) {
    const ratingDiffPageHTML = await fetchPath(
      page,
      `record/musicGenre/send${diff}`,
      "POST",
      {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      `genre=99&token=${token}`,
    );

    const allCategories = new JSDOM(
      ratingDiffPageHTML,
    ).window.document.querySelectorAll(".box05.w400");

    if (allCategories.length !== 7) {
      throw new Error(
        `Step 3 Error: Expected 7 elements in all categories, got ${allCategories.length}\nPage Content: ${ratingDiffPageHTML}`,
      );
    }

    for (const category of allCategories) {
      const categoryHTML = category.innerHTML;
      totalHTML += `\n<!-- ${diff} -->\n${categoryHTML}`;
      const categoryDom = new JSDOM(categoryHTML);
      for (const element of categoryDom.window.document.querySelectorAll(
        ".w388.musiclist_box",
      )) {
        allRecords.push(parseRecord(element));
      }
    }

    logger.log(`Step 3.2: ${diff} done`);
  }

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
