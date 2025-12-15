import { Sequence } from "remotion";
import { RecordView } from "./RecordView";
import { z } from "zod";
import { recordSequenceSchema } from "./types";

export type RecordSequenceProps = z.infer<typeof recordSequenceSchema>;

export const RecordSequence: React.FC<RecordSequenceProps> = ({
  songs,
  videoMapping,
}) => {
  const durationPerSong = 600; // 10 seconds at 60fps

  return (
    <>
      {songs.map((song, index) => (
        <Sequence
          key={index}
          from={index * durationPerSong}
          durationInFrames={durationPerSong}
        >
          <RecordView
            {...song}
            video={videoMapping.find((v) => v.id === song.chart.id)!}
          />
        </Sequence>
      ))}
    </>
  );
};
