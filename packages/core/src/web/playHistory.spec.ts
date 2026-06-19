import { describe, expect, it } from "vitest";

import {
  getNextPlayHistoryLimit,
  parsePlayHistoryLimit,
  PLAY_HISTORY_DEFAULT_LIMIT,
  PLAY_HISTORY_MAX_LIMIT,
} from "./playHistory.js";

describe("parsePlayHistoryLimit", () => {
  it("defaults when missing or invalid", () => {
    expect(parsePlayHistoryLimit(null)).toBe(PLAY_HISTORY_DEFAULT_LIMIT);
    expect(parsePlayHistoryLimit("abc")).toBe(PLAY_HISTORY_DEFAULT_LIMIT);
  });

  it("clamps to the allowed range", () => {
    expect(parsePlayHistoryLimit("10")).toBe(PLAY_HISTORY_DEFAULT_LIMIT);
    expect(parsePlayHistoryLimit("99999")).toBe(PLAY_HISTORY_MAX_LIMIT);
    expect(parsePlayHistoryLimit("60")).toBe(60);
  });
});

describe("getNextPlayHistoryLimit", () => {
  it("returns null when there is nothing more or already at the max", () => {
    expect(getNextPlayHistoryLimit(60, false)).toBeNull();
    expect(getNextPlayHistoryLimit(PLAY_HISTORY_MAX_LIMIT, true)).toBeNull();
  });

  it("grows by one step, capped at the max", () => {
    expect(getNextPlayHistoryLimit(30, true)).toBe(60);
    expect(getNextPlayHistoryLimit(PLAY_HISTORY_MAX_LIMIT - 10, true)).toBe(
      PLAY_HISTORY_MAX_LIMIT,
    );
  });
});
