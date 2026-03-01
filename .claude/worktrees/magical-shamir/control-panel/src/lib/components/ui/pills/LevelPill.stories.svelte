<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import LevelPill from "./LevelPill.svelte";

  const { Story } = defineMeta({
    title: "UI/LevelPill",
    component: LevelPill,
    tags: ["autodocs"],
    argTypes: {
      level: {
        control: { type: "number", min: 1, max: 20 },
      },
    },
  });
</script>

<Story name="Level 1" args={{ level: 1 }} />

<Story name="Level 5" args={{ level: 5 }} />

<Story name="Level 10" args={{ level: 10 }} />

<Story name="Level 20" args={{ level: 20 }} />

<Story name="Interactive" args={{ level: 5 }} />

<Story name="All Levels">
  <div style="display: flex; gap: 8px; flex-wrap: wrap; padding: 16px;">
    {#each [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20] as lvl}
      <LevelPill level={lvl} />
    {/each}
  </div>
</Story>
