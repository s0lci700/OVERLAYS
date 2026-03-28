<script module>
  import SavingThrowsPanel from './SavingThrowsPanel.svelte';
  import { defineMeta } from '@storybook/addon-svelte-csf';

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
    resources: [],
    is_active: true,
    is_visible_to_party_overlay: true,
    portrait: undefined,
    notes: [],
  };

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
    conditions: [],
    resources: [],
    is_active: true,
    is_visible_to_party_overlay: true,
    portrait: undefined,
    notes: [],
  };

  const NO_PROFS = {
    ...SIR_NABO,
    saving_throws_proficiencies: []
  };

  const { Story } = defineMeta({
    title: 'Cast/Players/SavingThrowsPanel',
    component: SavingThrowsPanel,
    parameters: {
      layout: 'fullscreen',
      viewport: { defaultViewport: 'mobile1' }
    }
  });
</script>

<Story name="Fighter — STR+CON Proficient" args={{ character: SIR_NABO }} />
<Story name="Wizard — INT+WIS Proficient" args={{ character: MAGE_BRUM }} />
<Story name="No Proficiencies" args={{ character: NO_PROFS }} />
