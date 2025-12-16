import "../../../app.css";
import "../../../../../../packages/ui/src/globals.css";

import { expect, test } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-svelte";

import Music from "./Music.svelte";

test("Music.svelte looks good", async () => {
  await page.viewport(320, 240);

  render(Music, {
    index: 1,
    music: {
      id: 2837,
      title: "Flap&Clap",
      difficulty: "master",
      score: 1008104,
      clearMark: "BRAVE",
      fc: true,
      aj: false,
      isHidden: false,
      constant: 14,
      constantSure: true,
      rating: 16.06,
      image: "ed7ce038c352361a.jpg",
    },
  });

  // capture and compare screenshot
  await expect(page.getByTestId("music-card-2837")).toMatchScreenshot(
    "music-card-2837",
  );
});
