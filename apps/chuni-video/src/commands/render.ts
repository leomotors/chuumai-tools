import { renderMedia, selectComposition } from "@remotion/renderer";
import readline from "node:readline";
import fs from "node:fs/promises";
import { getRenderYaml } from "../shared";

export async function render() {
  const start = Date.now();
  console.log("Starting render process...");

  // Load songs from YAML
  const songsData = await getRenderYaml();

  for (const song of songsData.songs) {
    const videoMapping = songsData.videoMapping.find(
      (v) => v.id === song.chart.id && v.difficulty === song.chart.difficulty,
    );

    if (!videoMapping?.url) {
      throw new Error(
        `No video mapping found for song ID ${song.chart.id} (${song.chart.title} ${song.chart.difficulty})`,
      );
    }

    // Check if video file exists and is not empty
    const videoPath = `build/public/files/${videoMapping.url}`;
    try {
      const stats = await fs.stat(videoPath);
      if (stats.size === 0) {
        throw new Error(
          `Video file is empty: ${videoPath} for song ${song.chart.title} ${song.chart.difficulty}`,
        );
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        throw new Error(
          `Video file not found: ${videoPath} for song ${song.chart.title} ${song.chart.difficulty}`,
        );
      }
      throw error;
    }
  }

  // Select the composition
  const compositionId = "RecordSequence";
  const composition = await selectComposition({
    serveUrl: "./build",
    id: compositionId,
    inputProps: {
      ...songsData,
      generatorVersion: process.env.npm_package_version,
    },
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
    inputProps: {
      ...songsData,
      generatorVersion: process.env.npm_package_version,
    },
    imageFormat: "jpeg",
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
