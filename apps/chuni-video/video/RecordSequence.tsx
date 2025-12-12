import { Sequence } from "remotion";
import { RecordView, recordViewWithoutVideoSchema } from "./RecordView";
import { z } from "zod";

export const videoMappingSchema = z.array(
  z.object({
    id: z.coerce.number(),
    title: z.string(),
    url: z.string(),
    offset: z.number(),
  }),
);

export const recordSequenceSchema = z.object({
  songs: z.array(recordViewWithoutVideoSchema),
  videoMapping: videoMappingSchema,
});

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
