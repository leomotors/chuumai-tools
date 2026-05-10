<script lang="ts" module>
  export type SparklineProps = {
    values: number[];
    color: string;
    height?: number;
  };
</script>

<script lang="ts">
  let { values, color, height = 28 }: SparklineProps = $props();

  const W = 100;

  const paths = $derived.by(() => {
    if (values.length === 0) return { line: "", area: "" };
    const min = Math.min(...values);
    const max = Math.max(...values);
    const H = height;
    let line = "";
    values.forEach((v, i) => {
      const x = values.length === 1 ? W / 2 : (i / (values.length - 1)) * W;
      const y =
        max === min ? H / 2 : H - ((v - min) / (max - min)) * (H - 2) - 1;
      line += (i === 0 ? "M" : "L") + x.toFixed(1) + "," + y.toFixed(1);
    });
    const area = `${line} L${W},${H} L0,${H} Z`;
    return { line, area };
  });
</script>

<svg
  viewBox={`0 0 ${W} ${height}`}
  preserveAspectRatio="none"
  style:width="100%"
  style:height={`${height}px`}
  style:display="block"
>
  <path d={paths.area} fill={color} opacity="0.12" />
  <path
    d={paths.line}
    fill="none"
    stroke={color}
    stroke-width="1.5"
    stroke-linejoin="round"
    stroke-linecap="round"
  />
</svg>
