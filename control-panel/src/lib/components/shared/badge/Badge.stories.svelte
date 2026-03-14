<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Badge from "./badge.svelte";

  const { Story } = defineMeta({
    title: "UI/Badge",
    component: Badge,
    tags: ["autodocs"],
    argTypes: {
      variant: {
        control: { type: "select" },
        options: ["default", "secondary", "destructive", "outline"],
      },
    },
  });
</script>

<Story name="Default" args={{ variant: "default" }}>
  {#snippet children(args)}
    <Badge {...args}>Badge</Badge>
  {/snippet}
</Story>

<Story name="Secondary" args={{ variant: "secondary" }}>
  {#snippet children(args)}
    <Badge {...args}>Secondary</Badge>
  {/snippet}
</Story>

<Story name="Destructive" args={{ variant: "destructive" }}>
  {#snippet children(args)}
    <Badge {...args}>Destructive</Badge>
  {/snippet}
</Story>

<Story name="Outline" args={{ variant: "outline" }}>
  {#snippet children(args)}
    <Badge {...args}>Outline</Badge>
  {/snippet}
</Story>

<Story name="All Variants">
  <div style="display: flex; gap: 8px; align-items: center; padding: 16px;">
    <Badge variant="default">Default</Badge>
    <Badge variant="secondary">Secondary</Badge>
    <Badge variant="destructive">Destructive</Badge>
    <Badge variant="outline">Outline</Badge>
  </div>
</Story>

<Story name="D&D Conditions">
  <div style="display: flex; gap: 8px; flex-wrap: wrap; padding: 16px;">
    <Badge variant="destructive">Envenenado</Badge>
    <Badge variant="secondary">Aturdido</Badge>
    <Badge variant="outline">Asustado</Badge>
    <Badge variant="default">Concentración</Badge>
  </div>
</Story>
