import { JSDOM } from "jsdom";

import { logger } from "@repo/core/utils";

import { parseHistory } from "../parser/music";

export async function processHistoryData(html: string) {
  const page = new JSDOM(html).window.document;
  const records = [
    ...page.querySelectorAll(".wrapper.main_wrapper > .p_10.t_l.f_0.v_b"),
  ];

  const historyData = records
    .map((record, index) => {
      try {
        return parseHistory(record);
      } catch (err) {
        logger.error(`Failed to parse history record #${index + 1}: ${err}`);
        return null;
      }
    })
    .filter(
      (record): record is ReturnType<typeof parseHistory> => record !== null,
    );
  return historyData;
}
