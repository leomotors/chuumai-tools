import { JSDOM } from "jsdom";

import { parsePlayerData } from "../parser/playerData.js";

export async function scrapePlayerData(html: string) {
  const page = new JSDOM(html).window.document;

  const pageData = page.querySelector(".see_through_block");

  if (!pageData) {
    throw new Error(
      `Player data not found in the provided HTML. HTML: ${html}`,
    );
  }

  const pageDataHTML = pageData.innerHTML;
  const pageDataDom = new JSDOM(pageDataHTML);

  const playerData = parsePlayerData(pageDataDom);

  return {
    playerData,
    playerDataHtml: pageDataHTML,
  };
}
