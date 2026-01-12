import { rankCutoffs, ranks } from "@repo/types/maimai";

/**
 * @param score Score (Max 1010000)
 * @returns Rank Name
 */
export function getRank(score: number) {
  if (score < 0) {
    return 0;
  }

  if (score >= rankCutoffs[rankCutoffs.length - 1] * 10000) {
    return ranks.length - 1;
  }

  for (let i = 0; i < rankCutoffs.length; i++) {
    if (score < rankCutoffs[i] * 10000) {
      return i - 1;
    }
  }

  return ranks.length - 1;
}
