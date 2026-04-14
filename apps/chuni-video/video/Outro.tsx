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
import { outroCompositionSchema } from "./types";

type OutroProps = z.infer<typeof outroCompositionSchema>;

export const Outro: FC<OutroProps> = ({ outro, version }) => {
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
  const imageUrl = staticFile("files/" + outro.imagePath);

  return (
    <AbsoluteFill>
      <AbsoluteFill>
        <Img src={backgroundImg} className="w-full" />
      </AbsoluteFill>
      <AbsoluteFill
        className="flex items-center justify-center p-24"
        style={{ opacity }}
      >
        <Img src={imageUrl} className="max-w-full max-h-full object-contain" />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
