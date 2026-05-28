import { createS3Client, uploadImage } from "../s3";
import type { RatingBreakdownImageUpload } from "./jobUpload";

export type RatingBreakdownImageStorageConfig = {
  endpoint: string | undefined;
  region: string | undefined;
  accessKeyId: string | undefined;
  secretAccessKey: string | undefined;
  bucketName: string | undefined;
};

export class RatingBreakdownImageStorageError extends Error {}

function requiredConfigValue(
  config: RatingBreakdownImageStorageConfig,
  key: keyof RatingBreakdownImageStorageConfig,
) {
  const value = config[key];

  if (!value) {
    throw new RatingBreakdownImageStorageError(`${key} is not configured`);
  }

  return value;
}

export async function uploadRatingBreakdownImageToS3({
  config,
  upload,
  userId,
}: {
  config: RatingBreakdownImageStorageConfig;
  upload: RatingBreakdownImageUpload;
  userId: string;
}) {
  const bucketName = requiredConfigValue(config, "bucketName");
  const folder = "ratingBreakdownImages";
  const imageName = `${encodeURIComponent(userId)}/${upload.jobId}.png`;
  const imageKey = `${folder}/${imageName}`;
  const s3 = createS3Client({
    endpoint: requiredConfigValue(config, "endpoint"),
    region: requiredConfigValue(config, "region"),
    accessKeyId: requiredConfigValue(config, "accessKeyId"),
    secretAccessKey: requiredConfigValue(config, "secretAccessKey"),
  });

  await uploadImage({
    s3,
    bucketName,
    folder,
    imageName,
    buffer: upload.imageBuffer,
    contentType: upload.mimeType,
  });

  return imageKey;
}
