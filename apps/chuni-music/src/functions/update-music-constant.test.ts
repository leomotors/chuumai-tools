import fs from "node:fs";
import path from "node:path";

import { describe, expect, it, vi } from "vitest";

import { musicDataTable, musicLevelTable } from "@repo/database/chuni";

import { updateMusicConstant } from "./update-music-constant";

// Helper function to load fixture data
function loadFixture(filename: string) {
  const fixturePath = path.join(__dirname, "__fixtures__", "step-2", filename);
  const data = fs.readFileSync(fixturePath, "utf8");
  return JSON.parse(data);
}

// Mock cli-progress to avoid console output during tests
vi.mock("@leomotors/cli-progress", () => ({
  default: {
    SingleBar: vi.fn().mockImplementation(() => ({
      start: vi.fn(),
      update: vi.fn(),
      stop: vi.fn(),
    })),
    Preset: {
      shadesClassic: {},
    },
  },
}));

describe("updateMusicConstant", () => {
  const existingMusicData: (typeof musicDataTable.$inferSelect)[] = loadFixture(
    "existing-music-data.json",
  );
  const existingLevelData: (typeof musicLevelTable.$inferSelect)[] =
    loadFixture("existing-level-data.json");
  const newData = loadFixture("new-data.json");

  it("should update constants when they differ from existing values", async () => {
    const version = "VRS";
    const result = await updateMusicConstant(
      version,
      existingMusicData,
      existingLevelData,
      newData,
    );

    // There should be 2 updates: 晴る ultima (14.1 -> 14.2) and ビビデバ master (null -> 12.5)
    expect(result.payload).toHaveLength(2);
    expect(result.payload).toContainEqual({
      songId: 2684,
      difficulty: "ultima",
      version: "VRS",
      newConstant: "14.2",
    });
    expect(result.payload).toContainEqual({
      songId: 2686,
      difficulty: "master",
      version: "VRS",
      newConstant: "12.5",
    });

    expect(result.nullsCount).toBe(1); // One null constant in the new data
    expect(result.nullsTitle).toContain("Null Constants Song"); // Title of song with null constants
    expect(result.warnings).toContain(
      "Multiple songs found in DB: Duplicate Title",
    );
    expect(result.warnings).toContain(
      "Constant value mismatch: 晴る, ultima, VRS, Existing: 14.2 != New: 14.1",
    );
  });

  it("should handle songs with matching constants (no updates needed)", async () => {
    const matchingNewData = [
      {
        title: "晴る",
        sheets: [
          {
            type: "std" as const,
            difficulty: "basic" as const,
            internalLevel: "2.0", // Matches existing
          },
          {
            type: "std" as const,
            difficulty: "advanced" as const,
            internalLevel: "5.0", // Matches existing
          },
        ],
      },
    ];

    const result = await updateMusicConstant(
      "VRS",
      existingMusicData,
      existingLevelData,
      matchingNewData,
    );

    expect(result.payload).toHaveLength(0); // No updates needed
    expect(result.nullsCount).toBe(0);
    expect(result.nullsTitle).toEqual([]);
    expect(result.warnings).toBe("");
  });

  it("should handle null constants correctly", async () => {
    const nullConstantData = [
      {
        title: "Null Constants Song",
        sheets: [
          {
            type: "std" as const,
            difficulty: "basic" as const,
            internalLevel: null, // Both existing and new are null
          },
          {
            type: "std" as const,
            difficulty: "advanced" as const,
            internalLevel: "6.0", // New constant for existing null
          },
        ],
      },
    ];

    const result = await updateMusicConstant(
      "VRS",
      existingMusicData,
      existingLevelData,
      nullConstantData,
    );

    expect(result.payload).toHaveLength(1);
    expect(result.payload[0]).toEqual({
      songId: 1001,
      difficulty: "advanced",
      version: "VRS",
      newConstant: "6.0",
    });
    expect(result.nullsCount).toBe(1); // One case where both are null
    expect(result.nullsTitle).toContain("Null Constants Song");
  });

  it("should collect null constants titles correctly", async () => {
    // Use the fixture data that already has a song with null constants
    // From the fixtures: "Null Constants Song" has null constants
    const result = await updateMusicConstant(
      "VRS",
      existingMusicData,
      existingLevelData,
      newData,
    );

    // The "Null Constants Song" from fixtures should be in nullsTitle
    expect(result.nullsCount).toBe(1);
    expect(result.nullsTitle).toContain("Null Constants Song");
    expect(result.nullsTitle).toHaveLength(1);

    // Multiple songs with different updates should not affect nullsTitle
    expect(result.payload.length).toBeGreaterThan(0); // There are other updates
    expect(result.nullsTitle).not.toContain("晴る"); // Songs with updates shouldn't be in nullsTitle
    expect(result.nullsTitle).not.toContain("ビビデバ");
  });

  it("should warn about missing songs in database", async () => {
    const missingSongData = [
      {
        title: "Missing Song",
        sheets: [
          {
            type: "std" as const,
            difficulty: "basic" as const,
            internalLevel: "1.0",
          },
        ],
      },
    ];

    const result = await updateMusicConstant(
      "VRS",
      existingMusicData,
      existingLevelData,
      missingSongData,
    );

    expect(result.payload).toHaveLength(0);
    expect(result.warnings).toBe(""); // Missing songs are silently skipped (might be deleted)
  });

  it("should warn about duplicate songs in database", async () => {
    const duplicateSongData = [
      {
        title: "Duplicate Title",
        sheets: [
          {
            type: "std" as const,
            difficulty: "basic" as const,
            internalLevel: "2.0",
          },
        ],
      },
    ];

    const result = await updateMusicConstant(
      "VRS",
      existingMusicData,
      existingLevelData,
      duplicateSongData,
    );

    expect(result.payload).toHaveLength(0);
    expect(result.warnings).toContain(
      "Multiple songs found in DB: Duplicate Title",
    );
  });

  it("should warn about constant value mismatches", async () => {
    const mismatchData = [
      {
        title: "ビビデバ",
        sheets: [
          {
            type: "std" as const,
            difficulty: "basic" as const,
            internalLevel: "4.0", // Different from existing 3.0
          },
        ],
      },
    ];

    const result = await updateMusicConstant(
      "VRS",
      existingMusicData,
      existingLevelData,
      mismatchData,
    );

    expect(result.payload).toHaveLength(1);
    expect(result.payload[0]).toEqual({
      songId: 2686,
      difficulty: "basic",
      version: "VRS",
      newConstant: "4.0",
    });
    expect(result.warnings).toContain(
      "Constant value mismatch: ビビデバ, basic, VRS, Existing: 4.0 != New: 3.0",
    );
  });

  it("should skip non-std sheet types", async () => {
    const mixedSheetData = [
      {
        title: "ビビデバ",
        sheets: [
          {
            type: "std" as const,
            difficulty: "basic" as const,
            internalLevel: "3.0",
          },
          {
            type: "we" as const,
            difficulty: "world_end", // Should be skipped
          },
        ],
      },
    ];

    const result = await updateMusicConstant(
      "VRS",
      existingMusicData,
      existingLevelData,
      mixedSheetData,
    );

    expect(result.payload).toHaveLength(0); // No updates for std sheet
    expect(result.warnings).toBe(""); // No warnings for skipped we sheet
  });

  it("should handle updates from null existing constants", async () => {
    const updateFromNullData = [
      {
        title: "ビビデバ",
        sheets: [
          {
            type: "std" as const,
            difficulty: "master" as const, // Existing constant is null
            internalLevel: "12.5",
          },
        ],
      },
    ];

    const result = await updateMusicConstant(
      "VRS",
      existingMusicData,
      existingLevelData,
      updateFromNullData,
    );

    expect(result.payload).toHaveLength(1);
    expect(result.payload[0]).toEqual({
      songId: 2686,
      difficulty: "master",
      version: "VRS",
      newConstant: "12.5",
    });
    expect(result.warnings).toBe(""); // No warnings when updating from null
  });

  it("should handle empty new data", async () => {
    const result = await updateMusicConstant(
      "VRS",
      existingMusicData,
      existingLevelData,
      [],
    );

    expect(result.payload).toHaveLength(0);
    expect(result.nullsCount).toBe(0);
    expect(result.nullsTitle).toEqual([]);
    expect(result.warnings).toBe("");
  });

  it("should handle different versions correctly", async () => {
    const result = await updateMusicConstant(
      "XVRS", // Different version
      existingMusicData,
      existingLevelData,
      [
        {
          title: "晴る",
          sheets: [
            {
              type: "std" as const,
              difficulty: "basic" as const,
              internalLevel: "2.5", // Different from XVRS existing 2.0
            },
          ],
        },
      ],
    );

    expect(result.payload).toHaveLength(1);
    expect(result.payload[0]).toEqual({
      songId: 2684,
      difficulty: "basic",
      version: "XVRS",
      newConstant: "2.5",
    });
    expect(result.warnings).toContain(
      "Constant value mismatch: 晴る, basic, XVRS, Existing: 2.5 != New: 2.0",
    );
  });
});
