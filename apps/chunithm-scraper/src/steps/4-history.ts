import { JSDOM } from "jsdom";

import { logger } from "@repo/core/utils";

import { parseHistory } from "../parser/music";

export async function processHistoryData(html: string) {
  try {
    const page = new JSDOM(html).window.document;

    const records = [...page.querySelectorAll(".box01.w420 > .mt_10 > div")];

    const historyData = records.map((record) => parseHistory(record));
    return historyData;
  } catch (error) {
    logger.error(`Failed to process history data: ${error}`);
    return [];
  }
}
