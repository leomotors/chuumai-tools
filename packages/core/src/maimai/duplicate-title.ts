import { Category } from "@repo/types/maimai";

// It is hard to determine music ID in maimai so we use title as PKEY.
// Current known duplicate is Link which can be determined by Category or Image.

export function mapMaimaiTitleWithCategory(title: string, category: Category) {
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

export function mapMaimaiTitleWithImage(title: string, imageUrl: string) {
  if (title !== "Link") {
    return title;
  }

  if (imageUrl.includes("e90f79d9dcff84df.png")) {
    return "Link (niconico)";
  }

  if (imageUrl.includes("1e44516a8a3b5a51.png")) {
    return "Link (maimai)";
  }

  throw new Error(`Unknown image URL for title "Link": ${imageUrl}`);
}
