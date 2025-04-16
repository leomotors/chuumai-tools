export function anotherRarity(rarity: string) {
  if (rarity === "platinum") {
    return "platina";
  }

  if (rarity === "bronze") {
    return "copper";
  }

  return rarity;
}
