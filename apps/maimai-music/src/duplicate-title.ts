import { Category } from "@repo/database/maimai";

export function mapMaimaiTitle(title: string, category: Category) {
  if (title !== "Link") {
    return title;
  }

  if (category === "maimai") {
    return "Link (maimai)";
  }

  if (category === "niconico&ボーカロイド") {
    return "Link (niconico)";
  }

  throw new Error(`Unknown category for title "Link": ${category}`);
}
