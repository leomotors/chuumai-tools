import { describe, expect, it } from "vitest";

import { constantFromLevel } from "./index.js";

describe("Chuni Level Utils", () => {
  it("parse correctly for normal integer", () => {
    expect(constantFromLevel("10")).toBe(10);
    expect(constantFromLevel("15")).toBe(15);

    expect(constantFromLevel("0")).toBe(0);

    for (let i = 0; i <= 99; i++) {
      expect(constantFromLevel(`${i}`)).toBe(i);
    }
  });

  it("parse correctly for + levels", () => {
    expect(constantFromLevel("10+")).toBe(10.6);
    expect(constantFromLevel("15+")).toBe(15.6);

    expect(constantFromLevel("0+")).toBe(0.6);

    for (let i = 0; i <= 99; i++) {
      expect(constantFromLevel(`${i}+`)).toBe(+`${i}.6`);
    }
  });
});
