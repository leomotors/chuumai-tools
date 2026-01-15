import fs from "node:fs/promises";

import { JSDOM } from "jsdom";
import { expect, test } from "vitest";

import { parseHistory, parseMusic, parseRecord } from "./music.js";

test("Music parser", async () => {
  const fixtures = [
    [
      "forsaken-tale.html",
      {
        musicId: 2652,
        musicTitle: "Forsaken Tale",
        score: 1006530,
        difficulty: 2,
      },
    ],
    [
      "fracture-ray.html",
      {
        musicId: 749,
        musicTitle: "Fracture Ray",
        score: 1008159,
        difficulty: 3,
      },
    ],
    [
      "inori.html",
      {
        musicId: 1086,
        musicTitle: "祈 -我ら神祖と共に歩む者なり-",
        score: 997538,
        difficulty: 3,
      },
    ],
    [
      "matsukensaiba.html",
      {
        musicId: 2493,
        musicTitle: "マツケンサンバⅡ",
        score: 0,
        difficulty: 3,
      },
    ],
  ];

  for (const [fixture, expected] of fixtures) {
    const filename = `src/parser/__fixtures__/music/${fixture}`;

    const fileContent = await fs.readFile(filename, "utf-8");
    const dom = new JSDOM(fileContent);

    expect(parseMusic(dom.window.document.documentElement)).toStrictEqual(
      expected,
    );
  }
});

test("Full Music Parser", async () => {
  const fixtures = {
    "bakamitai.html": {
      musicId: 2449,
      musicTitle: "ばかみたい【Taxi Driver Edition】",
      score: 1009890,
      difficulty: 0,
      clearMark: "CATASTROPHY",
      fc: true,
      aj: true,
      fullChain: 0,
    },
    "flos.html": {
      musicId: 2521,
      musicTitle: "flos",
      score: 519529,
      difficulty: 3,
      clearMark: undefined,
      fc: false,
      aj: false,
      fullChain: 0,
    },
    "forsaken-tale.html": {
      musicId: 2652,
      musicTitle: "Forsaken Tale",
      score: 1006530,
      difficulty: 2,
      clearMark: "BRAVE",
      fc: false,
      aj: false,
      fullChain: 0,
    },
    "matsukensaiba.html": {
      musicId: 2493,
      musicTitle: "マツケンサンバⅡ",
      score: 0,
      difficulty: 3,
      clearMark: undefined,
      fc: false,
      aj: false,
      fullChain: 0,
    },
    "startliner.html": {
      musicId: 802,
      musicTitle: "STARTLINER",
      score: 1010000,
      difficulty: 0,
      clearMark: "CATASTROPHY",
      fc: true,
      aj: true,
      fullChain: 0,
    },
    "teratera.html": {
      musicId: 2513,
      musicTitle: "てらてら",
      score: 1009891,
      difficulty: 3,
      clearMark: "ABSOLUTE",
      fc: true,
      aj: true,
      fullChain: 2,
    },
    "ultimate-force.html": {
      musicId: 2582,
      musicTitle: "Ultimate Force",
      score: 1007412,
      difficulty: 2,
      clearMark: "HARD",
      fc: true,
      aj: false,
      fullChain: 0,
    },
    "whats-up-pop.html": {
      musicId: 2660,
      musicTitle: "What's up? Pop!",
      score: 996880,
      difficulty: 3,
      clearMark: "CLEAR",
      fc: false,
      aj: false,
      fullChain: 0,
    },
  };
  for (const [fixture, expected] of Object.entries(fixtures)) {
    const filename = `src/parser/__fixtures__/record/${fixture}`;
    const fileContent = await fs.readFile(filename, "utf-8");

    const dom = new JSDOM(fileContent);
    expect(parseRecord(dom.window.document.documentElement)).toStrictEqual(
      expected,
    );
  }
});

test("Play History Parser", async () => {
  const fixtures = {
    "slider.html": {
      title: "グラウンドスライダー協奏曲第一番「風唄」",
      difficulty: "master",
      score: 983575,
      clearMark: "CLEAR",
      fc: false,
      aj: false,
      fullChain: 0,
      isHidden: false,
      trackNo: 3,
      playedAt: "2026-01-13T09:43:00.000Z", // JST 2026/01/13 18:43 -> UTC
    },
    "we.html": {
      title: "M.L.V.G",
      difficulty: null, // World's End -> null
      score: 997721,
      clearMark: "CLEAR",
      fc: false,
      aj: false,
      fullChain: 0,
      isHidden: false,
      trackNo: 3,
      playedAt: "2026-01-09T09:48:00.000Z", // JST 2026/01/09 18:48 -> UTC
    },
    "fullchain.html": {
      title: "Pris-Magic!",
      difficulty: "master",
      score: 1009567,
      clearMark: "HARD",
      fc: true,
      aj: false,
      fullChain: 2, // Platinum Full Chain
      isHidden: false,
      trackNo: 1,
      playedAt: "2026-01-13T06:47:00.000Z", // JST 2026/01/13 15:47 -> UTC
    },
    "ultima.html": {
      title: "Unwelcome School",
      difficulty: "ultima",
      score: 1003653,
      clearMark: "HARD",
      fc: false,
      aj: false,
      fullChain: 0,
      isHidden: false,
      trackNo: 3,
      playedAt: "2026-01-07T05:09:00.000Z", // JST 2026/01/07 14:09 -> UTC
    },
    "fail.html": {
      title: "A Man In The Mirror",
      difficulty: "master",
      score: 837147,
      clearMark: undefined, // No clear mark (failed)
      fc: false,
      aj: false,
      fullChain: 0,
      isHidden: false,
      trackNo: 3,
      playedAt: "2026-01-07T05:45:00.000Z", // JST 2026/01/07 14:45 -> UTC
    },
    "hera.html": {
      title: "HERA",
      difficulty: "master",
      score: 999940,
      clearMark: undefined, // icon_course_clear is not a standard clear mark
      fc: false,
      aj: false,
      fullChain: 0,
      isHidden: false,
      trackNo: 3,
      playedAt: "2026-01-09T09:06:00.000Z", // JST 2026/01/09 18:06 -> UTC
    },
    "expert.html": {
      title: "Ultimate Force",
      difficulty: "expert",
      score: 1008513,
      clearMark: "HARD",
      fc: false,
      aj: false,
      fullChain: 0,
      isHidden: false,
      trackNo: 4,
      playedAt: "2026-01-13T07:00:00.000Z", // JST 2026/01/13 16:00 -> UTC
    },
    "samsa.html": {
      title: "ザムザ",
      difficulty: "master",
      score: 1009770,
      clearMark: "HARD",
      fc: true,
      aj: true,
      fullChain: 0,
      isHidden: false,
      trackNo: 1,
      playedAt: "2026-01-09T08:25:00.000Z", // JST 2026/01/09 17:25 -> UTC
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
