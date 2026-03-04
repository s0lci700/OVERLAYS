<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import OverlayCharacterFocus from "./OverlayCharacterFocus.svelte";

  const { Story } = defineMeta({
    title: "Overlays/Persistent/OverlayCharacterFocus",
    component: OverlayCharacterFocus,
    tags: ["autodocs"],
    parameters: {
      layout: "fullscreen",
      backgrounds: { default: "dark" },
      docs: {
        description: {
          component:
            "Large character panel (left side of screen) for spotlighting a character. Pass preview to skip socket setup.",
        },
      },
    },
  });

  const highlighted = {
    id: "CH101",
    name: "Kael Ironfang",
    race: "Enano",
    class: "Guerrero",
    level: 7,
    hp_current: 32,
    hp_max: 52,
    conditions: [{ id: "c1", condition_name: "poisoned" }],
    photo: null,
  };

  const healthy = {
    id: "CH102",
    name: "Lyra Moonwhisper",
    race: "Elfo",
    class: "Mago",
    level: 6,
    hp_current: 38,
    hp_max: 38,
    conditions: [],
    photo: null,
  };
</script>

<Story name="Highlighted — Injured + Poisoned">
  <OverlayCharacterFocus preview={highlighted} />
</Story>

<Story name="Highlighted — Healthy">
  <OverlayCharacterFocus preview={healthy} />
</Story>

<Story name="No Focus (empty)">
  <OverlayCharacterFocus />
</Story>
