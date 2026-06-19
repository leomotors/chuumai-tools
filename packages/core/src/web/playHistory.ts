export const PLAY_HISTORY_DEFAULT_LIMIT = 30;
export const PLAY_HISTORY_LIMIT_STEP = 30;
export const PLAY_HISTORY_MAX_LIMIT = 300;

export function parsePlayHistoryLimit(value: string | null) {
  if (value === null) return PLAY_HISTORY_DEFAULT_LIMIT;

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return PLAY_HISTORY_DEFAULT_LIMIT;

  return Math.min(
    PLAY_HISTORY_MAX_LIMIT,
    Math.max(PLAY_HISTORY_DEFAULT_LIMIT, Math.floor(parsed)),
  );
}

export function getNextPlayHistoryLimit(
  currentLimit: number,
  hasMore: boolean,
) {
  if (!hasMore || currentLimit >= PLAY_HISTORY_MAX_LIMIT) return null;

  return Math.min(
    PLAY_HISTORY_MAX_LIMIT,
    currentLimit + PLAY_HISTORY_LIMIT_STEP,
  );
}
