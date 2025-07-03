import { expect, test } from "vitest";

import { getRank } from "./index.js";

test("Get Rank", () => {
  const testcases = [
    [-100, 0],
    [0, 0],
    [499999, 0],
    [500000, 1],
    [599999, 1],
    [600000, 2],
    [700000, 3],
    [800000, 4],
    [900000, 5],
    [925000, 6],
    [950000, 7],
    [975000, 8],
    [990000, 9],
    [1000000, 10],
    [1005000, 11],
    [1007500, 12],
    [1008999, 12],
    [1009000, 13],
    [1010000, 13],
  ];

  testcases.forEach(([score, rank]) => {
    expect(getRank(score)).toBe(rank);
  });
});
