export const courseRankMapping = [
  // 0
  "初心者",
  "初段",
  "二段",
  "三段",
  "四段",
  "五段",
  "六段",
  "七段",
  "八段",
  "九段",
  "十段",
  // 11 - Somehow this is skipped
  "???",
  "真初段",
  "真二段",
  "真三段",
  "真四段",
  "真五段",
  "真六段",
  "真七段",
  "真八段",
  "真九段",
  "真十段",
  // 22
  "真皆伝",
  // 23?
  "裏皆伝",
];

export function getCourseRankName(rank: number) {
  return courseRankMapping[rank] || "???";
}

export const classRankMapping = [
  "B5",
  "B4",
  "B3",
  "B2",
  "B1",
  "A5",
  "A4",
  "A3",
  "A2",
  "A1",
  "S5",
  "S4",
  "S3",
  "S2",
  "S1",
  "SS5",
  "SS4",
  "SS3",
  "SS2",
  "SS1",
  "SSS5",
  "SSS4",
  "SSS3",
  "SSS2",
  "SSS1",
  "LEGEND",
];

export function getClassRankName(rank: number) {
  return classRankMapping[rank] || "???";
}
