import { describe, expect, it } from "vitest";

import { isAdminUser } from "./admin";

describe("isAdminUser", () => {
  it("returns true when the user id matches the configured admin user id", () => {
    expect(isAdminUser("123", "123")).toBe(true);
  });

  it("trims the configured admin user id", () => {
    expect(isAdminUser("123", " 123 ")).toBe(true);
  });

  it("returns false when either id is missing or mismatched", () => {
    expect(isAdminUser("123", undefined)).toBe(false);
    expect(isAdminUser(undefined, "123")).toBe(false);
    expect(isAdminUser("123", "456")).toBe(false);
  });
});
