import { S3Client } from "@aws-sdk/client-s3";
import cliProgress from "cli-progress";
import { PgInsertValue } from "drizzle-orm/pg-core";

import { musicDataTable, musicLevelTable } from "@repo/db-chuni/schema";
import { downloadImage, listFilesInFolder, uploadImage } from "@repo/utils/s3";

import { db } from "../db.js";
import { environment } from "../environment.js";
import { musicJsonSchema } from "../types.js";
import { updateMusicConstant } from "./utils/music-constant.js";

const url = "https://chunithm.sega.jp/storage/json/music.json";
const s3Folder = "musicImages";

// async function uploadImage(s3: S3Client, image: string) {
//   const downloadUrl = `https://new.chunithm-net.com/chuni-mobile/html/mobile/img/${image}`;

//   const response = await fetch(downloadUrl);
//   if (!response.ok) {
//     throw new Error(`Failed to fetch image from ${downloadUrl}`);
//   }
//   const imageBuffer = await response.arrayBuffer();

//   const uploadParams = {
//     Bucket: environment.AWS_BUCKET_NAME,
//     Key: `${s3Folder}/${image}`,
//     Body: Buffer.from(imageBuffer),
//     ContentType: "image/jpeg",
//   };

//   const command = new PutObjectCommand(uploadParams);
//   await s3.send(command);
// }

export async function downloadMusicData(version: string) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch music data");
  }
  const data = await response.json();

  const stdMusicData = musicJsonSchema.parse(data).filter((m) => m.lev_bas);

  const existingMusicData = await db.select().from(musicDataTable);
  const existingIdSet = new Set(existingMusicData.map((m) => m.id));

  const newMusicData = stdMusicData.filter((m) => !existingIdSet.has(m.id));

  const s3 = new S3Client({
    endpoint: environment.AWS_ENDPOINT,
    region: environment.AWS_REGION,
    credentials: {
      accessKeyId: environment.AWS_ACCESS_KEY_ID,
      secretAccessKey: environment.AWS_SECRET_ACCESS_KEY,
    },
    // minio
    forcePathStyle: true,
  });

  if (newMusicData.length > 0) {
    await db.insert(musicDataTable).values(
      newMusicData.map((m) => ({
        id: m.id,
        category: m.catname,
        title: m.title,
        artist: m.artist,
        image: m.image,
      })),
    );
    console.log(`Successfully inserted ${newMusicData.length} new music data`);
  }

  // List all objects from folder `s3Folder`
  const contents = await listFilesInFolder(
    s3,
    environment.AWS_BUCKET_NAME,
    s3Folder,
  );
  const existingImages = contents.map((item) => item.split("/").pop()!);
  const newImages = stdMusicData
    .map((m) => m.image)
    .filter((image) => !existingImages.includes(image));
  console.log(`New images count: ${newImages.length}`);

  const progress = new cliProgress.SingleBar(
    {},
    cliProgress.Presets.shades_classic,
  );
  progress.start(newImages.length, 0);

  for (let i = 0; i < newImages.length; i++) {
    const imageBuffer = await downloadImage(
      `https://new.chunithm-net.com/chuni-mobile/html/mobile/img/${newImages[i]}`,
    );
    await uploadImage({
      s3,
      bucketName: environment.AWS_BUCKET_NAME,
      folder: s3Folder,
      imageName: newImages[i],
      buffer: Buffer.from(imageBuffer),
      contentType: "image/jpeg",
    });
    progress.update(i + 1);
  }

  progress.stop();

  // Section: Chart Level
  const existingChartLevel = await db.select().from(musicLevelTable);

  const payload = [] as PgInsertValue<typeof musicLevelTable>[];
  for (const music of stdMusicData) {
    const levels = [
      { difficulty: "basic" as const, level: music.lev_bas },
      { difficulty: "advanced" as const, level: music.lev_adv },
      { difficulty: "expert" as const, level: music.lev_exp },
      { difficulty: "master" as const, level: music.lev_mas },
      { difficulty: "ultima" as const, level: music.lev_ult },
    ];

    for (const l of levels) {
      if (l.level) {
        payload.push({
          musicId: music.id,
          difficulty: l.difficulty,
          level: l.level,
          version,
        });
      }
    }
  }

  for (const p of payload) {
    const result = existingChartLevel.find(
      (c) =>
        c.musicId === p.musicId &&
        c.difficulty === p.difficulty &&
        c.version === version,
    );
    if (result) {
      if (result.level !== p.level) {
        console.log(
          `Warning: Level mismatch for musicId ${p.musicId} and difficulty ${p.difficulty}. Existing level: ${result.level}, New level: ${p.level}`,
        );
      }
    }
  }

  if (payload.length > 0) {
    await db.insert(musicLevelTable).values(payload).onConflictDoNothing();
  }

  // Section: Chart Constant
  await updateMusicConstant(version);

  await db.$client.end();
}
