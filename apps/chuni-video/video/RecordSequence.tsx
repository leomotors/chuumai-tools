import { Sequence } from "remotion";
import { RecordView } from "./RecordView";
import { z } from "zod";
import { recordSequenceSchema } from "./types";

export type RecordSequenceProps = z.infer<typeof recordSequenceSchema> & {
  generatorVersion?: string;
};

export const RecordSequence: React.FC<RecordSequenceProps> = ({
  songs,
  videoMapping,
  videoConfig,
  generatorVersion,
}) => {
  const durationPerSong = videoConfig.durationPerSong * 60;

  return (
    <>
      {songs.map((song, index) => {
        const videoData = videoMapping.find(
          (v) =>
            v.id === song.chart.id && v.difficulty === song.chart.difficulty,
        )!;

        return (
          <Sequence
            key={index}
            from={index * durationPerSong}
            durationInFrames={durationPerSong}
          >
            <RecordView
              {...song}
              video={{
                url: videoData.url,
                offset: videoData.offset,
                volumeMultiplier: videoData.volumeMultiplier ?? 0.5,
              }}
              generatorVersion={generatorVersion}
            />
          </Sequence>
        );
      })}
    </>
  );
};
