<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import OverlayPlayerDown from "./moments/OverlayPlayerDown.svelte";

  const { Story } = defineMeta({
    title: "Overlays/Moments/OverlayPlayerDown",
    component: OverlayPlayerDown,
    tags: ["autodocs"],
    parameters: {
      layout: "fullscreen",
      backgrounds: { default: "dark" },
      docs: {
        description: {
          component:
            "Player-down / KO moment overlay. Pass preview to display without a server.",
        },
      },
    },
  });
</script>

<Story name="Inconsciente">
  <OverlayPlayerDown preview={{ charName: "Kael Ironfang", isDead: false }} />
</Story>

<Story name="Caído para Siempre">
  <OverlayPlayerDown preview={{ charName: "Lyra Moonwhisper", isDead: true }} />
</Story>
