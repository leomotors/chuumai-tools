export function parseMusic(element: Element) {
  const musicTitle = element.querySelector(".music_title")!.textContent!;

  const score = element.querySelector(
    ".play_musicdata_highscore .text_b",
  )!.textContent!;

  const scoreNumber = parseInt(score.replace(/,/g, ""));

  const difficulty = element
    .querySelector("input[name=diff]")!
    .getAttribute("value")!;

  const musicIdx = element
    .querySelector("input[name=idx]")!
    .getAttribute("value")!;

  return {
    musicId: parseInt(musicIdx),
    musicTitle,
    score: scoreNumber,
    difficulty: parseInt(difficulty),
  };
}
