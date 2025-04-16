import { Page } from "playwright";

import { type db as dbValue } from "./db.js";
import { environment } from "./environment.js";
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
        console.error(e);

        if (environment.CHANNEL_ID && environment.DISCORD_TOKEN) {
          const screenshot = await this.page.screenshot();
          await sendImage(
            environment.DISCORD_TOKEN,
            environment.CHANNEL_ID,
            `ALERT :warning:: An error occured at step ${stepName} (Attempt ${i + 1}/${retries})`,
            new Blob([screenshot]),
          );
        } else {
          console.log("Screenshot not sent to Discord because it is disabled");
        }
      }
    }

    throw new Error(`Failed to run step ${stepName} after ${retries} retries`);
  }

  private async _runStep<T>(stepName: string, step: Step<T>, retried: number) {
    const stepStart = performance.now();
    const stepResult = await step(this.page, retried);
    const stepEnd = performance.now();

    console.log(
      `${stepName} completed: Took ${Math.round(stepEnd - stepStart)}ms`,
    );

    return stepResult;
  }
}
