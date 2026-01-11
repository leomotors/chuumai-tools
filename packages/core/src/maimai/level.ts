export function constantFromLevel(level: string) {
  if (level.endsWith("+")) {
    return parseInt(level.slice(0, -1)) + 0.6;
  }
  return parseInt(level);
}
