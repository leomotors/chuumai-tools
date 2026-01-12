import { chartSchema, historyRecordSchema } from "@repo/types/maimai";

// Helper function to parse chart type from icon
function parseChartType(element: Element): "dx" | "std" {
  const musicKindIcon = element.querySelector(
    ".music_kind_icon, .playlog_music_kind_icon",
  ) as HTMLImageElement | null;
  if (!musicKindIcon) {
    throw new Error("Failed to find music kind icon");
  }
  return musicKindIcon.src.includes("music_dx.png") ? "dx" : "std";
}

// Helper function to parse difficulty from image
function parseDifficulty(
  element: Element,
): "basic" | "advanced" | "expert" | "master" | "remaster" {
  const difficultyImg = element.querySelector(
    "img[src*='/diff_']",
  ) as HTMLImageElement | null;
  if (!difficultyImg) {
    throw new Error("Failed to find difficulty image");
  }

  if (difficultyImg.src.includes("diff_basic.png")) {
    return "basic";
  } else if (difficultyImg.src.includes("diff_advanced.png")) {
    return "advanced";
  } else if (difficultyImg.src.includes("diff_expert.png")) {
    return "expert";
  } else if (difficultyImg.src.includes("diff_master.png")) {
    return "master";
  } else if (difficultyImg.src.includes("diff_remaster.png")) {
    return "remaster";
  } else {
    throw new Error("Failed to parse difficulty from image");
  }
}

// Helper function to parse combo mark from images
function parseComboMark(
  images: NodeListOf<Element>,
): "NONE" | "FC" | "FC+" | "AP" | "AP+" | undefined {
  for (const img of images) {
    const src = (img as HTMLImageElement).src;
    if (src.includes("music_icon_fc.png") || src.includes("playlog/fc.png")) {
      return "FC";
    } else if (
      src.includes("music_icon_fcp.png") ||
      src.includes("playlog/fcp.png")
    ) {
      return "FC+";
    } else if (
      src.includes("music_icon_ap.png") ||
      src.includes("playlog/ap.png")
    ) {
      return "AP";
    } else if (
      src.includes("music_icon_app.png") ||
      src.includes("playlog/app.png")
    ) {
      return "AP+";
    }
  }
  return undefined;
}

// Helper function to parse sync mark from images
function parseSyncMark(
  images: NodeListOf<Element>,
): "NONE" | "SYNC" | "FS" | "FS+" | "FDX" | "FDX+" | undefined {
  for (const img of images) {
    const src = (img as HTMLImageElement).src;
    if (
      src.includes("music_icon_sync.png") ||
      src.includes("playlog/sync.png")
    ) {
      return "SYNC";
    } else if (
      src.includes("music_icon_fs.png") ||
      src.includes("playlog/fs.png")
    ) {
      return "FS";
    } else if (
      src.includes("music_icon_fsp.png") ||
      src.includes("playlog/fsp.png")
    ) {
      return "FS+";
    } else if (
      src.includes("music_icon_fdx.png") ||
      src.includes("playlog/fdx.png")
    ) {
      return "FDX";
    } else if (
      src.includes("music_icon_fdxp.png") ||
      src.includes("playlog/fdxp.png")
    ) {
      return "FDX+";
    }
  }
  return undefined;
}

export function parseMusic(element: Element) {
  // Parse title
  const titleElement = element.querySelector(".music_name_block");
  if (!titleElement) {
    throw new Error("Failed to find music title element");
  }
  const title = titleElement.textContent?.trim();
  if (!title) {
    throw new Error("Failed to parse music title");
  }

  const chartType = parseChartType(element);
  const difficulty = parseDifficulty(element);

  // Parse score
  const scoreBlocks = element.querySelectorAll(".music_score_block");
  let score = 0;
  let dxScore: number | undefined;
  let dxScoreMax: number | undefined;

  if (scoreBlocks.length > 0) {
    // Has score data
    const scoreText = scoreBlocks[0].textContent?.trim();
    if (scoreText) {
      // Remove % and whitespace, handle thousand separators
      const scoreMatch = scoreText.match(/([\d,]+\.?\d*)/);
      if (scoreMatch) {
        const scoreFloat = parseFloat(scoreMatch[1].replace(/,/g, ""));
        // Convert percentage to integer (multiply by 10000)
        // e.g., 100.2307% -> 1002307
        score = Math.round(scoreFloat * 10000);
      }
    }

    // Check for dxScore (will be in second score block for record view)
    if (scoreBlocks.length > 1) {
      const dxScoreText = scoreBlocks[1].textContent?.trim();
      if (dxScoreText) {
        // Format: "797 / 858" or "1,733 / 1,923"
        const dxScoreMatch = dxScoreText.match(/([\d,]+)\s*\/\s*([\d,]+)/);
        if (dxScoreMatch) {
          dxScore = parseInt(dxScoreMatch[1].replace(/,/g, ""), 10);
          dxScoreMax = parseInt(dxScoreMatch[2].replace(/,/g, ""), 10);
        }
      }
    }
  }

  // Parse combo mark
  const comboImages = element.querySelectorAll('img[src*="music_icon_"]');
  const comboMark = parseComboMark(comboImages);

  // Parse sync mark
  const syncMark = parseSyncMark(comboImages);

  return chartSchema.parse({
    title,
    chartType,
    difficulty,
    score,
    dxScore,
    dxScoreMax,
    comboMark,
    syncMark,
  });
}

export function parseHistory(element: Element) {
  // Parse title from the basic_block
  // The structure is: <div class="basic_block">...<div>level</div>Title</div>
  const titleElement = element.querySelector(".basic_block");
  if (!titleElement) {
    throw new Error("Failed to find title element");
  }

  // Get text content and remove the level div content
  const levelDiv = titleElement.querySelector(".music_lv_back");
  let title = titleElement.textContent?.trim() || "";
  if (levelDiv) {
    const levelText = levelDiv.textContent?.trim() || "";
    title = title.replace(levelText, "").trim();
  }

  if (!title) {
    throw new Error("Failed to parse title");
  }

  const chartType = parseChartType(element);
  const difficulty = parseDifficulty(element);

  // Parse track number and played time
  const subTitle = element.querySelector(".sub_title");
  if (!subTitle) {
    throw new Error("Failed to find sub_title element");
  }
  const subTitleText = subTitle.textContent?.trim();
  if (!subTitleText) {
    throw new Error("Failed to parse sub_title");
  }

  // Parse track number (e.g., "TRACK 03")
  const trackMatch = subTitleText.match(/TRACK\s+(\d+)/);
  if (!trackMatch) {
    throw new Error("Failed to parse track number");
  }
  const trackNo = parseInt(trackMatch[1], 10);

  // Parse played time (e.g., "2026/01/09 18:21")
  const dateMatch = subTitleText.match(
    /(\d{4})\/(\d{2})\/(\d{2})\s+(\d{2}):(\d{2})/,
  );
  if (!dateMatch) {
    throw new Error("Failed to parse played time");
  }
  const [, year, month, day, hour, minute] = dateMatch;
  // Time is in JST (+9), convert to UTC by subtracting 9 hours
  const jstDate = new Date(
    `${year}-${month}-${day}T${hour}:${minute}:00+09:00`,
  );
  const playedAt = jstDate.toISOString();

  // Parse score from playlog_achievement_txt
  const achievementTxt = element.querySelector(".playlog_achievement_txt");
  if (!achievementTxt) {
    throw new Error("Failed to find achievement text");
  }
  const achievementText = achievementTxt.textContent?.trim();
  if (!achievementText) {
    throw new Error("Failed to parse achievement");
  }
  // Format: "99.9262%" with possible span tags
  const scoreMatch = achievementText.match(/([\d,]+\.?\d*)/);
  if (!scoreMatch) {
    throw new Error("Failed to parse score from achievement");
  }
  const scoreFloat = parseFloat(scoreMatch[1].replace(/,/g, ""));
  const score = Math.round(scoreFloat * 10000);

  // Parse dxScore from playlog_score_block
  const scoreBlock = element.querySelector(".playlog_score_block");
  let dxScore: number | undefined;
  let dxScoreMax: number | undefined;

  if (scoreBlock) {
    const scoreText = scoreBlock.textContent?.trim();
    if (scoreText) {
      // Format: "3,447 / 4,071"
      const dxScoreMatch = scoreText.match(/([\d,]+)\s*\/\s*([\d,]+)/);
      if (dxScoreMatch) {
        dxScore = parseInt(dxScoreMatch[1].replace(/,/g, ""), 10);
        dxScoreMax = parseInt(dxScoreMatch[2].replace(/,/g, ""), 10);
      }
    }
  }

  // Parse combo and sync marks from playlog images
  const playlogImages = element.querySelectorAll('img[src*="playlog/"]');
  const comboMark = parseComboMark(playlogImages);
  const syncMark = parseSyncMark(playlogImages);

  return historyRecordSchema.parse({
    title,
    chartType,
    difficulty,
    score,
    dxScore,
    dxScoreMax,
    comboMark,
    syncMark,
    trackNo,
    playedAt,
  });
}
