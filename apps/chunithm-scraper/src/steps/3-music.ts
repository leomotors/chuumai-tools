import { JSDOM } from "jsdom";
import { Page } from "playwright";

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
  // Best
  await page.waitForURL(
    "https://chunithm-net-eng.com/mobile/home/playerData/ratingDetailBest/",
  );
  await page.waitForTimeout(1000);

  let totalHTML = "<!-- BEST -->\n";

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

  await page.getByRole("link", { name: "Recent" }).click();
  // New Section
  await page.waitForURL(
    "https://chunithm-net-eng.com/mobile/home/playerData/ratingDetailRecent/",
  );
  await page.waitForTimeout(1000);

  const newSection = page.locator(".box05.w400");
  const newSectionHTML = await newSection.innerHTML();
  totalHTML += `\n<!-- NEW -->\n${newSectionHTML}`;
  const newSectionDom = new JSDOM(newSectionHTML);

  const newSectionMusic = [] as Array<ReturnType<typeof parseMusic>>;
  for (const element of newSectionDom.window.document.querySelectorAll(
    ".w388.musiclist_box",
  )) {
    newSectionMusic.push(parseMusic(element));
  }

  await page.getByRole("link", { name: "Selection" }).click();
  // Selection
  await page.waitForURL(
    "https://chunithm-net-eng.com/mobile/home/playerData/ratingDetailNext/",
  );
  await page.waitForTimeout(1000);

  const selection = page.locator(".box05.w400");
  const selectionHTML = await selection.innerHTML();
  totalHTML += `\n<!-- SELECTION -->\n${selectionHTML}`;
  const selectionDom = new JSDOM(selectionHTML);
  const selectionMusic = [] as Array<ReturnType<typeof parseMusic>>;
  for (const element of selectionDom.window.document.querySelectorAll(
    ".w388.musiclist_box",
  )) {
    selectionMusic.push(parseMusic(element));
  }

  // Part 3.2: All Records
  const allRecords = [] as Array<ReturnType<typeof parseRecord>>;
  await page.locator(".btn_record").click();
  await page.waitForURL("https://chunithm-net-eng.com/mobile/record/");
  await page.waitForTimeout(1000);

  await page.getByRole("link", { name: "RECORD BY MUSIC" }).click();
  await page.waitForURL(
    "https://chunithm-net-eng.com/mobile/record/musicGenre",
  );
  await page.waitForTimeout(1000);

  const btnClasses = [
    "btn_basic",
    "btn_advanced",
    "btn_expert",
    "btn_master",
    "btn_ultimate",
  ];
  for (const btnClass of btnClasses) {
    await page.locator(`.${btnClass}`).click();
    await page.waitForTimeout(3000);
    const allCategories = await page.locator(".box05.w400").all();

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
  }

  return {
    recordData: {
      bestSongs: fillMarkInfo(bestMusic, allRecords),
      newSongs: fillMarkInfo(newSectionMusic, allRecords),
      selectionSongs: fillMarkInfo(selectionMusic, allRecords),
      allRecords: allRecords,
    },
    recordHtml: totalHTML,
  };
}
