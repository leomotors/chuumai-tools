import { GetObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";

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
export class RatingBreakdownImageNotFoundError extends Error {}

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
  const imageKey = getRatingBreakdownImageKey({
    userId,
    jobId: upload.jobId,
  });
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

export function getRatingBreakdownImageKey({
  userId,
  jobId,
}: {
  userId: string;
  jobId: number;
}) {
  return `ratingBreakdownImages/${encodeURIComponent(userId)}/${jobId}.png`;
}

function createRatingBreakdownImageS3Client(
  config: RatingBreakdownImageStorageConfig,
) {
  return createS3Client({
    endpoint: requiredConfigValue(config, "endpoint"),
    region: requiredConfigValue(config, "region"),
    accessKeyId: requiredConfigValue(config, "accessKeyId"),
    secretAccessKey: requiredConfigValue(config, "secretAccessKey"),
  });
}

function isObjectNotFoundError(err: unknown) {
  if (!(err instanceof Error)) {
    return false;
  }

  const s3Error = err as Error & {
    $metadata?: {
      httpStatusCode?: number;
    };
  };

  return (
    s3Error.name === "NotFound" ||
    s3Error.name === "NoSuchKey" ||
    s3Error.$metadata?.httpStatusCode === 404
  );
}

export async function ratingBreakdownImageExistsInS3({
  config,
  userId,
  jobId,
}: {
  config: RatingBreakdownImageStorageConfig;
  userId: string;
  jobId: number;
}) {
  const s3 = createRatingBreakdownImageS3Client(config);
  const bucketName = requiredConfigValue(config, "bucketName");
  const imageKey = getRatingBreakdownImageKey({ userId, jobId });

  try {
    await s3.send(
      new HeadObjectCommand({
        Bucket: bucketName,
        Key: imageKey,
      }),
    );

    return true;
  } catch (err) {
    if (isObjectNotFoundError(err)) {
      return false;
    }

    throw err;
  }
}

export async function getRatingBreakdownImageFromS3({
  config,
  userId,
  jobId,
}: {
  config: RatingBreakdownImageStorageConfig;
  userId: string;
  jobId: number;
}) {
  const s3 = createRatingBreakdownImageS3Client(config);
  const bucketName = requiredConfigValue(config, "bucketName");
  const imageKey = getRatingBreakdownImageKey({ userId, jobId });

  try {
    const response = await s3.send(
      new GetObjectCommand({
        Bucket: bucketName,
        Key: imageKey,
      }),
    );

    if (!response.Body) {
      throw new RatingBreakdownImageNotFoundError(
        `Rating breakdown image for job ${jobId} was empty`,
      );
    }

    const body = await response.Body.transformToByteArray();
    const arrayBuffer = new ArrayBuffer(body.byteLength);
    new Uint8Array(arrayBuffer).set(body);

    return {
      body: arrayBuffer,
      contentType: response.ContentType ?? "image/png",
      contentLength: response.ContentLength ?? null,
    };
  } catch (err) {
    if (isObjectNotFoundError(err)) {
      throw new RatingBreakdownImageNotFoundError(
        `Rating breakdown image for job ${jobId} was not found`,
      );
    }

    throw err;
  }
}
