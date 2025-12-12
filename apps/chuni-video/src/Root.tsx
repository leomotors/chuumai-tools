import "./index.css";

import { Composition } from "remotion";

import { RecordView, recordViewSchema } from "./RecordView";

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
        defaultProps={{
          version: "XVRS",
          chart: {
            id: 0,
            title: "Forsaken Tale",
            artist: "t+pazolite",
            difficulty: "master",
            score: 1010000,
            clearMark: "BRAVE",
            fc: true,
            aj: true,
            isHidden: false,
            constant: 15.7,
            constantSure: true,
            rating: 17.85,
            image: "0e32fa085f54f59c.jpg",
          },
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
