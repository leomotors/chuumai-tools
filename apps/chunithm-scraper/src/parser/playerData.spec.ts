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
      "one-honor.html": "NORMAL",
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
      "leomotors-vrs.html": {
        characterRarity: "RAINBOW",
        characterImage:
          "https://chunithm-net-eng.com/mobile/img/a48871f78a3f1e9d.png", // mafuyu
      },
      "minori.html": {
        characterRarity: "PLATINUM",
        characterImage:
          "https://chunithm-net-eng.com/mobile/img/e16348980f62f5ed.png", // minori bnw
      },
      "one-honor.html": {
        characterRarity: "SILVER",
        characterImage:
          "https://chunithm-net-eng.com/mobile/img/8fa16e6e7cdb18b2.png", // hifumi
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
      "thatcat-vrs.html": {
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
        mainHonorRarity: "PLATINUM",
        mainHonorText: "STARRED HEART",
        playerLevel: 152,
        playerName: "～Ｅｌｙｓｉａ～",
        classBand: 0,
        classEmblem: 5,
        rating: 16.81,
        overpowerValue: 40815.39,
        overpowerPercent: 37.25,
        lastPlayed: new Date("2025-04-16T14:08:00Z"),
      },
      "leomotors.html": {
        teamEmblem: "NORMAL",
        teamName: "ＣＰ　ｖｓ　ＣＥＤＴ",
        mainHonorRarity: "PLATINUM",
        mainHonorText: "携帯恋話",
        playerLevel: 70,
        playerName: "Ｌｅｏψｒθφ",
        classBand: 0,
        classEmblem: 4,
        rating: 16.29,
        overpowerValue: 28475.22,
        overpowerPercent: 26.62,
        lastPlayed: new Date("2025-04-04T07:49:00Z"),
      },
      "leomotors-vrs.html": {
        teamEmblem: "NORMAL",
        teamName: "ＣＰ　ｖｓ　ＣＥＤＴ",
        mainHonorRarity: "PLATINUM",
        mainHonorText: "携帯恋話",
        subHonor1Rarity: "PLATINUM",
        subHonor1Text: "ラビットハウス",
        subHonor2Rarity: "PLATINUM",
        subHonor2Text: "完璧で究極のアイドル",
        playerLevel: 71,
        playerName: "Ｌｅｏψｒθφ",
        classBand: 0,
        classEmblem: 0,
        rating: 10.48,
        overpowerValue: 28422.85,
        overpowerPercent: 26.63,
        lastPlayed: new Date("2025-04-17T09:15:00Z"),
      },
      "leomotors-wband.html": {
        teamEmblem: "NORMAL",
        teamName: "ＣＰ　ｖｓ　ＣＥＤＴ",
        mainHonorRarity: "PLATINUM",
        mainHonorText: "Phosphoribosylaminoimidazolesuccinocarboxamide",
        subHonor1Rarity: "PLATINUM",
        subHonor1Text: "ラビットハウス",
        subHonor2Rarity: "PLATINUM",
        subHonor2Text: "完璧で究極のアイドル",
        playerLevel: 79,
        playerName: "Ｌｅｏψｒθφ",
        classBand: 4,
        classEmblem: 4,
        rating: 16.41,
        overpowerValue: 33765.42,
        overpowerPercent: 30.44,
        lastPlayed: new Date("2025-05-24T10:48:00Z"),
      },
      "minori.html": {
        teamEmblem: "NORMAL",
        teamName: "ＣＰ　ｖｓ　ＣＥＤＴ",
        mainHonorRarity: "GOLD",
        mainHonorText: "THE ACHIEVER／RATING 14.50",
        playerLevel: 12,
        playerName: "Ｍｉｎｏｒｉｎ♪",
        classBand: 0,
        classEmblem: 0,
        rating: 14.74,
        overpowerValue: 7178.72,
        overpowerPercent: 6.81,
        lastPlayed: new Date("2025-04-12T03:38:00Z"),
      },
      "one-honor.html": {
        teamEmblem: "YELLOW",
        teamName: "ＣＰ　ｖｓ　ＣＥＤＴ",
        mainHonorRarity: "PLATINUM",
        mainHonorText: "私たちの、青春の物語を！！",
        playerLevel: 133,
        playerName: "Ｌｅｏψｒθφ",
        classBand: 4,
        classEmblem: 5,
        rating: 16.66,
        overpowerValue: 52079.39,
        overpowerPercent: 43.18,
        lastPlayed: new Date("2026-01-13T09:47:00Z"),
      },
      "pooh.html": {
        teamEmblem: undefined,
        teamName: undefined,
        mainHonorRarity: "PLATINUM",
        mainHonorText: "THE ACHIEVER／RATING 15.50",
        playerLevel: 29,
        playerName: "Ｐｏｏｈ５８２１",
        classBand: 0,
        classEmblem: 0,
        rating: 15.69,
        overpowerValue: 15514.1,
        overpowerPercent: 14.71,
        lastPlayed: new Date("2025-04-09T07:47:00Z"),
      },
      "thatcat.html": {
        teamEmblem: "NORMAL",
        teamName: "ＣＰ　ｖｓ　ＣＥＤＴ",
        mainHonorRarity: "SILVER",
        mainHonorText: "ノーツに嫌われている。",
        playerLevel: 122,
        playerName: "ＴＨＡＴＣＡＴ",
        classBand: 0,
        classEmblem: 0,
        rating: 17.17,
        overpowerValue: 47546.36,
        overpowerPercent: 43.77,
        lastPlayed: new Date("2025-04-06T03:55:00Z"),
      },
      "thatcat-vrs.html": {
        teamEmblem: "NORMAL",
        teamName: "ＣＰ　ｖｓ　ＣＥＤＴ",
        mainHonorRarity: "SILVER",
        mainHonorText: "ノーツに嫌われている。",
        playerLevel: 122,
        playerName: "ＴＨＡＴＣＡＴ",
        classBand: 0,
        classEmblem: 0,
        rating: 17.17,
        overpowerValue: 47546.36,
        overpowerPercent: 43.77,
        lastPlayed: new Date("2025-04-06T03:55:00Z"),
      },
    };

    for (const [filename, expected] of Object.entries(fixtures)) {
      const dom = await getFixture("playerData", filename);

      // Note: Not toStrictEqual because I lazy adding undefined fields
      expect(parseRightData(dom)).toEqual(expected);
    }
  });

  it("Bottom (Player Data Page)", async () => {
    const fixtures = {
      "example.html": {
        currentCurrency: 0,
        totalCurrency: 1373000,
        playCount: 465,
      },
      "vrs.html": {
        currentCurrency: 8000,
        totalCurrency: 8000,
        playCount: 468,
      },
    };

    for (const [filename, expected] of Object.entries(fixtures)) {
      const dom = await getFixture("bottomData", filename);

      expect(parseBottomData(dom)).toStrictEqual(expected);
    }
  });
});
