<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import OverlaySceneTitle from "./OverlaySceneTitle.svelte";

  const { Story } = defineMeta({
    title: "Overlays/Persistent/OverlaySceneTitle",
    component: OverlaySceneTitle,
    tags: ["autodocs"],
    parameters: {
      layout: "fullscreen",
      backgrounds: { default: "dark" },
      docs: {
        description: {
          component:
            "Animated scene/location title card (center screen). Pass preview to skip socket setup.",
        },
      },
    },
  });
</script>

<Story name="Scene Reveal">
  <OverlaySceneTitle preview={{ title: "La Taberna del Dragón Rojo", subtitle: null }} />
</Story>

<Story name="Scene with Subtitle">
  <OverlaySceneTitle preview={{ title: "Las Mazmorras de Kharak", subtitle: "Nivel 3 — Los Huesos de los Caídos" }} />
</Story>
