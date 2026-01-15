export function getDXStar(score: number, max: number) {
  if (max <= 0) return 0;

  const percent = score / max;

  if (percent >= 0.97) return 5;
  if (percent >= 0.95) return 4;
  if (percent >= 0.93) return 3;
  if (percent >= 0.9) return 2;
  if (percent >= 0.85) return 1;
  return 0;
}
