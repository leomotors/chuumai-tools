import { JSDOM } from "jsdom";

export function parseRatingImage(url: string) {
  const rating = url.split("_").at(-1)?.split(".")[0];

  const parsed = parseInt(rating!);
  if (isNaN(parsed)) {
    throw new Error("Invalid rating image URL");
  }

  return parsed;
}

export function getRatingImages(dom: JSDOM) {
  const imageList = dom.window.document.querySelectorAll(
    ".player_rating_num_block > img",
  );

  const imageArray = [...imageList] as HTMLImageElement[];

  return imageArray.map((img) => img.src);
}

export function parseCurrentRating(dom: JSDOM) {
  const imageUrls = getRatingImages(dom);

  const ratings = imageUrls.map(parseRatingImage);

  // Last two value are decimal places
  const hundredth = ratings.pop()!;
  const tenth = ratings.pop()!;

  return parseFloat(`${ratings.join("")}.${tenth}${hundredth}`);
}
