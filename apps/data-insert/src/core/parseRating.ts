export function parseRating(fileContent: string, maxRating: number) {
  const lines = fileContent.split("\n").filter((line) => line.trim() !== "");

  const records = lines.map((line) => {
    const [timestampStr, ratingStr] = line.split(",");
    const rating = parseInt(ratingStr, 10);
    const timestamp = new Date(timestampStr);

    if (isNaN(rating) || rating < 0 || rating > maxRating) {
      throw new Error(
        `Invalid rating value: ${ratingStr} at timestamp ${timestampStr}`,
      );
    }

    if (
      isNaN(timestamp.getTime()) ||
      timestamp.getTime() < new Date("2000-01-01").getTime() ||
      timestamp.getTime() > new Date().getTime()
    ) {
      throw new Error(`Invalid timestamp value: ${timestampStr}`);
    }

    return {
      rating,
      timestamp,
    };
  });

  return records;
}
