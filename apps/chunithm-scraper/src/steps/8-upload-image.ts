import type { ChuniWeb } from "@repo/api-types";
import { createRatingBreakdownImageForm } from "@repo/core/scraper";
import { logger } from "@repo/core/utils";

import type { ApiClient } from "../api.js";

type UploadRatingBreakdownImageRequest =
  ChuniWeb.Components["schemas"]["UploadRatingBreakdownImageRequest"];

export async function uploadRatingBreakdownImageToService(
  jobId: number,
  apiClient: NonNullable<ApiClient>,
  imageLocation: string | undefined,
) {
  if (!imageLocation) {
    logger.warn(
      "Rating breakdown image location is not provided. Skipping service upload.",
    );
    return;
  }

  logger.log("Uploading rating breakdown image to service...");

  const { formData, byteSize } = await createRatingBreakdownImageForm(
    jobId,
    imageLocation,
  );

  const response = await apiClient.POST("/api/jobs/ratingBreakdownImage", {
    body: formData as unknown as UploadRatingBreakdownImageRequest,
  });

  if (response.error) {
    throw new Error(
      `Failed to upload rating breakdown image: ${response.error.message || JSON.stringify(response.error)}`,
    );
  }

  logger.log(
    `Rating breakdown image uploaded successfully: ${response.data.byteSize ?? byteSize} bytes`,
  );
}
