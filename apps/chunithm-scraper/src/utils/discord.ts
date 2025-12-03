import { Routes } from "discord-api-types/v10";

import { Environment, environment } from "../environment.js";
import { logger } from "./logger.js";

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

export type BlobFileList = Array<{
  blob: Blob;
  fileName?: string;
}>;

export async function sendFiles(
  content: string | undefined,
  files: BlobFileList,
) {
  if (!webhookEnabled(environment) && !discordBotEnabled(environment)) {
    logger.warn(
      "Neither Discord Webhook nor Discord Bot is enabled. Skipping Discord image sending.",
    );
    return;
  }

  const sizeOfEachFileKbs = files.map((f) => f.blob.size / 1024);

  logger.log(
    `Sending message and files with size of ${sizeOfEachFileKbs.map((s) => s.toFixed(3)).join(", ")} kB to Discord using ${webhookEnabled(environment) ? "Webhook" : "Discord Bot"}`,
  );

  const formData = new FormData();

  if (content) {
    formData.append("content", content);
  }

  files.forEach(({ blob, fileName }, index) => {
    formData.append(`files[${index}]`, blob, fileName);
  });

  const res = await fetch(getURL(environment), {
    method: "POST",
    headers: getHeaders(environment),
    body: formData,
  });

  if (!res.ok) {
    logger.error(`Discord API Failed ${res.status} ${res.statusText}`);
    logger.error(await res.text().catch());
  }
}
