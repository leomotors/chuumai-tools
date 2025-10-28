import type { BaseChartSchema } from "@repo/types/chuni";
import { calculateRating, constantFromLevel } from "@repo/utils/chuni";

import type { ChartConstantData, ChartForRender, MusicData } from "./types";

export function addForRenderInfo(
  data: BaseChartSchema,
  constantData: ChartConstantData,
  imageData: MusicData,
  version: string,
): ChartForRender {
  const chartLevel = constantData.find(
    (c) =>
      c.musicId === data.id &&
      c.difficulty === data.difficulty &&
      c.version === version,
  );

  if (!chartLevel) {
    return {
      ...data,
      constant: 0,
      constantSure: false,
      rating: null,
      image: null,
    };
  }

  const constant = chartLevel.constant
    ? +chartLevel.constant
    : constantFromLevel(chartLevel.level);

  const rating = calculateRating(data.score, constant);

  const image = imageData.find((c) => c.id === data.id)!.image;

  return {
    ...data,
    constant,
    constantSure: !!chartLevel.constant,
    rating,
    image,
  };
}
