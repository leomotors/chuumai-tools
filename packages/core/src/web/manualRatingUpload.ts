export type ManualRatingUploadGame = "chuni" | "maimai";
export type ManualRatingUploadTimeZoneMode = "utc" | "local";

export type ManualRatingUploadOptions = {
  timeZoneMode?: unknown;
  localTimeZone?: unknown;
};

export type ManualRatingUploadRecord = {
  timestamp: string;
  localTimestamp: string;
  rating: number;
  sourceRow: number;
  timeValue: string;
  ratingValue: string;
};

export type ManualRatingUploadRejectedRow = {
  sourceRow: number;
  values: string[];
  reason: string;
};

export type ManualRatingUploadColumn = {
  index: number;
  label: string;
  confidence: number;
};

export type ManualRatingUploadPreview = {
  hasHeader: boolean;
  timeZoneMode: ManualRatingUploadTimeZoneMode;
  localTimeZone: string;
  timeColumn: ManualRatingUploadColumn;
  ratingColumn: ManualRatingUploadColumn;
  records: ManualRatingUploadRecord[];
  rejectedRows: ManualRatingUploadRejectedRow[];
  totalRows: number;
  dataRows: number;
  warnings: string[];
};

type CsvRow = {
  sourceRow: number;
  values: string[];
};

type ParsedScenario = ManualRatingUploadPreview & {
  score: number;
};

type NormalizedManualRatingUploadOptions = {
  timeZoneMode: ManualRatingUploadTimeZoneMode;
  localTimeZone: string;
};

type DateTimeParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  millisecond: number;
};

const DEFAULT_TIME_ZONE = "UTC";
const MAX_YEAR = 2100;
const MIN_YEAR = 2000;
const EXCEL_EPOCH_OFFSET = 25569;
const MS_PER_DAY = 86_400_000;
const EXPLICIT_TIME_ZONE_PATTERN = /(?:[zZ]|[+-]\d{2}:?\d{2})$/;

export function parseManualRatingCsv(
  csv: string,
  game: ManualRatingUploadGame,
  options: ManualRatingUploadOptions = {},
): ManualRatingUploadPreview {
  const timeZoneOptions = normalizeManualRatingUploadOptions(options);
  const rows = parseCsvRows(csv).filter((row) =>
    row.values.some((value) => value.trim().length > 0),
  );

  if (rows.length === 0) {
    throw new Error("CSV file is empty.");
  }

  const scenarios = [
    buildScenario(rows, null, game, timeZoneOptions),
    rows.length > 1
      ? buildScenario(rows.slice(1), rows[0], game, timeZoneOptions)
      : null,
  ].filter((scenario): scenario is ParsedScenario => scenario !== null);

  const best = scenarios
    .filter((scenario) => scenario.records.length > 0)
    .sort((a, b) => b.score - a.score)[0];

  if (!best) {
    throw new Error("Could not find a usable time column and rating column.");
  }

  const { score: _score, ...preview } = best;
  return preview;
}

export function validateManualRatingUploadRecords(
  value: unknown,
  game: ManualRatingUploadGame,
): Array<Pick<ManualRatingUploadRecord, "rating" | "timestamp">> {
  if (!Array.isArray(value)) {
    throw new Error("Manual rating records must be an array.");
  }

  return value.map((record, index) => {
    if (
      record === null ||
      typeof record !== "object" ||
      !("timestamp" in record) ||
      !("rating" in record)
    ) {
      throw new Error(`Manual rating row ${index + 1} is invalid.`);
    }

    const timestamp = parseDateCell(String(record.timestamp), {
      localTimeZone: DEFAULT_TIME_ZONE,
      timeZoneMode: "utc",
    });
    const rating = parseRatingCell(String(record.rating), game);

    if (!timestamp || rating === null) {
      throw new Error(`Manual rating row ${index + 1} is invalid.`);
    }

    return {
      timestamp: timestamp.toISOString(),
      rating,
    };
  });
}

export function normalizeManualRatingUploadOptions(
  options: ManualRatingUploadOptions = {},
): NormalizedManualRatingUploadOptions {
  const timeZoneMode =
    options.timeZoneMode === "local" || options.timeZoneMode === "utc"
      ? options.timeZoneMode
      : "utc";
  const localTimeZone =
    typeof options.localTimeZone === "string" &&
    isValidTimeZone(options.localTimeZone)
      ? options.localTimeZone
      : DEFAULT_TIME_ZONE;

  return {
    timeZoneMode,
    localTimeZone,
  };
}

function parseCsvRows(csv: string): CsvRow[] {
  const rows: CsvRow[] = [];
  let current = "";
  let row: string[] = [];
  let inQuotes = false;
  let sourceRow = 1;

  const input = csv.replace(/^\uFEFF/, "");

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];
    const next = input[index + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(current);
      current = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      row.push(current);
      rows.push({ sourceRow, values: row.map((value) => value.trim()) });
      row = [];
      current = "";
      sourceRow += 1;
      if (char === "\r" && next === "\n") index += 1;
      continue;
    }

    current += char;
  }

  row.push(current);
  rows.push({ sourceRow, values: row.map((value) => value.trim()) });

  return rows;
}

function buildScenario(
  rows: CsvRow[],
  header: CsvRow | null,
  game: ManualRatingUploadGame,
  options: NormalizedManualRatingUploadOptions,
): ParsedScenario {
  const columnCount = Math.max(
    ...[...(header ? [header] : []), ...rows].map((row) => row.values.length),
  );

  const timeScores = Array.from({ length: columnCount }, (_, index) =>
    scoreColumn(rows, header, index, "time", game, options),
  );
  const ratingScores = Array.from({ length: columnCount }, (_, index) =>
    scoreColumn(rows, header, index, "rating", game, options),
  );

  const pairs = timeScores.flatMap((timeScore) =>
    ratingScores
      .filter((ratingScore) => ratingScore.index !== timeScore.index)
      .map((ratingScore) => ({ timeScore, ratingScore })),
  );
  const bestPair = pairs.sort(
    (a, b) =>
      b.timeScore.score +
      b.ratingScore.score -
      (a.timeScore.score + a.ratingScore.score),
  )[0];

  if (!bestPair) {
    return emptyScenario(rows, header, options);
  }

  const records: ManualRatingUploadRecord[] = [];
  const rejectedRows: ManualRatingUploadRejectedRow[] = [];

  for (const row of rows) {
    const timestamp = parseDateCell(
      row.values[bestPair.timeScore.index] ?? "",
      options,
    );
    const rating = parseRatingCell(
      row.values[bestPair.ratingScore.index] ?? "",
      game,
    );

    if (!timestamp || rating === null) {
      rejectedRows.push({
        sourceRow: row.sourceRow,
        values: row.values,
        reason: !timestamp
          ? "No valid date/time value found."
          : "No valid rating value found.",
      });
      continue;
    }

    records.push({
      timestamp: timestamp.toISOString(),
      localTimestamp: formatTimestampForTimeZone(
        timestamp,
        options.localTimeZone,
      ),
      rating,
      sourceRow: row.sourceRow,
      timeValue: row.values[bestPair.timeScore.index] ?? "",
      ratingValue: row.values[bestPair.ratingScore.index] ?? "",
    });
  }

  const warnings =
    rejectedRows.length > 0
      ? [`${rejectedRows.length.toLocaleString()} row(s) were skipped.`]
      : [];

  return {
    hasHeader: header !== null,
    timeZoneMode: options.timeZoneMode,
    localTimeZone: options.localTimeZone,
    timeColumn: columnFromScore(bestPair.timeScore, header),
    ratingColumn: columnFromScore(bestPair.ratingScore, header),
    records,
    rejectedRows,
    totalRows: rows.length + (header ? 1 : 0),
    dataRows: rows.length,
    warnings,
    score:
      records.length * 20 +
      bestPair.timeScore.score +
      bestPair.ratingScore.score -
      rejectedRows.length * 2 +
      (header ? 5 : 0),
  };
}

function emptyScenario(
  rows: CsvRow[],
  header: CsvRow | null,
  options: NormalizedManualRatingUploadOptions,
): ParsedScenario {
  return {
    hasHeader: header !== null,
    timeZoneMode: options.timeZoneMode,
    localTimeZone: options.localTimeZone,
    timeColumn: { index: -1, label: "Unknown", confidence: 0 },
    ratingColumn: { index: -1, label: "Unknown", confidence: 0 },
    records: [],
    rejectedRows: rows.map((row) => ({
      sourceRow: row.sourceRow,
      values: row.values,
      reason: "No valid time and rating columns found.",
    })),
    totalRows: rows.length + (header ? 1 : 0),
    dataRows: rows.length,
    warnings: ["No usable rows were found."],
    score: 0,
  };
}

function scoreColumn(
  rows: CsvRow[],
  header: CsvRow | null,
  index: number,
  kind: "time" | "rating",
  game: ManualRatingUploadGame,
  options: NormalizedManualRatingUploadOptions,
) {
  const matches = rows.filter((row) => {
    const value = row.values[index] ?? "";
    return kind === "time"
      ? parseDateCell(value, options) !== null
      : parseRatingCell(value, game) !== null;
  }).length;
  const headerBonus = scoreHeader(header?.values[index] ?? "", kind);

  return {
    index,
    score: matches * 10 + headerBonus,
    matches,
    headerBonus,
  };
}

function columnFromScore(
  score: ReturnType<typeof scoreColumn>,
  header: CsvRow | null,
): ManualRatingUploadColumn {
  const headerLabel = header?.values[score.index]?.trim();

  return {
    index: score.index,
    label: headerLabel || `Column ${score.index + 1}`,
    confidence: score.matches + score.headerBonus / 10,
  };
}

function scoreHeader(header: string, kind: "time" | "rating"): number {
  const normalized = header.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (!normalized) return 0;

  if (kind === "time") {
    if (
      normalized.includes("timestamp") ||
      normalized.includes("datetime") ||
      normalized.includes("playedat")
    ) {
      return 30;
    }
    if (
      normalized.includes("date") ||
      normalized.includes("time") ||
      normalized.includes("created")
    ) {
      return 20;
    }
    return 0;
  }

  if (
    normalized === "rating" ||
    normalized === "rate" ||
    normalized.endsWith("rating")
  ) {
    return 30;
  }
  if (normalized.includes("rating")) return 20;
  return 0;
}

function parseRatingCell(
  value: string,
  game: ManualRatingUploadGame,
): number | null {
  const normalized = value.trim().replace(/,/g, "");
  if (!normalized) return null;

  if (game === "chuni") {
    if (!/^\d{1,2}(?:\.\d{1,4})?$/.test(normalized)) return null;
    const rating = Number(normalized);
    return Number.isFinite(rating) && rating >= 0 && rating < 20
      ? rating
      : null;
  }

  if (!/^\d+$/.test(normalized)) return null;
  const rating = Number(normalized);
  return Number.isInteger(rating) && rating >= 0 && rating <= 25_000
    ? rating
    : null;
}

function parseDateCell(
  value: string,
  options: NormalizedManualRatingUploadOptions,
): Date | null {
  const normalized = value.trim();
  if (!normalized) return null;

  const numericValue = Number(normalized);
  if (/^\d+(?:\.\d+)?$/.test(normalized) && Number.isFinite(numericValue)) {
    return parseNumericDate(numericValue, options);
  }

  if (
    !/[/-]|\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\b|T|\d:\d/i.test(
      normalized,
    )
  ) {
    return null;
  }

  if (EXPLICIT_TIME_ZONE_PATTERN.test(normalized)) {
    const parsed = new Date(normalized);
    return validDateInRange(parsed) ? parsed : null;
  }

  const parts = parseDateTimeParts(normalized);
  if (parts) {
    return dateFromParts(parts, options);
  }

  const parsed = new Date(normalized);
  return validDateInRange(parsed) ? parsed : null;
}

function parseNumericDate(
  value: number,
  options: NormalizedManualRatingUploadOptions,
): Date | null {
  if (value >= 946_684_800_000 && value <= 4_102_444_800_000) {
    const date = new Date(value);
    return validDateInRange(date) ? date : null;
  }

  if (value >= 946_684_800 && value <= 4_102_444_800) {
    const date = new Date(value * 1000);
    return validDateInRange(date) ? date : null;
  }

  if (value >= 20_000 && value <= 60_000) {
    const utcDate = new Date(
      Math.round((value - EXCEL_EPOCH_OFFSET) * MS_PER_DAY),
    );
    return dateFromParts(
      {
        year: utcDate.getUTCFullYear(),
        month: utcDate.getUTCMonth() + 1,
        day: utcDate.getUTCDate(),
        hour: utcDate.getUTCHours(),
        minute: utcDate.getUTCMinutes(),
        second: utcDate.getUTCSeconds(),
        millisecond: utcDate.getUTCMilliseconds(),
      },
      options,
    );
  }

  return null;
}

function validDateInRange(date: Date): boolean {
  const year = date.getUTCFullYear();
  return !Number.isNaN(date.getTime()) && year >= MIN_YEAR && year <= MAX_YEAR;
}

function parseDateTimeParts(value: string): DateTimeParts | null {
  const isoLike = value.match(
    /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})(?:[T\s]+(\d{1,2}):(\d{2})(?::(\d{2})(?:\.(\d{1,9}))?)?)?$/,
  );
  if (isoLike) {
    return createDateTimeParts({
      year: isoLike[1],
      month: isoLike[2],
      day: isoLike[3],
      hour: isoLike[4],
      minute: isoLike[5],
      second: isoLike[6],
      millisecond: isoLike[7],
    });
  }

  const monthFirst = value.match(
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:[T\s]+(\d{1,2}):(\d{2})(?::(\d{2})(?:\.(\d{1,9}))?)?)?$/,
  );
  if (monthFirst) {
    return createDateTimeParts({
      year: monthFirst[3],
      month: monthFirst[1],
      day: monthFirst[2],
      hour: monthFirst[4],
      minute: monthFirst[5],
      second: monthFirst[6],
      millisecond: monthFirst[7],
    });
  }

  return null;
}

function createDateTimeParts(values: {
  year: string;
  month: string;
  day: string;
  hour?: string;
  minute?: string;
  second?: string;
  millisecond?: string;
}): DateTimeParts | null {
  const parts = {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
    hour: values.hour ? Number(values.hour) : 0,
    minute: values.minute ? Number(values.minute) : 0,
    second: values.second ? Number(values.second) : 0,
    millisecond: values.millisecond
      ? Number(values.millisecond.padEnd(3, "0").slice(0, 3))
      : 0,
  };

  if (
    !Number.isInteger(parts.year) ||
    !Number.isInteger(parts.month) ||
    !Number.isInteger(parts.day) ||
    !Number.isInteger(parts.hour) ||
    !Number.isInteger(parts.minute) ||
    !Number.isInteger(parts.second) ||
    !Number.isInteger(parts.millisecond) ||
    parts.month < 1 ||
    parts.month > 12 ||
    parts.day < 1 ||
    parts.day > 31 ||
    parts.hour < 0 ||
    parts.hour > 23 ||
    parts.minute < 0 ||
    parts.minute > 59 ||
    parts.second < 0 ||
    parts.second > 59 ||
    parts.millisecond < 0 ||
    parts.millisecond > 999
  ) {
    return null;
  }

  return parts;
}

function dateFromParts(
  parts: DateTimeParts,
  options: NormalizedManualRatingUploadOptions,
): Date | null {
  if (options.timeZoneMode === "local") {
    return dateFromPartsInTimeZone(parts, options.localTimeZone);
  }

  const date = new Date(
    Date.UTC(
      parts.year,
      parts.month - 1,
      parts.day,
      parts.hour,
      parts.minute,
      parts.second,
      parts.millisecond,
    ),
  );

  return validDateInRange(date) && utcPartsEqual(date, parts) ? date : null;
}

function dateFromPartsInTimeZone(
  parts: DateTimeParts,
  timeZone: string,
): Date | null {
  const utcTarget = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
    parts.millisecond,
  );
  let timestamp = utcTarget;

  for (let index = 0; index < 3; index += 1) {
    const offset = getTimeZoneOffsetMinutes(new Date(timestamp), timeZone);
    const nextTimestamp = utcTarget - offset * 60_000;
    if (nextTimestamp === timestamp) break;
    timestamp = nextTimestamp;
  }

  const date = new Date(timestamp);
  return validDateInRange(date) &&
    timeZonePartsEqual(getDateTimePartsForTimeZone(date, timeZone), parts)
    ? date
    : null;
}

function formatTimestampForTimeZone(date: Date, timeZone: string): string {
  const parts = getDateTimePartsForTimeZone(date, timeZone);
  const offset = getTimeZoneOffsetMinutes(date, timeZone);

  return `${pad(parts.year, 4)}-${pad(parts.month)}-${pad(parts.day)} ${pad(
    parts.hour,
  )}:${pad(parts.minute)}:${pad(parts.second)} UTC${formatOffset(offset)}`;
}

function getTimeZoneOffsetMinutes(date: Date, timeZone: string): number {
  const parts = getDateTimePartsForTimeZone(date, timeZone);
  const localAsUtc = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
    parts.millisecond,
  );

  return Math.round((localAsUtc - date.getTime()) / 60_000);
}

function getDateTimePartsForTimeZone(
  date: Date,
  timeZone: string,
): DateTimeParts {
  const parts = new Intl.DateTimeFormat(undefined, {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const values = Object.fromEntries(
    parts.map((part) => [part.type, part.value]),
  );

  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
    hour: Number(values.hour),
    minute: Number(values.minute),
    second: Number(values.second),
    millisecond: date.getUTCMilliseconds(),
  };
}

function utcPartsEqual(date: Date, parts: DateTimeParts): boolean {
  return (
    date.getUTCFullYear() === parts.year &&
    date.getUTCMonth() + 1 === parts.month &&
    date.getUTCDate() === parts.day &&
    date.getUTCHours() === parts.hour &&
    date.getUTCMinutes() === parts.minute &&
    date.getUTCSeconds() === parts.second &&
    date.getUTCMilliseconds() === parts.millisecond
  );
}

function timeZonePartsEqual(
  left: DateTimeParts,
  right: DateTimeParts,
): boolean {
  return (
    left.year === right.year &&
    left.month === right.month &&
    left.day === right.day &&
    left.hour === right.hour &&
    left.minute === right.minute &&
    left.second === right.second &&
    left.millisecond === right.millisecond
  );
}

function isValidTimeZone(timeZone: string): boolean {
  try {
    new Intl.DateTimeFormat(undefined, { timeZone }).format(new Date(0));
    return true;
  } catch {
    return false;
  }
}

function pad(value: number, length = 2): string {
  return value.toString().padStart(length, "0");
}

function formatOffset(offsetMinutes: number): string {
  const sign = offsetMinutes >= 0 ? "+" : "-";
  const absoluteOffset = Math.abs(offsetMinutes);
  const hours = Math.floor(absoluteOffset / 60);
  const minutes = absoluteOffset % 60;

  return `${sign}${pad(hours)}:${pad(minutes)}`;
}
