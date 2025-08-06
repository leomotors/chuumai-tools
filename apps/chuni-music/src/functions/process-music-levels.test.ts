import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { musicLevelTable } from "../../../../packages/db-chuni/src/schema/musicData";
import { processMusicLevels } from "./process-music-levels";

// Helper function to load fixture data
function loadFixture(filename: string) {
  const fixturePath = path.join(__dirname, "__fixtures__", filename);
  const data = fs.readFileSync(fixturePath, "utf8");
  return JSON.parse(data);
}

describe("processMusicLevels", () => {
  it("should process basic music levels correctly", () => {
    const fixture = loadFixture("music-levels-basic.json");
    const result = processMusicLevels(
      fixture.musicData,
      fixture.existingMusicLevels,
      "VRS",
    );

    // Should return 0 payload items since all exist, and skippedCount should be 8
    expect(result.payload).toHaveLength(0); // All records already exist
    expect(result.warnings).toHaveLength(0);
    expect(result.skippedCount).toBe(8); // 2 songs * 4 difficulties each
  });

  it("should handle new songs with ultima difficulty", () => {
    const fixture = loadFixture("music-levels-new-songs.json");
    const result = processMusicLevels(
      fixture.musicData,
      fixture.existingMusicLevels,
      "XVRS",
    );

    expect(result.payload).toHaveLength(9); // All are new records: First song: 5 difficulties, Second song: 4 difficulties
    expect(result.warnings).toHaveLength(0);
    expect(result.skippedCount).toBe(0); // No existing records for this version

    // Check song with ultima difficulty
    const newSongLevels = result.payload.filter((p) => p.musicId === 300);
    expect(newSongLevels).toHaveLength(5);
    expect(newSongLevels).toEqual(
      expect.arrayContaining([
        {
          musicId: 300,
          difficulty: "basic",
          level: "4",
          version: "XVRS",
        },
        {
          musicId: 300,
          difficulty: "advanced",
          level: "7",
          version: "XVRS",
        },
        {
          musicId: 300,
          difficulty: "expert",
          level: "10",
          version: "XVRS",
        },
        {
          musicId: 300,
          difficulty: "master",
          level: "13",
          version: "XVRS",
        },
        {
          musicId: 300,
          difficulty: "ultima",
          level: "15",
          version: "XVRS",
        },
      ]),
    );

    // Check song without ultima difficulty
    const anotherSongLevels = result.payload.filter((p) => p.musicId === 400);
    expect(anotherSongLevels).toHaveLength(4);
    expect(
      anotherSongLevels.find((l) => l.difficulty === "ultima"),
    ).toBeUndefined();
  });

  it("should detect level mismatches and generate warnings", () => {
    const fixture = loadFixture("music-levels-warnings.json");
    const result = processMusicLevels(
      fixture.musicData,
      fixture.existingMusicLevels,
      "VRS",
    );

    // Should return 4 payload items for song 600 (new version XVRS in existing data, so VRS version is new)
    expect(result.payload).toHaveLength(4); // Only song 600's levels are new for VRS version
    expect(result.warnings).toHaveLength(1);
    expect(result.skippedCount).toBe(4); // Song 500's 4 levels already exist in VRS

    // Check the warning for level mismatch
    expect(result.warnings[0]).toEqual({
      musicId: 500,
      difficulty: "master",
      existingLevel: "12",
      newLevel: "13",
    });

    // Verify that song 500's master level is not in payload (filtered out due to existing)
    const changedLevel = result.payload.find(
      (p) => p.musicId === 500 && p.difficulty === "master",
    );
    expect(changedLevel).toBeUndefined();

    // Verify that song 600's levels are in payload (different version)
    const song600Levels = result.payload.filter((p) => p.musicId === 600);
    expect(song600Levels).toHaveLength(4);
  });

  it("should not generate warnings for different versions", () => {
    const fixture = loadFixture("music-levels-warnings.json");
    const result = processMusicLevels(
      fixture.musicData,
      fixture.existingMusicLevels,
      "XVRS", // Different version than song 500's existing data
    );

    expect(result.payload).toHaveLength(4); // Only song 500's levels are new for XVRS version
    expect(result.warnings).toHaveLength(0); // No warnings because song 500 doesn't exist in XVRS, song 600 exists with same levels
    expect(result.skippedCount).toBe(4); // Song 600's 4 levels already exist in XVRS
  });

  it("should handle empty data", () => {
    const fixture = loadFixture("music-levels-empty.json");
    const result = processMusicLevels(
      fixture.musicData,
      fixture.existingMusicLevels,
      "VRS",
    );

    expect(result.payload).toHaveLength(0);
    expect(result.warnings).toHaveLength(0);
    expect(result.skippedCount).toBe(0);
  });

  it("should skip difficulties with empty levels", () => {
    const musicData = [
      {
        id: 999,
        catname: "POPS & ANIME" as const,
        title: "Partial Levels Song",
        artist: "Test Artist",
        image: "partial.jpg",
        newflag: 0,
        reading: "パーシャル",
        lev_bas: "3",
        lev_adv: "6",
        lev_exp: "", // Empty expert level
        lev_mas: "12",
        lev_ult: "", // Empty ultima level
        we_kanji: "",
        we_star: "",
      },
    ];

    const result = processMusicLevels(musicData, [], "VRS");

    expect(result.payload).toHaveLength(3); // Only basic, advanced, master
    expect(result.warnings).toHaveLength(0);
    expect(result.skippedCount).toBe(0); // No existing records

    const levels = result.payload.map((p) => p.difficulty);
    expect(levels).toEqual(["basic", "advanced", "master"]);
    expect(levels).not.toContain("expert");
    expect(levels).not.toContain("ultima");
  });

  it("should handle multiple warnings for the same song", () => {
    const existingMusicLevels = [
      {
        id: 30,
        musicId: 700,
        difficulty: "basic" as const,
        level: "2",
        constant: "2.0",
        version: "VRS",
      },
      {
        id: 31,
        musicId: 700,
        difficulty: "advanced" as const,
        level: "5",
        constant: "5.0",
        version: "VRS",
      },
      {
        id: 32,
        musicId: 700,
        difficulty: "expert" as const,
        level: "8",
        constant: "8.0",
        version: "VRS",
      },
      {
        id: 33,
        musicId: 700,
        difficulty: "master" as const,
        level: "11",
        constant: "11.0",
        version: "VRS",
      },
    ];

    const musicData = [
      {
        id: 700,
        catname: "ORIGINAL" as const,
        title: "Multiple Changes Song",
        artist: "Change Artist",
        image: "changes.jpg",
        newflag: 0,
        reading: "マルチプルチェンジ",
        lev_bas: "3", // Changed from 2
        lev_adv: "5", // Same
        lev_exp: "9", // Changed from 8
        lev_mas: "12", // Changed from 11
        lev_ult: "",
        we_kanji: "",
        we_star: "",
      },
    ];

    const result = processMusicLevels(musicData, existingMusicLevels, "VRS");

    expect(result.payload).toHaveLength(0); // All records exist and are filtered out
    expect(result.warnings).toHaveLength(3);
    expect(result.skippedCount).toBe(4); // All 4 levels already exist

    expect(result.warnings).toEqual(
      expect.arrayContaining([
        {
          musicId: 700,
          difficulty: "basic",
          existingLevel: "2",
          newLevel: "3",
        },
        {
          musicId: 700,
          difficulty: "expert",
          existingLevel: "8",
          newLevel: "9",
        },
        {
          musicId: 700,
          difficulty: "master",
          existingLevel: "11",
          newLevel: "12",
        },
      ]),
    );
  });

  it("should work with real-world data structure", () => {
    // Test with data that matches the existing fixture format
    const newData = [
      {
        id: 100,
        catname: "POPS & ANIME" as const,
        title: "Test Song 1",
        artist: "Test Artist 1",
        image: "test1.jpg",
        newflag: 0,
        reading: "テストソング1",
        lev_bas: "3",
        lev_adv: "6",
        lev_exp: "9",
        lev_mas: "12",
        lev_ult: "",
        we_kanji: "",
        we_star: "",
      },
    ];

    const existingMusicLevels: (typeof musicLevelTable.$inferSelect)[] = [];

    const result = processMusicLevels(newData, existingMusicLevels, "VRS");

    expect(result.payload).toHaveLength(4);
    expect(result.warnings).toHaveLength(0);
    expect(result.skippedCount).toBe(0);
    expect(result.payload[0].musicId).toBe(100);
    expect(result.payload[0].version).toBe("VRS");
  });
});
