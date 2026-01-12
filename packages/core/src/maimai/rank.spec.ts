import { expect, test } from "vitest";

import { getRank } from "./rank.js";

test("Get Rank", () => {
  const testcases = [
    [-100, 0],
    [0, 0],
    [499999, 0],
    [500000, 1], // C
    [599999, 1],
    [600000, 2], // B
    [700000, 3], // BB
    [749999, 3],
    [750000, 4], // BBB
    [800000, 5], // A
    [900000, 6], // AA
    [940000, 7], // AAA
    [969999, 7],
    [970000, 8], // S
    [980000, 9], // S+
    [990000, 10], // SS
    [995000, 11], // SS+
    [1000000, 12], // SSS
    [1004999, 12],
    [1005000, 13], // SSS+
    [1010000, 13],
  ];

  testcases.forEach(([score, rank]) => {
    expect(getRank(score)).toBe(rank);
  });
});
