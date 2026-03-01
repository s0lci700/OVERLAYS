<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import ReadOnlyField from "./read-only-field.svelte";

  const { Story } = defineMeta({
    title: "UI/ReadOnlyField",
    component: ReadOnlyField,
    tags: ["autodocs"],
    parameters: {
      docs: {
        description: {
          component: `
**ReadOnlyField** displays a caps label above (or beside) a plain value string.

Used in:
- \`CharacterManagement\` info panel — 10+ instances showing character data like Clase, Background, Alineamiento, Idiomas

### Variants
| Variant | Layout | Use Case |
|---------|--------|----------|
| \`default\` | Vertical — label above value | Info panel fields |
| \`inline\`  | Horizontal — label beside value | Compact metadata rows |

Pass \`children\` for rich content (pills, badges) instead of plain string value.
          `,
        },
      },
    },
    argTypes: {
      variant: {
        control: { type: "select" },
        options: ["default", "inline"],
      },
      label: { control: "text" },
      value: { control: "text" },
    },
  });
</script>

<Story name="Default" args={{ label: "Clase / Nivel", value: "Guerrero / 5", variant: "default" }} />

<Story name="Inline" args={{ label: "Alineamiento", value: "Neutral Bueno", variant: "inline" }} />

<Story name="Empty value (shows dash)" args={{ label: "Background", value: "", variant: "default" }} />

<Story name="Info Panel (CharacterManagement style)">
  <div style="display:grid; gap:12px; padding:16px; max-width:340px; background:var(--black-elevated,#111); border-radius:8px;">
    <ReadOnlyField label="Clase / Nivel" value="Guerrero / 5" />
    <ReadOnlyField label="Background / Especie" value="Soldado / Humano" />
    <ReadOnlyField label="Alineamiento" value="Legal Neutral" />
    <ReadOnlyField label="Idiomas" value="Común, Élfico, Enano" />
  </div>
</Story>

<Story name="Inline Row">
  <div style="display:flex; flex-direction:column; gap:8px; padding:16px; max-width:280px;">
    <ReadOnlyField label="ID" value="CH101" variant="inline" />
    <ReadOnlyField label="Jugador" value="Mara" variant="inline" />
    <ReadOnlyField label="Sesiones" value="12" variant="inline" />
  </div>
</Story>
