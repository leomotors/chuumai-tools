import { Routes } from "discord-api-types/v10";

const endpoint = "https://discord.com/api/v10";

export async function sendImage(
  discordToken: string,
  channelId: string,
  content: string,
  blob: Blob,
  fileName = "image.jpg",
) {
  console.log(
    `Sending message and image with size of ${(blob.size / 1024).toFixed(3)} kB to Discord...`,
  );

  const formData = new FormData();
  formData.append("content", content);
  formData.append("files", blob, fileName);

  const res = await fetch(endpoint + Routes.channelMessages(channelId), {
    method: "POST",
    headers: {
      Authorization: `Bot ${discordToken}`,
    },
    body: formData,
  });

  if (!res.ok) {
    console.error(`Discord API Failed ${res.status} ${res.statusText}`);
    console.error(await res.text().catch());
  }
}
