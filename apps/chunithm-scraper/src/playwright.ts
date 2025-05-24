import { Page } from "playwright";

import { type db as dbValue } from "./db.js";
import { logger } from "./logger.js";
import { sendImage } from "./utils/discord.js";

export type dbType = typeof dbValue;

export type Step<T> = (page: Page, retried: number) => Promise<T>;

export class PwPage {
  constructor(public readonly page: Page) {}

  async runStep<T>(stepName: string, step: Step<T>, retries = 1) {
    for (let i = 0; i < retries; i++) {
      try {
        return await this._runStep(stepName, step, i);
      } catch (e) {
        logger.error(`${e}`);

        const screenshot = await this.page.screenshot();
        await sendImage(
          `ALERT :warning:: An error occured at step ${stepName} (Attempt ${i + 1}/${retries})`,
          new Blob([screenshot]),
        );
      }
    }

    throw new Error(`Failed to run step ${stepName} after ${retries} retries`);
  }

  private async _runStep<T>(stepName: string, step: Step<T>, retried: number) {
    const stepStart = performance.now();
    const stepResult = await step(this.page, retried);
    const stepEnd = performance.now();

    logger.log(
      `${stepName} completed: Took ${Math.round(stepEnd - stepStart)}ms`,
    );

    return stepResult;
  }
}
