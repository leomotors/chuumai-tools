function clamp(
  srcBegin: number,
  srcEnd: number,
  dstBegin: number,
  dstEnd: number,
  value: number,
) {
  return (
    dstBegin + ((value - srcBegin) * (dstEnd - dstBegin)) / (srcEnd - srcBegin)
  );
}

function calculateRatingRaw(score: number, level: number) {
  if (score >= 1009000) {
    return level + 2.15;
  } else if (score >= 1007500) {
    return clamp(1007500, 1009000, level + 2, level + 2.15, score);
  } else if (score >= 1005000) {
    return clamp(1005000, 1007500, level + 1.5, level + 2, score);
  } else if (score >= 1000000) {
    return clamp(1000000, 1005000, level + 1, level + 1.5, score);
  } else if (score >= 975000) {
    return clamp(975000, 1000000, level, level + 1, score);
  } else if (score >= 925000) {
    return clamp(925000, 975000, level - 3, level, score);
  } else if (score >= 900000) {
    return clamp(900000, 925000, level - 5, level - 3, score);
  } else if (score >= 800000) {
    return clamp(800000, 900000, (level - 5) / 2, level - 5, score);
  } else if (score >= 500000) {
    return clamp(500000, 800000, 0, (level - 5) / 2, score);
  } else {
    return 0;
  }
}

export function calculateRating(score: number, level: number) {
  const rating = calculateRatingRaw(score, level);

  return Math.max(0, Math.floor(rating * 100 + Number.EPSILON * 1000000) / 100);
}
