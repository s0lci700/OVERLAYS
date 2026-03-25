<!--
  CharacterOptionsFields
  ======================
  Shared select-field group for class, subclass, level, background, feat,
  species, size and alignment. Extracted from CharacterCreationForm and
  CharacterProfileForm to eliminate duplication.

  Props (all bindable):
    optionSets   – parsed option arrays from character-form.js parseOptionSets()
    classPrimary    – bound value for class select
    classSubclass   – bound value for subclass select
    classLevel      – bound value for level input
    backgroundName  – bound value for background select
    backgroundFeat  – bound value for feat select
    speciesName     – bound value for species select
    speciesSize     – bound value for size select
    alignment       – bound value for alignment select

  Layout: responsive 2-col grid, expands to 3 cols on wider screens.
  Relies on the `.selector` and `.label-caps` classes from app.css.
-->
<script>
  import { Input } from "$lib/components/shared/input/index.js";

  let {
    optionSets = {},
    classPrimary = $bindable(""),
    classSubclass = $bindable(""),
    classLevel = $bindable(1),
    backgroundName = $bindable(""),
    backgroundFeat = $bindable(""),
    speciesName = $bindable(""),
    speciesSize = $bindable(""),
    alignment = $bindable(""),
  } = $props();

  const {
    classOptions = [],
    subclassOptions = [],
    backgroundOptions = [],
    featOptions = [],
    speciesOptions = [],
    sizeOptions = [],
    alignmentOptions = [],
  } = optionSets;
</script>

<div class="char-options-grid">
  <!-- Clase -->
  <label class="char-options-field">
    <span class="label-caps">Clase</span>
    <select class="selector" bind:value={classPrimary}>
      <option value="">Sin definir</option>
      {#each classOptions as option (option.key)}
        <option value={option.key}>{option.label}</option>
      {/each}
    </select>
  </label>

  <!-- Subclase -->
  <label class="char-options-field">
    <span class="label-caps">Subclase</span>
    <select
      class="selector"
      bind:value={classSubclass}
      disabled={subclassOptions.length === 0}
    >
      {#if subclassOptions.length === 0}
        <option value="">Sin opciones</option>
      {:else}
        <option value="">Sin definir</option>
        {#each subclassOptions as option (option.key)}
          <option value={option.key}>{option.label}</option>
        {/each}
      {/if}
    </select>
  </label>

  <!-- Nivel -->
  <div class="char-options-field">
    <span class="label-caps">Nivel</span>
    <Input type="number" min="1" max="20" bind:value={classLevel} />
  </div>

  <!-- Background -->
  <label class="char-options-field">
    <span class="label-caps">Background</span>
    <select class="selector" bind:value={backgroundName}>
      <option value="">Sin definir</option>
      {#each backgroundOptions as option (option.key)}
        <option value={option.key}>{option.label}</option>
      {/each}
    </select>
  </label>

  <!-- Feat -->
  <label class="char-options-field">
    <span class="label-caps">Feat</span>
    <select
      class="selector"
      bind:value={backgroundFeat}
      disabled={featOptions.length === 0}
    >
      {#if featOptions.length === 0}
        <option value="">Sin opciones</option>
      {:else}
        <option value="">Sin definir</option>
        {#each featOptions as option (option.key)}
          <option value={option.key}>{option.label}</option>
        {/each}
      {/if}
    </select>
  </label>

  <!-- Especie -->
  <label class="char-options-field">
    <span class="label-caps">Especie</span>
    <select class="selector" bind:value={speciesName}>
      <option value="">Sin definir</option>
      {#each speciesOptions as option (option.key)}
        <option value={option.key}>{option.label}</option>
      {/each}
    </select>
  </label>

  <!-- Tamaño -->
  <label class="char-options-field">
    <span class="label-caps">Tamaño</span>
    <select class="selector" bind:value={speciesSize}>
      <option value="">Sin definir</option>
      {#each sizeOptions as option (option.key)}
        <option value={option.key}>{option.label}</option>
      {/each}
    </select>
  </label>

  <!-- Alineamiento -->
  <label class="char-options-field">
    <span class="label-caps">Alineamiento</span>
    <select class="selector" bind:value={alignment}>
      <option value="">Sin definir</option>
      {#each alignmentOptions as option (option.key)}
        <option value={option.key}>{option.label}</option>
      {/each}
    </select>
  </label>
</div>

<style>
  .char-options-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--space-2);
  }

  @media (min-width: 900px) {
    .char-options-grid {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }

  @media (max-width: 480px) {
    .char-options-grid {
      grid-template-columns: 1fr;
    }
  }

  .char-options-field {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }
</style>
