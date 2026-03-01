<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import CharacterBulkControls from "$lib/CharacterBulkControls.svelte";

  const { Story } = defineMeta({
    title: "Components/CharacterBulkControls",
    component: CharacterBulkControls,
    tags: ["autodocs"],
  });
</script>

<Story name="Default">
  <div style="padding:20px;max-width:900px;">
    <CharacterBulkControls
      selectedCount={3}
      selectionMode={true}
      hasSelection={true}
      bulkAmount={5}
    />
  </div>
</Story>
