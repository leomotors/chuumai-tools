import { Page } from "playwright";

import { logger } from "@repo/core/utils";

import { environment } from "../environment.js";

export async function generateImage(page: Page, inputFileName: string) {
  if (!environment.CHUNI_SERVICE_URL) {
    logger.warn("CHUNI_SERVICE_URL is not set. Skipping image generation.");
    return;
  }

  await page.goto(
    environment.CHUNI_SERVICE_URL + `?scraperVersion=${APP_VERSION}`,
    { waitUntil: "load" },
  );
  await page.selectOption("#version", environment.VERSION);

  await page
    .getByLabel("Upload JSON File")
    .setInputFiles(`outputs/${inputFileName}`);

  await page
    .getByText("Data fetched successfully,")
    .waitFor({ state: "visible" });

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Generate and Download" }).click();
  const download = await downloadPromise;

  const outputFileLocation = `outputs/${inputFileName.replace(".json", ".png")}`;

  await download.saveAs(outputFileLocation);

  return outputFileLocation;
}
