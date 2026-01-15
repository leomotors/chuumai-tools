import fs from "node:fs/promises";

import { JSDOM } from "jsdom";
import { describe, expect, it } from "vitest";

import type { ProfileWithoutLastPlayed } from "@repo/types/maimai";

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
    const fixtures: Record<string, ProfileWithoutLastPlayed> = {
      "leomotors.html": {
        characterImage:
          "https://maimaidx-eng.com/maimai-mobile/img/Icon/88b3e152350aa218.png",
        honorText: "シリウスの輝きのように",
        honorRarity: "GOLD",
        playerName: "Ｌｅｏψｒθφ",
        courseRank: 10,
        classRank: 0,
        rating: 14911,
        star: 234,
        playCountCurrent: 105,
        playCountTotal: 523,
      },
      "amakami.html": {
        characterImage:
          "https://maimaidx-eng.com/maimai-mobile/img/Icon/4f2837bbf424a86c.png",
        honorText: "アマカミサマ",
        honorRarity: "GOLD",
        playerName: "AmakamiSamaLover",
        courseRank: 6,
        classRank: 1,
        rating: 14291,
        star: 69420,
        playCountCurrent: 67,
        playCountTotal: 6967,
      },
      "silver.html": {
        characterImage:
          "https://maimaidx-eng.com/maimai-mobile/img/Icon/e7376c0cfb074b53.png",
        honorText: "皆皆 御唱和あれ！",
        honorRarity: "SILVER",
        playerName: "AcidGod",
        courseRank: 0,
        classRank: 0,
        rating: 13849,
        star: 67,
        playCountCurrent: 123,
        playCountTotal: 456,
      },
      "shikanoko.html": {
        characterImage:
          "https://maimaidx.jp/maimai-mobile/img/Icon/ab9873ac3e18f505.png",
        honorText:
          "しかのこのこのここしたんたんしかのこのこのここしたんたんしかのこのこのここしたんたんしかのこのこのここしたんたんしかのこのこのここしたんたんしかのこのこのここしたんたんしかのこのこのここしたんたんしかのこのこのここしたんたん",
        honorRarity: "NORMAL",
        playerName: "Ｌｅｏψｒθφ",
        courseRank: 0,
        classRank: 0,
        rating: 13062,
        star: 30,
        playCountCurrent: 1,
        playCountTotal: 32,
      },
      "rate16.html": {
        characterImage:
          "https://maimaidx-eng.com/maimai-mobile/img/Icon/4724624520f6605f.png",
        honorText: "Luminescence",
        honorRarity: "GOLD",
        playerName: "RATE16",
        courseRank: 18,
        classRank: 22,
        rating: 16969,
        star: 1337,
        playCountCurrent: 0,
        playCountTotal: 1,
      },
    };

    for (const [filename, expected] of Object.entries(fixtures)) {
      const dom = await getFixture("playerData", filename);
      const parsedData = parsePlayerData(dom);

      expect(parsedData).toEqual(expected);
    }
  });
});
