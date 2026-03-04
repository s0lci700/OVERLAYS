<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import OverlayLevelUp from "./moments/OverlayLevelUp.svelte";

  const { Story } = defineMeta({
    title: "Overlays/Moments/OverlayLevelUp",
    component: OverlayLevelUp,
    tags: ["autodocs"],
    parameters: {
      layout: "fullscreen",
      backgrounds: { default: "dark" },
      docs: {
        description: {
          component:
            "Level-up achievement moment overlay. Pass preview to display without a server.",
        },
      },
    },
  });
</script>

<Story name="Subida de Nivel">
  <OverlayLevelUp preview={{ charName: "Kael Ironfang", newLevel: 7, className: "Guerrero" }} />
</Story>
