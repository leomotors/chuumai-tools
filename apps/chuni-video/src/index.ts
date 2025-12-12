import { renderMedia, selectComposition } from "@remotion/renderer";
import fs from "node:fs/promises";
import { load } from "js-yaml";
import readline from "node:readline";
import { recordSequenceSchema } from "../video/RecordSequence";

async function render() {
  const start = Date.now();
  console.log("Starting render process...");

  // Load songs from YAML
  const songsYaml = await fs.readFile("temp/songs.yaml", "utf-8");
  const songsData = recordSequenceSchema.parse(load(songsYaml));
  console.log(`Loaded ${songsData.songs.length} songs`);

  for (const song of songsData.songs) {
    if (!songsData.videoMapping.find((v) => v.id === song.chart.id)?.url) {
      throw new Error(
        `No video mapping found for song ID ${song.chart.id} (${song.chart.title})`,
      );
    }
  }

  // Select the composition
  const compositionId = "RecordSequence";
  const composition = await selectComposition({
    serveUrl: "./build",
    id: compositionId,
    inputProps: songsData,
  });

  console.log(
    `Selected composition: ${composition.id} (${composition.width}x${composition.height}, ${composition.durationInFrames} frames @ ${composition.fps}fps)`,
  );

  // Render the video
  const outputLocation = `out/${composition.id}-${Date.now()}.mp4`;
  console.log(`Rendering to: ${outputLocation}\n\n`);

  const totalFrames = composition.durationInFrames;

  await renderMedia({
    composition,
    serveUrl: "./build",
    codec: "h264",
    outputLocation,
    inputProps: songsData,
    imageFormat: "png",
    overwrite: false,
    concurrency: 12,
    onProgress: ({ progress, renderedFrames, encodedFrames }) => {
      readline.moveCursor(process.stdout, 0, -1);
      readline.clearLine(process.stdout, 0);
      console.log(
        `Progress: ${Math.round(progress * 100)}% (Rendered: ${renderedFrames}/${totalFrames}, Encoded: ${encodedFrames}/${totalFrames})`,
      );
    },
  });

  const end = Date.now();
  console.log(`Render completed in ${((end - start) / 1000).toFixed(2)}s`);
  console.log(`Output: ${outputLocation}`);
}

render()
  .then(() => {
    console.log("✅ Render successful");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Render failed:", err);
    process.exit(1);
  });
