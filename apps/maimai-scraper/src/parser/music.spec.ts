import fs from "node:fs/promises";

import { JSDOM } from "jsdom";
import { expect, test } from "vitest";

import { ChartSchema, HistoryRecordSchema } from "@repo/types/maimai";

import { parseHistory, parseMusic } from "./music";

test("Parse for Rating", async () => {
  const fixtures: Record<string, ChartSchema> = {
    "refrain.html": {
      title: "Ref:rain (for 7th Heaven)",
      chartType: "dx",
      difficulty: "master",
      score: 100_2307,
      dxScore: undefined,
      dxScoreMax: undefined,
      comboMark: undefined,
      syncMark: undefined,
    },
    "scopix.html": {
      title: "Xaleid◆scopiX",
      chartType: "dx",
      difficulty: "expert",
      score: 100_0106,
      dxScore: undefined,
      dxScoreMax: undefined,
      comboMark: undefined,
      syncMark: undefined,
    },
  };

  for (const [fixture, expected] of Object.entries(fixtures)) {
    const filename = `src/parser/__fixtures__/rating/${fixture}`;

    const fileContent = await fs.readFile(filename, "utf-8");
    const dom = new JSDOM(fileContent);

    expect(parseMusic(dom.window.document.documentElement)).toStrictEqual(
      expected,
    );
  }
});

test("Parse Record", async () => {
  const fixtures: Record<string, ChartSchema> = {
    "adv-sirius.html": {
      title: "シリウスの輝きのように",
      chartType: "dx",
      difficulty: "advanced",
      score: 101_0000,
      dxScore: 797,
      dxScoreMax: 858,
      comboMark: "AP+",
      syncMark: "FDX",
    },
    "basic-idsmile.html": {
      title: "アイディスマイル",
      chartType: "dx",
      difficulty: "basic",
      score: 0,
      dxScore: undefined,
      dxScoreMax: undefined,
      comboMark: undefined,
      syncMark: undefined,
    },
    "donki.html": {
      title: "ミラクル・ショッピング",
      chartType: "std",
      difficulty: "master",
      score: 100_2622,
      dxScore: 1733,
      dxScoreMax: 1923,
      comboMark: "FC",
      syncMark: "SYNC",
    },
    "ellenjoe.html": {
      title: "モエチャッカファイア",
      chartType: "dx",
      difficulty: "master",
      score: 100_2445,
      dxScore: 2639,
      dxScoreMax: 2952,
      comboMark: undefined,
      syncMark: "SYNC",
    },
    "expert-yuusha.html": {
      title: "勇者",
      chartType: "dx",
      difficulty: "expert",
      score: 100_5940,
      dxScore: 718,
      dxScoreMax: 813,
      comboMark: "FC+",
      syncMark: "FDX",
    },
    "remas-sirius.html": {
      title: "シリウスの輝きのように",
      chartType: "dx",
      difficulty: "remaster",
      score: 98_5801,
      dxScore: 2036,
      dxScoreMax: 2445,
      comboMark: undefined,
      syncMark: "SYNC",
    },
    "yamero.html": {
      title: "INTERNET YAMERO",
      chartType: "dx",
      difficulty: "master",
      score: 100_5110,
      dxScore: 2045,
      dxScoreMax: 2241,
      comboMark: "FC",
      syncMark: undefined,
    },
  };

  for (const [fixture, expected] of Object.entries(fixtures)) {
    const filename = `src/parser/__fixtures__/record/${fixture}`;

    const fileContent = await fs.readFile(filename, "utf-8");
    const dom = new JSDOM(fileContent);

    expect(parseMusic(dom.window.document.documentElement)).toStrictEqual(
      expected,
    );
  }
});

test("Parse History", async () => {
  const fixtures: Record<string, HistoryRecordSchema> = {
    "scopix.html": {
      title: "Xaleid◆scopiX",
      chartType: "dx",
      difficulty: "expert",
      score: 999262,
      dxScore: 3447,
      dxScoreMax: 4071,
      comboMark: "FC",
      syncMark: "SYNC",
      trackNo: 3,
      playedAt: "2026-01-09T09:21:00.000Z", // JST 18:21 = UTC 09:21
    },
    "zitronectar.html": {
      title: "Zitronectar",
      chartType: "dx",
      difficulty: "master",
      score: 994183,
      dxScore: 1924,
      dxScoreMax: 2226,
      comboMark: undefined,
      syncMark: undefined,
      trackNo: 3,
      playedAt: "2025-12-27T06:39:00.000Z", // JST 15:39 = UTC 06:39
    },
    "scopix-re.html": {
      title: "Xaleid◆scopiX",
      chartType: "dx",
      difficulty: "remaster",
      score: 905223,
      dxScore: 4461,
      dxScoreMax: 6666,
      comboMark: undefined,
      syncMark: "SYNC",
      trackNo: 2,
      playedAt: "2025-12-14T09:03:00.000Z", // JST 18:03 = UTC 09:03
    },
  };

  for (const [fixture, expected] of Object.entries(fixtures)) {
    const filename = `src/parser/__fixtures__/history/${fixture}`;

    const fileContent = await fs.readFile(filename, "utf-8");
    const dom = new JSDOM(fileContent);

    expect(parseHistory(dom.window.document.documentElement)).toStrictEqual(
      expected,
    );
  }
});
