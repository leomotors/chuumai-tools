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

  mainHonorRarity: z.enum(rarityLevelValues),
  mainHonorText: z.string(),
  subHonor1Rarity: z.enum(rarityLevelValues).optional(),
  subHonor1Text: z.string().optional(),
  subHonor2Rarity: z.enum(rarityLevelValues).optional(),
  subHonor2Text: z.string().optional(),

  playerLevel: z.number().int(),
  playerName: z.string(),
  classBand: z.number().int().min(0).max(6),
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
  const honorsData = parseHonor(dom);
  const mainHonorText = honorsData[0].text;
  const mainHonorRarity = honorsData[0].rarity;
  const subHonor1Text = honorsData[1]?.text;
  const subHonor1Rarity = honorsData[1]?.rarity;
  const subHonor2Text = honorsData[2]?.text;
  const subHonor2Rarity = honorsData[2]?.rarity;

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
  const classBand = +(
    (
      rightData.querySelector(
        ".player_classemblem_base > img",
      ) as HTMLImageElement | null
    )?.src
      ?.split("_")
      .at(-1)
      ?.split(".")[0] ?? "0"
  );
  const classMedal = +(
    (
      rightData.querySelector(
        ".player_classemblem_top > img",
      ) as HTMLImageElement | null
    )?.src
      ?.split("_")
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

    mainHonorText,
    mainHonorRarity,
    subHonor1Text,
    subHonor1Rarity,
    subHonor2Text,
    subHonor2Rarity,

    playerLevel: totalPlayerLevel,
    playerName,
    classBand,
    classEmblem: classMedal,

    rating: playerRating,

    overpowerValue,
    overpowerPercent,

    lastPlayed: lasyPlayedData,
  });
}

function parseHonor(dom: JSDOM) {
  const honors = dom.window.document.querySelectorAll(".player_honor_short");
  const honorList = [...honors] as HTMLDivElement[];

  if (honorList.length < 1 || honorList.length > 3) {
    throw new Error(`Invalid honor list, got: ${honorList.length}`);
  }

  const honorsData = honorList.map((ele) => {
    const level = rarityFromUrl(ele.style.backgroundImage);
    if (level === undefined) {
      throw new Error("Failed to parse honor level");
    }
    return {
      rarity: level,
      text: ele.querySelector(".player_honor_text")!.textContent!.trim(),
    };
  });

  return honorsData;
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
