import { JSDOM } from "jsdom";

import { parseHistory } from "../parser/music";

export async function processHistoryData(html: string) {
  const page = new JSDOM(html).window.document;
  const records = [
    ...page.querySelectorAll(".wrapper.main_wrapper > .p_10.t_l.f_0.v_b"),
  ];

  const historyData = records.map((record) => parseHistory(record));
  return historyData;
}
