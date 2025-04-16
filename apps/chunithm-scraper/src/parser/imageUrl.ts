import { RarityLevel } from "@repo/db-chuni/schema";

export function rarityFromUrl(url: string): RarityLevel | null {
  if (url.includes("_holographic")) {
    return "HOLOGRAPHIC";
  }

  if (url.includes("_rainbow")) {
    return "RAINBOW";
  }

  if (url.includes("_platina") || url.includes("_platinum")) {
    return "PLATINUM";
  }

  if (url.includes("_gold")) {
    return "GOLD";
  }

  if (url.includes("_silver")) {
    return "SILVER";
  }

  if (url.includes("_copper") || url.includes("_bronze")) {
    return "BRONZE";
  }

  if (url.includes("_normal")) {
    return "NORMAL";
  }

  return null;
}
