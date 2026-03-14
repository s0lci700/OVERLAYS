<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import ConditionPill from "./condition-pill.svelte";

  const { Story } = defineMeta({
    title: "UI/ConditionPill",
    component: ConditionPill,
    tags: ["autodocs"],
    parameters: {
      docs: {
        description: {
          component: `
**ConditionPill** displays a D&D status effect as a styled pill badge.

Used in:
- \`CharacterCard\` — interactive (clickable ×) to remove conditions
- \`DashboardCard\` — display-only for the read-only monitor view
- \`CharacterManagement\` — selection previews

### Variants
| Variant | Color | Use Case |
|---------|-------|----------|
| \`condition\` | Red | Active status effects (Envenenado, Aturdido...) |
| \`tag\` | Cyan | Selection preview pills below MultiSelect |
| \`info\` | Grey | Neutral / read-only information |

### Interactive Mode
Set \`interactive={true}\` to render a \`<button>\` with × and call \`onRemove\` on click.
          `,
        },
      },
    },
    argTypes: {
      variant: {
        control: { type: "select" },
        options: ["condition", "tag", "info"],
        description: "Color and semantic intent of the pill",
      },
      interactive: {
        control: "boolean",
        description: "Renders as a clickable button with × when true",
      },
      label: {
        control: "text",
        description: "Text displayed inside the pill",
      },
    },
  });
</script>

<Story name="Condition (default)" args={{ label: "Envenenado", variant: "condition" }} />

<Story name="Tag (cyan)" args={{ label: "Élfico", variant: "tag" }} />

<Story name="Info (grey)" args={{ label: "Concentración", variant: "info" }} />

<Story name="Interactive — Removable" args={{ label: "Aturdido", variant: "condition", interactive: true }} />

<Story name="All Variants">
  <div style="display:flex; gap:8px; flex-wrap:wrap; padding:16px; align-items:center;">
    <ConditionPill label="Envenenado" variant="condition" />
    <ConditionPill label="Asustado" variant="condition" />
    <ConditionPill label="Aturdido" variant="condition" />
    <ConditionPill label="Élfico" variant="tag" />
    <ConditionPill label="Nivel 5" variant="tag" />
    <ConditionPill label="Concentración" variant="info" />
  </div>
</Story>

<Story name="Interactive (Removable) Row">
  <div style="display:flex; gap:8px; flex-wrap:wrap; padding:16px;">
    <ConditionPill label="Envenenado" variant="condition" interactive onRemove={() => {}} />
    <ConditionPill label="Aturdido" variant="condition" interactive onRemove={() => {}} />
    <ConditionPill label="Asustado" variant="condition" interactive onRemove={() => {}} />
  </div>
</Story>

<Story name="Tag Pills Row">
  <div style="display:flex; gap:6px; flex-wrap:wrap; padding:16px;">
    {#each ["Élfico", "Común", "Gnómico", "Draconiano"] as lang}
      <ConditionPill label={lang} variant="tag" />
    {/each}
  </div>
</Story>
