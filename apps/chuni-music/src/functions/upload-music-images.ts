import type { S3Client } from "@aws-sdk/client-s3";
import cliProgress from "cli-progress";
import z from "zod";

import { downloadImage, listFilesInFolder, uploadImage } from "@repo/utils/s3";

import type { musicJsonSchema } from "../types.js";

export async function uploadMissingMusicImages(
  s3Client: S3Client,
  bucketName: string,
  s3Folder: string,
  musicData: z.infer<typeof musicJsonSchema>,
) {
  // List all objects from folder `s3Folder`
  const contents = await listFilesInFolder(s3Client, bucketName, s3Folder);
  const existingImages = contents.map((item) => item.split("/").pop()!);
  const newImages = musicData
    .map((m) => m.image)
    .filter((image) => !existingImages.includes(image));

  console.log(`New images count: ${newImages.length}`);

  if (newImages.length === 0) {
    console.log("No new images to upload");
    return { uploadedCount: 0, skippedCount: musicData.length };
  }

  const progress = new cliProgress.SingleBar(
    {},
    cliProgress.Presets.shades_classic,
  );
  progress.start(newImages.length, 0);

  let uploadedCount = 0;
  const errors: Array<{ imageName: string; error: Error }> = [];

  for (let i = 0; i < newImages.length; i++) {
    try {
      const imageBuffer = await downloadImage(
        `https://new.chunithm-net.com/chuni-mobile/html/mobile/img/${newImages[i]}`,
      );
      await uploadImage({
        s3: s3Client,
        bucketName,
        folder: s3Folder,
        imageName: newImages[i],
        buffer: Buffer.from(imageBuffer),
        contentType: "image/jpeg",
      });
      uploadedCount++;
    } catch (error) {
      console.error(`Failed to upload image ${newImages[i]}:`, error);
      errors.push({
        imageName: newImages[i],
        error: error instanceof Error ? error : new Error(String(error)),
      });
    }
    progress.update(i + 1);
  }

  progress.stop();

  console.log(
    `Image upload completed: ${uploadedCount} uploaded, ${errors.length} failed`,
  );

  if (errors.length > 0) {
    console.warn(
      `Failed uploads: ${errors.map((e) => e.imageName).join(", ")}`,
    );
  }

  return {
    uploadedCount,
    skippedCount: musicData.length - newImages.length,
    failedCount: errors.length,
    errors,
  };
}
