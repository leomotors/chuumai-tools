import type { musicDataTable, musicLevelTable } from "./schema";

export type ChartConstantData = (typeof musicLevelTable.$inferSelect)[];
export type MusicData = Pick<
  typeof musicDataTable.$inferSelect,
  "id" | "title" | "image"
>[];
