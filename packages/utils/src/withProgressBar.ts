import { Preset, SingleBar } from "@leomotors/cli-progress";

export async function forWithProgressBar(
  range: number,
  func: (i: number) => unknown,
) {
  const progress = new SingleBar({}, Preset.shadesClassic);
  progress.start(range, 0);

  for (let i = 0; i < range; i++) {
    await func(i);
    progress.update(i + 1);
  }

  progress.stop();
}

export async function forInRangeWithProgressBar<T>(
  range: T[],
  func: (item: T) => unknown,
) {
  await forWithProgressBar(range.length, (i) => {
    func(range[i]);
  });
}
