import "./index.css";

import { Composition } from "remotion";

import { RecordView } from "./RecordView";
import { RecordSequence, RecordSequenceProps } from "./RecordSequence";
import { Intro } from "./Intro";
import { Outro } from "./Outro";
import { example2Data, example2NoVideo, exampleDataNoVideo } from "./example";
import {
  introCompositionSchema,
  outroCompositionSchema,
  recordSequenceSchema,
  recordViewSchema,
} from "./types";

// Each <Composition> is an entry in the sidebar!

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        // You can take the "id" to render a video:
        // npx remotion render src/index.ts <id> out/video.mp4
        id="RecordView"
        component={RecordView}
        durationInFrames={600}
        fps={60}
        width={1920}
        height={1080}
        // You can override these props for each render:
        // https://www.remotion.dev/docs/parametrized-rendering
        schema={recordViewSchema}
        defaultProps={example2Data}
      />

      <Composition
        id="RecordSequence"
        component={RecordSequence}
        calculateMetadata={({ props }) => {
          const fps = 60;
          const typedProps = props as RecordSequenceProps;
          const crossfadeFrames = 30;

          const songsDuration =
            typedProps.songs.length *
            fps *
            typedProps.videoConfig.durationPerSong;
          const introDuration = typedProps.intro
            ? typedProps.intro.durationSeconds * fps
            : 0;
          const outroDuration = typedProps.outro
            ? typedProps.outro.durationSeconds * fps
            : 0;

          // Crossfade overlaps: intro overlaps with first song, last song overlaps with outro
          const introOverlap = introDuration > 0 ? crossfadeFrames : 0;
          const outroOverlap = outroDuration > 0 ? crossfadeFrames : 0;

          return {
            durationInFrames:
              introDuration +
              songsDuration +
              outroDuration -
              introOverlap -
              outroOverlap,
          };
        }}
        fps={60}
        width={1920}
        height={1080}
        schema={recordSequenceSchema}
        defaultProps={{
          songs: [exampleDataNoVideo, example2NoVideo],
          videoMapping: [
            {
              id: 2652,
              title: "Forsaken Tale",
              difficulty: "master",
              url: "rickroll.webm",
              offset: 50,
              volumeMultiplier: 0.5,
            },
            {
              id: 1086,
              title: "祈 -我ら神祖と共に歩む者なり-",
              difficulty: "master",
              url: "rickroll.webm",
              offset: 50,
              volumeMultiplier: 0.5,
            },
          ],
          videoConfig: { durationPerSong: 10 },
          intro: {
            lines: ["Chunithm X-VERSE-X", "Rating 16.75", "on 2026/04/03"],
            durationSeconds: 5,
          },
          outro: {
            imagePath: "best-1675.png",
            durationSeconds: 5,
          },
        }}
      />

      <Composition
        id="Intro"
        component={Intro}
        durationInFrames={300}
        fps={60}
        width={1920}
        height={1080}
        schema={introCompositionSchema}
        defaultProps={{
          intro: {
            lines: ["Chunithm X-VERSE-X", "Rating 16.75", "on 2026/04/03"],
            durationSeconds: 5,
          },
          version: "XVRS",
        }}
      />

      <Composition
        id="Outro"
        component={Outro}
        durationInFrames={300}
        fps={60}
        width={1920}
        height={1080}
        schema={outroCompositionSchema}
        defaultProps={{
          outro: {
            imagePath: "best-1675.png",
            durationSeconds: 5,
          },
          version: "XVRS",
        }}
      />
    </>
  );
};
