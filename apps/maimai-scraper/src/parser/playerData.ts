import { JSDOM } from "jsdom";

import { profileWithoutLastPlayedSchema } from "@repo/types/maimai";

export function parsePlayerData(dom: JSDOM) {
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

  // Parse trophy rarity from class name
  let trophyRarity: "NORMAL" | "BRONZE" | "SILVER" | "GOLD" | "RAINBOW" =
    "NORMAL";
  const classList = Array.from(trophyBlock.classList);
  for (const className of classList) {
    if (className.startsWith("trophy_") && className !== "trophy_block") {
      const rarityPart = className.substring(7).toUpperCase(); // "trophy_".length = 7
      switch (rarityPart) {
        case "NORMAL":
        case "BRONZE":
        case "SILVER":
        case "GOLD":
        case "RAINBOW":
          trophyRarity = rarityPart;
          break;
      }
      break;
    }
  }

  // Parse Rating
  const ratingBlock = doc.querySelector(".rating_block");
  if (!ratingBlock) {
    throw new Error("Failed to find rating block");
  }

  const ratingText = ratingBlock.textContent?.trim();
  if (!ratingText) {
    throw new Error("Failed to parse rating");
  }

  const rating = parseInt(ratingText.replace(/,/g, ""), 10);
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

  const starCountMatch = starCountText.match(/×([\d,]+)/);
  if (!starCountMatch) {
    throw new Error("Failed to parse star count from: " + starCountText);
  }
  const starCount = parseInt(starCountMatch[1].replace(/,/g, ""), 10);

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
    /play count of current version[：:]\s*([\d,]+)/,
  );
  if (!currentVersionMatch) {
    throw new Error(
      "Failed to parse current version play count from: " + playCountContent,
    );
  }
  const currentVersionPlayCount = parseInt(
    currentVersionMatch[1].replace(/,/g, ""),
    10,
  );

  // Extract total play count
  const totalPlayCountMatch = playCountContent.match(
    /maimaiDX total play count[：:]\s*([\d,]+)/,
  );
  if (!totalPlayCountMatch) {
    throw new Error(
      "Failed to parse total play count from: " + playCountContent,
    );
  }
  const totalPlayCount = parseInt(totalPlayCountMatch[1].replace(/,/g, ""), 10);

  // Parse Course Rank
  // Format: <img src=".../course/course_rank_10hvsSHd90.png" />
  const courseRankImg = doc.querySelector(
    'img[src*="/course/course_rank_"]',
  ) as HTMLImageElement | null;
  let courseRank: number | undefined;
  if (courseRankImg) {
    const courseRankMatch = courseRankImg.src.match(/course_rank_(\d+)/);
    if (courseRankMatch) {
      courseRank = parseInt(courseRankMatch[1], 10);
    }
  }

  // Parse Class Rank
  // Format: <img src=".../class/class_rank_s_00ZqZmdpb8.png" />
  const classRankImg = doc.querySelector(
    'img[src*="/class/class_rank_"]',
  ) as HTMLImageElement | null;
  let classRank: number | undefined;
  if (classRankImg) {
    const classRankMatch = classRankImg.src.match(/class_rank_s_(\d+)/);
    if (classRankMatch) {
      classRank = parseInt(classRankMatch[1], 10);
    }
  }

  return profileWithoutLastPlayedSchema.parse({
    characterImage: icon,
    playerName,
    honorRarity: trophyRarity,
    honorText: trophyText,
    courseRank,
    classRank,
    rating,
    star: starCount,
    playCountCurrent: currentVersionPlayCount,
    playCountTotal: totalPlayCount,
  });
}
