import fs from "node:fs/promises";
import type { getRenderYaml } from "../shared";

type RenderYamlData = Awaited<ReturnType<typeof getRenderYaml>>;

export async function validateRenderInputFiles(songsData: RenderYamlData) {
  for (const song of songsData.songs) {
    const videoMapping = songsData.videoMapping.find(
      (v) => v.id === song.chart.id && v.difficulty === song.chart.difficulty,
    );

    if (!videoMapping?.url) {
      throw new Error(
        `No video mapping found for song ID ${song.chart.id} (${song.chart.title} ${song.chart.difficulty})`,
      );
    }

    const videoPath = `build/public/files/${videoMapping.url}`;
    await assertFileExistsAndNotEmpty(
      videoPath,
      `song ${song.chart.title} ${song.chart.difficulty}`,
      "Video file",
    );
  }

  if (songsData.outro?.imagePath) {
    const outroPath = `build/public/files/${songsData.outro.imagePath}`;
    await assertFileExistsAndNotEmpty(outroPath, undefined, "Outro image file");
  }
}

async function assertFileExistsAndNotEmpty(
  filePath: string,
  context: string | undefined,
  label: string,
) {
  try {
    const stats = await fs.stat(filePath);
    if (stats.size === 0) {
      throw new Error(
        `${label} is empty: ${filePath}${context ? ` for ${context}` : ""}`,
      );
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      throw new Error(
        `${label} not found: ${filePath}${context ? ` for ${context}` : ""}`,
      );
    }
    throw error;
  }
}
