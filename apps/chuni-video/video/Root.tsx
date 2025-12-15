import "./index.css";

import { Composition } from "remotion";

import { RecordView } from "./RecordView";
import { RecordSequence, RecordSequenceProps } from "./RecordSequence";
import { exampleData, exampleDataNoVideo } from "./example";
import { recordSequenceSchema, recordViewSchema } from "./types";

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
        defaultProps={exampleData}
      />

      <Composition
        id="RecordSequence"
        component={RecordSequence}
        calculateMetadata={({ props }) => {
          const fps = 60;
          const typedProps = props as RecordSequenceProps;

          return {
            durationInFrames:
              typedProps.songs.length *
              fps *
              typedProps.videoConfig.durationPerSong,
          };
        }}
        fps={60}
        width={1920}
        height={1080}
        schema={recordSequenceSchema}
        defaultProps={{
          songs: [exampleDataNoVideo, exampleDataNoVideo],
          videoMapping: [
            {
              id: 2652,
              title: "Forsaken Tale",
              difficulty: "master",
              url: "rickroll.webm",
              offset: 50,
            },
          ],
          videoConfig: { durationPerSong: 10 },
        }}
      />

      {/* Mount any React component to make it show up in the sidebar and work on it individually! */}
      {/* <Composition
        id="OnlyLogo"
        component={Logo}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          logoColor1: "#91dAE2" as const,
          logoColor2: "#86A8E7" as const,
        }}
      /> */}
    </>
  );
};
