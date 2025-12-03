import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { musicDataTable } from "@repo/db-chuni/schema";

import { diffInMusicData } from "./diff-in-music-data";

// Types based on the database schema and JSON schema
type ExistingData = (typeof musicDataTable.$inferSelect)[];
type NewData = Array<{
  id: number;
  catname:
    | "POPS & ANIME"
    | "niconico"
    | "東方Project"
    | "VARIETY"
    | "イロドリミドリ"
    | "ゲキマイ"
    | "ORIGINAL";
  title: string;
  artist: string;
  image: string;
  newflag: number;
  reading: string;
  lev_bas: string;
  lev_adv: string;
  lev_exp: string;
  lev_mas: string;
  lev_ult: string;
  we_kanji: string;
  we_star: string;
}>;

// Helper function to load fixture data
function loadFixture(filename: string) {
  const fixturePath = path.join(__dirname, "__fixtures__", filename);
  const data = fs.readFileSync(fixturePath, "utf-8");
  return JSON.parse(data);
}

describe("diffInMusicData", () => {
  it("should identify new records correctly", () => {
    const fixture = loadFixture("new-records.json");
    const { existingData, newData, expected } = fixture;

    const result = diffInMusicData(existingData, newData);

    expect(result.newRecords).toHaveLength(expected.newRecords);
    expect(result.updatedRecords).toHaveLength(expected.updatedRecords);
    expect(result.removedRecords).toHaveLength(expected.removedRecords);
    expect(result.newRecords.map((r) => r.id)).toEqual(expected.newRecordIds);
  });

  it("should identify removed records correctly", () => {
    const fixture = loadFixture("removed-records.json");
    const { existingData, newData, expected } = fixture;

    const result = diffInMusicData(existingData, newData);

    expect(result.newRecords).toHaveLength(expected.newRecords);
    expect(result.updatedRecords).toHaveLength(expected.updatedRecords);
    expect(result.removedRecords).toHaveLength(expected.removedRecords);
    expect(result.removedRecords.map((r) => r.id)).toEqual(
      expected.removedRecordIds,
    );
  });

  it("should identify updated records with only changed fields", () => {
    const fixture = loadFixture("updated-records-all-fields.json");
    const { existingData, newData, expected } = fixture;

    const result = diffInMusicData(existingData, newData);

    expect(result.newRecords).toHaveLength(expected.newRecords);
    expect(result.updatedRecords).toHaveLength(expected.updatedRecords);
    expect(result.removedRecords).toHaveLength(expected.removedRecords);
    expect(result.updatedRecords[0]).toEqual(expected.expectedUpdate);
  });

  it("should handle partial updates with only some fields changed", () => {
    const fixture = loadFixture("partial-updates.json");
    const { existingData, newData, expected } = fixture;

    const result = diffInMusicData(existingData, newData);

    expect(result.newRecords).toHaveLength(expected.newRecords);
    expect(result.updatedRecords).toHaveLength(expected.updatedRecords);
    expect(result.removedRecords).toHaveLength(expected.removedRecords);
    expect(result.updatedRecords[0]).toEqual(expected.expectedUpdate);
  });

  it("should return empty updates when no changes exist", () => {
    const fixture = loadFixture("no-changes.json");
    const { existingData, newData, expected } = fixture;

    const result = diffInMusicData(existingData, newData);

    expect(result.newRecords).toHaveLength(expected.newRecords);
    expect(result.updatedRecords).toHaveLength(expected.updatedRecords);
    expect(result.removedRecords).toHaveLength(expected.removedRecords);
  });

  it("should handle empty datasets", () => {
    // Empty to empty
    const result1 = diffInMusicData([], []);
    expect(result1.newRecords).toHaveLength(0);
    expect(result1.updatedRecords).toHaveLength(0);
    expect(result1.removedRecords).toHaveLength(0);

    // Empty existing, with new data
    const newData: NewData = [
      {
        id: 100,
        catname: "POPS & ANIME",
        title: "New Song",
        artist: "New Artist",
        image: "new.jpg",
        newflag: 1,
        reading: "ニューソング",
        lev_bas: "3",
        lev_adv: "6",
        lev_exp: "9",
        lev_mas: "12",
        lev_ult: "",
        we_kanji: "",
        we_star: "",
      },
    ];

    const result2 = diffInMusicData([], newData);
    expect(result2.newRecords).toHaveLength(1);
    expect(result2.updatedRecords).toHaveLength(0);
    expect(result2.removedRecords).toHaveLength(0);

    // Existing data, empty new
    const existingData: ExistingData = [
      {
        id: 100,
        category: "POPS & ANIME",
        title: "Existing Song",
        artist: "Existing Artist",
        image: "existing.jpg",
        version: null,
      },
    ];

    const result3 = diffInMusicData(existingData, []);
    expect(result3.newRecords).toHaveLength(0);
    expect(result3.updatedRecords).toHaveLength(0);
    expect(result3.removedRecords).toHaveLength(1);
  });

  it("should handle multiple changes of different types", () => {
    const fixture = loadFixture("multiple-changes.json");
    const { existingData, newData, expected } = fixture;

    const result = diffInMusicData(existingData, newData);

    expect(result.newRecords).toHaveLength(expected.newRecords);
    expect(result.updatedRecords).toHaveLength(expected.updatedRecords);
    expect(result.removedRecords).toHaveLength(expected.removedRecords);

    expect(result.newRecords.map((r) => r.id)).toEqual(
      expect.arrayContaining(expected.newRecordIds),
    );
    expect(result.updatedRecords.map((r) => r.id)).toEqual(
      expect.arrayContaining(expected.updatedRecordIds),
    );
    expect(result.removedRecords.map((r) => r.id)).toEqual(
      expected.removedRecordIds,
    );

    expect(result.updatedRecords[0]).toEqual(expected.expectedUpdate);
  });

  it("should handle real-world data samples", () => {
    const fixture = loadFixture("real-world-data.json");
    const { existingData, newData, expected } = fixture;

    const result = diffInMusicData(existingData, newData);

    expect(result.newRecords).toHaveLength(expected.newRecords);
    expect(result.updatedRecords).toHaveLength(expected.updatedRecords);
    expect(result.removedRecords).toHaveLength(expected.removedRecords);

    expect(result.newRecords.map((r) => r.id).sort()).toEqual(
      expected.newRecordIds.sort(),
    );
    expect(result.removedRecords.map((r) => r.id)).toEqual(
      expected.removedRecordIds,
    );

    // Check specific updates
    const update2757 = result.updatedRecords.find((r) => r.id === 2757);
    const update2820 = result.updatedRecords.find((r) => r.id === 2820);

    expect(update2757).toEqual(expected.expectedUpdates[0]);
    expect(update2820).toEqual(expected.expectedUpdates[1]);
  });

  it("should efficiently handle large datasets", () => {
    // Create larger datasets to test performance
    const existingData = Array.from({ length: 1000 }, (_, i) => ({
      id: i,
      category: "POPS & ANIME" as const,
      title: `Song ${i}`,
      artist: `Artist ${i}`,
      image: `image${i}.jpg`,
      version: null,
    }));

    const newData = Array.from({ length: 1200 }, (_, i) => ({
      id: i,
      catname: i < 500 ? ("niconico" as const) : ("POPS & ANIME" as const),
      title: i < 500 ? `Updated Song ${i}` : `Song ${i}`,
      artist: `Artist ${i}`,
      image: `image${i}.jpg`,
      newflag: i >= 1000 ? 1 : 0,
      reading: `Reading ${i}`,
      lev_bas: "3",
      lev_adv: "6",
      lev_exp: "9",
      lev_mas: "12",
      lev_ult: "",
      we_kanji: "",
      we_star: "",
    }));

    const result = diffInMusicData(existingData, newData);

    expect(result.newRecords).toHaveLength(200);
    expect(result.updatedRecords).toHaveLength(500);
    expect(result.removedRecords).toHaveLength(0);

    const firstUpdate = result.updatedRecords.find((r) => r.id === 0);
    expect(firstUpdate).toEqual({
      id: 0,
      catname: "niconico",
      title: "Updated Song 0",
    });
  });

  it("should handle edge cases with special characters and unicode", () => {
    const fixture = loadFixture("unicode-data.json");
    const { existingData, newData, expected } = fixture;

    const result = diffInMusicData(existingData, newData);

    expect(result.newRecords).toHaveLength(expected.newRecords);
    expect(result.updatedRecords).toHaveLength(expected.updatedRecords);
    expect(result.removedRecords).toHaveLength(expected.removedRecords);
    expect(result.updatedRecords[0]).toEqual(expected.expectedUpdate);
  });

  it("should handle edge case with numeric id vs string id", () => {
    const existingData: ExistingData = [
      {
        id: 100,
        category: "POPS & ANIME",
        title: "Test Song",
        artist: "Test Artist",
        image: "test.jpg",
        version: null,
      },
    ];

    const newData = [
      {
        id: "100",
        catname: "POPS & ANIME" as const,
        title: "Test Song",
        artist: "Test Artist",
        image: "test.jpg",
        newflag: 0,
        reading: "テストソング",
        lev_bas: "3",
        lev_adv: "6",
        lev_exp: "9",
        lev_mas: "12",
        lev_ult: "",
        we_kanji: "",
        we_star: "",
      },
    ];

    const parsedNewData = newData.map((item) => ({
      ...item,
      id: Number(item.id),
    }));

    const result = diffInMusicData(existingData, parsedNewData);

    expect(result.newRecords).toHaveLength(0);
    expect(result.updatedRecords).toHaveLength(0);
    expect(result.removedRecords).toHaveLength(0);
  });
});
