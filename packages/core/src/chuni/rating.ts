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
  } else if (score >= 900000) {
    return clamp(900000, 975000, level - 5, level, score);
  } else if (score >= 800000) {
    return clamp(800000, 900000, (level - 5) / 2, level - 5, score);
  } else if (score >= 500000) {
    return clamp(500000, 800000, 0, (level - 5) / 2, score);
  } else {
    return 0;
  }
}

export function floorDecimalPlaces(num: number, places: number) {
  const factor = Math.pow(10, places);
  return Math.floor(num * factor + Number.EPSILON * factor * 100) / factor;
}

export function calculateRating(score: number, level: number) {
  const rating = calculateRatingRaw(score, level);

  return Math.max(0, floorDecimalPlaces(rating, 2));
}

export const chuniRatingMilestones = [
  {
    id: "starting-point",
    label: "Starting Point",
    rating: 0,
    isStartingPoint: true,
  },
  { id: "orange", label: "Orange", rating: 4 },
  { id: "red", label: "Red", rating: 7 },
  { id: "purple", label: "Purple", rating: 10 },
  { id: "bronze", label: "Bronze", rating: 12 },
  { id: "silver", label: "Silver", rating: 13.25 },
  { id: "gold", label: "Gold", rating: 14.5 },
  { id: "platinum-1", label: "Platinum ⭐", rating: 15.25 },
  { id: "platinum-2", label: "Platinum ⭐⭐", rating: 15.5 },
  { id: "platinum-3", label: "Platinum ⭐⭐⭐", rating: 15.75 },
  { id: "rainbow-1", label: "Rainbow ⭐", rating: 16 },
  { id: "rainbow-2", label: "Rainbow ⭐⭐", rating: 16.25 },
  { id: "rainbow-3", label: "Rainbow ⭐⭐⭐", rating: 16.5 },
  { id: "rainbow-4", label: "Rainbow ⭐⭐⭐⭐", rating: 16.75 },
  { id: "kiwami-1", label: "Ultimate Rainbow ⭐", rating: 17 },
  { id: "kiwami-2", label: "Ultimate Rainbow ⭐⭐", rating: 17.25 },
  { id: "kiwami-3", label: "Ultimate Rainbow ⭐⭐⭐", rating: 17.5 },
] as const;

export type ChuniRatingLevel =
  | "kiwami"
  | "rainbow"
  | "platinum"
  | "gold"
  | "silver"
  | "bronze"
  | "purple"
  | "red"
  | "orange"
  | "green";

export function getChuniRatingLevel(rating: number): ChuniRatingLevel {
  if (rating >= 17) return "kiwami";
  if (rating >= 16) return "rainbow";
  if (rating >= 15.25) return "platinum";
  if (rating >= 14.5) return "gold";
  if (rating >= 13.25) return "silver";
  if (rating >= 12) return "bronze";
  if (rating >= 10) return "purple";
  if (rating >= 7) return "red";
  if (rating >= 4) return "orange";
  return "green";
}
