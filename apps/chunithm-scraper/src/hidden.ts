import fs from "node:fs/promises";

import { z } from "zod";

import { hiddenChartSchema } from "@repo/types-chuni";

export async function readHiddenCharts() {
  try {
    const content = await fs.readFile("./hidden.json", "utf-8");

    const json = JSON.parse(content);
    const parsed = z.array(hiddenChartSchema).safeParse(json);

    if (!parsed.success) {
      console.error("hidden.json is given but invalid format");
      throw new Error(parsed.error.message);
    }

    console.info("hidden.json is given and valid format");
    return parsed.data;
  } catch (err) {
    if ((err as NodeJS.ErrnoException)?.code !== "ENOENT") {
      console.error(`Error while reading hidden.json: ${err}`);
      throw err;
    }

    console.info(
      "hidden.json is not found, Hidden Charts feature is not active",
    );
  }
}
