import createClient from "openapi-fetch";
import { ChuniWeb } from "@repo/api-types";
import { getRenderYaml } from "../shared";
import fs from "node:fs/promises";
import { dump } from "js-yaml";

export async function yaml() {
  if (!process.env.CHUNI_WEB_API_KEY) {
    throw new Error("CHUNI_WEB_API_KEY is not set");
  }

  const client = createClient<ChuniWeb.Paths>({
    baseUrl: "http://localhost:5173",
    headers: {
      Authorization: `Bearer ${process.env.CHUNI_WEB_API_KEY}`,
    },
  });

  const { data, error } = await client.GET("/api/users/forRating");

  if (!data) {
    console.log(error);
    throw new Error("No data returned");
  }

  const { data: songData, error: songError } = await client.GET(
    "/api/musicData",
    {
      params: {
        query: {
          version: "XVRS",
        },
      },
    },
  );

  if (!songData) {
    console.log(songError);
    throw new Error("No song data returned");
  }

  const renderConfig = await getRenderYaml(false);

  const ratingSorted = [
    ...data.best.map((d, index) => ({
      ...d,
      type: "best" as const,
      rankInType: index,
    })),
    ...data.current.map((d, index) => ({
      ...d,
      type: "current" as const,
      rankInType: index,
    })),
  ].sort((a, b) => {
    if (a.rating !== b.rating) {
      return (b.rating || 0) - (a.rating || 0);
    }

    if (a.type !== b.type) {
      return a.type === "best" ? -1 : 1; // Best ranks higher than Current if ratings are equal
    }

    return a.rankInType - b.rankInType; // Lower rankInType ranks higher
  });

  renderConfig.songs = [
    ...data.best.map((entry, index) => ({
      version: data.version,
      chart: {
        ...entry,
        artist: songData.find((s) => s.id === entry.id)?.artist || "Unknown",
      },
      detail: {
        comment:
          renderConfig.songs.find(
            (s) =>
              s.chart.id === entry.id &&
              s.chart.difficulty === entry.difficulty,
          )?.detail.comment || "",
        rankType: "Best" as const,
        rankInType: index + 1,
        rankTotal:
          ratingSorted.findIndex(
            (e) => e.id === entry.id && e.difficulty === entry.difficulty,
          ) + 1,
      },
    })),
    ...data.current.map((entry, index) => ({
      version: data.version,
      chart: {
        ...entry,
        artist: songData.find((s) => s.id === entry.id)?.artist || "Unknown",
      },
      detail: {
        comment:
          renderConfig.songs.find(
            (s) =>
              s.chart.id === entry.id &&
              s.chart.difficulty === entry.difficulty,
          )?.detail.comment || "",
        rankType: "Current" as const,
        rankInType: index + 1,
        rankTotal:
          ratingSorted.findIndex(
            (e) => e.id === entry.id && e.difficulty === entry.difficulty,
          ) + 1,
      },
    })),
  ].sort((a, b) => b.detail.rankTotal - a.detail.rankTotal);

  renderConfig.videoMapping = [
    ...renderConfig.videoMapping,
    ...[...data.best, ...data.current]
      .filter(
        (d) =>
          renderConfig.videoMapping.find(
            (vm) => vm.id === d.id && vm.difficulty === d.difficulty,
          ) === undefined,
      )
      .map((d) => ({
        id: d.id,
        title: d.title,
        difficulty: d.difficulty,
        url: "",
        offset: 0,
        volumeMultiplier: 0.5,
      })),
  ];
  renderConfig.videoMapping.sort((a, b) => a.id - b.id);

  const yamlContent = dump(renderConfig, { lineWidth: -1 });
  await fs.writeFile("temp/songs.yaml", yamlContent, "utf-8");
  console.log("Updated temp/songs.yaml with latest data");
}
