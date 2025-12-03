import { db } from "./db.js";
import { downloadMusicData } from "./steps/1-music-data";
import { updateMusicConstant } from "./steps/2-music-constant.js";

const command = process.argv[2];

if (command === "music") {
  if (!process.argv[3]) {
    console.log("Please provide a version");
    process.exit(1);
  }

  const version = process.argv[3];
  await downloadMusicData(version);
  await updateMusicConstant(version);
  console.log("\n✅ All steps completed\n");
  await db.$client.end();
  console.log("✅ Database connection closed");
} else {
  console.log(`Unknown Command: ${command}`);
  process.exit(1);
}
