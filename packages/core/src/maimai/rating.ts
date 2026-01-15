export function getRankMultiplier(score: number) {
  if (score >= 100_5000) return 22.4;
  if (score >= 100_4999) return 22.2;
  if (score >= 100_0000) return 21.6;
  if (score >= 99_9999) return 21.4;
  if (score >= 99_5000) return 21.1;
  if (score >= 99_0000) return 20.8;
  if (score >= 98_9999) return 20.6;
  if (score >= 98_0000) return 20.3;
  if (score >= 97_0000) return 20.0;
  if (score >= 96_9999) return 17.6;
  if (score >= 94_0000) return 16.8;
  if (score >= 90_0000) return 15.2;
  if (score >= 80_0000) return 13.6;
  if (score >= 79_9999) return 12.8;
  if (score >= 75_0000) return 12.0;
  if (score >= 70_0000) return 11.2;
  if (score >= 60_0000) return 9.6;
  if (score >= 50_0000) return 8.0;
  if (score >= 40_0000) return 6.4;
  if (score >= 30_0000) return 4.8;
  if (score >= 20_0000) return 3.2;
  if (score >= 10_0000) return 1.6;
  return 0.0;
}

export function calculateRating(score: number, level: number) {
  return Math.floor(
    (Math.min(score, 100_5000) / 1000000) * getRankMultiplier(score) * level +
      Number.EPSILON * 10000,
  );
}
