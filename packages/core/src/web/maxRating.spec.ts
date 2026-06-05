import { expect, test } from "vitest";

import { withMaxRating } from "./maxRating.js";

test("adds a running max rating to chronological records", () => {
  expect(
    withMaxRating([
      { rating: 14.25, label: "start" },
      { rating: 14.5, label: "peak" },
      { rating: 14.4, label: "dip" },
      { rating: 14.75, label: "new peak" },
    ]),
  ).toStrictEqual([
    { rating: 14.25, label: "start", maxRating: 14.25 },
    { rating: 14.5, label: "peak", maxRating: 14.5 },
    { rating: 14.4, label: "dip", maxRating: 14.5 },
    { rating: 14.75, label: "new peak", maxRating: 14.75 },
  ]);
});

test("returns an empty array for no records", () => {
  expect(withMaxRating([])).toStrictEqual([]);
});
