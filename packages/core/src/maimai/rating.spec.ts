import { expect, test } from "vitest";

import { calculateRating } from "./rating.js";

test("Calculate Rating", () => {
  const testCases: [number, number, number][] = [
    [100_5000, 13.0, 292],
    [97_0000, 13.0, 252],
    [80_0000, 13.0, 141],
    [100_6969, 15.7, 353],
    [100_2322, 13.4, 290],
  ];

  testCases.forEach((tc) => expect(calculateRating(tc[0], tc[1])).toBe(tc[2]));
});
