import { musicDataTable, musicLevelTable } from "./musicData";

export type ChartConstantData = (typeof musicLevelTable.$inferSelect)[];
export type MusicData = Pick<
  typeof musicDataTable.$inferSelect,
  "id" | "title" | "image"
>[];
