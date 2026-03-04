<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import OverlayLowerThird from "./show/OverlayLowerThird.svelte";

  const { Story } = defineMeta({
    title: "Overlays/Show/OverlayLowerThird",
    component: OverlayLowerThird,
    tags: ["autodocs"],
    parameters: {
      layout: "fullscreen",
      backgrounds: { default: "dark" },
      docs: {
        description: {
          component:
            "Character nameplate lower-third bar. Pass preview to display without a server.",
        },
      },
    },
  });
</script>

<Story name="Character Nameplate">
  <OverlayLowerThird preview={{ characterName: "Kael Ironfang", playerName: "Rodrigo" }} />
</Story>

<Story name="Character Only (no player)">
  <OverlayLowerThird preview={{ characterName: "Goblin Rey Maldor", playerName: "" }} />
</Story>
