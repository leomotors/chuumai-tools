import fs from "node:fs/promises";
import { load } from "js-yaml";
import { recordSequenceSchema } from "../video/types";
import { z } from "zod";

export async function getRenderYaml(required = true) {
  try {
    const songsYaml = await fs.readFile("temp/songs.yaml", "utf-8");
    const songsData = recordSequenceSchema.parse(load(songsYaml));
    console.log(`Loaded ${songsData.songs.length} songs`);
    return songsData;
  } catch (error) {
    if (!required && (error as NodeJS.ErrnoException).code === "ENOENT") {
      // Return minimal object when file doesn't exist and not required
      return {
        songs: [],
        videoMapping: [],
        videoConfig: { durationPerSong: 10 },
      } satisfies z.infer<typeof recordSequenceSchema>;
    }
    throw error;
  }
}
