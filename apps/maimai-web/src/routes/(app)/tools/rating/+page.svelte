<script lang="ts">
  import { calculateRating, getRankMultiplier } from "@repo/core/maimai";
  import { Button } from "@repo/ui/atom/button";
  import * as Card from "@repo/ui/atom/card";
  import { Input } from "@repo/ui/atom/input";
  import { Label } from "@repo/ui/atom/label";
  import * as Tabs from "@repo/ui/atom/tabs";

  let activeTab = $state<"forward" | "reverse">("forward");

  // Forward calculation: Level + Score -> Rating
  let level = $state<string>("");
  let score = $state<string>("");
  let rating = $state<number | null>(null);
  let displayLevel = $state<string>("");
  let displayScore = $state<string>("");

  // Reverse calculation: Score + Rating -> Level
  let reverseScore = $state<string>("");
  let reverseRating = $state<string>("");
  let calculatedLevel = $state<number | null>(null);
  let verifiedRating = $state<number | null>(null);
  let displayReverseScore = $state<string>("");
  let displayReverseRating = $state<string>("");

  function calculateLevel(score: number, targetRating: number): number {
    const multiplier = getRankMultiplier(score);
    if (multiplier === 0) return 0;

    const scoreRatio = Math.min(score, 100_5000) / 1000000;
    // From rating formula: rating = floor((score/1000000) * multiplier * level)
    // Solving for level: level = rating / ((score/1000000) * multiplier)
    const rawLevel = targetRating / (scoreRatio * multiplier);

    return Math.round(rawLevel * 10) / 10; // Round to 1 decimal place
  }

  function handleForwardCalculate() {
    const levelNum = parseFloat(level);
    const scoreNum = Math.round(parseFloat(score) * 10000); // Convert to scale of 1010000

    if (isNaN(levelNum) || isNaN(scoreNum)) {
      rating = null;
      return;
    }

    rating = calculateRating(scoreNum, levelNum);
    displayLevel = level;
    displayScore = score;
  }

  function handleReverseCalculate() {
    const scoreNum = Math.round(parseFloat(reverseScore) * 10000); // Convert to scale of 1010000
    const ratingNum = parseInt(reverseRating);

    if (isNaN(scoreNum) || isNaN(ratingNum)) {
      calculatedLevel = null;
      verifiedRating = null;
      return;
    }

    calculatedLevel = calculateLevel(scoreNum, ratingNum);
    // Verify by calculating rating back from the calculated level
    verifiedRating = calculateRating(scoreNum, calculatedLevel);
    displayReverseScore = reverseScore;
    displayReverseRating = reverseRating;
  }

  function handleForwardReset() {
    level = "";
    score = "";
    rating = null;
  }

  function handleReverseReset() {
    reverseScore = "";
    reverseRating = "";
    calculatedLevel = null;
    verifiedRating = null;
  }
</script>

<div class="w-full max-w-2xl">
  <h1 class="mb-2 text-center text-3xl font-bold text-gray-800">
    Rating Calculator
  </h1>
  <p class="mb-8 text-center text-gray-600">
    Calculate rating from level and score, or reverse calculate level
  </p>

  <Card.Root class="shadow-lg border-black/20">
    <Card.Content class="space-y-6 pt-6">
      <Tabs.Root bind:value={activeTab} class="w-full">
        <Tabs.List class="grid w-full grid-cols-2">
          <Tabs.Trigger value="forward">Calculate Rating</Tabs.Trigger>
          <Tabs.Trigger value="reverse">Calculate Level</Tabs.Trigger>
        </Tabs.List>

        <!-- Forward Calculation Tab -->
        <Tabs.Content value="forward" class="space-y-6 pt-6">
          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div class="space-y-2">
              <Label for="level">Level</Label>
              <Input
                id="level"
                type="number"
                step="0.1"
                placeholder="e.g., 14.5"
                bind:value={level}
              />
              <p class="text-xs text-gray-500">Up to 1 decimal place</p>
            </div>
            <div class="space-y-2">
              <Label for="score">Score (%)</Label>
              <Input
                id="score"
                type="number"
                step="0.0001"
                placeholder="e.g., 100.5000"
                bind:value={score}
                min={0}
                max={101}
              />
              <p class="text-xs text-gray-500">
                Up to 4 decimal places (0-101)
              </p>
            </div>
          </div>

          <div class="flex flex-col gap-3 sm:flex-row">
            <Button
              class="flex-1"
              onclick={handleForwardCalculate}
              disabled={!level || !score}
            >
              Calculate
            </Button>
            <Button
              variant="secondary"
              class="flex-1"
              onclick={handleForwardReset}
            >
              Reset
            </Button>
          </div>

          {#if rating !== null}
            <Card.Root class="border-blue-200 bg-blue-50">
              <Card.Header>
                <Card.Title class="text-lg text-blue-900">Result</Card.Title>
              </Card.Header>
              <Card.Content>
                <p class="text-sm text-blue-800">
                  Level: <span class="font-semibold">{displayLevel}</span><br />
                  Score: <span class="font-semibold">{displayScore}%</span><br
                  />
                  <span class="text-base font-bold mt-2 block"
                    >Rating = {rating}</span
                  >
                </p>
              </Card.Content>
            </Card.Root>
          {/if}
        </Tabs.Content>

        <!-- Reverse Calculation Tab -->
        <Tabs.Content value="reverse" class="space-y-6 pt-6">
          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div class="space-y-2">
              <Label for="reverseScore">Score (%)</Label>
              <Input
                id="reverseScore"
                type="number"
                step="0.0001"
                placeholder="e.g., 100.5000"
                bind:value={reverseScore}
                min={0}
                max={101}
              />
              <p class="text-xs text-gray-500">
                Up to 4 decimal places (0-101)
              </p>
            </div>
            <div class="space-y-2">
              <Label for="reverseRating">Rating</Label>
              <Input
                id="reverseRating"
                type="number"
                placeholder="e.g., 340"
                bind:value={reverseRating}
              />
              <p class="text-xs text-gray-500">Integer value</p>
            </div>
          </div>

          <div class="flex flex-col gap-3 sm:flex-row">
            <Button
              class="flex-1"
              onclick={handleReverseCalculate}
              disabled={!reverseScore || !reverseRating}
            >
              Calculate
            </Button>
            <Button
              variant="secondary"
              class="flex-1"
              onclick={handleReverseReset}
            >
              Reset
            </Button>
          </div>

          {#if calculatedLevel !== null}
            <Card.Root class="border-blue-200 bg-blue-50">
              <Card.Header>
                <Card.Title class="text-lg text-blue-900">Result</Card.Title>
              </Card.Header>
              <Card.Content>
                <p class="text-sm text-blue-800">
                  Score: <span class="font-semibold"
                    >{displayReverseScore}%</span
                  >
                  <br />
                  Rating:
                  <span class="font-semibold">{displayReverseRating}</span>
                  <br />
                  <span class="text-base font-bold mt-2 block">
                    Calculated Level = <span
                      class:text-red-600={verifiedRating !==
                        parseInt(displayReverseRating)}
                    >
                      {calculatedLevel}
                    </span>
                  </span>
                  <br />
                  <span class="text-sm mt-1 block">
                    Check: Rating from level {calculatedLevel} =
                    <span
                      class:text-red-600={verifiedRating !==
                        parseInt(displayReverseRating)}
                    >
                      {verifiedRating}
                    </span>
                  </span>
                </p>
              </Card.Content>
            </Card.Root>
          {/if}
        </Tabs.Content>
      </Tabs.Root>
    </Card.Content>
  </Card.Root>
</div>
