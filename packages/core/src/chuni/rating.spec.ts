import { expect, test } from "vitest";

import {
  calculateRating,
  chuniRatingMilestones,
  getChuniRatingLevel,
} from "./index.js";

test("Calculate Rating", () => {
  const testCases: [number, number, number][] = [
    [1009000, 15, 17.15],
    [1007500, 15, 17],
    [1005000, 15, 16.5],
    [1000000, 15, 16],
    [990000, 15, 15.6],
    [975000, 15, 15],
    [900000, 15, 10],
    [800000, 15, 5],
    [700000, 15, 3.33],
    [600000, 15, 1.66],
    [500000, 15, 0],
    [200000, 15, 0],
    [950000, 1, 0],
    // Real test cases
    [969457, 15.1, 14.73],
    [967015, 14.4, 13.86],
    [970465, 14.1, 13.79],
    [974615, 13.6, 13.57],
  ];

  testCases.forEach((tc) => expect(calculateRating(tc[0], tc[1])).toBe(tc[2]));
});

test("Chunithm rating level thresholds", () => {
  expect(chuniRatingMilestones.map((milestone) => milestone.rating)).toEqual([
    0, 4, 7, 10, 12, 13.25, 14.5, 15.25, 15.5, 15.75, 16, 16.25, 16.5, 16.75,
    17, 17.25, 17.5,
  ]);
  expect(chuniRatingMilestones[0]).toMatchObject({
    label: "Starting Point",
    isStartingPoint: true,
  });
  expect(chuniRatingMilestones.at(-1)?.label).toBe("Ultimate Rainbow ⭐⭐⭐");

  expect(getChuniRatingLevel(3.99)).toBe("green");
  expect(getChuniRatingLevel(4)).toBe("orange");
  expect(getChuniRatingLevel(7)).toBe("red");
  expect(getChuniRatingLevel(10)).toBe("purple");
  expect(getChuniRatingLevel(12)).toBe("bronze");
  expect(getChuniRatingLevel(13.25)).toBe("silver");
  expect(getChuniRatingLevel(14.5)).toBe("gold");
  expect(getChuniRatingLevel(15.25)).toBe("platinum");
  expect(getChuniRatingLevel(16)).toBe("rainbow");
  expect(getChuniRatingLevel(17)).toBe("kiwami");
});
