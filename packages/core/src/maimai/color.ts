import type { stdChartDifficultyValues } from "@repo/types/maimai";

export const difficultyColorMap: Record<
  (typeof stdChartDifficultyValues)[number],
  string
> = {
  basic: "bg-[#1eb393]",
  advanced: "bg-[#ff7e00]",
  expert: "bg-[#e35454]",
  master: "bg-[#bf6aff]",
  remaster: "bg-[#dcaaff]",
};
