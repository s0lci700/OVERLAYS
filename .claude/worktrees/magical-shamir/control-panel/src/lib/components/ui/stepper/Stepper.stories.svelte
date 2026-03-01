<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Stepper from "./stepper.svelte";

  const { Story } = defineMeta({
    title: "UI/Stepper",
    component: Stepper,
    tags: ["autodocs"],
    parameters: {
      docs: {
        description: {
          component: `
**Stepper** is a −/value/+ numeric input with hold-to-repeat support.

Used in:
- \`CharacterCard\` — damage/heal amount (size \`"sm"\`, range 1–999)
- \`DiceRoller\` — roll modifier (size \`"lg"\`, range −20 to +20)

### Features
- **Hold to repeat**: holding the − or + button increments after 250ms delay, then every 80ms
- **Controlled**: parent owns the value via \`bind:value\` or \`onchange\`
- **Clamped**: automatically clamps to \`min\`/\`max\` on blur

### Sizes
| Size | Buttons | Input | Use Case |
|------|---------|-------|----------|
| \`sm\` | 32×32px | 48px wide | Compact HP stepper |
| \`lg\` | 80×60px | flex-1 | Modifier input with large tap targets |
          `,
        },
      },
    },
    argTypes: {
      size: {
        control: { type: "select" },
        options: ["sm", "lg"],
        description: "Button and input dimensions",
      },
      min: { control: "number" },
      max: { control: "number" },
      value: { control: "number" },
    },
  });
</script>

<Story name="Small (HP Amount)" args={{ size: "sm", value: 5, min: 1, max: 999 }} />

<Story name="Large (Modifier)" args={{ size: "lg", value: 0, min: -20, max: 20 }} />

<Story name="CharacterCard usage">
  <div style="padding:16px; display:flex; align-items:center; gap:12px;">
    <span style="font-family:var(--font-display); font-size:0.7rem; color:var(--grey); letter-spacing:0.1em;">CANTIDAD</span>
    <Stepper size="sm" value={5} min={1} max={999} />
  </div>
</Story>

<Story name="DiceRoller usage">
  <div style="padding:16px; display:flex; flex-direction:column; gap:8px; max-width:200px;">
    <span style="font-family:var(--font-display); font-size:0.7rem; color:var(--grey); letter-spacing:0.1em;">MODIFICADOR</span>
    <Stepper size="lg" value={0} min={-20} max={20} />
  </div>
</Story>

<Story name="At min boundary" args={{ size: "sm", value: 1, min: 1, max: 10 }} />

<Story name="At max boundary" args={{ size: "sm", value: 10, min: 1, max: 10 }} />

<Story name="Negative range" args={{ size: "lg", value: -5, min: -20, max: 20 }} />
