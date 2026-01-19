import { expect, test } from "vitest";

import { ComboMark } from "@repo/types/maimai";

import { calculateRating } from "./rating.js";

test("Calculate Rating", () => {
  const testCases: [number, number, ComboMark, number][] = [
    [100_5000, 13.0, "NONE", 292],
    [100_5000, 13.0, "FC+", 292],
    [100_5000, 13.0, "AP", 293],

    [97_0000, 13.0, "NONE", 252],
    [80_0000, 13.0, "NONE", 141],

    [100_6969, 15.7, "FC", 353],
    [100_6969, 15.7, "AP", 354],
    [100_6969, 15.7, "AP+", 354],

    [100_2322, 13.4, "FC", 290],
  ];

  testCases.forEach((tc) =>
    expect(calculateRating(tc[0], tc[1], tc[2])).toBe(tc[3]),
  );
});
