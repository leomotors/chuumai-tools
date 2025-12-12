import { Img, OffthreadVideo, staticFile } from "remotion";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

import {
  backgroundMapping,
  logoMapping,
} from "../../chuni-web/src/lib/constants/pureMapping";

import { FC } from "react";
import { z } from "zod";
import { cn } from "@repo/ui/utils";
import { difficultyColorMap, getLamp, getRank } from "@repo/utils/chuni";
import {
  clearMarkValues,
  stdChartDifficultyValues,
} from "@repo/db-chuni/schema";

// Remotion only supports zod v3
export const chartForVideoSchemaZod3 = z.object({
  id: z.coerce.number(),
  title: z.string().nonempty(),
  artist: z.string(),
  difficulty: z.enum(stdChartDifficultyValues),
  score: z.coerce.number().int().min(0).max(1010000),
  clearMark: z.enum(clearMarkValues).nullish(),
  fc: z.boolean().default(false),
  aj: z.boolean().default(false),
  constant: z.number(),
  constantSure: z.boolean(),
  rating: z.number().nullable(),
  image: z.string().nullable(),
});

export const videoSchema = z.object({
  url: z.string(),
  offset: z.number(),
});

export const detailSchema = z.object({
  comment: z.string(),
  rankType: z.enum(["Best", "Current"]),
  rankInType: z.number(),
  rankTotal: z.number(),
});

export const recordViewWithoutVideoSchema = z.object({
  version: z.string(),
  chart: chartForVideoSchemaZod3,
  detail: detailSchema,
});

export const recordViewSchema = recordViewWithoutVideoSchema.extend({
  video: videoSchema,
});

type RecordViewProps = z.infer<typeof recordViewSchema>;

export const RecordView: FC<RecordViewProps> = ({
  version,
  chart,
  video,
  detail,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Fade in and out
  const opacity = interpolate(
    frame,
    [0, 30, durationInFrames - 30, durationInFrames],
    [0, 1, 1, 0],
  );

  const backgroundImg = staticFile(
    "chuni-web" + backgroundMapping[version as keyof typeof backgroundMapping],
  );
  const versionLogo = staticFile(
    "chuni-web" + logoMapping[version as keyof typeof logoMapping],
  );
  const rickroll = staticFile(video.url);

  const lamp = getLamp(chart.score, chart.fc, chart.aj);

  // A <AbsoluteFill> is just a absolutely positioned <div>!
  return (
    <AbsoluteFill>
      <AbsoluteFill>
        <Img src={backgroundImg} className="w-full" />
      </AbsoluteFill>
      <AbsoluteFill
        className="bg-cover bg-center bg-no-repeat flex flex-row gap-8 p-8"
        style={{ opacity }}
      >
        <aside className="flex flex-col gap-8 flex-2/3">
          <OffthreadVideo
            src={rickroll}
            volume={opacity}
            trimBefore={video.offset * 60}
          />

          <div className="bg-white/40 p-16 flex-1">
            <p className="text-6xl">{detail.comment}</p>
          </div>
        </aside>

        <main className="flex flex-col gap-8 flex-1/3">
          <header className="flex justify-between bg-white/40">
            <div className="font-bold text-5xl flex flex-col gap-2 justify-evenly pl-8 py-8">
              <p>Rating #{detail.rankInType}</p>
              <p>
                {detail.rankType} #{detail.rankTotal}
              </p>
            </div>

            <Img src={versionLogo} className="h-48 self-end" />
          </header>

          <article
            className={cn(
              "p-8 flex-1 flex flex-col gap-8",
              difficultyColorMap[chart.difficulty],
            )}
          >
            <section className="flex gap-8">
              <Img
                className="flex-3/5"
                src={`https://s3.lmhome.dev/chunithm/musicImages/${chart.image}`}
              />

              <div className="flex flex-col gap-8 flex-2/5">
                <p className="font-bold text-5xl text-center">
                  {chart.difficulty.toUpperCase()}
                </p>

                <div className="bg-white p-2 flex-1 flex flex-col gap-2 font-helvetica">
                  <p className="text-4xl font-bold text-center text-black">
                    LEVEL
                  </p>

                  <div className="bg-[#042436] flex-1 flex items-center justify-center">
                    <p className="text-white font-bold">
                      <span className="text-8xl">
                        {Math.floor(chart.constant)}
                      </span>
                      <span className="text-6xl">
                        .
                        {chart.constantSure
                          ? (chart.constant % 1).toFixed(1).slice(2)
                          : "?"}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-white/80 flex-1 flex flex-col justify-between items-center p-4 gap-4 font-helvetica text-black">
              <div className="flex flex-col gap-2 items-center w-full">
                <p className="text-5xl">{chart.title}</p>
                <hr className="w-full" />
                <p className="text-5xl">{chart.artist}</p>
              </div>

              <div className="flex flex-col w-full gap-4">
                <p className="font-bold text-5xl self-start">
                  SCORE {chart.score.toLocaleString()}
                </p>
                <p className="font-bold text-5xl self-start">
                  RATING {chart.rating?.toFixed(2) || "??.??"}
                </p>
              </div>
            </section>

            <section className="flex justify-evenly">
              {/* Scale x2.5 */}
              {chart.clearMark ? (
                <Img
                  src={staticFile(
                    `/chuni-web/clearmark/${chart.clearMark.toLowerCase()}.png`,
                  )}
                  alt="Clear Mark"
                  className="w-40 h-11.25"
                />
              ) : (
                <div className="w-40 h-11.25 border-2 border-gray-300 bg-gray-200" />
              )}

              <Img
                src={staticFile(
                  `/chuni-web/rankmark/${getRank(chart.score)}.png`,
                )}
                alt="Rank Mark"
                className="w-40 h-11.25"
              />

              {lamp ? (
                <Img
                  src={staticFile(`/chuni-web/lampmark/${lamp}.png`)}
                  alt={`${lamp} Mark`}
                  className="w-40 h-11.25"
                />
              ) : (
                <div className="w-40 h-11.25 border-2 border-gray-300 bg-gray-200" />
              )}
            </section>
          </article>
        </main>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
