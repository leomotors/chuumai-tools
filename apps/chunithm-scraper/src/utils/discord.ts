import { Routes } from "discord-api-types/v10";

import { Environment, environment } from "../environment";

const endpoint = "https://discord.com/api/v10";

type WebhookEnabled = Environment &
  Required<Pick<Environment, "DISCORD_WEBHOOK_URL">>;
type DiscordBotEnabled = Environment &
  Required<Pick<Environment, "DISCORD_TOKEN" | "CHANNEL_ID">>;

function webhookEnabled(env: Environment): env is WebhookEnabled {
  return !!env.DISCORD_WEBHOOK_URL;
}

function discordBotEnabled(env: Environment): env is DiscordBotEnabled {
  return !!env.DISCORD_TOKEN && !!env.CHANNEL_ID;
}

function getURL(env: WebhookEnabled | DiscordBotEnabled): string {
  if (webhookEnabled(env)) {
    return env.DISCORD_WEBHOOK_URL;
  } else {
    return endpoint + Routes.channelMessages(env.CHANNEL_ID);
  }
}

function getHeaders(
  env: WebhookEnabled | DiscordBotEnabled,
): HeadersInit | undefined {
  if (webhookEnabled(env)) {
    return undefined;
  } else {
    return {
      Authorization: `Bot ${env.DISCORD_TOKEN}`,
    };
  }
}

export async function sendImage(
  content: string,
  blob: Blob,
  fileName = "image.jpg",
) {
  if (!webhookEnabled(environment) && !discordBotEnabled(environment)) {
    console.warn(
      "Neither Discord Webhook nor Discord Bot is enabled. Skipping Discord image sending.",
    );
    return;
  }

  console.log(
    `Sending message and image with size of ${(blob.size / 1024).toFixed(3)} kB to Discord using ${webhookEnabled(environment) ? "Webhook" : "Discord Bot"}`,
  );

  const formData = new FormData();
  formData.append("content", content);
  formData.append("files", blob, fileName);

  const res = await fetch(getURL(environment), {
    method: "POST",
    headers: getHeaders(environment),
    body: formData,
  });

  if (!res.ok) {
    console.error(`Discord API Failed ${res.status} ${res.statusText}`);
    console.error(await res.text().catch());
  }
}
