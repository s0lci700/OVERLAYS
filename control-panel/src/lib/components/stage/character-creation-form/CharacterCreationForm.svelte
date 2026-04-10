<!--
  CharacterCreationForm
  =====================
  Creates a new character by POSTing to /api/characters.
  Fields match the flat PocketBase `characters` schema exactly.
  Removed: background, alignment, languages, equipment, speciesSize —
  those fields do not exist in PocketBase.
-->
<script lang="ts">
  import "./CharacterCreationForm.css";
  import PhotoSourcePicker from "../photo-source-picker/PhotoSourcePicker.svelte";
  import Modal from "$lib/components/shared/modal/Modal.svelte";
  import { resolve } from "$app/paths";
  import { Button } from "$lib/components/shared/button/index.js";
  import { Input } from "$lib/components/shared/input/index.js";
  import { Label } from "$lib/components/shared/label/index.js";
  import { characters, SERVER_URL } from "$lib/services/socket.svelte.js";
  import { fly, fade } from "svelte/transition";
  import { backOut } from "svelte/easing";
  import characterOptions from "$lib/data/character-options.template.json";
  import {
    parseOptionSets,
    buildCharacterPayload,
    getDefaultFormValues,
    PHOTO_OPTIONS,
  } from "$lib/services/character-form.ts";

  const { meta: _meta, ...rawOptions } = characterOptions;
  const optionSets = parseOptionSets(rawOptions);

  // Form state — only PocketBase-backed fields
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
  } = $state(getDefaultFormValues());

  // Photo
  let photoSource       = $state("preset");
  let photo             = $state("");
  let customPhotoUrl    = $state("");
  let localPhotoDataUrl = $state("");

  let isSubmitting    = $state(false);
  let errorMessage    = $state("");
  let successMessage  = $state("");
  let lastCreatedId   = $state("");
  let lastCreatedName = $state("");

  const isFormValid = $derived(
    name.trim().length > 0 && player.trim().length > 0 && hpMax > 0,
  );

  function getResolvedPhotoValue(): string {
    if (photoSource === "local") return localPhotoDataUrl;
    if (photoSource === "url")   return customPhotoUrl.trim();
    if (!photo) return "";
    const p = String(photo);
    if (
      p.startsWith("http://") || p.startsWith("https://") ||
      p.startsWith("data:")   || p.startsWith("blob:")
    ) return p;
    if (p.startsWith("/")) return `${SERVER_URL}${p}`;
    return `${SERVER_URL}/${p.replace(/^\/+/, "")}`;
  }

  function handlePhotoPickerError(message: string) {
    if (message) { errorMessage = message; return; }
    if (
      errorMessage === "El archivo debe ser una imagen." ||
      errorMessage === "No se pudo procesar la imagen local."
    ) errorMessage = "";
  }

  async function submitCharacter(event: Event) {
    event.preventDefault();
    if (!isFormValid || isSubmitting) return;

    isSubmitting    = true;
    errorMessage    = "";
    successMessage  = "";
    lastCreatedId   = "";
    lastCreatedName = "";

    try {
      const payload = buildCharacterPayload({
        name, player, hpMax, armorClass, speedWalk,
        classPrimary, classSubclass, classLevel,
        speciesName,
        skills: [],
      });

      const resolvedPhoto = getResolvedPhotoValue();
      if (resolvedPhoto) payload.portrait = resolvedPhoto;

      const response = await fetch(`${SERVER_URL}/api/characters`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => null);
        errorMessage = err?.error ?? "No se pudo crear el personaje.";
        return;
      }

      const created = await response.json();
      lastCreatedId   = created.id;
      lastCreatedName = created.name;

      // Reset to defaults
      ({
        name, player, hpMax, armorClass, speedWalk,
        classPrimary, classSubclass, classLevel,
        speciesName,
      } = getDefaultFormValues());
      photoSource       = "preset";
      photo             = "";
      customPhotoUrl    = "";
      localPhotoDataUrl = "";
      successMessage = `Personaje "${lastCreatedName}" creado.`;
    } catch {
      errorMessage = "Error de conexión al crear personaje.";
    } finally {
      isSubmitting = false;
    }
  }
</script>

<section class="character-create card-base" aria-labelledby="create-character-title">
  <div class="create-header">
    <h2 id="create-character-title" class="create-title">NUEVO PERSONAJE</h2>
    <p class="create-subtitle">{$characters.length} personaje{$characters.length === 1 ? '' : 's'} en sesión</p>
    <p class="create-legend"><span class="required-mark" aria-hidden="true">*</span> Campo obligatorio</p>
  </div>

  <form class="create-form" onsubmit={submitCharacter}>
    <div class="create-layout">
      <div class="create-fields">

        <!-- Identity -->
        <div class="identity-group">
          <div class="create-field field-name">
            <Label for="name-input" class="label-caps">Nombre <span class="required-mark" aria-hidden="true">*</span></Label>
            <Input
              class="name-input form-input"
              id="name-input"
              type="text"
              placeholder="Ej. Valeria"
              bind:value={name}
              maxlength="40"
              required
              autofocus
              variant="dark"
            />
          </div>
          <div class="create-field field-player">
            <Label for="player-input" class="label-caps">Jugador <span class="required-mark" aria-hidden="true">*</span></Label>
            <Input
              class="form-input"
              id="player-input"
              type="text"
              placeholder="Ej. Sol"
              bind:value={player}
              maxlength="40"
              required
              variant="dark"
            />
          </div>
        </div>

        <!-- Photo -->
        <div class="create-section photo-section">
          <h3 class="section-title">Foto de personaje</h3>
          <div class="photo-picker-container">
            <PhotoSourcePicker
              options={PHOTO_OPTIONS}
              source={photoSource}
              presetValue={photo}
              urlValue={customPhotoUrl}
              localValue={localPhotoDataUrl}
              serverUrl={SERVER_URL}
              dense={true}
              onSourceChange={(v) => (photoSource = v)}
              onPresetChange={(v) => (photo = v)}
              onUrlChange={(v) => (customPhotoUrl = v)}
              onLocalChange={(v) => (localPhotoDataUrl = v)}
              onError={handlePhotoPickerError}
            />
          </div>
        </div>

        <!-- Combat stats -->
        <div class="create-section">
          <h3 class="section-title">Combate</h3>
          <div class="stats-grid">
            <div class="create-field field-hp">
              <Label for="hp-max-input" class="label-caps">HP MAX <span class="required-mark" aria-hidden="true">*</span></Label>
              <Input
                class="form-input"
                id="hp-max-input"
                type="number"
                min="1"
                max="999"
                title="Puntos de vida máximos (1-999)"
                bind:value={hpMax}
                required
                variant="dark"
              />
            </div>
            <div class="create-field field-ac">
              <Label for="ac-input" class="label-caps">AC</Label>
              <Input
                class="form-input"
                id="ac-input"
                type="number"
                min="0"
                max="99"
                title="Clase de armadura (0-99)"
                bind:value={armorClass}
                variant="dark"
              />
            </div>
            <div class="create-field field-vel">
              <Label for="speed-input" class="label-caps">VEL</Label>
              <Input
                class="form-input"
                id="speed-input"
                type="number"
                min="0"
                max="200"
                title="Velocidad de movimiento en pies (0-200)"
                bind:value={speedWalk}
                variant="dark"
              />
            </div>
          </div>
        </div>

        <!-- Class -->
        <div class="create-section">
          <h3 class="section-title">Clase</h3>
          <div class="identity-group">
            <div class="create-field">
              <Label for="class-input" class="label-caps">Clase</Label>
              <select id="class-input" bind:value={classPrimary} class="form-select">
                <option value="">— Seleccionar —</option>
                {#each optionSets.classOptions as opt (opt.key)}
                  <option value={opt.key}>{opt.label}</option>
                {/each}
              </select>
            </div>
            <div class="create-field">
              <Label for="level-input" class="label-caps">Nivel</Label>
              <Input
                class="form-input"
                id="level-input"
                type="number"
                min="1"
                max="20"
                bind:value={classLevel}
                variant="dark"
              />
            </div>
          </div>
          <div class="create-field" style="margin-top: 0.5rem;">
            <Label for="subclass-input" class="label-caps">Subclase</Label>
            <select
              id="subclass-input"
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
        <div class="create-section">
          <h3 class="section-title">Especie</h3>
          <div class="create-field">
            <Label for="species-input" class="label-caps">Especie</Label>
            <select id="species-input" bind:value={speciesName} class="form-select">
              <option value="">— Seleccionar —</option>
              {#each optionSets.speciesOptions as opt (opt.key)}
                <option value={opt.key}>{opt.label}</option>
              {/each}
            </select>
          </div>
        </div>

      </div>
    </div>

    <Button
      class="create-submit"
      type="submit"
      disabled={!isFormValid || isSubmitting}
    >
      {isSubmitting ? "CREANDO..." : "CREAR PERSONAJE"}
    </Button>

    {#if errorMessage}
      <p class="create-feedback error">{errorMessage}</p>
    {/if}
    {#if successMessage}
      <div class="create-success-block" in:fly={{ y: 10, duration: 400, easing: backOut }}>
        <p class="create-feedback success">{successMessage}</p>
        {#if lastCreatedId}
          <div class="create-success-actions">
            <a href={resolve(`/players/${lastCreatedId}`, {})} class="create-success-primary">
              VER FICHA
            </a>
            <button
              type="button"
              class="create-success-secondary"
              onclick={() => { successMessage = ""; lastCreatedId = ""; lastCreatedName = ""; }}
            >
              CREAR OTRO
            </button>
          </div>
        {/if}
      </div>
    {/if}
  </form>
</section>
