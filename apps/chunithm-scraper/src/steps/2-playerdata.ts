import { JSDOM } from "jsdom";
import { Page } from "playwright";

import {
  parseBottomData,
  parseCharacter,
  parsePossession,
  parseRightData,
} from "../parser/playerData.js";

export async function scrapePlayerData(page: Page) {
  const boxData = page.locator(".box_playerprofile");
  const boxDataHTML = await boxData.innerHTML();
  const boxDataDom = new JSDOM(boxDataHTML);

  const bottomData = page.locator(".w420.box01");
  const bottomDataHTML = await bottomData.innerHTML();
  const bottomDataDom = new JSDOM(bottomDataHTML);

  const possession = parsePossession(boxDataDom);
  const character = parseCharacter(boxDataDom);
  const rightData = parseRightData(boxDataDom);

  const bottomDataParsed = parseBottomData(bottomDataDom);

  return {
    possession,
    ...character,
    ...rightData,
    ...bottomDataParsed,
  };
}
