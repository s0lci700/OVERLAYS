<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import SelectionPillList from "./selection-pill-list.svelte";

  const { Story } = defineMeta({
    title: "UI/SelectionPillList",
    component: SelectionPillList,
    tags: ["autodocs"],
    parameters: {
      docs: {
        description: {
          component: `
**SelectionPillList** renders a row of cyan tag pills for selected items.

Used in:
- \`CharacterCreationForm\` — appears 7 times, once below each \`MultiSelect\`
  to preview selected languages, feats, spells, proficiencies, etc.

### Props
| Prop | Type | Description |
|------|------|-------------|
| \`items\` | \`string[]\` | Array of selected value keys |
| \`labelMap\` | \`Map<string,string>\` or plain object | Resolves keys to display labels. If omitted, key is shown as-is |

### Behaviour
- Renders nothing if \`items\` is empty (no empty state container)
- Each pill uses \`ConditionPill variant="tag"\` (cyan)
          `,
        },
      },
    },
    argTypes: {
      items: { control: "object" },
    },
  });

  const languageMap = new Map([
    ["common", "Común"],
    ["elvish", "Élfico"],
    ["dwarvish", "Enano"],
    ["draconic", "Draconiano"],
    ["gnomish", "Gnómico"],
    ["orc", "Orco"],
  ]);
</script>

<Story name="With Label Map" args={{ items: ["common", "elvish", "dwarvish"], labelMap: languageMap }} />

<Story name="Without Label Map (shows keys)" args={{ items: ["athletics", "perception", "stealth"] }} />

<Story name="Empty (renders nothing)" args={{ items: [] }} />

<Story name="Many Items" args={{ items: ["common", "elvish", "dwarvish", "draconic", "gnomish", "orc"], labelMap: languageMap }} />

<Story name="CharacterCreationForm — Languages section">
  <div style="padding:16px; max-width:380px; display:flex; flex-direction:column; gap:8px;">
    <span style="font-family:var(--font-display,monospace); font-size:0.7rem; color:var(--grey,#666); letter-spacing:0.1em;">IDIOMAS</span>
    <div style="border:1px solid #333; border-radius:6px; padding:8px; font-family:sans-serif; color:#aaa; font-size:0.85rem;">
      [MultiSelect goes here]
    </div>
    <SelectionPillList items={["common", "elvish", "dwarvish"]} labelMap={languageMap} />
  </div>
</Story>
