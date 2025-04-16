import fs from "node:fs/promises";

import { JSDOM } from "jsdom";
import { expect, test } from "vitest";

import { parseMusic } from "./music.js";

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
