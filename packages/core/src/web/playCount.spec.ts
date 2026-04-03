import { describe, expect, it } from "vitest";

import { getCutoffTime, getMonthStart, getWeekStart } from "./playCount.js";

// JST is UTC+9
// 7AM JST = 22:00 UTC of the PREVIOUS day
// e.g. April 3 7AM JST = April 2 22:00 UTC

describe("getCutoffTime", () => {
  it("returns 7AM JST (22:00 UTC previous day) for midnight UTC input", () => {
    // Input: April 3, 2026 00:00 UTC  → April 3, 9:00 AM JST
    // Expected: April 2, 22:00 UTC    = April 3, 7:00 AM JST  (start of April 3 game day)
    const input = new Date("2026-04-03T00:00:00.000Z");
    const result = getCutoffTime(input);
    expect(result.toISOString()).toBe("2026-04-02T22:00:00.000Z");
  });

  it("returns 7AM JST for start of month", () => {
    // Input: April 1, 2026 00:00 UTC → April 1, 9:00 AM JST
    // Expected: March 31, 22:00 UTC  = April 1, 7:00 AM JST  (start of April 1 game day)
    const input = new Date("2026-04-01T00:00:00.000Z");
    const result = getCutoffTime(input);
    expect(result.toISOString()).toBe("2026-03-31T22:00:00.000Z");
  });

  it("does not modify the original date", () => {
    const input = new Date("2026-04-03T12:00:00.000Z");
    getCutoffTime(input);
    expect(input.toISOString()).toBe("2026-04-03T12:00:00.000Z");
  });

  it("handles late night player", () => {
    const input = new Date("2026-04-03T21:00:00.000Z"); // April 4, 6:00 AM JST
    const result = getCutoffTime(input);
    // Expected: April 2, 22:00 UTC = April 3, 7:00 AM JST (start of April 4 game day)
    expect(result.toISOString()).toBe("2026-04-02T22:00:00.000Z");
  });
});

describe("getWeekStart", () => {
  // April 2026 calendar (UTC days):
  // Mon Mar 30 | Tue Mar 31 | Wed Apr 1 | Thu Apr 2 | Fri Apr 3 | Sat Apr 4 | Sun Apr 5

  it("returns Monday 7AM JST for a Friday input", () => {
    // April 3, 2026 is Friday (UTC); Monday of this week = March 30
    // Expected: March 30 7AM JST = March 29, 22:00 UTC
    const friday = new Date("2026-04-03T10:00:00.000Z");
    const result = getWeekStart(friday);
    expect(result.toISOString()).toBe("2026-03-29T22:00:00.000Z");
  });

  it("returns Monday 7AM JST for a Monday input", () => {
    // March 30, 2026 is Monday
    // Expected: March 30 7AM JST = March 29, 22:00 UTC
    const monday = new Date("2026-03-30T10:00:00.000Z");
    const result = getWeekStart(monday);
    expect(result.toISOString()).toBe("2026-03-29T22:00:00.000Z");
  });

  it("returns Monday 7AM JST for a Sunday input (last day of week)", () => {
    // April 5, 2026 is Sunday; Monday of this week = March 30
    // Expected: March 30 7AM JST = March 29, 22:00 UTC
    const sunday = new Date("2026-04-05T10:00:00.000Z");
    const result = getWeekStart(sunday);
    expect(result.toISOString()).toBe("2026-03-29T22:00:00.000Z");
  });

  it("handles late night player on Sunday", () => {
    const lateSunday = new Date("2026-04-05T21:00:00.000Z"); // April 6, 6:00 AM JST

    // Expected: March 30 7AM JST = March 29, 22:00 UTC (start of April 6 game day)
    const result = getWeekStart(lateSunday);
    expect(result.toISOString()).toBe("2026-03-29T22:00:00.000Z");
  });
});

describe("getMonthStart", () => {
  it("returns April 1 7AM JST for a date in April", () => {
    // April 1 7AM JST = March 31, 22:00 UTC
    const aprilDate = new Date("2026-04-03T10:00:00.000Z");
    const result = getMonthStart(aprilDate);
    expect(result.toISOString()).toBe("2026-03-31T22:00:00.000Z");
  });

  it("returns January 1 7AM JST for a date in January", () => {
    // January 1 7AM JST = December 31 (prev year), 22:00 UTC
    const janDate = new Date("2026-01-15T10:00:00.000Z");
    const result = getMonthStart(janDate);
    expect(result.toISOString()).toBe("2025-12-31T22:00:00.000Z");
  });

  it("returns correct start when called on the 1st of the month", () => {
    // April 1, 2026 00:00 UTC — should still return March 31, 22:00 UTC
    const firstDay = new Date("2026-04-01T00:00:00.000Z");
    const result = getMonthStart(firstDay);
    expect(result.toISOString()).toBe("2026-03-31T22:00:00.000Z");
  });

  it("handles late night player on the last day of the month", () => {
    const lateApril = new Date("2026-04-30T21:00:00.000Z"); // May 1, 6:00 AM JST

    // Expected: April 1 7AM JST = March 31, 22:00 UTC (start of May 1 game day)
    const result = getMonthStart(lateApril);
    expect(result.toISOString()).toBe("2026-03-31T22:00:00.000Z");
  });
});
