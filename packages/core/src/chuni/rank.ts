import { rankCutoffs, ranks } from "@repo/types/chuni";

/**
 * @param score Score
 * @returns Rank Index
 */
export function getRank(score: number) {
  if (score < 0) {
    return 0;
  }

  if (score >= rankCutoffs[rankCutoffs.length - 1]) {
    return ranks.length - 1;
  }

  for (let i = 0; i < rankCutoffs.length; i++) {
    if (score < rankCutoffs[i]) {
      return i - 1;
    }
  }

  return ranks.length - 1;
}
