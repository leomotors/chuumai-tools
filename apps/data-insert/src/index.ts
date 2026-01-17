import { insertMaimaiRating } from "./functions/insertMaimaiRating";

const command = process.argv[2];

if (command === "rating-maimai") {
  await insertMaimaiRating();
  console.log("\n✅ Insert Maimai Rating Completed\n");
} else {
  console.log(`Unknown Command: ${command}`);
  process.exit(1);
}
