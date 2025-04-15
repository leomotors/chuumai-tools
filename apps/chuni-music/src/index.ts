import { downloadMusicData } from "./functions/music-data";

const command = process.argv[2];

if (command === "music") {
  await downloadMusicData();
} else {
  console.log(`Unknown Command: ${command}`);
  process.exit(1);
}
