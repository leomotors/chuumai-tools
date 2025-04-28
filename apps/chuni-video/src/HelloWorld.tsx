import { Img, OffthreadVideo, staticFile } from "remotion";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

import { FC } from "react";

export const HelloWorld: FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Fade in and out
  const opacity = interpolate(
    frame,
    [0, 30, durationInFrames - 30, durationInFrames],
    [0, 1, 1, 0],
  );

  const backgroundUrl = staticFile("chuni-web/verse_bg.webp");
  const verseLogo = staticFile("chuni-web/verse_logo.webp");
  const rickroll = staticFile("rickroll.webm");

  // A <AbsoluteFill> is just a absolutely positioned <div>!
  return (
    <AbsoluteFill>
      <AbsoluteFill>
        <Img src={backgroundUrl} className="w-full" />
      </AbsoluteFill>
      <AbsoluteFill
        className="bg-cover bg-center bg-no-repeat flex flex-row gap-8 p-8"
        style={{ opacity }}
      >
        <aside className="flex flex-col gap-8 flex-2/3">
          <OffthreadVideo src={rickroll} volume={opacity} />

          <div className="bg-white/40 p-16 flex-1">
            <p className="text-6xl">เพลงนี้ดีมาก</p>
          </div>
        </aside>

        <main className="flex flex-col gap-8 flex-1/3">
          <header className="flex justify-between bg-white/40 p-8">
            <div className="font-bold text-5xl flex flex-col gap-2 justify-evenly">
              <p>Rating #3</p>
              <p>Best #2</p>
            </div>

            <Img src={verseLogo} className="w-48 self-end" />
          </header>

          <article className="bg-[#bf6aff] p-8 flex-1 flex flex-col gap-8">
            <section className="flex gap-8">
              <Img
                className="flex-3/5"
                src="https://s3.lmhome.dev/chunithm/musicImages/0e32fa085f54f59c.jpg"
              />

              <div className="flex flex-col gap-8 flex-2/5">
                <p className="font-bold text-5xl text-center">MASTER</p>

                <div className="bg-white p-2 flex-1 flex flex-col gap-2 font-helvetica">
                  <p className="text-4xl font-bold text-center">LEVEL</p>

                  <div className="bg-[#042436] flex-1 flex items-center justify-center">
                    <p className="text-white font-bold">
                      <span className="text-8xl">15</span>
                      <span className="text-6xl">.7</span>
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-white/80 flex-1 flex flex-col justify-between items-center p-4 gap-4 font-helvetica">
              <div className="flex flex-col gap-2 items-center w-full">
                <p className="text-5xl">Forsaken Tale</p>
                <hr className="w-full" />
                <p className="text-5xl">t+pazolite</p>
              </div>

              <div className="flex flex-col w-full gap-4">
                <p className="font-bold text-5xl self-start">SCORE 1,010,000</p>
                <p className="font-bold text-5xl self-start">RATING 17.85</p>
              </div>
            </section>

            <section className="flex justify-evenly">
              {/* Scale x2.5 */}
              <div className="w-[160px] h-[45px] border-2 border-gray-300 bg-gray-200" />
              <Img
                src={staticFile(`/chuni-web/rankmark/13.png`)}
                alt="Rank Mark"
                className="w-[160px] h-[45px]"
              />
              {/* <div className="w-[160px] h-[45px] border-2 border-gray-300 bg-gray-200" /> */}
              <Img
                src={staticFile(`/chuni-web/lampmark/ajc.png`)}
                alt="Rank Mark"
                className="w-[160px] h-[45px]"
              />
              {/* <div className="w-[160px] h-[45px] border-2 border-gray-300 bg-gray-200" /> */}
            </section>
          </article>
        </main>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
