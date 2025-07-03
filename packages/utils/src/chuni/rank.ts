export const ranks = [
  "D",
  "C",
  "B",
  "BB",
  "BBB",
  "A",
  "AA",
  "AAA",
  "S",
  "S+",
  "SS",
  "SS+",
  "SSS",
  "SSS+",
] as const;

export const rankCutoffs = [
  0, 500000, 600000, 700000, 800000, 900000, 925000, 950000, 975000, 990000,
  1000000, 1005000, 1007500, 1009000,
];

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
