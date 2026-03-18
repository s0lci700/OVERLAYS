<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import CharacterManagement from "./CharacterManagement.svelte";

  const { Story } = defineMeta({
    title: "Stage/CharacterManagement",
    component: CharacterManagement,
    tags: ["autodocs"],
    parameters: {
      layout: "fullscreen",
      docs: {
        description: {
          component:
            "Management grid for editing character profiles, photos, and data. " +
            "Uses the socket store mock — all characters come from the static fixture. " +
            "Save/delete actions will fail gracefully (no server in Storybook).",
        },
      },
    },
  });
</script>

<!--
  Renders the full management grid with all 3 mock characters.
  Click the edit icon on any card to open the CharacterProfileForm inline.
-->
<Story name="Default (3 characters)" />
