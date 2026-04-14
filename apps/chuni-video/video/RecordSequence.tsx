import { Sequence } from "remotion";
import { RecordView } from "./RecordView";
import { Intro } from "./Intro";
import { Outro } from "./Outro";
import { z } from "zod";
import { recordSequenceSchema } from "./types";

export type RecordSequenceProps = z.infer<typeof recordSequenceSchema> & {
  generatorVersion?: string;
};

export const RecordSequence: React.FC<RecordSequenceProps> = ({
  songs,
  videoMapping,
  videoConfig,
  intro,
  outro,
  generatorVersion,
}) => {
  const durationPerSong = videoConfig.durationPerSong * 60;
  const introDuration = intro ? intro.durationSeconds * 60 : 0;
  const outroDuration = outro ? outro.durationSeconds * 60 : 0;
  const crossfadeFrames = 30;

  const songsFrom = introDuration > 0 ? introDuration - crossfadeFrames : 0;

  return (
    <>
      {intro && (
        <Sequence durationInFrames={introDuration}>
          <Intro intro={intro} version={songs[0]?.version ?? "XVRS"} />
        </Sequence>
      )}

      {songs.map((song, index) => {
        const videoData = videoMapping.find(
          (v) =>
            v.id === song.chart.id && v.difficulty === song.chart.difficulty,
        )!;

        return (
          <Sequence
            key={index}
            from={songsFrom + index * durationPerSong}
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

      {outro && (
        <Sequence
          from={songsFrom + songs.length * durationPerSong - crossfadeFrames}
          durationInFrames={outroDuration}
        >
          <Outro
            outro={outro}
            version={songs[songs.length - 1]?.version ?? "XVRS"}
          />
        </Sequence>
      )}
    </>
  );
};
