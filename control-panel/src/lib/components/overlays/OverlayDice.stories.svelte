<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import OverlayDice from "./OverlayDice.svelte";

  const { Story } = defineMeta({
    title: "Overlays/Moments/OverlayDice",
    component: OverlayDice,
    tags: ["autodocs"],
    parameters: {
      layout: "fullscreen",
      backgrounds: { default: "dark" },
      docs: {
        description: {
          component:
            "Animated dice roll result card. Pass preview (dice_rolled payload) to display without a server.",
        },
      },
    },
  });
</script>

<Story name="Critico Nat 20">
  <OverlayDice preview={{ characterName: "Kael", charId: "CH101", result: 20, sides: 20, modifier: 3, rollResult: 23 }} />
</Story>

<Story name="Pifia Nat 1">
  <OverlayDice preview={{ characterName: "Lyra", charId: "CH102", result: 1, sides: 20, modifier: 0, rollResult: 1 }} />
</Story>

<Story name="Normal d20 Roll">
  <OverlayDice preview={{ characterName: "Brum", charId: "CH103", result: 14, sides: 20, modifier: 2, rollResult: 16 }} />
</Story>

<Story name="d8 Damage Roll">
  <OverlayDice preview={{ characterName: "Zara", charId: "CH104", result: 6, sides: 8, modifier: 3, rollResult: 9 }} />
</Story>
