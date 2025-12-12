export function getLamp(score: number, fc: boolean, aj: boolean) {
  if (score === 1_010_000) {
    return "ajc";
  }

  if (aj) return "aj";
  if (fc) return "fc";

  return null;
}
