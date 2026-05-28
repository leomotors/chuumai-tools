import fs from "node:fs/promises";

export type RatingBreakdownImageForm = {
  formData: FormData;
  byteSize: number;
};

export async function createRatingBreakdownImageForm(
  jobId: number,
  imageLocation: string,
): Promise<RatingBreakdownImageForm> {
  const image = await fs.readFile(imageLocation);
  const formData = new FormData();
  const fileName = imageLocation.split("/").pop() || "rating-breakdown.png";

  formData.set("jobId", String(jobId));
  formData.set(
    "image",
    new Blob([new Uint8Array(image)], { type: "image/png" }),
    fileName,
  );

  return {
    formData,
    byteSize: image.byteLength,
  };
}
