import { db } from "./db.js";
import { updateMusicConstant } from "./steps/music-constant.js";
import { downloadMusicData } from "./steps/music-data.js";
import { updateMusicConstantQman } from "./steps/music-qman.js";

const command = process.argv[2];

function validateVersion(version: string) {
  const EXPECTED_VERSIONS = ["CiRCLE"];
  if (!EXPECTED_VERSIONS.includes(version)) {
    console.log(
      `Invalid version. Expected one of: ${EXPECTED_VERSIONS.join(", ")}. Are you seeding correct game?`,
    );
    process.exit(1);
  }
}

if (command === "music") {
  if (!process.argv[3]) {
    console.log("Please provide a version");
    process.exit(1);
  }

  const version = process.argv[3];
  validateVersion(version);
  await downloadMusicData(version);
  console.log("\n✅ Download Music Data + Seed Level Completed\n");
} else if (command === "constant") {
  if (!process.argv[3]) {
    console.log("Please provide a version");
    process.exit(1);
  }

  const version = process.argv[3];
  validateVersion(version);
  await updateMusicConstant(version);
  console.log("\n✅ Update Music Constant Completed\n");
} else if (command === "constant-qman") {
  if (!process.argv[3]) {
    console.log("Please provide a version");
    process.exit(1);
  }

  const version = process.argv[3];
  validateVersion(version);
  await updateMusicConstantQman(version);
  console.log("\n✅ Update Music Constant Completed\n");
} else {
  console.log(`Unknown Command: ${command}`);
  process.exit(1);
}

await db.$client.end();
console.log("✅ Database connection closed");
