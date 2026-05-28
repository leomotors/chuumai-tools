const MAX_RATING_BREAKDOWN_IMAGE_BYTES = 10 * 1024 * 1024;

export type RatingBreakdownImageUpload = {
  jobId: number;
  fileName: string | null;
  mimeType: string;
  byteSize: number;
  imageBuffer: Buffer;
};

export class RatingBreakdownImageUploadError extends Error {}

function parseJobId(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    throw new RatingBreakdownImageUploadError("jobId is required");
  }

  const jobId = Number(value);

  if (!Number.isInteger(jobId) || jobId <= 0) {
    throw new RatingBreakdownImageUploadError(
      "jobId must be a positive integer",
    );
  }

  return jobId;
}

function assertImageFile(value: FormDataEntryValue | null): File {
  if (!(value instanceof File)) {
    throw new RatingBreakdownImageUploadError("image file is required");
  }

  if (!value.type.startsWith("image/")) {
    throw new RatingBreakdownImageUploadError("image must be an image file");
  }

  if (value.size > MAX_RATING_BREAKDOWN_IMAGE_BYTES) {
    throw new RatingBreakdownImageUploadError(
      "image must be 10 MiB or smaller",
    );
  }

  return value;
}

export async function parseRatingBreakdownImageUploadRequest(
  request: Request,
): Promise<RatingBreakdownImageUpload> {
  let formData: FormData;

  try {
    formData = await request.formData();
  } catch (err) {
    throw new RatingBreakdownImageUploadError(
      "multipart/form-data body is required",
      { cause: err },
    );
  }

  const jobId = parseJobId(formData.get("jobId"));
  const image = assertImageFile(formData.get("image"));

  return {
    jobId,
    fileName: image.name || null,
    mimeType: image.type,
    byteSize: image.size,
    imageBuffer: Buffer.from(await image.arrayBuffer()),
  };
}
