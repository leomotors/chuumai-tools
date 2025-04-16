import { Page } from "playwright";

import { environment } from "../environment.js";

export async function login(page: Page) {
  await page.goto(
    "https://lng-tgk-aime-gw.am-all.net/common_auth/login?site_id=chuniex&redirect_url=https://chunithm-net-eng.com/mobile/&back_url=https://chunithm.sega.com/",
  );
  await page.getByRole("term").getByText("SEGA ID").click();
  await page.locator("#sid").click();
  await page.locator("#sid").fill(environment.USERNAME);
  await page.locator("#password").click();
  await page.locator("#password").fill(environment.PASSWORD);
  await page.getByRole("button", { name: "Login" }).click();

  await page.waitForURL("https://chunithm-net-eng.com/mobile/home/");
}
