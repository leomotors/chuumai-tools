import fs from "node:fs/promises";

import { JSDOM } from "jsdom";
import { describe, expect, it } from "vitest";

import {
  parseBottomData,
  parseCharacter,
  parsePossession,
  parseRightData,
} from "./playerData";

async function getFixture(folder: string, filename: string) {
  const fileContent = await fs.readFile(
    `src/parser/__fixtures__/${folder}/${filename}`,
    "utf-8",
  );
  return new JSDOM(fileContent);
}

describe("Player Data", () => {
  it("Possession Color", async () => {
    const fixtures = {
      "elysia.html": "NORMAL",
      "leomotors.html": "NORMAL",
      "minori.html": "NORMAL",
      "pooh.html": "NORMAL",
      "thatcat.html": "NORMAL",
    };

    for (const [filename, expected] of Object.entries(fixtures)) {
      const dom = await getFixture("playerData", filename);

      expect(parsePossession(dom)).toBe(expected);
    }
  });

  it("Left (Character Profile)", async () => {
    const fixtures = {
      "elysia.html": {
        characterRarity: "RAINBOW",
        characterImage:
          "https://chunithm-net-eng.com/mobile/img/3948279459da27ff.png", // arisu
      },
      "leomotors.html": {
        characterRarity: "RAINBOW",
        characterImage:
          "https://chunithm-net-eng.com/mobile/img/a48871f78a3f1e9d.png", // mafuyu
      },
      "minori.html": {
        characterRarity: "PLATINUM",
        characterImage:
          "https://chunithm-net-eng.com/mobile/img/e16348980f62f5ed.png", // minori bnw
      },
      "pooh.html": {
        characterRarity: "SILVER",
        characterImage:
          "https://chunithm-net-eng.com/mobile/img/c80eeee609c42acf.png", // laur
      },
      "thatcat.html": {
        characterRarity: "RAINBOW",
        characterImage:
          "https://chunithm-net-eng.com/mobile/img/ca42d927c55a6f9b.png", // toa
      },
    };

    for (const [filename, expected] of Object.entries(fixtures)) {
      const dom = await getFixture("playerData", filename);

      expect(parseCharacter(dom)).toStrictEqual(expected);
    }
  });

  it("Right (Home Page Data)", async () => {
    const fixtures = {
      "elysia.html": {
        teamEmblem: "GOLD",
        teamName: "－ＫＵＢ・ＬＡＤＰＲＡＯ－",
        honorLevel: "PLATINUM",
        honorText: "STARRED HEART",
        playerLevel: 152,
        playerName: "～Ｅｌｙｓｉａ～",
        classEmblem: 5,
        rating: 16.81,
        overpowerValue: 40815.39,
        overpowerPercent: 37.25,
        lastPlayed: new Date("2025-04-16T14:08:00Z"),
      },
      "leomotors.html": {
        teamEmblem: "NORMAL",
        teamName: "ＣＰ　ｖｓ　ＣＥＤＴ",
        honorLevel: "PLATINUM",
        honorText: "携帯恋話",
        playerLevel: 70,
        playerName: "Ｌｅｏψｒθφ",
        classEmblem: 4,
        rating: 16.29,
        overpowerValue: 28475.22,
        overpowerPercent: 26.62,
        lastPlayed: new Date("2025-04-04T07:49:00Z"),
      },
      "minori.html": {
        teamEmblem: "NORMAL",
        teamName: "ＣＰ　ｖｓ　ＣＥＤＴ",
        honorLevel: "GOLD",
        honorText: "THE ACHIEVER／RATING 14.50",
        playerLevel: 12,
        playerName: "Ｍｉｎｏｒｉｎ♪",
        classEmblem: 0,
        rating: 14.74,
        overpowerValue: 7178.72,
        overpowerPercent: 6.81,
        lastPlayed: new Date("2025-04-12T03:38:00Z"),
      },
      "pooh.html": {
        teamEmblem: undefined,
        teamName: undefined,
        honorLevel: "PLATINUM",
        honorText: "THE ACHIEVER／RATING 15.50",
        playerLevel: 29,
        playerName: "Ｐｏｏｈ５８２１",
        classEmblem: 0,
        rating: 15.69,
        overpowerValue: 15514.1,
        overpowerPercent: 14.71,
        lastPlayed: new Date("2025-04-09T07:47:00Z"),
      },
      "thatcat.html": {
        teamEmblem: "NORMAL",
        teamName: "ＣＰ　ｖｓ　ＣＥＤＴ",
        honorLevel: "SILVER",
        honorText: "ノーツに嫌われている。",
        playerLevel: 122,
        playerName: "ＴＨＡＴＣＡＴ",
        classEmblem: 0,
        rating: 17.17,
        overpowerValue: 47546.36,
        overpowerPercent: 43.77,
        lastPlayed: new Date("2025-04-06T03:55:00Z"),
      },
    };

    for (const [filename, expected] of Object.entries(fixtures)) {
      const dom = await getFixture("playerData", filename);

      expect(parseRightData(dom)).toStrictEqual(expected);
    }
  });

  it("Bottom (Player Data Page)", async () => {
    const fixtures = {
      "example.html": {
        currentCurrency: 0,
        totalCurrency: 1373000,
        playCount: 465,
      },
    };

    for (const [filename, expected] of Object.entries(fixtures)) {
      const dom = await getFixture("bottomData", filename);

      expect(parseBottomData(dom)).toStrictEqual(expected);
    }
  });
});
