import { db } from "./db.js";
import { updateMusicConstantBeer } from "./steps/constant-beer.js";
import { updateMusicConstantCsv } from "./steps/constant-csv.js";
import { updateMusicConstantZerataku } from "./steps/constant-zerataku.js";
import { downloadMusicData } from "./steps/music-data.js";

const command = process.argv[2];

if (command === "music") {
  if (!process.argv[3]) {
    console.log("Please provide a version");
    process.exit(1);
  }

  const version = process.argv[3];
  await downloadMusicData(version);
  console.log("\n✅ Download Music Data + Seed Level Completed\n");
} else if (command === "constant-zerataku") {
  if (!process.argv[3]) {
    console.log("Please provide a version");
    process.exit(1);
  }

  const version = process.argv[3];
  await updateMusicConstantZerataku(version);
  console.log(
    "\n✅ Update Music Constant from arcade-songs.zetaraku.dev Completed\n",
  );
} else if (command === "constant-csv") {
  if (!process.argv[3]) {
    console.log("Please provide a version");
    process.exit(1);
  }

  const version = process.argv[3];
  const filePath = process.argv[4];
  if (!filePath) {
    console.log("Please provide a file path");
    process.exit(1);
  }

  await updateMusicConstantCsv(version, filePath);
  console.log("\n✅ Update Music Constant from CSV Completed\n");
} else if (command === "constant-beer") {
  if (!process.argv[3]) {
    console.log("Please provide a version");
    process.exit(1);
  }

  const version = process.argv[3];
  await updateMusicConstantBeer(version);
  console.log(
    "\n✅ Update Music Constant from chuni-penguin.beerpsi.cc Completed\n",
  );
} else {
  console.log(`Unknown Command: ${command}`);
  process.exit(1);
}

await db.$client.end();
console.log("✅ Database connection closed");
