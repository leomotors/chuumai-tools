import { expect, test } from "vitest";

import { extractDigits } from "./index.js";

test("Extract Decimal Places", () => {
  for (let i = 0; i <= 99_9999; i++) {
    const rating = i / 10000;
    const ratingStr = i.toString();
    const tenthousandth = ratingStr.at(-1) ?? "0";
    const thousandth = ratingStr.at(-2) ?? "0";
    const hundredth = ratingStr.at(-3) ?? "0";
    const tenth = ratingStr.at(-4) ?? "0";
    const ones = ratingStr.at(-5) ?? "0";
    const tens = ratingStr.at(-6) ?? "0";

    expect(extractDigits(rating)).toStrictEqual({
      tens: +tens,
      ones: +ones,
      tenths: +tenth,
      hundredths: +hundredth,
      thousandths: +thousandth,
      tenthousandths: +tenthousandth,
    });
  }
}, 30000);
