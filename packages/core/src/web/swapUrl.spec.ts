import { describe, expect, it } from "vitest";

import { getSwapUrl } from "./swapUrl";

describe("getSwapUrl", () => {
  it("returns an empty string if base URL is not defined", () => {
    expect(getSwapUrl(undefined, "/data")).toBe("");
    expect(getSwapUrl("", "/data")).toBe("");
  });

  it("normalizes base URL trailing slashes", () => {
    const rawUrlWithSlash = "https://maimai.wonderhoy.me/";
    const rawUrlWithoutSlash = "https://maimai.wonderhoy.me";

    expect(getSwapUrl(rawUrlWithSlash, "/data")).toBe(
      "https://maimai.wonderhoy.me/data",
    );
    expect(getSwapUrl(rawUrlWithoutSlash, "/data")).toBe(
      "https://maimai.wonderhoy.me/data",
    );
  });

  it("preserves interchangeable routes", () => {
    const baseUrl = "https://chuni.wonderhoy.me";

    expect(getSwapUrl(baseUrl, "/data")).toBe(
      "https://chuni.wonderhoy.me/data",
    );
    expect(getSwapUrl(baseUrl, "/about")).toBe(
      "https://chuni.wonderhoy.me/about",
    );
    expect(getSwapUrl(baseUrl, "/dashboard")).toBe(
      "https://chuni.wonderhoy.me/dashboard",
    );
  });

  it("drops non-interchangeable routes and falls back to home page (/)", () => {
    const baseUrl = "https://chuni.wonderhoy.me";

    expect(getSwapUrl(baseUrl, "/")).toBe("https://chuni.wonderhoy.me/");
    expect(getSwapUrl(baseUrl, "/tools/chart-constant")).toBe(
      "https://chuni.wonderhoy.me/",
    );
    expect(getSwapUrl(baseUrl, "/some-random-page")).toBe(
      "https://chuni.wonderhoy.me/",
    );
  });
});
