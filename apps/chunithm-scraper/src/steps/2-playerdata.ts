import { JSDOM } from "jsdom";
import { Page } from "playwright";

import {
  parseBottomData,
  parseCharacter,
  parsePossession,
  parseRightData,
} from "../parser/playerData.js";

export async function scrapePlayerData(page: Page) {
  const pageData = page.locator(".frame01_inside.w460");
  const pageDataHTML = await pageData.innerHTML();
  const pageDataDom = new JSDOM(pageDataHTML);

  const possession = parsePossession(pageDataDom);
  const character = parseCharacter(pageDataDom);
  const rightData = parseRightData(pageDataDom);

  const bottomData = parseBottomData(pageDataDom);

  return {
    possession,
    ...character,
    ...rightData,
    ...bottomData,
  };
}
