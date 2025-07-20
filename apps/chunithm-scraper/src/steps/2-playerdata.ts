import { JSDOM } from "jsdom";

import {
  parseBottomData,
  parseCharacter,
  parsePossession,
  parseRightData,
} from "../parser/playerData.js";

export async function scrapePlayerData(html: string) {
  const page = new JSDOM(html).window.document;

  const pageData = page.querySelector(".frame01_inside.w460");

  if (!pageData) {
    throw new Error(
      `Player data not found in the provided HTML. HTML: ${html}`,
    );
  }

  const pageDataHTML = pageData.innerHTML;
  const pageDataDom = new JSDOM(pageDataHTML);

  const possession = parsePossession(pageDataDom);
  const character = parseCharacter(pageDataDom);
  const rightData = parseRightData(pageDataDom);

  const bottomData = parseBottomData(pageDataDom);

  return {
    playerData: {
      possession,
      ...character,
      ...rightData,
      ...bottomData,
    },
    playerDataHtml: pageDataHTML,
  };
}
