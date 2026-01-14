import { Page } from "playwright";

import { logger } from "@repo/core/utils";

import { BlobFileList, sendFiles } from "./utils/discord.js";

type RunStep<T> = () => Promise<T>;
type HandleErrorContext = {
  error: unknown;
  stepName: string;
  currentAttempt: number;
  maxRetries: number;
};

export async function handlePwError(
  { error, stepName, currentAttempt, maxRetries }: HandleErrorContext,
  page?: Page,
) {
  let errorMessage = `ALERT :warning:: An error occured at step ${stepName} (Attempt ${currentAttempt + 1}/${maxRetries})`;

  const files: BlobFileList = [
    {
      blob: new Blob([`${error}`], { type: "text/plain" }),
      fileName: `error-${Date.now()}.txt`,
    },
  ];

  if (page) {
    files.push({
      blob: new Blob([await page.content()], { type: "text/html" }),
      fileName: `error-page-${Date.now()}.html`,
    });
    files.push({
      blob: new Blob([new Uint8Array(await page.screenshot())], {
        type: "image/png",
      }),
      fileName: `error-screenshot-${Date.now()}.png`,
    });
    errorMessage += ` on page ${page.url()}`;
  }

  await sendFiles(errorMessage, files);
}

export class Runner {
  async runStep<T>(
    stepName: string,
    step: RunStep<T>,
    errorHandler: (
      context: HandleErrorContext,
    ) => Promise<void> = handlePwError,
    retries = 1,
  ) {
    for (let i = 0; i < retries; i++) {
      try {
        return await this._runStep(stepName, step);
      } catch (e) {
        logger.error(`${e}`);

        await errorHandler({
          error: e,
          stepName,
          currentAttempt: i,
          maxRetries: retries,
        });

        // Wait 1 second
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    throw new Error(`Failed to run step ${stepName} after ${retries} retries`);
  }

  private async _runStep<T>(stepName: string, step: RunStep<T>) {
    const stepStart = performance.now();
    const stepResult = await step();
    const stepEnd = performance.now();

    logger.log(
      `${stepName} completed: Took ${Math.round(stepEnd - stepStart)}ms`,
    );

    return stepResult;
  }
}
