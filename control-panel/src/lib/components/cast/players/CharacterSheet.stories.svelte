<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { Shimmer } from "@shimmer-from-structure/svelte";
  import CharacterSheet from "./CharacterSheet.svelte";
  /** @typedef {import('$lib/contracts/records').CharacterRecord} CharacterRecord */

  // ── Fixtures ──────────────────────────────────────────────────

  /** @type {CharacterRecord} */
  const SIR_NABO = {
    id: "CH101",
    name: "Sir Nabo",
    player: "Sol",
    species: "Human",
    class_name: "Fighter",
    subclass_name: "Champion",
    level: 4,
    proficiency_bonus: 2,
    ac_base: 16,
    speed: 30,
    hp_current: 28,
    hp_max: 34,
    hp_temp: 0,
    ability_scores: { str: 16, dex: 12, con: 14, int: 10, wis: 13, cha: 8 },
    saving_throws_proficiencies: ["str", "con"],
    skill_proficiencies: ["athletics", "perception"],
    expertise: [],
    conditions: [],
    resources: [
      { id: "r1", name: "Action Surge", pool_current: 1, pool_max: 1, reset_on: "short_rest" },
      { id: "r2", name: "Second Wind", pool_current: 1, pool_max: 1, reset_on: "short_rest" },
    ],
    is_active: true,
    is_visible_to_party_overlay: true,
    portrait: undefined,
    notes: [],
  };

  /** Sir Nabo — mid-fight: resources spent, conditions applied */
  const SIR_NABO_WOUNDED = {
    ...SIR_NABO,
    hp_current: 8,
    conditions: [
      { id: "c1", condition_name: "Exhausted", intensity_level: 1, applied_at: new Date().toISOString() },
      { id: "c2", condition_name: "Poisoned", intensity_level: 1, applied_at: new Date().toISOString() },
    ],
    resources: [
      { id: "r1", name: "Action Surge", pool_current: 0, pool_max: 1, reset_on: "short_rest" },
      { id: "r2", name: "Second Wind", pool_current: 0, pool_max: 1, reset_on: "short_rest" },
    ],
  };

  /** Mage — expertise in Arcana, multiple spell slot tracks */
  const MAGE_BRUM = {
    id: "CH102",
    name: "Brum Cogsworth",
    player: "Iris",
    species: "Gnome",
    class_name: "Wizard",
    subclass_name: "School of Illusion",
    level: 5,
    proficiency_bonus: 3,
    ac_base: 12,
    speed: 25,
    hp_current: 18,
    hp_max: 28,
    hp_temp: 0,
    ability_scores: { str: 8, dex: 14, con: 12, int: 18, wis: 15, cha: 10 },
    saving_throws_proficiencies: ["int", "wis"],
    skill_proficiencies: ["arcana", "history", "investigation", "perception"],
    expertise: ["arcana"],
    conditions: [
      { id: "c1", condition_name: "Concentracion", intensity_level: 1, applied_at: new Date().toISOString() },
    ],
    resources: [
      { id: "r1", name: "Slots Nv.1", pool_current: 2, pool_max: 4, reset_on: "long_rest" },
      { id: "r2", name: "Slots Nv.2", pool_current: 1, pool_max: 3, reset_on: "long_rest" },
      { id: "r3", name: "Slots Nv.3", pool_current: 0, pool_max: 2, reset_on: "long_rest" },
      { id: "r4", name: "Arcane Recovery", pool_current: 0, pool_max: 1, reset_on: "long_rest" },
    ],
    is_active: true,
    is_visible_to_party_overlay: true,
    portrait: undefined,
    notes: [],
  };

  const { Story } = defineMeta({
    title: "Cast/Players/CharacterSheet",
    component: CharacterSheet,
    tags: ["autodocs"],
    parameters: {
      layout: "fullscreen",
      viewport: { defaultViewport: "mobile1" },
      docs: {
        description: {
          component: `
**CharacterSheet** renders the home tab of the player sheet at \`/players/[id]\`.

Data comes from PocketBase via SSR load — the component is pure display, no fetching.
Live socket overlays (HP, conditions) are TASK-1.6 and not wired here.

### States
| Story | Description |
|-------|-------------|
| Default | Sir Nabo at full health, no conditions |
| Wounded + Conditions | Resources spent, 2 active conditions |
| Expertise (Mage) | Expertise marker shown, multiple resource tracks |
| Loading (Shimmer) | Structure-aware shimmer via \`@shimmer-from-structure/svelte\` |
| Not Found | \`character={null}\` renders fallback empty state |

### Viewports to check
- **375px** — iPhone SE (primary)
- **768px** — tablet
- **1920px** — desktop (centred, max-width 640px)
          `,
        },
      },
    },
  });
</script>

<!-- ── Default: Sir Nabo healthy ──────────────────────────────── -->
<Story
  name="Default — Sir Nabo"
  args={{ character: SIR_NABO, portraitUrl: null }}
/>

<!-- ── Wounded with conditions ────────────────────────────────── -->
<Story
  name="Wounded + Conditions"
  args={{ character: SIR_NABO_WOUNDED, portraitUrl: null }}
/>

<!-- ── Expertise (Mage) ───────────────────────────────────────── -->
<Story
  name="Expertise + Multi-track Resources (Mage)"
  args={{ character: MAGE_BRUM, portraitUrl: null }}
/>

<!-- ── Loading: shimmer mirrors the actual sheet structure ───── -->
<Story name="Loading — Shimmer">
  <Shimmer
    loading={true}
    shimmerColor="rgba(200, 148, 74, 0.18)"
    backgroundColor="rgba(200, 148, 74, 0.06)"
    duration={1.8}
    fallbackBorderRadius={2}
    templateProps={{ character: SIR_NABO, portraitUrl: null }}
  >
    <CharacterSheet character={SIR_NABO} portraitUrl={null} />
  </Shimmer>
</Story>

<!-- ── Not found ─────────────────────────────────────────────── -->
<Story name="Not Found">
  <CharacterSheet character={null} portraitUrl={null} />
</Story>
