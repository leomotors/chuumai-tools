import { JSDOM } from "jsdom";
import { z } from "zod";

import { RarityLevel, rarityLevelValues } from "@repo/db-chuni/schema";
import { ImgGenInput } from "@repo/types-chuni";

import { rarityFromUrl } from "./imageUrl";
import { parseCurrentRating } from "./playerRating";

// Box
export function parsePossession(dom: JSDOM): RarityLevel {
  const ele = dom.window.document.querySelector(
    ".box_playerprofile",
  )! as HTMLDivElement;

  const bgImg = ele.style.backgroundImage;

  if (bgImg.includes("profile_rainbow")) {
    return "RAINBOW";
  }

  if (bgImg.includes("profile_platina")) {
    return "PLATINUM";
  }

  if (bgImg.includes("profile_gold")) {
    return "GOLD";
  }

  if (bgImg.includes("profile_silver")) {
    return "SILVER";
  }

  return "NORMAL";
}

// Left
export function parseCharacter(
  dom: JSDOM,
): Pick<ImgGenInput["profile"], "characterRarity" | "characterImage"> {
  const ele = dom.window.document.querySelector(
    ".player_data_left",
  )! as HTMLDivElement;

  const charaFrame = (ele.querySelector(".player_chara") as HTMLDivElement)
    .style.backgroundImage;

  const imgUrl = (ele.querySelector(".player_chara > img") as HTMLImageElement)
    .src;
  const rarityLevel = rarityFromUrl(charaFrame);

  if (!rarityLevel) {
    throw new Error("Failed to parse character frame rarity level");
  }

  return { characterRarity: rarityLevel, characterImage: imgUrl };
}

const rightDataSchema = z.object({
  teamEmblem: z.enum(rarityLevelValues).optional(),
  teamName: z.string().optional(),

  honorLevel: z.enum(rarityLevelValues),
  honorText: z.string(),

  playerLevel: z.number().int(),
  playerName: z.string(),
  classEmblem: z.number().int().min(0).max(6),

  rating: z.number(),

  overpowerValue: z.number(),
  overpowerPercent: z.number(),

  lastPlayed: z.date(),
});

// Right
export function parseRightData(dom: JSDOM) {
  const rightData = dom.window.document.querySelector(
    ".player_data_right",
  )! as HTMLDivElement;

  // Team Information
  let teamEmblem: RarityLevel | undefined = undefined;

  if (rightData.querySelector(".player_team_emblem_rainbow") !== null) {
    teamEmblem = "RAINBOW";
  }
  if (rightData.querySelector(".player_team_emblem_gold") !== null) {
    teamEmblem = "GOLD";
  }
  if (rightData.querySelector(".player_team_emblem_silver") !== null) {
    teamEmblem = "SILVER";
  }
  if (rightData.querySelector(".player_team_emblem_normal") !== null) {
    teamEmblem = "NORMAL";
  }

  const teamName = rightData
    .querySelector(".player_team_name")
    ?.textContent?.trim();

  // Honor Text
  const honorElement = rightData.querySelector(
    ".player_honor_short",
  ) as HTMLDivElement;

  const honorLevel = rarityFromUrl(honorElement.style.backgroundImage);
  const honorText = honorElement
    .querySelector(".player_honor_text")
    ?.textContent?.trim();

  // Player Level, Name, and Class Emblem
  const playerLevel = rightData
    .querySelector(".player_lv")!
    .textContent?.trim();
  const playerReborn =
    rightData.querySelector(".player_reborn")?.textContent ?? "0";

  if (playerLevel === undefined) {
    throw new Error("Failed to parse player level");
  }

  const totalPlayerLevel = +playerReborn * 100 + +playerLevel;

  const playerName = rightData.querySelector(".player_name_in")?.textContent;
  const classEmblem = +(
    (
      rightData.querySelector(".player_classemblem_top > img") as
        | HTMLImageElement
        | undefined
    )?.src
      .split("_")
      .at(-1)
      ?.split(".")[0] ?? "0"
  );

  // Player Rating
  const playerRating = parseCurrentRating(dom);

  // Player Overpower
  const overpowerText = rightData
    .querySelector(".player_overpower_text")
    ?.textContent?.trim();

  if (overpowerText === undefined) {
    throw new Error("Failed to parse player overpower text");
  }

  const overpowerValue = parseFloat(overpowerText.split(" ")[0]);
  const overpowerPercent = parseFloat(overpowerText.split(" ")[1].slice(1, -2));

  // Last Played Data
  const lastPlayedText = rightData
    .querySelector(".player_lastplaydate_text")
    ?.textContent?.trim();

  if (lastPlayedText === undefined) {
    throw new Error("Failed to parse last played date");
  }

  const lasyPlayedData = new Date(`${lastPlayedText} UTC+9`);

  return rightDataSchema.parse({
    teamEmblem,
    teamName,

    honorLevel,
    honorText,

    playerLevel: totalPlayerLevel,
    playerName,
    classEmblem,

    rating: playerRating,

    overpowerValue,
    overpowerPercent,

    lastPlayed: lasyPlayedData,
  });
}

// Bottom
export function parseBottomData(dom: JSDOM) {
  const bottomData = dom.window.document.querySelector(
    ".w420.box01",
  )! as HTMLDivElement;

  const currentCurrency = +bottomData
    .querySelector(".user_data_point")!
    .textContent!.replaceAll(",", "");

  const totalCurrency = +bottomData
    .querySelector(".user_data_total_point")!
    .textContent!.replaceAll(",", "");

  const playCount = +bottomData
    .querySelector(".user_data_play_count")!
    .textContent!.replaceAll(",", "");

  return {
    currentCurrency,
    totalCurrency,
    playCount,
  };
}
