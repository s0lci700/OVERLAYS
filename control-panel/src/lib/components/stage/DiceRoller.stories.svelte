<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import DiceRoller from "./DiceRoller.svelte";
  import DiceRollerStoryWrapper from "./DiceRollerStoryWrapper.svelte";

  const { Story } = defineMeta({
    title: "Components/DiceRoller",
    component: DiceRoller,
    tags: ["autodocs"],
    parameters: {
      docs: {
        description: {
          component:
            "Dice roller panel. Character selector is populated from the mock store. Roll buttons post to the server — they will fail silently in Storybook.",
        },
      },
    },
  });
</script>

<!-- Default: no roll result shown yet -->
<Story name="Default" />

<!-- Pre-populated result states via wrapper that sets lastRoll on mount -->
<Story name="Critical Hit">
  <DiceRollerStoryWrapper result={20} sides={20} modifier={3} rollResult={23} charId="CH101" characterName="Kael" />
</Story>

<Story name="Pifia (Nat 1)">
  <DiceRollerStoryWrapper result={1} sides={20} modifier={0} rollResult={1} charId="CH102" characterName="Lyra" />
</Story>

<Story name="Normal Roll (d8)">
  <DiceRollerStoryWrapper result={5} sides={8} modifier={2} rollResult={7} charId="CH103" characterName="Brum" />
</Story>
