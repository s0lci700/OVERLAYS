<!--
  CharacterProficienciesFields
  ============================
  Shared MultiSelect field group for languages, proficiencies and equipment.
  Extracted from CharacterCreationForm and CharacterProfileForm.

  Props (all bindable):
    optionSets     – parsed option arrays from character-form.js parseOptionSets()
    labelOf        – Map<key, label> from buildLabelMap() for pill previews
    languages      – bound array for base language selection
    rareLanguages  – bound array for rare language selection
    skills         – bound array for skill proficiency selection
    tools          – bound array for tool proficiency selection
    armor          – bound array for armor proficiency selection
    weapons        – bound array for weapon proficiency selection
    items          – bound array for equipment items selection
    trinket        – bound value for trinket select
-->
<script>
  import "$lib/components/shared/pills/Pills.css";
  import MultiSelect from "../multi-select/MultiSelect.svelte";
  import SelectionPills from "$lib/components/shared/pills/SelectionPills.svelte";

  let {
    optionSets = {},
    labelOf = new Map(),
    languages = $bindable([]),
    rareLanguages = $bindable([]),
    skills = $bindable([]),
    tools = $bindable([]),
    armor = $bindable([]),
    weapons = $bindable([]),
    items = $bindable([]),
    trinket = $bindable(""),
  } = $props();

  const {
    languageOptions = [],
    rareLanguageOptions = [],
    skillOptions = [],
    toolOptions = [],
    armorOptions = [],
    weaponOptions = [],
    itemOptions = [],
    trinketOptions = [],
  } = optionSets;
</script>

<!-- Languages & Proficiencies -->
<div class="char-prof-section">
  <h3 class="char-prof-title">Idiomas y proficiencias</h3>
  <div class="char-prof-grid">
    <div class="char-prof-field">
      <span class="label-caps" id="lbl-languages">
        Idiomas{#if languages.length > 0}&nbsp;<span class="selection-count">{languages.length}</span>{/if}
      </span>
      <MultiSelect
        aria-labelledby="lbl-languages"
        options={languageOptions}
        selected={languages}
        onchange={(v) => (languages = v)}
        size={Math.max(3, Math.min(6, languageOptions.length || 3))}
      />
      <SelectionPills keys={languages} {labelOf} />
    </div>

    <div class="char-prof-field">
      <span class="label-caps" id="lbl-rare-langs">
        Idiomas raros{#if rareLanguages.length > 0}&nbsp;<span class="selection-count">{rareLanguages.length}</span>{/if}
      </span>
      <MultiSelect
        aria-labelledby="lbl-rare-langs"
        options={rareLanguageOptions}
        selected={rareLanguages}
        onchange={(v) => (rareLanguages = v)}
        size={Math.max(3, Math.min(6, rareLanguageOptions.length || 3))}
      />
      <SelectionPills keys={rareLanguages} {labelOf} />
    </div>

    <div class="char-prof-field">
      <span class="label-caps" id="lbl-skills">
        Skills{#if skills.length > 0}&nbsp;<span class="selection-count">{skills.length}</span>{/if}
      </span>
      <MultiSelect
        aria-labelledby="lbl-skills"
        options={skillOptions}
        selected={skills}
        onchange={(v) => (skills = v)}
        size={Math.max(4, Math.min(8, skillOptions.length || 4))}
      />
      <SelectionPills keys={skills} {labelOf} />
    </div>

    <div class="char-prof-field">
      <span class="label-caps" id="lbl-tools">
        Herramientas{#if tools.length > 0}&nbsp;<span class="selection-count">{tools.length}</span>{/if}
      </span>
      <MultiSelect
        aria-labelledby="lbl-tools"
        options={toolOptions}
        selected={tools}
        onchange={(v) => (tools = v)}
        size={Math.max(4, Math.min(8, toolOptions.length || 4))}
      />
      <SelectionPills keys={tools} {labelOf} />
    </div>

    <div class="char-prof-field">
      <span class="label-caps" id="lbl-armor">
        Armadura{#if armor.length > 0}&nbsp;<span class="selection-count">{armor.length}/{armorOptions.length}</span>{/if}
      </span>
      <MultiSelect
        aria-labelledby="lbl-armor"
        options={armorOptions}
        selected={armor}
        onchange={(v) => (armor = v)}
        size={Math.max(3, Math.min(6, armorOptions.length || 3))}
      />
      <SelectionPills keys={armor} {labelOf} />
    </div>

    <div class="char-prof-field">
      <span class="label-caps" id="lbl-weapons">
        Armas{#if weapons.length > 0}&nbsp;<span class="selection-count">{weapons.length}/{weaponOptions.length}</span>{/if}
      </span>
      <MultiSelect
        aria-labelledby="lbl-weapons"
        options={weaponOptions}
        selected={weapons}
        onchange={(v) => (weapons = v)}
        size={Math.max(3, Math.min(6, weaponOptions.length || 3))}
      />
      <SelectionPills keys={weapons} {labelOf} />
    </div>
  </div>
</div>

<!-- Equipment -->
<div class="char-prof-section">
  <h3 class="char-prof-title">Equipo</h3>
  <div class="char-equip-grid">
    <div class="char-prof-field">
      <span class="label-caps" id="lbl-items">
        Items{#if items.length > 0}&nbsp;<span class="selection-count">{items.length}</span>{/if}
      </span>
      <MultiSelect
        aria-labelledby="lbl-items"
        options={itemOptions}
        selected={items}
        onchange={(v) => (items = v)}
        disabled={itemOptions.length === 0}
        size={Math.max(3, Math.min(6, itemOptions.length || 3))}
      />
      <SelectionPills keys={items} {labelOf} />
    </div>

    <label class="char-prof-field">
      <span class="label-caps">Trinket</span>
      <select
        class="selector"
        bind:value={trinket}
        disabled={trinketOptions.length === 0}
      >
        {#if trinketOptions.length === 0}
          <option value="">Sin opciones</option>
        {:else}
          <option value="">Sin definir</option>
          {#each trinketOptions as option (option.key)}
            <option value={option.key}>{option.label}</option>
          {/each}
        {/if}
      </select>
    </label>
  </div>
</div>

<style>
  .char-prof-section {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .char-prof-title {
    font-family: var(--font-display);
    font-size: 0.95rem;
    letter-spacing: 0.08em;
    color: var(--grey);
    text-transform: uppercase;
  }

  .char-prof-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--space-2);
  }

  .char-equip-grid {
    display: grid;
    grid-template-columns: 1fr 260px;
    gap: var(--space-2);
    align-items: start;
  }

  @media (max-width: 768px) {
    .char-prof-grid,
    .char-equip-grid {
      grid-template-columns: 1fr;
    }
  }

  .char-prof-field {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }
</style>
