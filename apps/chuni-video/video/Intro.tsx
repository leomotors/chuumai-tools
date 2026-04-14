import { Img, staticFile } from "remotion";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

import { backgroundMapping } from "../../chuni-web/src/lib/constants/pureMapping";

import { FC } from "react";
import { z } from "zod";
import { introCompositionSchema } from "./types";

type IntroProps = z.infer<typeof introCompositionSchema>;

export const Intro: FC<IntroProps> = ({ intro, version }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const opacity = interpolate(
    frame,
    [0, 30, durationInFrames - 30, durationInFrames],
    [0, 1, 1, 0],
  );

  const backgroundImg = staticFile(
    "chuni-web" + backgroundMapping[version as keyof typeof backgroundMapping],
  );

  return (
    <AbsoluteFill>
      <AbsoluteFill>
        <Img src={backgroundImg} className="w-full" />
      </AbsoluteFill>
      <AbsoluteFill
        className="flex items-center justify-center"
        style={{ opacity }}
      >
        <div className="flex flex-col items-center gap-6 p-16">
          {intro.lines.map((line, index) => (
            <p
              key={index}
              className="text-6xl text-white font-bold text-center"
              style={{
                textShadow:
                  "0 4px 12px rgba(0,0,0,0.8), 0 2px 4px rgba(0,0,0,0.6)",
              }}
            >
              {line}
            </p>
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
