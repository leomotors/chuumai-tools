import { JSDOM } from "jsdom";
import { Page } from "playwright";

import { logger } from "../logger.js";
import { parseMusic, parseRecord } from "../parser/music.js";

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
  await page.getByRole("link", { name: "MUSIC FOR RATING" }).click();
  // Best Songs
  await page.waitForURL(
    "https://chunithm-net-eng.com/mobile/home/playerData/ratingDetailBest/",
  );
  await page.waitForLoadState("networkidle");

  let totalHTML = "<!-- BEST -->\n";

  // warning: error if no best songs
  const best = page.locator(".box05.w400");
  const bestHTML = await best.innerHTML();
  totalHTML += bestHTML;
  const bestDom = new JSDOM(bestHTML);

  const bestMusic = [] as Array<ReturnType<typeof parseMusic>>;
  for (const element of bestDom.window.document.querySelectorAll(
    ".w388.musiclist_box",
  )) {
    bestMusic.push(parseMusic(element));
  }
  logger.log("Step 3.1.1: Best Songs done");

  await page.getByRole("link", { name: "Current" }).click();
  // Current (New) Songs
  await page.waitForURL(
    "https://chunithm-net-eng.com/mobile/home/playerData/ratingDetailRecent/",
  );
  await page.waitForLoadState("networkidle");

  // warning: error if no current songs
  const current = page.locator(".box05.w400");
  const currentHTML = await current.innerHTML();
  totalHTML += `\n<!-- NEW -->\n${currentHTML}`;
  const currentDom = new JSDOM(currentHTML);

  const currentMusic = [] as Array<ReturnType<typeof parseMusic>>;
  for (const element of currentDom.window.document.querySelectorAll(
    ".w388.musiclist_box",
  )) {
    currentMusic.push(parseMusic(element));
  }
  logger.log("Step 3.1.2: Current Songs done");

  await page.getByRole("link", { name: "Selection" }).click();
  // Selection
  await page.waitForURL(
    "https://chunithm-net-eng.com/mobile/home/playerData/ratingDetailNext/",
  );
  await page.waitForLoadState("networkidle");

  const selection = await page.locator(".w420.box01").all();

  if (selection.length !== 2) {
    throw new Error(
      `Step 3 Error: Expected 2 elements in selection page, got ${selection.length}`,
    );
  }

  const selectionBestHTML = await selection[0].innerHTML();
  totalHTML += `\n<!-- SELECTION BEST -->\n${selectionBestHTML}`;
  const selectionBestDom = new JSDOM(selectionBestHTML);
  const selectionBestMusic = [] as Array<ReturnType<typeof parseMusic>>;
  for (const element of selectionBestDom.window.document.querySelectorAll(
    ".w388.musiclist_box",
  )) {
    selectionBestMusic.push(parseMusic(element));
  }

  const selectionCurrentHTML = await selection[1].innerHTML();
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
  const allRecords = [] as Array<ReturnType<typeof parseRecord>>;
  await page.locator(".btn_record").click();
  await page.waitForURL("https://chunithm-net-eng.com/mobile/record/");
  await page.waitForLoadState("networkidle");

  await page.getByRole("link", { name: "RECORD BY MUSIC" }).click();
  await page.waitForURL(
    "https://chunithm-net-eng.com/mobile/record/musicGenre",
  );
  await page.waitForLoadState("networkidle");

  const btnClasses = [
    "btn_basic",
    "btn_advanced",
    "btn_expert",
    "btn_master",
    "btn_ultimate",
  ];
  for (const btnClass of btnClasses) {
    await page.locator(`.${btnClass}`).click();
    await page.waitForLoadState("networkidle");
    const allCategories = await page.locator(".box05.w400").all();

    if (allCategories.length !== 7) {
      throw new Error(
        `Step 3 Error: Expected 7 elements in all categories, got ${allCategories.length}`,
      );
    }

    for (const category of allCategories) {
      const categoryHTML = await category.innerHTML();
      totalHTML += `\n<!-- ${btnClass} -->\n${categoryHTML}`;
      const categoryDom = new JSDOM(categoryHTML);
      for (const element of categoryDom.window.document.querySelectorAll(
        ".w388.musiclist_box",
      )) {
        allRecords.push(parseRecord(element));
      }
    }

    logger.log(`Step 3.2: ${btnClass} done`);
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
