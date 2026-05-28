import {
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

export type CreateS3ClientParams = {
  endpoint: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  forcePathStyle?: boolean;
};

export function createS3Client({
  endpoint,
  region,
  accessKeyId,
  secretAccessKey,
  forcePathStyle = true,
}: CreateS3ClientParams) {
  return new S3Client({
    endpoint,
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
    forcePathStyle,
  });
}

export async function downloadImage(url: string) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch image from ${url}`);
  }
  const imageBuffer = await response.arrayBuffer();
  return imageBuffer;
}

export type UploadImageParams = {
  s3: S3Client;
  bucketName: string;
  folder: string;
  imageName: string;
  buffer: Buffer;
  contentType?: string;
};

export async function uploadImage({
  s3,
  bucketName,
  folder,
  imageName,
  buffer,
  contentType = "image/jpeg",
}: UploadImageParams) {
  const uploadParams = {
    Bucket: bucketName,
    Key: `${folder}/${imageName}`,
    Body: buffer,
    ContentType: contentType,
  };

  const command = new PutObjectCommand(uploadParams);
  await s3.send(command);
}

export async function listFilesInFolder(
  s3: S3Client,
  bucketName: string,
  folder: string,
) {
  const files: string[] = [];
  let continuationToken: string | undefined;

  do {
    const command = new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: folder,
      ContinuationToken: continuationToken,
    });

    const response = await s3.send(command);

    if (response.Contents) {
      files.push(...response.Contents.map((item) => item.Key!).filter(Boolean));
    }

    continuationToken = response.NextContinuationToken;
  } while (continuationToken);

  return files;
}
