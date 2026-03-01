<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Button from "./button.svelte";

  const { Story } = defineMeta({
    title: "UI/Button",
    component: Button,
    tags: ["autodocs"],
    argTypes: {
      variant: {
        control: { type: "select" },
        options: [
          "default",
          "destructive",
          "outline",
          "secondary",
          "ghost",
          "link",
        ],
      },
      size: {
        control: { type: "select" },
        options: ["default", "sm", "lg", "icon"],
      },
      disabled: { control: "boolean" },
    },
  });
</script>

<Story name="Default" args={{ variant: "default" }}>
  {#snippet children(args)}
    <Button {...args}>Button</Button>
  {/snippet}
</Story>

<Story name="Destructive" args={{ variant: "destructive" }}>
  {#snippet children(args)}
    <Button {...args}>Eliminar</Button>
  {/snippet}
</Story>

<Story name="Outline" args={{ variant: "outline" }}>
  {#snippet children(args)}
    <Button {...args}>Outline</Button>
  {/snippet}
</Story>

<Story name="Secondary" args={{ variant: "secondary" }}>
  {#snippet children(args)}
    <Button {...args}>Secondary</Button>
  {/snippet}
</Story>

<Story name="Ghost" args={{ variant: "ghost" }}>
  {#snippet children(args)}
    <Button {...args}>Ghost</Button>
  {/snippet}
</Story>

<Story name="Disabled" args={{ disabled: true }}>
  {#snippet children(args)}
    <Button {...args}>Disabled</Button>
  {/snippet}
</Story>

<Story name="All Variants">
  <div
    style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center; padding: 16px;"
  >
    <Button variant="default">Default</Button>
    <Button variant="destructive">Destructive</Button>
    <Button variant="outline">Outline</Button>
    <Button variant="secondary">Secondary</Button>
    <Button variant="ghost">Ghost</Button>
    <Button variant="link">Link</Button>
  </div>
</Story>

<Story name="All Sizes">
  <div style="display: flex; gap: 8px; align-items: center; padding: 16px;">
    <Button size="sm">Small</Button>
    <Button size="default">Default</Button>
    <Button size="lg">Large</Button>
  </div>
</Story>
