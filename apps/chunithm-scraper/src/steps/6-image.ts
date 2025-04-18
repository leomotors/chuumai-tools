import { Page } from "playwright";

import { environment } from "../environment";

export async function generateImage(page: Page, inputFileLocation: string) {
  if (!environment.IMAGE_GEN_URL) {
    console.warn("IMAGE_GEN_URL is not set. Skipping image generation.");
    return;
  }

  await page.goto(environment.IMAGE_GEN_URL, { waitUntil: "load" });

  await page
    .getByRole("textbox", { name: "Upload JSON File" })
    .setInputFiles(inputFileLocation);

  await page
    .getByText("Data fetched successfully,")
    .waitFor({ state: "visible" });

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Generate and Download" }).click();
  const download = await downloadPromise;

  const outputFileLocation = `${inputFileLocation.replace(".json", ".png")}`;

  await download.saveAs(outputFileLocation);

  return outputFileLocation;
}
