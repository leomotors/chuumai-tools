import { expect, test } from "vitest";

import { parseRatingImage } from "./playerRating.js";

test("Image Rating parser", () => {
  const jobs: [string, number][] = [
    [
      "https://chunithm-net-eng.com/mobile/images/rating/rating_silver_01.png",
      1,
    ],
    ["https://chunithm-net-eng.com/mobile/images/rating/rating_gold_01.png", 1],
    [
      "https://chunithm-net-eng.com/mobile/images/rating/rating_platinum_01.png",
      1,
    ],
    [
      "https://chunithm-net-eng.com/mobile/images/rating/rating_silver_03.png",
      3,
    ],
    ["https://chunithm-net-eng.com/mobile/images/rating/rating_gold_03.png", 3],
    [
      "https://chunithm-net-eng.com/mobile/images/rating/rating_platinum_03.png",
      3,
    ],
    [
      "https://chunithm-net-eng.com/mobile/images/rating/rating_silver_05.png",
      5,
    ],
    ["https://chunithm-net-eng.com/mobile/images/rating/rating_gold_05.png", 5],
    [
      "https://chunithm-net-eng.com/mobile/images/rating/rating_platinum_05.png",
      5,
    ],
    [
      "https://chunithm-net-eng.com/mobile/images/rating/rating_silver_09.png",
      9,
    ],
    ["https://chunithm-net-eng.com/mobile/images/rating/rating_gold_09.png", 9],
    [
      "https://chunithm-net-eng.com/mobile/images/rating/rating_platinum_09.png",
      9,
    ],
  ];

  jobs.forEach(([url, expected]) => {
    expect(parseRatingImage(url)).toBe(expected);
  });
});
