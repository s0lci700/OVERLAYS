<!--
  CharacterProfileForm
  ====================
  Edit form for a single character's profile data.
  Fields match the flat PocketBase `characters` schema exactly.
  Removed: background, alignment, languages, equipment, speciesSize —
  those fields do not exist in PocketBase.

  Props:
    character        – full character object (used for initial state only)
    SERVER_URL       – base URL for API calls
    characterOptions – imported from character-options.template.json
    onProfileSaved   – optional callback(id, updatedFields)
    onLevelUp        – optional callback(id) after level-up save
-->
<script lang="ts">
  import MultiSelect from "../multi-select/MultiSelect.svelte";
  import SelectionPills from "$lib/components/shared/pills/SelectionPills.svelte";
  import "$lib/components/shared/pills/Pills.css";
  import { Button } from "$lib/components/shared/button/index.js";
  import { Input } from "$lib/components/shared/input/index.js";
  import { Label } from "$lib/components/shared/label/index.js";
  import characterOptions from "$lib/data/character-options.template.json";
  import {
    parseOptionSets,
    buildLabelMap,
    buildCharacterPayload,
    getFormValuesFromCharacter,
    PHOTO_OPTIONS,
  } from "$lib/services/character-form.ts";
  import PhotoSourcePicker from "../photo-source-picker/PhotoSourcePicker.svelte";
  import { untrack } from "svelte";

  let {
    character,
    SERVER_URL,
    onProfileSaved = () => {},
    onLevelUp = () => {},
  }: {
    character: import("$lib/contracts/records").CharacterRecord;
    SERVER_URL: string;
    onProfileSaved?: (id: string, payload: unknown) => void;
    onLevelUp?: (id: string) => void;
  } = $props();

  const { meta: _meta, ...rawOptions } = characterOptions;
  const optionSets = parseOptionSets(rawOptions);
  const labelOf = buildLabelMap(optionSets);

  let {
    name,
    player,
    hpMax,
    armorClass,
    speedWalk,
    classPrimary,
    classSubclass,
    classLevel,
    speciesName,
    skills,
  } = $state(getFormValuesFromCharacter(character));

  // ── Photo state ──────────────────────────────────────────────────
  function inferSource(photoValue: string) {
    if (!photoValue || PHOTO_OPTIONS.some((o) => o.value === photoValue)) {
      return "preset";
    }
    if (photoValue.startsWith("data:")) return "local";
    return "url";
  }

  const _photo0 = untrack(() => character.portrait) || "";
  const _source0 = inferSource(_photo0);

  let photoSource = $state(_source0);
  let presetPhoto = $state(_source0 === "preset" ? _photo0 : "");
  let customUrl   = $state(_source0 === "url" ? _photo0 : "");
  let localPhoto  = $state(_source0 === "local" ? _photo0 : "");

  function getResolvedPhotoValue() {
    if (photoSource === "local") return localPhoto;
    if (photoSource === "url")   return customUrl.trim();
    return presetPhoto;
  }

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
      speciesName,
      skills,
    });

    // Merge photo into payload
    const finalPhoto = getResolvedPhotoValue();
    (payload as any).portrait = finalPhoto;

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
  <!-- Photo Section -->
  <div class="manage-section">
    <h4 class="manage-section-title">Foto de personaje</h4>
    <div class="manage-photo-editor-inline">
      <PhotoSourcePicker
        options={PHOTO_OPTIONS}
        source={photoSource}
        presetValue={presetPhoto}
        urlValue={customUrl}
        localValue={localPhoto}
        serverUrl={SERVER_URL}
        dense={true}
        onSourceChange={(v) => { photoSource = v; feedback = { type: "", text: "" }; }}
        onPresetChange={(v) => (presetPhoto = v)}
        onUrlChange={(v) => (customUrl = v)}
        onLocalChange={(v) => (localPhoto = v)}
        onError={(msg) => { if (msg) feedback = { type: "error", text: msg }; }}
      />
    </div>
  </div>

  <!-- Basic identity fields -->
  <div class="manage-section">
    <h4 class="manage-section-title">Identidad</h4>
    <div class="manage-grid-two">
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
    </div>
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

  <!-- Class -->
  <div class="manage-section">
    <h4 class="manage-section-title">Clase</h4>
    <div class="manage-grid-fields">
      <div class="manage-field">
        <Label for={`class-${character.id}`} class="label-caps">Clase</Label>
        <select id={`class-${character.id}`} bind:value={classPrimary} class="form-select">
          <option value="">— Seleccionar —</option>
          {#each optionSets.classOptions as opt (opt.key)}
            <option value={opt.key}>{opt.label}</option>
          {/each}
        </select>
      </div>
      <div class="manage-field">
        <Label for={`level-${character.id}`} class="label-caps">Nivel</Label>
        <Input
          id={`level-${character.id}`}
          type="number"
          min="1"
          max="20"
          bind:value={classLevel}
          variant="dark"
        />
      </div>
    </div>
    <div class="manage-field" style="margin-top: 0.5rem;">
      <Label for={`subclass-${character.id}`} class="label-caps">Subclase</Label>
      <select
        id={`subclass-${character.id}`}
        bind:value={classSubclass}
        class="form-select"
        disabled={!classPrimary}
      >
        <option value="">{classPrimary ? "— Seleccionar —" : "Elige clase primero"}</option>
        {#each optionSets.subclassOptions as opt (opt.key)}
          <option value={opt.key}>{opt.label}</option>
        {/each}
      </select>
    </div>
  </div>

  <!-- Species -->
  <div class="manage-section">
    <h4 class="manage-section-title">Especie</h4>
    <div class="manage-field">
      <Label for={`species-${character.id}`} class="label-caps">Especie</Label>
      <select id={`species-${character.id}`} bind:value={speciesName} class="form-select">
        <option value="">— Seleccionar —</option>
        {#each optionSets.speciesOptions as opt (opt.key)}
          <option value={opt.key}>{opt.label}</option>
        {/each}
      </select>
    </div>
  </div>

  <!-- Skills -->
  <div class="manage-section">
    <h4 class="manage-section-title">
      Skills{#if skills.length > 0}&nbsp;<span class="selection-count">{skills.length}</span>{/if}
    </h4>
    <MultiSelect
      options={optionSets.skillOptions}
      selected={skills}
      onchange={(v) => (skills = v)}
      size={Math.max(4, Math.min(8, optionSets.skillOptions.length || 4))}
    />
    <SelectionPills keys={skills} {labelOf} />
  </div>

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
