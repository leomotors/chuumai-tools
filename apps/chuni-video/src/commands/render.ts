import { renderMedia, selectComposition } from "@remotion/renderer";
import readline from "node:readline";
import { getRenderYaml } from "../shared";
import { validateRenderInputFiles } from "../libs/validation";

export async function render() {
  const start = Date.now();
  console.log("Starting render process...");

  // Load songs from YAML
  const songsData = await getRenderYaml();
  await validateRenderInputFiles(songsData);

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
