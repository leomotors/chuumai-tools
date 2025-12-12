import type { stdChartDifficultyValues } from "@repo/types/chuni";

export const difficultyColorMap: Record<
  (typeof stdChartDifficultyValues)[number],
  string
> = {
  basic: "bg-[#1eb393]",
  advanced: "bg-[#ff7e00]",
  expert: "bg-[#e35454]",
  master: "bg-[#bf6aff]",
  ultima: "bg-[#232323] text-white",
};
