import { expect, test } from "vitest";

import { ComboMark } from "@repo/types/maimai";

import {
  calculateRating,
  getMaimaiRatingLevel,
  maimaiRatingMilestones,
} from "./rating.js";

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

test("Maimai rating level thresholds", () => {
  expect(maimaiRatingMilestones.map((milestone) => milestone.rating)).toEqual([
    0, 1000, 2000, 4000, 7000, 10000, 12000, 13000, 14000, 14250, 14500, 14750,
    15000, 15250, 15500, 15750, 16000, 16250, 16500,
  ]);
  expect(maimaiRatingMilestones[0]).toMatchObject({
    label: "Starting Point",
    isStartingPoint: true,
  });
  expect(maimaiRatingMilestones.at(-1)?.label).toBe("Ultimate Rainbow ⭐⭐⭐");

  expect(getMaimaiRatingLevel(999)).toBe("normal");
  expect(getMaimaiRatingLevel(1000)).toBe("blue");
  expect(getMaimaiRatingLevel(2000)).toBe("green");
  expect(getMaimaiRatingLevel(4000)).toBe("orange");
  expect(getMaimaiRatingLevel(7000)).toBe("red");
  expect(getMaimaiRatingLevel(10000)).toBe("purple");
  expect(getMaimaiRatingLevel(11999)).toBe("purple");
  expect(getMaimaiRatingLevel(12000)).toBe("bronze");
  expect(getMaimaiRatingLevel(13000)).toBe("silver");
  expect(getMaimaiRatingLevel(14000)).toBe("gold");
  expect(getMaimaiRatingLevel(14500)).toBe("platinum");
  expect(getMaimaiRatingLevel(15000)).toBe("rainbow");
  expect(getMaimaiRatingLevel(16000)).toBe("rainbow_kiwami");
});
