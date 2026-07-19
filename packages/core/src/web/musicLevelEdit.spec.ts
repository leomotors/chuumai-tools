import { describe, expect, it } from "vitest";

import { chartLevelEditSchema, parseConstantInput } from "./musicLevelEdit";

describe("parseConstantInput", () => {
  it("treats blank and dash as null", () => {
    expect(parseConstantInput("")).toBeNull();
    expect(parseConstantInput("   ")).toBeNull();
    expect(parseConstantInput("-")).toBeNull();
  });

  it("parses and rounds to one decimal", () => {
    expect(parseConstantInput("13")).toBe(13);
    expect(parseConstantInput("13.5")).toBe(13.5);
    expect(parseConstantInput(" 13.55 ")).toBe(13.6);
    expect(parseConstantInput("13.24")).toBe(13.2);
  });

  it("throws on non-numeric input", () => {
    expect(() => parseConstantInput("abc")).toThrow();
    expect(() => parseConstantInput("13a")).toThrow();
  });
});

describe("chartLevelEditSchema", () => {
  it("accepts a valid edit with a constant", () => {
    const result = chartLevelEditSchema.safeParse({
      level: "13+",
      constant: 13.5,
    });
    expect(result.success).toBe(true);
  });

  it("accepts a null constant", () => {
    const result = chartLevelEditSchema.safeParse({
      level: "13+",
      constant: null,
    });
    expect(result.success).toBe(true);
  });

  it("rejects an empty level", () => {
    const result = chartLevelEditSchema.safeParse({ level: "", constant: 1 });
    expect(result.success).toBe(false);
  });

  it("rejects an out-of-range constant", () => {
    expect(
      chartLevelEditSchema.safeParse({ level: "13", constant: -1 }).success,
    ).toBe(false);
    expect(
      chartLevelEditSchema.safeParse({ level: "13", constant: 21 }).success,
    ).toBe(false);
  });
});
