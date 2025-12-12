<script lang="ts">
  import { calculateRating } from "@repo/core/chuni";
  import { Button } from "@repo/ui/atom/button";
  import * as Card from "@repo/ui/atom/card";
  import { Input } from "@repo/ui/atom/input";
  import { Label } from "@repo/ui/atom/label";
  import * as Tabs from "@repo/ui/atom/tabs";

  let overpower = $state<string>("");
  let offset = $state<string>("");
  let lamp = $state<"none" | "fc" | "aj">("none");
  let score = $state<number>(0);

  let result = $state<string | null>(null);
  let lampOffset = $state<number>(0);
  let sssOffset = $state<number>(0);
  let ratingOffset = $state<number>(0);

  let explanation = $state<string>("");
  let summary = $state<string>("");
  let chartConstant = $state<string>("");
  let errorMessage = $state<string>("");

  function handleCalculate() {
    // Placeholder calculation logic
    result = `Calculated with Overpower: ${overpower}, Offset: ${offset}, Lamp: ${lamp.toUpperCase()}, Score: ${score}`;

    lampOffset =
      score === 1010000 ? 1.25 : lamp === "aj" ? 1 : lamp === "fc" ? 0.5 : 0;
    sssOffset = score > 1007500 ? (score - 1007500) * 0.0015 : 0;

    if (score < 900000) {
      errorMessage =
        "Calculation for score less than A is currently not supported.";
      summary = "";
      return;
    }

    ratingOffset = score >= 1007500 ? 2 : calculateRating(score, 0);

    explanation = `Overpower = ${overpower + offset}
Lamp Offset = ${lampOffset}
SSS Offset = ${sssOffset}
Rating Offset = ${ratingOffset}`;

    summary = `Calculation = (${overpower + offset} - ${lampOffset} - ${sssOffset}) / 5 - ${ratingOffset}`;
    const cc =
      (parseFloat(overpower) +
        parseFloat(offset || "0") -
        lampOffset -
        sssOffset) /
        5 -
      ratingOffset;
    chartConstant = `${cc.toFixed(1)} (${cc.toFixed(4)})`;
  }

  function handleReset() {
    overpower = "";
    offset = "";
    lamp = "none";
    score = 0;
    summary = "";
    errorMessage = "";
  }
</script>

<main
  class="flex min-h-screen w-screen flex-col items-center gap-6 bg-gray-50 px-4 pb-16 pt-32 font-app"
>
  <div class="w-full max-w-2xl">
    <h1 class="mb-2 text-center text-3xl font-bold text-gray-800">
      Chart Constant Calculator
    </h1>
    <p class="mb-8 text-center text-gray-600">
      Calculate chart constants based on overpower data
    </p>

    <Card.Root class="shadow-lg border-black/20">
      <Card.Content class="space-y-6 pt-6">
        <!-- Line 1: Overpower and Offset -->
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div class="space-y-2">
            <Label for="overpower">Overpower</Label>
            <Input
              id="overpower"
              type="number"
              step="0.01"
              placeholder="XX.XX"
              bind:value={overpower}
            />
          </div>
          <div class="space-y-2">
            <Label for="offset">Offset</Label>
            <Input
              id="offset"
              type="number"
              step="0.01"
              placeholder="-XX.XX"
              bind:value={offset}
            />
          </div>
        </div>

        <!-- Line 2: Lamp and Score -->
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div class="space-y-2">
            <Label>Lamp</Label>
            <Tabs.Root bind:value={lamp} class="w-full">
              <Tabs.List class="grid w-full grid-cols-3">
                <Tabs.Trigger value="none">None</Tabs.Trigger>
                <Tabs.Trigger value="fc">FC</Tabs.Trigger>
                <Tabs.Trigger value="aj">AJ</Tabs.Trigger>
              </Tabs.List>
            </Tabs.Root>
          </div>
          <div class="space-y-2">
            <Label for="score">Score</Label>
            <Input
              id="score"
              type="number"
              placeholder="X,XXX,XXX"
              bind:value={score}
              min={0}
              max={1_010_000}
            />
          </div>
        </div>

        <!-- Buttons -->
        <div class="flex flex-col gap-3 sm:flex-row">
          <Button
            class="flex-1"
            onclick={handleCalculate}
            disabled={!overpower || !score}
          >
            Calculate
          </Button>
          <Button variant="secondary" class="flex-1" onclick={handleReset}>
            Reset
          </Button>
        </div>

        <!-- Error Display -->
        {#if errorMessage}
          <Card.Root class="border-red-200 bg-red-50">
            <Card.Header>
              <Card.Title class="text-lg text-red-900">Error</Card.Title>
            </Card.Header>
            <Card.Content>
              <p class="text-sm text-red-800">{errorMessage}</p>
            </Card.Content>
          </Card.Root>
        {/if}

        <!-- Result Display -->
        {#if result && !errorMessage}
          <Card.Root class="border-blue-200 bg-blue-50">
            <Card.Header>
              <Card.Title class="text-lg text-blue-900">Result</Card.Title>
            </Card.Header>
            <Card.Content class="text-sm text-blue-800">
              <p class="whitespace-pre-wrap">{explanation}</p>
              <pre class="mt-2 whitespace-pre-wrap">{summary}</pre>
              <p class="font-bold text-base">
                Chart Constant = {chartConstant}
              </p>
            </Card.Content>
          </Card.Root>
        {/if}
      </Card.Content>
    </Card.Root>
  </div>
</main>
