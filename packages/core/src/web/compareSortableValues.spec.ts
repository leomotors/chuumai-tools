import { describe, expect, it } from "vitest";

import { compareSortableValues } from "./compareSortableValues";

describe("compareSortableValues", () => {
  it("sorts missing values last when descending", () => {
    const values = ["2024-06-01", undefined, "2023-01-01", null, ""];
    const sorted = [...values].sort((a, b) =>
      compareSortableValues(a, b, "desc"),
    );

    expect(sorted.slice(0, 2)).toEqual(["2024-06-01", "2023-01-01"]);
    expect(
      sorted.slice(2).every((value) => value == null || value === ""),
    ).toBe(true);
  });

  it("sorts missing values last when ascending", () => {
    const values = ["2024-06-01", undefined, "2023-01-01"];
    const sorted = [...values].sort((a, b) =>
      compareSortableValues(a, b, "asc"),
    );

    expect(sorted).toEqual(["2023-01-01", "2024-06-01", undefined]);
  });
});
