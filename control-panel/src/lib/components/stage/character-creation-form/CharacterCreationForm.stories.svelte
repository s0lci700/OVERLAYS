<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import CharacterCreationForm from "./CharacterCreationForm.svelte";

  const { Story } = defineMeta({
    title: "Stage/CharacterCreationForm",
    component: CharacterCreationForm,
    tags: ["autodocs"],
    parameters: {
      layout: "padded",
      docs: {
        description: {
          component:
            "Form for creating a new character. Submits to `POST /api/characters`. " +
            "In Storybook the submit will fail (no server) — use the form to verify rendering and field interactions.",
        },
      },
    },
  });
</script>

<!--
  Default state — empty form ready for input.
  Submit will fail gracefully (no server in Storybook).
-->
<Story name="Empty Form" />

<Story name="With Description">
  <div style="max-width: 640px; padding: 16px;">
    <CharacterCreationForm />
  </div>
</Story>
