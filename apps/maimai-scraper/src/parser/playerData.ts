import { JSDOM } from "jsdom";

import { z } from "@repo/types/zod";

// Mock constant for trophy rarity - to be implemented properly later
const MOCK_TROPHY_RARITY = "GOLD" as const;

const playerDataSchema = z.object({
  icon: z.url(),
  playerName: z.string(),
  trophyRarity: z.string(),
  trophyText: z.string(),
  rating: z.number().int(),
  starCount: z.number().int(),
  currentVersionPlayCount: z.number().int(),
  totalPlayCount: z.number().int(),
});

export type PlayerData = z.infer<typeof playerDataSchema>;

export function parsePlayerData(dom: JSDOM): PlayerData {
  const doc = dom.window.document;

  // Parse Icon
  const iconImg = doc.querySelector(
    ".basic_block img.w_112",
  ) as HTMLImageElement | null;
  if (!iconImg) {
    throw new Error("Failed to find icon image element");
  }
  const icon = iconImg.src;
  if (!icon) {
    throw new Error("Failed to parse icon URL");
  }

  // Parse Player Name
  const playerNameEle = doc.querySelector(".name_block");
  if (!playerNameEle) {
    throw new Error("Failed to find player name element");
  }
  const playerName = playerNameEle.textContent?.trim();
  if (!playerName) {
    throw new Error("Failed to parse player name");
  }

  // Parse Trophy (Title) - Rarity and Text
  const trophyBlock = doc.querySelector(".trophy_block");
  if (!trophyBlock) {
    throw new Error("Failed to find trophy block");
  }

  const trophyInnerBlock = trophyBlock.querySelector(".trophy_inner_block");
  if (!trophyInnerBlock) {
    throw new Error("Failed to find trophy inner block");
  }

  const trophyText = trophyInnerBlock.textContent?.trim();
  if (!trophyText) {
    throw new Error("Failed to parse trophy text");
  }

  // Trophy rarity is mocked for now
  const trophyRarity = MOCK_TROPHY_RARITY;

  // Parse Rating
  const ratingBlock = doc.querySelector(".rating_block");
  if (!ratingBlock) {
    throw new Error("Failed to find rating block");
  }

  const ratingText = ratingBlock.textContent?.trim();
  if (!ratingText) {
    throw new Error("Failed to parse rating");
  }

  const rating = parseInt(ratingText, 10);
  if (isNaN(rating)) {
    throw new Error(`Failed to parse rating as number: ${ratingText}`);
  }

  // Parse Star Count
  // Format: <img src=".../icon_star.png" ... />×234
  const starCountEle = doc.querySelector(".p_l_10.f_l.f_14");
  if (!starCountEle) {
    throw new Error("Failed to find star count element");
  }

  const starCountText = starCountEle.textContent?.trim();
  if (!starCountText) {
    throw new Error("Failed to parse star count text");
  }

  const starCountMatch = starCountText.match(/×(\d+)/);
  if (!starCountMatch) {
    throw new Error("Failed to parse star count from: " + starCountText);
  }
  const starCount = parseInt(starCountMatch[1], 10);

  // Parse Play Counts
  // Format: "play count of current version：105<br />maimaiDX total play count：523"
  const playCountText = doc.querySelector(".m_5.m_b_5.t_r.f_12");
  if (!playCountText) {
    throw new Error("Failed to find play count element");
  }

  const playCountContent = playCountText.innerHTML;
  if (!playCountContent) {
    throw new Error("Failed to parse play count content");
  }

  // Extract current version play count
  const currentVersionMatch = playCountContent.match(
    /play count of current version[：:]\s*(\d+)/,
  );
  if (!currentVersionMatch) {
    throw new Error(
      "Failed to parse current version play count from: " + playCountContent,
    );
  }
  const currentVersionPlayCount = parseInt(currentVersionMatch[1], 10);

  // Extract total play count
  const totalPlayCountMatch = playCountContent.match(
    /maimaiDX total play count[：:]\s*(\d+)/,
  );
  if (!totalPlayCountMatch) {
    throw new Error(
      "Failed to parse total play count from: " + playCountContent,
    );
  }
  const totalPlayCount = parseInt(totalPlayCountMatch[1], 10);

  return playerDataSchema.parse({
    icon,
    playerName,
    trophyRarity,
    trophyText,
    rating,
    starCount,
    currentVersionPlayCount,
    totalPlayCount,
  });
}
