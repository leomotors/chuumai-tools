import { musicJsonSchema } from "../types.js";

const url = "https://chunithm.sega.jp/storage/json/music.json";

export async function downloadMusicData() {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch music data");
  }
  const data = await response.json();

  const musicData = musicJsonSchema.parse(data);

  // Checking Data
  for (const music of musicData) {
    // todo next
  }
}
