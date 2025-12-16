import "../../../app.css";
import "../../../../../../packages/ui/src/globals.css";

import { expect, test } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-svelte";

import DataImageGen from "../__fixtures__/data_for_image_gen_150.json";
import Profile from "./Profile.svelte";

test("Profile.svelte looks good", async () => {
  await page.viewport(640, 480);

  render(Profile, {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    profile: (DataImageGen as any).profile,
    calculatedRating: 16.6156,
  });

  // capture and compare screenshot
  await expect(page.getByTestId("profile-header")).toMatchScreenshot(
    "profile-header",
  );
});
