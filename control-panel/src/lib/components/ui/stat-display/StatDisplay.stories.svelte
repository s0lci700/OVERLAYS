<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import StatDisplay from "./stat-display.svelte";

  const { Story } = defineMeta({
    title: "UI/StatDisplay",
    component: StatDisplay,
    tags: ["autodocs"],
    parameters: {
      docs: {
        description: {
          component: `
**StatDisplay** renders a label + monospace numeric value pair.

Used in:
- \`CharacterCard\` stat row (CA, VEL) — uses \`variant="inline"\`
- \`DashboardCard\` vitals grid (HP, AC, Temp) — uses \`variant="cell"\`
- \`DashboardCard\` ability scores (STR, DEX, CON...) — uses \`variant="cell"\`

### Variants
| Variant | Layout | Use Case |
|---------|--------|----------|
| \`inline\` | Horizontal (label → value) | Compact stat bars |
| \`cell\`   | Vertical (label above value) | Grid ability scores |

Values always render in monospace for number alignment.
          `,
        },
      },
    },
    argTypes: {
      variant: {
        control: { type: "select" },
        options: ["inline", "cell"],
        description: "Layout direction — horizontal or vertical stacked",
      },
      label: { control: "text" },
      value: { control: "text" },
    },
  });
</script>

<Story name="Inline" args={{ label: "CA", value: "16", variant: "inline" }} />

<Story name="Cell" args={{ label: "STR", value: "18", variant: "cell" }} />

<Story name="Inline Row (CharacterCard style)">
  <div style="display:flex; align-items:center; gap:20px; padding:16px;">
    <StatDisplay label="CA" value="16" variant="inline" />
    <span style="color:var(--grey-dim)">|</span>
    <StatDisplay label="VEL" value="30ft" variant="inline" />
    <span style="color:var(--grey-dim)">|</span>
    <StatDisplay label="INI" value="+3" variant="inline" />
  </div>
</Story>

<Story name="Ability Score Grid (DashboardCard style)">
  <div style="display:grid; grid-template-columns:repeat(3,1fr); gap:8px; padding:16px; max-width:240px;">
    {#each [["STR", "18"], ["DEX", "14"], ["CON", "16"], ["INT", "10"], ["WIS", "12"], ["CHA", "8"]] as [label, value]}
      <StatDisplay {label} {value} variant="cell" />
    {/each}
  </div>
</Story>

<Story name="Vitals Row (DashboardCard style)">
  <div style="display:grid; grid-template-columns:repeat(4,1fr); gap:8px; padding:16px; max-width:300px;">
    <StatDisplay label="HP" value="12/18" variant="cell" />
    <StatDisplay label="Temp" value="3" variant="cell" />
    <StatDisplay label="AC" value="16" variant="cell" />
    <StatDisplay label="Vel" value="30" variant="cell" />
  </div>
</Story>
