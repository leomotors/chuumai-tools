import { downloadMusicData } from "./functions/music-data";

const command = process.argv[2];

if (command === "music") {
  if (!process.argv[3]) {
    console.log("Please provide a version");
    process.exit(1);
  }

  await downloadMusicData(process.argv[3]);
} else {
  console.log(`Unknown Command: ${command}`);
  process.exit(1);
}
