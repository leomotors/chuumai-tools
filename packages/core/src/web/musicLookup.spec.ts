import { describe, expect, it, vi } from "vitest";

import {
  findMusicDataWithVersionFallback,
  getMusicLookupVersions,
} from "./musicLookup";

describe("getMusicLookupVersions", () => {
  it("returns only the default version when it is the latest", () => {
    expect(getMusicLookupVersions("xverse", ["xverse", "verse"])).toEqual([
      "xverse",
    ]);
  });

  it("adds the latest version when the default is older", () => {
    expect(getMusicLookupVersions("verse", ["xverse", "verse"])).toEqual([
      "verse",
      "xverse",
    ]);
  });

  it("handles a single enabled version", () => {
    expect(getMusicLookupVersions("verse", ["verse"])).toEqual(["verse"]);
  });
});

describe("findMusicDataWithVersionFallback", () => {
  const data: Record<string, { id: number }[]> = {
    verse: [{ id: 1 }, { id: 2 }],
    xverse: [{ id: 1 }, { id: 3 }],
  };

  it("returns matches from the first version without probing further", async () => {
    const getMusicData = vi.fn(async (version: string) => data[version]);

    const result = await findMusicDataWithVersionFallback(
      ["verse", "xverse"],
      getMusicData,
      (item) => item.id === 1,
    );

    expect(result).toEqual([{ id: 1 }]);
    expect(getMusicData).toHaveBeenCalledTimes(1);
    expect(getMusicData).toHaveBeenCalledWith("verse");
  });

  it("falls back to the next version when there is no match", async () => {
    const getMusicData = vi.fn(async (version: string) => data[version]);

    const result = await findMusicDataWithVersionFallback(
      ["verse", "xverse"],
      getMusicData,
      (item) => item.id === 3,
    );

    expect(result).toEqual([{ id: 3 }]);
    expect(getMusicData).toHaveBeenCalledTimes(2);
  });

  it("returns all matches from the matched version", async () => {
    const result = await findMusicDataWithVersionFallback(
      ["verse"],
      async () => [
        { id: 1, chartType: "std" },
        { id: 1, chartType: "dx" },
      ],
      (item) => item.id === 1,
    );

    expect(result).toHaveLength(2);
  });

  it("returns an empty array when no version has a match", async () => {
    const result = await findMusicDataWithVersionFallback(
      ["verse", "xverse"],
      async (version) => data[version],
      (item) => item.id === 999,
    );

    expect(result).toEqual([]);
  });
});
