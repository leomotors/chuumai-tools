import { PgInsertValue } from "drizzle-orm/pg-core";

import { mapMaimaiTitleWithCategory } from "@repo/core/maimai";
import {
  musicDataTable,
  musicLevelTable,
  musicVersionTable,
} from "@repo/database/maimai";

import { db } from "../db";
import { qmanJsonSchema } from "../types";

const url = "https://reiwa.f5.si/maimai_record.json";

function formatVersionName(version: string) {
  switch (version) {
    case "":
      return "maimai";
    case "PLUS":
      return "maimai+";
    case "でらっくす":
      return "DX";
    case "でらっくす PLUS":
      return "DX+";
  }

  return version.replace("でらっくす ", "").replace(" PLUS", "+");
}

export async function updateReleaseDateData() {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch music data");
  }

  const existingMusicData = await db.select().from(musicDataTable);
  const existingLevelData = await db.select().from(musicLevelTable);

  console.log("Fetched Data Successfully");

  const data = qmanJsonSchema
    .parse(await response.json())
    .map((m) => ({
      ...m,
      title: mapMaimaiTitleWithCategory(m.title, m.genre),
    }))
    .filter((c) => existingMusicData.some((em) => em.title === c.title));

  console.log("Parsed Data Successfully");

  const payload: PgInsertValue<typeof musicVersionTable>[] = [];

  for (const music of existingMusicData) {
    const hasStd = existingLevelData.some(
      (el) => el.musicTitle === music.title && el.chartType === "std",
    );
    const hasDx = existingLevelData.some(
      (el) => el.musicTitle === music.title && el.chartType === "dx",
    );

    if (hasStd) {
      const stdData = data.find(
        (d) => d.title === music.title && d.is_dx === false,
      );

      if (stdData) {
        payload.push({
          title: music.title,
          chartType: "std",
          releaseDate: stdData.release,
          version: formatVersionName(stdData.version),
        });
      } else {
        console.warn(`No data found for: std ${music.title}`);
      }
    }

    if (hasDx) {
      const dxData = data.find(
        (d) => d.title === music.title && d.is_dx === true,
      );

      if (dxData) {
        payload.push({
          title: music.title,
          chartType: "dx",
          releaseDate: dxData.release,
          version: formatVersionName(dxData.version),
        });
      } else {
        console.warn(`No data found for: dx ${music.title}`);
      }
    }
  }

  console.log("Prepared payload completed");

  const existingVersionData = await db.select().from(musicVersionTable);

  const newData = payload.filter((p) =>
    existingVersionData.every(
      (d) => !(d.title === p.title && d.chartType === p.chartType),
    ),
  );

  const changedData = payload.filter((p) =>
    existingVersionData.some(
      (d) =>
        d.title === p.title &&
        d.chartType === p.chartType &&
        (new Date(d.releaseDate).getTime() !==
          new Date(p.releaseDate.toString()).getTime() ||
          d.version !== p.version),
    ),
  );

  console.log("Finding new and changed data completed");

  if (changedData.length > 0) {
    console.warn(
      `There is ${changedData.length} changed release date data. Please review them manually (printing first 5):`,
    );
    console.warn(changedData.slice(0, 5));
  }

  if (newData.length === 0) {
    console.log("No new release date data to insert.");
    return;
  }

  if (process.env.DRY_RUN) {
    console.log(
      `Dry run mode - not inserting ${newData.length} new release date records. First 5:`,
    );
    console.log(newData.slice(0, 5));
    return;
  }

  await db.insert(musicVersionTable).values(newData);
  console.log(`Inserted ${newData.length} new release date records.`);
}
