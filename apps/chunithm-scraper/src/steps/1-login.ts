import { Page } from "playwright";

import { mobileBaseURL } from "../constants.js";
import { environment } from "../environment.js";
import { logger } from "../utils/logger.js";

export async function login(page: Page) {
  await page.goto(mobileBaseURL);
  await page.waitForLoadState("networkidle");

  if (page.url() === `${mobileBaseURL}home/`) {
    // Already logged in
    logger.log("Already logged in, using existing session.");
    return await page.context().cookies();
  }

  if (!page.url().includes("lng-tgk-aime-gw.am-all.net")) {
    throw new Error(`Login failed: Unexpected URL ${page.url()}`);
  }

  // Session reset, perform login
  logger.log("Session is not found or expired, performing login...");

  await page
    .getByRole("checkbox", { name: "Agree to the terms of use for" })
    .check();
  await page.getByRole("term").getByText("SEGA ID").click();
  await page.locator("#sid").click();
  await page.locator("#sid").fill(environment.USERNAME);
  await page.locator("#password").click();
  await page.locator("#password").fill(environment.PASSWORD);
  await page.getByRole("button", { name: "Login" }).click();

  await page.waitForURL("https://chunithm-net-eng.com/mobile/home/");

  const cookies = await page.context().cookies();

  return cookies.filter((c) => ["userId", "friendCodeList"].includes(c.name));
}
