<!--
  CharacterProfileForm
  ====================
  Edit form for a single character's profile data.
  Owns all field state and the profile-save API call.
  Rendered by the parent only when isEditing is true.

  Props:
    character        – full character object (used for initial state only)
    SERVER_URL       – base URL for API calls
    characterOptions – imported from character-options.template.json
    onProfileSaved   – optional callback(id, updatedFields)
    onLevelUp        – optional callback(id) after level-up save
-->
<script>
  import CharacterOptionsFields from "../character-form-fields/CharacterOptionsFields.svelte";
  import CharacterProficienciesFields from "../character-form-fields/CharacterProficienciesFields.svelte";
  import { Button } from "$lib/components/shared/button/index.js";
  import { Input } from "$lib/components/shared/input/index.js";
  import { Label } from "$lib/components/shared/label/index.js";
  import {
    parseOptionSets,
    buildLabelMap,
    buildCharacterPayload,
    getFormValuesFromCharacter,
  } from "$lib/services/character-form.js";

  let {
    character,
    SERVER_URL,
    characterOptions,
    onProfileSaved = () => {},
    onLevelUp = () => {},
  } = $props();

  const optionSets = parseOptionSets(characterOptions);
  const labelOf = buildLabelMap(optionSets);
  const rareLanguageKeys = new Set(
    (optionSets.rareLanguageOptions || []).map((o) => o.key),
  );

  // Initialise form state from the character prop (edit mode).
  let {
    name,
    player,
    hpMax,
    armorClass,
    speedWalk,
    classPrimary,
    classSubclass,
    classLevel,
    backgroundName,
    backgroundFeat,
    speciesName,
    speciesSize,
    alignment,
    languages,
    rareLanguages,
    skills,
    tools,
    armor,
    weapons,
    items,
    trinket,
  } = $state(getFormValuesFromCharacter(character, rareLanguageKeys));

  let isSaving = $state(false);
  let feedback = $state({ type: "", text: "" });

  function levelUpCharacter() {
    classLevel = Math.min(20, (Number(classLevel) || 1) + 1);
    saveProfile();
    onLevelUp?.(character.id);
  }

  async function saveProfile() {
    if (isSaving) return;

    const nameVal = String(name ?? "").trim();
    const playerVal = String(player ?? "").trim();
    const hpMaxVal = Number(hpMax);

    if (!nameVal || !playerVal || !Number.isFinite(hpMaxVal) || hpMaxVal <= 0) {
      feedback = { type: "error", text: "Revisa los datos obligatorios." };
      return;
    }

    isSaving = true;
    feedback = { type: "", text: "" };

    const payload = buildCharacterPayload({
      name,
      player,
      hpMax,
      armorClass,
      speedWalk,
      classPrimary,
      classSubclass,
      classLevel,
      backgroundName,
      backgroundFeat,
      speciesName,
      speciesSize,
      alignment,
      languages,
      rareLanguages,
      skills,
      tools,
      armor,
      weapons,
      items,
      trinket,
    });

    try {
      const response = await fetch(
        `${SERVER_URL}/api/characters/${character.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        feedback = { type: "error", text: "No se pudo guardar." };
        return;
      }

      feedback = { type: "success", text: "Datos actualizados." };
      onProfileSaved?.(character.id, payload);
    } catch (error) {
      console.error("Error updating profile", error);
      feedback = { type: "error", text: "Error de conexión." };
    } finally {
      isSaving = false;
    }
  }
</script>

<div class="manage-form">
  <!-- Basic identity fields -->
  <div class="manage-field">
    <Label for={`name-${character.id}`} class="label-caps">Nombre</Label>
    <Input
      id={`name-${character.id}`}
      type="text"
      bind:value={name}
      maxlength="40"
      variant="dark"
    />
  </div>
  <div class="manage-field">
    <Label for={`player-${character.id}`} class="label-caps">Jugador</Label>
    <Input
      id={`player-${character.id}`}
      type="text"
      bind:value={player}
      maxlength="40"
      variant="dark"
    />
  </div>

  <!-- Core stats -->
  <div class="manage-grid-fields">
    <div class="manage-field">
      <Label for={`hp-max-${character.id}`} class="label-caps">HP MAX</Label>
      <Input
        id={`hp-max-${character.id}`}
        type="number"
        min="1"
        max="999"
        bind:value={hpMax}
        variant="dark"
      />
    </div>
    <div class="manage-field">
      <Label for={`ac-${character.id}`} class="label-caps">AC</Label>
      <Input
        id={`ac-${character.id}`}
        type="number"
        min="0"
        max="99"
        bind:value={armorClass}
        variant="dark"
      />
    </div>
    <div class="manage-field">
      <Label for={`speed-${character.id}`} class="label-caps">VEL</Label>
      <Input
        id={`speed-${character.id}`}
        type="number"
        min="0"
        max="200"
        bind:value={speedWalk}
        variant="dark"
      />
    </div>
  </div>

  <!-- Character options (class, background, species, alignment) -->
  <div class="manage-section">
    <h4 class="manage-section-title">Opciones de personaje</h4>
    <CharacterOptionsFields
      {optionSets}
      bind:classPrimary
      bind:classSubclass
      bind:classLevel
      bind:backgroundName
      bind:backgroundFeat
      bind:speciesName
      bind:speciesSize
      bind:alignment
    />
  </div>

  <!-- Languages, proficiencies and equipment -->
  <CharacterProficienciesFields
    {optionSets}
    {labelOf}
    bind:languages
    bind:rareLanguages
    bind:skills
    bind:tools
    bind:armor
    bind:weapons
    bind:items
    bind:trinket
  />

  <!-- Actions -->
  <div class="manage-actions">
    <Button
      class="btn-base manage-save-btn manage-save-btn--outline"
      type="button"
      onclick={levelUpCharacter}
      disabled={isSaving}
    >
      SUBIR NIVEL
    </Button>
    <Button
      class="btn-base manage-save-btn manage-save-btn--neutral"
      type="button"
      onclick={saveProfile}
      disabled={isSaving}
    >
      {isSaving ? "GUARDANDO..." : "GUARDAR DATOS"}
    </Button>
    {#if feedback.text}
      <span class={`manage-feedback ${feedback.type}`}>
        {feedback.text}
      </span>
    {/if}
    <span class="manage-note">
      Subir nivel solo ajusta el nivel por ahora.
    </span>
  </div>
</div>
