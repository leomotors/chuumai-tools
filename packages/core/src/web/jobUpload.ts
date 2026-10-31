const MAX_RATING_BREAKDOWN_IMAGE_BYTES = 10 * 1024 * 1024;
const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

/**
 * The image is served from the app's own origin, so anything other than a
 * real PNG (e.g. SVG or HTML) would run script there. Only PNG is accepted.
 */
export const RATING_BREAKDOWN_IMAGE_CONTENT_TYPE = "image/png";

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

  if (value.type !== RATING_BREAKDOWN_IMAGE_CONTENT_TYPE) {
    throw new RatingBreakdownImageUploadError("image must be a PNG file");
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
  const imageBuffer = Buffer.from(await image.arrayBuffer());

  if (!PNG_SIGNATURE.every((byte, index) => imageBuffer[index] === byte)) {
    throw new RatingBreakdownImageUploadError("image must be a PNG file");
  }

  return {
    jobId,
    fileName: image.name || null,
    mimeType: RATING_BREAKDOWN_IMAGE_CONTENT_TYPE,
    byteSize: image.size,
    imageBuffer,
  };
}

/**
 * Headers for serving a stored breakdown image. The content type is fixed
 * rather than read from S3 so objects stored before PNG-only validation
 * cannot be served as a scriptable type.
 */
export function ratingBreakdownImageResponseHeaders(
  contentLength: number | null,
): Headers {
  const headers = new Headers({
    "Content-Type": RATING_BREAKDOWN_IMAGE_CONTENT_TYPE,
    "Cache-Control": "private, max-age=300",
    "Cross-Origin-Resource-Policy": "same-origin",
    "X-Content-Type-Options": "nosniff",
    "Content-Security-Policy": "default-src 'none'; sandbox",
  });

  if (contentLength !== null) {
    headers.set("Content-Length", contentLength.toString());
  }

  return headers;
}
