<!--
  CharacterCreationForm
  =====================
  Controlled form for creating new characters and optional photo assignment.
  - Purpose: collect character metadata (name, player, stats, options)
    and optionally attach a photo chosen via the PhotoSourcePicker modal.
  - Behavior: performs client-side validation, composes a normalized payload,
    POSTs to `${SERVER_URL}/api/characters`, and resets on success.
  - Accessibility: form controls include native labels and focus styles.
  - Note: visual layout lives in `CharacterCreationForm.css`.
-->
<script>
  import "./CharacterCreationForm.css";
  import PhotoSourcePicker from "../photo-source-picker/PhotoSourcePicker.svelte";
  import CharacterOptionsFields from "../character-form-fields/CharacterOptionsFields.svelte";
  import CharacterProficienciesFields from "../character-form-fields/CharacterProficienciesFields.svelte";
  import Modal from "$lib/components/shared/modal/Modal.svelte";
  import { Button } from "$lib/components/shared/button/index.js";
  import { Input } from "$lib/components/shared/input/index.js";
  import { Label } from "$lib/components/shared/label/index.js";
  import { SERVER_URL } from "$lib/services/socket.js";
  import characterOptions from "$lib/data/character-options.template.json";
  import {
    parseOptionSets,
    buildLabelMap,
    buildCharacterPayload,
    getDefaultFormValues,
  } from "$lib/services/character-form.js";

  const { meta, ...rawOptions } = characterOptions;
  const optionSets = parseOptionSets(rawOptions);
  const labelOf = buildLabelMap(optionSets);

  // Form field state — initialised from defaults, reset after successful submit.
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
  } = $state(getDefaultFormValues());

  // Photo selection supports preset assets, external URL, or local image data URL.
  let photoSource = $state("preset");
  let photo = $state("");
  let customPhotoUrl = $state("");
  let localPhotoDataUrl = $state("");

  let isSubmitting = $state(false);
  let errorMessage = $state("");
  let successMessage = $state("");

  const AVAILABLE_PHOTOS = [
    { label: "Aleatorio", value: "" },
    { label: "Barbarian", value: "/assets/img/barbarian.png" },
    { label: "Elf", value: "/assets/img/elf.png" },
    { label: "Wizard", value: "/assets/img/wizard.png" },
    { label: "Thiefling", value: "/assets/img/thiefling.png" },
    { label: "Dwarf", value: "/assets/img/dwarf.png" },
  ];

  let showPhotoModal = $state(false);

  const isFormValid = $derived(
    name.trim().length > 0 && player.trim().length > 0 && hpMax > 0,
  );

  function getResolvedPhotoValue() {
    if (photoSource === "local") return localPhotoDataUrl;
    if (photoSource === "url") return customPhotoUrl.trim();
    if (!photo) return "";
    const p = String(photo);
    if (
      p.startsWith("http://") ||
      p.startsWith("https://") ||
      p.startsWith("data:") ||
      p.startsWith("blob:")
    ) {
      return p;
    }
    if (p.startsWith("/")) return `${SERVER_URL}${p}`;
    return `${SERVER_URL}/${p.replace(/^\/+/, "")}`;
  }

  function handlePhotoPickerError(message) {
    if (message) {
      errorMessage = message;
      return;
    }
    if (
      errorMessage === "El archivo debe ser una imagen." ||
      errorMessage === "No se pudo procesar la imagen local."
    ) {
      errorMessage = "";
    }
  }

  async function submitCharacter(event) {
    event.preventDefault();
    if (!isFormValid || isSubmitting) return;

    isSubmitting = true;
    errorMessage = "";
    successMessage = "";

    try {
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

      const resolvedPhoto = getResolvedPhotoValue();
      if (resolvedPhoto) payload.photo = resolvedPhoto;

      const response = await fetch(`${SERVER_URL}/api/characters`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const payloadError = await response.json().catch(() => null);
        errorMessage = payloadError?.error || "No se pudo crear el personaje.";
        return;
      }

      // Reset all fields to defaults.
      ({
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
      } = getDefaultFormValues());
      photoSource = "preset";
      photo = "";
      customPhotoUrl = "";
      localPhotoDataUrl = "";
      successMessage = "Personaje creado.";
    } catch (error) {
      console.error("Error creating character", error);
      errorMessage = "Error de conexión al crear personaje.";
    } finally {
      isSubmitting = false;
    }
  }
</script>

<!-- Character creation card used by the control panel dashboard. -->
<section
  class="character-create card-base"
  aria-labelledby="create-character-title"
>
  <div class="create-header">
    <h2 id="create-character-title" class="create-title">NUEVO PERSONAJE</h2>
    <p class="create-subtitle">Scaffold base para alta rápida en sesión</p>
  </div>

  <form class="create-form" onsubmit={submitCharacter}>
    <div class="create-layout">
      <div class="create-fields">
        <!-- Photo -->
        <div class="create-section photo-section">
          <h3 class="section-title">Foto de personaje</h3>
          <div class="photo-section-container">
            <button
              class="photo-modal-trigger btn-base ph-el-1"
              type="button"
              onclick={() => (showPhotoModal = true)}
            >
              {getResolvedPhotoValue() ? "Editar foto" : "Agregar foto"}
            </button>
            {#if getResolvedPhotoValue()}
              <div class="photo-preview ph-el-2">
                <img src={getResolvedPhotoValue()} alt="Preview foto" />
              </div>
            {/if}
          </div>
          <Modal
            bind:open={showPhotoModal}
            title="Seleccionar foto"
            showCloseButton={false}
          >
            <PhotoSourcePicker
              options={AVAILABLE_PHOTOS}
              source={photoSource}
              presetValue={photo}
              urlValue={customPhotoUrl}
              localValue={localPhotoDataUrl}
              serverUrl={SERVER_URL}
              dense={true}
              onSourceChange={(value) => (photoSource = value)}
              onPresetChange={(value) => (photo = value)}
              onUrlChange={(value) => (customPhotoUrl = value)}
              onLocalChange={(value) => (localPhotoDataUrl = value)}
              onError={handlePhotoPickerError}
            />
          </Modal>
        </div>

        <!-- Identity fields -->
        <div class="identity-group">
          <div class="create-field field-name">
            <Label for="name-input" class="label-caps">Nombre</Label>
            <Input
              class="name-input form-input"
              id="name-input"
              type="text"
              placeholder="Ej. Valeria"
              bind:value={name}
              maxlength="40"
              required
              variant="dark"
            />
          </div>
          <div class="create-field field-player">
            <Label for="player-input" class="label-caps">Jugador</Label>
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

        <!-- Core combat stats -->
        <div class="stats-grid">
          <div class="create-field field-hp">
            <Label for="hp-max-input" class="label-caps">HP MAX</Label>
            <Input
              class="form-input"
              id="hp-max-input"
              type="number"
              min="1"
              max="999"
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
              bind:value={speedWalk}
              variant="dark"
            />
          </div>
        </div>

        <!-- Section: Character Options -->
        <div class="create-section options-section">
          <h3 class="section-title">Opciones de personaje</h3>
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

        <!-- Sections: Languages, Proficiencies, Equipment -->
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
      <p class="create-feedback success">{successMessage}</p>
    {/if}
  </form>
</section>
