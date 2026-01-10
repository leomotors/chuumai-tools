import fs from "node:fs/promises";

import { JSDOM } from "jsdom";
import { describe, expect, it } from "vitest";

import { parsePlayerData } from "./playerData";

async function getFixture(folder: string, filename: string) {
  const fileContent = await fs.readFile(
    `src/parser/__fixtures__/${folder}/${filename}`,
    "utf-8",
  );
  return new JSDOM(fileContent);
}

describe("Player Data", () => {
  it("should parse leomotors.html correctly", async () => {
    const dom = await getFixture("playerData", "leomotors.html");

    const result = parsePlayerData(dom);

    expect(result).toEqual({
      icon: "https://maimaidx-eng.com/maimai-mobile/img/Icon/88b3e152350aa218.png",
      playerName: "Ｌｅｏψｒθφ",
      trophyRarity: "GOLD",
      trophyText: "シリウスの輝きのように",
      rating: 14911,
      starCount: 234,
      currentVersionPlayCount: 105,
      totalPlayCount: 523,
    });
  });
});
