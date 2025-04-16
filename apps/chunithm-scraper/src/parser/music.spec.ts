import fs from "node:fs/promises";

import { JSDOM } from "jsdom";
import { expect, test } from "vitest";

import { parseMusic, parseRecord } from "./music.js";

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
      clearMark: "ABSOLUTE",
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
      clearMark: "ABSOLUTE+",
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
