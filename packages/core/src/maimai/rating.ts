import type { ComboMark } from "@repo/types/maimai";

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

export function calculateRating(
  score: number,
  level: number,
  comboMark: ComboMark,
) {
  const baseRating = Math.floor(
    (Math.min(score, 100_5000) / 1000000) * getRankMultiplier(score) * level +
      Number.EPSILON * 10000,
  );

  if (comboMark === "AP" || comboMark === "AP+") {
    return baseRating + 1;
  } else {
    return baseRating;
  }
}

export const maimaiRatingMilestones = [
  {
    id: "starting-point",
    label: "Starting Point",
    rating: 0,
    isStartingPoint: true,
  },
  { id: "blue", label: "Blue", rating: 1000 },
  { id: "green", label: "Green", rating: 2000 },
  { id: "orange", label: "Orange", rating: 4000 },
  { id: "red", label: "Red", rating: 7000 },
  { id: "purple", label: "Purple", rating: 10000 },
  { id: "bronze", label: "Bronze", rating: 12000 },
  { id: "silver", label: "Silver", rating: 13000 },
  { id: "gold-1", label: "Gold ⭐", rating: 14000 },
  { id: "gold-2", label: "Gold ⭐⭐", rating: 14250 },
  { id: "platinum-1", label: "Platinum ⭐", rating: 14500 },
  { id: "platinum-2", label: "Platinum ⭐⭐", rating: 14750 },
  { id: "rainbow-1", label: "Rainbow ⭐", rating: 15000 },
  { id: "rainbow-2", label: "Rainbow ⭐⭐", rating: 15250 },
  { id: "rainbow-3", label: "Rainbow ⭐⭐⭐", rating: 15500 },
  { id: "rainbow-4", label: "Rainbow ⭐⭐⭐⭐", rating: 15750 },
  { id: "ultimate-rainbow-1", label: "Ultimate Rainbow ⭐", rating: 16000 },
  { id: "ultimate-rainbow-2", label: "Ultimate Rainbow ⭐⭐", rating: 16250 },
  { id: "ultimate-rainbow-3", label: "Ultimate Rainbow ⭐⭐⭐", rating: 16500 },
] as const;

export type MaimaiRatingLevel =
  | "rainbow_kiwami"
  | "rainbow"
  | "platinum"
  | "gold"
  | "silver"
  | "bronze"
  | "purple"
  | "red"
  | "orange"
  | "green"
  | "blue"
  | "normal";

export function getMaimaiRatingLevel(rating: number): MaimaiRatingLevel {
  if (rating >= 16000) return "rainbow_kiwami";
  if (rating >= 15000) return "rainbow";
  if (rating >= 14500) return "platinum";
  if (rating >= 14000) return "gold";
  if (rating >= 13000) return "silver";
  if (rating >= 12000) return "bronze";
  if (rating >= 10000) return "purple";
  if (rating >= 7000) return "red";
  if (rating >= 4000) return "orange";
  if (rating >= 2000) return "green";
  if (rating >= 1000) return "blue";
  return "normal";
}
