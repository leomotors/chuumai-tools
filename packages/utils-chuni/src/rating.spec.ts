import { expect, test } from "vitest";

import { calculateRating } from "./rating.js";

test("Calculate Rating", () => {
  const testCases: [number, number, number][] = [
    [1009000, 15, 17.15],
    [1007500, 15, 17],
    [1005000, 15, 16.5],
    [1000000, 15, 16],
    [990000, 15, 15.6],
    [975000, 15, 15],
    [950000, 15, 13.5],
    [925000, 15, 12],
    [900000, 15, 10],
    [800000, 15, 5],
    [700000, 15, 3.33],
    [600000, 15, 1.66],
    [500000, 15, 0],
    [200000, 15, 0],
    [950000, 1, 0],
  ];

  testCases.forEach((tc) => expect(calculateRating(tc[0], tc[1])).toBe(tc[2]));
});
