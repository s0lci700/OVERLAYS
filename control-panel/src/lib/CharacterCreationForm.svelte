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
  import "$lib/components/ui/pills/Pills.css";
  import MultiSelect from "./MultiSelect.svelte";
  import PhotoSourcePicker from "./PhotoSourcePicker.svelte";
  import * as Dialog from "./components/ui/dialog/index.js";
  import Modal from "$lib/components/ui/modal/Modal.svelte";
  import { Button } from "$lib/components/ui/button/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { Label } from "$lib/components/ui/label/index.js";
  import { SelectionPillList } from "$lib/components/ui/selection-pill-list/index.js";
  import { SERVER_URL } from "./socket";
  import characterOptions from "./character-options.template.json";

  // Controlled form fields for the character payload.
  // Each field is a reactive local state item bound to inputs in the template.
  // Using `$state()` integrates with the app's state helper (thin wrapper used
  // across the control panel). Treat these as plain local variables in this file.
  let name = $state(""); // Character display name (required)
  let player = $state(""); // Player name (required)
  // Core numeric stats with sensible defaults.
  let hpMax = $state(30);
  let armorClass = $state(10);
  let speedWalk = $state(30);
  // Class, subclass and level. `classPrimary` is a key matching `optionSets.classes`.
  let classPrimary = $state("");
  let classSubclass = $state("");
  let classLevel = $state(1);
  let backgroundName = $state("");
  let backgroundFeat = $state("");
  let speciesName = $state("");
  let speciesSize = $state("");
  let alignment = $state("");
  // Multi-select collections: stored as arrays of option keys.
  let selectedLanguages = $state([]);
  let selectedRareLanguages = $state([]);
  let selectedSkills = $state([]);
  let selectedTools = $state([]);
  let selectedArmorProficiencies = $state([]);
  let selectedWeaponProficiencies = $state([]);
  let selectedItems = $state([]);
  let selectedTrinket = $state("");

  // Photo selection supports preset assets, external URL, or local image data URL.
  // `photoSource` determines which of the three values is used when submitting.
  let photoSource = $state("preset");
  let photo = $state(""); // Preset value. Empty string means random/default.
  let customPhotoUrl = $state("");
  let localPhotoDataUrl = $state("");

  // UI feedback state for submit lifecycle.
  // These flags are used to disable actions and show messages while requests run.
  let isSubmitting = $state(false);
  let errorMessage = $state("");
  let successMessage = $state("");

  // Preset image options rendered by PhotoSourcePicker. Keep this list small for demo.
  const AVAILABLE_PHOTOS = [
    { label: "Aleatorio", value: "" },
    { label: "Barbarian", value: "/assets/img/barbarian.png" },
    { label: "Elf", value: "/assets/img/elf.png" },
    { label: "Wizard", value: "/assets/img/wizard.png" },
    { label: "Thiefling", value: "/assets/img/thiefling.png" },
    { label: "Dwarf", value: "/assets/img/dwarf.png" },
  ];

  /**
   * @typedef {{key: string, label: string}} OptionEntry
   * @typedef {{
   *  classes?: OptionEntry[],
   *  subclasses?: OptionEntry[],
   *  backgrounds?: OptionEntry[],
   *  feats?: OptionEntry[],
   *  species?: OptionEntry[],
   *  sizes?: OptionEntry[],
   *  languages?: OptionEntry[],
   *  rare_languages?: OptionEntry[],
   *  alignments?: OptionEntry[],
   *  skills?: OptionEntry[],
   *  tools?: OptionEntry[],
   *  armor_proficiencies?: OptionEntry[],
   *  weapon_proficiencies?: OptionEntry[],
   *  items?: OptionEntry[],
   *  trinkets?: OptionEntry[]
   * }} CharacterOptions
   */
  /** @type {CharacterOptions} */
  const optionSets = characterOptions || {};
  const classOptions = optionSets.classes || [];
  const subclassOptions = optionSets.subclasses || [];
  const backgroundOptions = optionSets.backgrounds || [];
  const featOptions = optionSets.feats || [];
  const speciesOptions = optionSets.species || [];
  const sizeOptions = optionSets.sizes || [];
  const languageOptions = optionSets.languages || [];
  const rareLanguageOptions = optionSets.rare_languages || [];
  const alignmentOptions = optionSets.alignments || [];
  const skillOptions = optionSets.skills || [];
  const toolOptions = optionSets.tools || [];
  const armorOptions = optionSets.armor_proficiencies || [];
  const weaponOptions = optionSets.weapon_proficiencies || [];
  const itemOptions = optionSets.items || [];
  const trinketOptions = optionSets.trinkets || [];

  // Label lookup maps for pill previews. This Map is used to translate selected
  // option keys into human-readable labels for the selection pills rendered
  // under the MultiSelect components in the template.
  // eslint-disable-next-line svelte/prefer-svelte-reactivity
  const labelOf = new Map();

  // Aggregate all option objects and populate the lookup map. Guard against
  // missing or empty keys/labels so `SelectionPillList` receives only valid
  // string labels for rendering.
  const _allOptions = [
    ...languageOptions,
    ...rareLanguageOptions,
    ...skillOptions,
    ...toolOptions,
    ...armorOptions,
    ...weaponOptions,
    ...itemOptions,
  ];

  _allOptions.forEach((opt) => {
    if (!opt) return;
    const k = opt.key == null ? "" : String(opt.key).trim();
    const v = opt.label == null ? "" : String(opt.label).trim();
    if (k.length === 0 || v.length === 0) return;
    labelOf.set(k, v);
  });

  // Modal trigger state for photo picker overlay. Toggled by the "Agregar foto"
  // button in the template and observed to render the `Modal` portal.
  let showPhotoModal = $state(false);

  // Minimal client-side validation before enabling submit.
  // `isFormValid` is a computed/derived boolean used to early-exit the submit
  // handler and to disable the submit button in the template.
  const isFormValid = $derived(
    name.trim().length > 0 && player.trim().length > 0 && hpMax > 0,
  );

  /**
   * Normalize multi-select values into trimmed, non-empty keys.
   * @param {string[] | undefined | null} values
   * @returns {string[]}
   */
  // Normalize multi-select arrays into trimmed, non-empty keys. This prevents
  // accidental empty strings from being sent to the API and ensures a stable
  // shape for server-side processing.
  function normalizeSelection(values) {
    if (!Array.isArray(values)) return [];
    return values
      .map((value) => String(value).trim())
      .filter((value) => value.length > 0);
  }

  /**
   * Resolve the selected photo source into the value sent to the API.
   * @returns {string}
   */
  // Resolve the selected photo value according to the active `photoSource`.
  // Returned value is either a preset URL, a user-provided URL, or a local
  // data-URL generated from an uploaded image.
  function getResolvedPhotoValue() {
    if (photoSource === "local") return localPhotoDataUrl;
    if (photoSource === "url") return customPhotoUrl.trim();

    // Preset values are stored as project-relative paths (e.g. "/assets/img/elf.png").
    // When rendering in the control panel (Vite dev server) we need to prefix
    // those with the backend `SERVER_URL` so requests go to the running server
    // that serves the `assets/` directory.
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

  /**
   * Handle PhotoSourcePicker validation errors and clear stale messages.
   * @param {string} message
   */
  // Photo picker error handler: sets an inline error message visible near
  // the photo controls. The PhotoSourcePicker calls this via `onError`.
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

  /**
   * Submit the new character payload to the API and reset on success.
   * @param {SubmitEvent} event
   * @returns {Promise<void>}
   */
  // Submit handler: validates client-side, composes payload, performs POST
  // to the server and resets fields on success. All server errors are mapped
  // to `errorMessage` for user feedback.
  async function submitCharacter(event) {
    event.preventDefault();
    if (!isFormValid || isSubmitting) return;

    isSubmitting = true;
    errorMessage = "";
    successMessage = "";

    try {
      const payload = {
        name: name.trim(),
        player: player.trim(),
        hp_max: Number(hpMax),
        armor_class: Number(armorClass),
        speed_walk: Number(speedWalk),
        class_primary: {
          name: classPrimary,
          level: Number(classLevel) || 1,
          subclass: classSubclass,
        },
        background: {
          name: backgroundName,
          feat: backgroundFeat,
          skill_proficiencies: normalizeSelection(selectedSkills),
          tool_proficiency: normalizeSelection(selectedTools)[0] || "",
        },
        species: {
          name: speciesName,
          size: speciesSize,
          speed_walk: Number(speedWalk),
          traits: [],
        },
        languages: [
          ...normalizeSelection(selectedLanguages),
          ...normalizeSelection(selectedRareLanguages),
        ],
        alignment,
        proficiencies: {
          skills: normalizeSelection(selectedSkills),
          saving_throws: [],
          armor: normalizeSelection(selectedArmorProficiencies),
          weapons: normalizeSelection(selectedWeaponProficiencies),
          tools: normalizeSelection(selectedTools),
        },
        equipment: {
          items: normalizeSelection(selectedItems),
          coins: { gp: 0, sp: 0, cp: 0 },
          trinket: selectedTrinket,
        },
      };

      const resolvedPhoto = getResolvedPhotoValue();

      if (resolvedPhoto) {
        payload.photo = resolvedPhoto;
      }

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

      name = "";
      player = "";
      hpMax = 30;
      armorClass = 10;
      speedWalk = 30;
      classPrimary = "";
      classSubclass = "";
      classLevel = 1;
      backgroundName = "";
      backgroundFeat = "";
      speciesName = "";
      speciesSize = "";
      alignment = "";
      selectedLanguages = [];
      selectedRareLanguages = [];
      selectedSkills = [];
      selectedTools = [];
      selectedArmorProficiencies = [];
      selectedWeaponProficiencies = [];
      selectedItems = [];
      selectedTrinket = "";
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
        <!-- Section: Photo (moved inline for better layout) -->
        <div class="create-section photo-section">
          <h3 class="section-title">Foto de personaje</h3>
          <button
            class="photo-modal-trigger btn-base"
            type="button"
            onclick={() => (showPhotoModal = true)}
          >
            {getResolvedPhotoValue() ? "Editar foto" : "Agregar foto"}
          </button>
          {#if getResolvedPhotoValue()}
            <div class="photo-preview-inline">
              <img src={getResolvedPhotoValue()} alt="Preview foto" />
            </div>
          {/if}
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
        <!-- Required identity fields. Arrange 'Nombre' and 'Jugador' side-by-side -->
        <div class="create-grid create-grid--two identity-group">
          <div class="create-field">
            <Label for="name-input" class="label-caps">Nombre</Label>
            <Input
              class="name-input form-input"
              id="name-input"
              type="text"
              placeholder="Ej. Valeria"
              bind:value={name}
              maxlength="40"
              required
            />
          </div>

          <div class="create-field">
            <Label for="player-input" class="label-caps">Jugador</Label>
            <Input
              class="form-input"
              id="player-input"
              type="text"
              placeholder="Ej. Sol"
              bind:value={player}
              maxlength="40"
              required
            />
          </div>
        </div>

        <!-- Core combat stats. -->
        <div class="create-grid stats-grid">
          <div class="create-field">
            <Label for="hp-max-input" class="label-caps">HP MAX</Label>
            <Input
              class="form-input"
              id="hp-max-input"
              type="number"
              min="1"
              max="999"
              bind:value={hpMax}
              required
            />
          </div>
          <div class="create-field">
            <Label for="ac-input" class="label-caps">AC</Label>
            <Input
              class="form-input"
              id="ac-input"
              type="number"
              min="0"
              max="99"
              bind:value={armorClass}
            />
          </div>
          <div class="create-field">
            <Label for="speed-input" class="label-caps">VEL</Label>
            <Input
              class="form-input"
              id="speed-input"
              type="number"
              min="0"
              max="200"
              bind:value={speedWalk}
            />
          </div>
        </div>

        <!-- Section: Character Options (class, background, species, alignment) -->
        <div class="create-section options-section">
          <h3 class="section-title">Opciones de personaje</h3>
          <div class="create-grid create-grid--two">
            <label class="create-field">
              <span class="label-caps">Clase</span>
              <select class="selector" bind:value={classPrimary}>
                <option value="">Sin definir</option>
                {#each classOptions as option (option.key)}
                  <option value={option.key}>{option.label}</option>
                {/each}
              </select>
            </label>
            <label class="create-field">
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
            <label class="create-field">
              <span class="label-caps">Nivel</span>
              <Input
                class="form-input"
                type="number"
                min="1"
                max="20"
                bind:value={classLevel}
              />
            </label>
            <label class="create-field">
              <span class="label-caps">Background</span>
              <select class="selector" bind:value={backgroundName}>
                <option value="">Sin definir</option>
                {#each backgroundOptions as option (option.key)}
                  <option value={option.key}>{option.label}</option>
                {/each}
              </select>
            </label>
            <label class="create-field">
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
            <label class="create-field">
              <span class="label-caps">Especie</span>
              <select class="selector" bind:value={speciesName}>
                <option value="">Sin definir</option>
                {#each speciesOptions as option (option.key)}
                  <option value={option.key}>{option.label}</option>
                {/each}
              </select>
            </label>
            <label class="create-field">
              <span class="label-caps">Tamaño</span>
              <select class="selector" bind:value={speciesSize}>
                <option value="">Sin definir</option>
                {#each sizeOptions as option (option.key)}
                  <option value={option.key}>{option.label}</option>
                {/each}
              </select>
            </label>
            <label class="create-field">
              <span class="label-caps">Alineamiento</span>
              <select class="selector" bind:value={alignment}>
                <option value="">Sin definir</option>
                {#each alignmentOptions as option (option.key)}
                  <option value={option.key}>{option.label}</option>
                {/each}
              </select>
            </label>
          </div>
        </div>

        <!-- Section: Languages & Proficiencies -->
        <div class="create-section languages-section">
          <h3 class="section-title">Idiomas y proficiencias</h3>
          <div class="create-grid create-grid--two">
            <div class="create-field">
              <span class="label-caps"
                >Idiomas {#if selectedLanguages.length > 0}<span
                    class="selection-count">{selectedLanguages.length}</span
                  >{/if}</span
              >
              <MultiSelect
                options={languageOptions}
                selected={selectedLanguages}
                onchange={(v) => (selectedLanguages = v)}
                size={Math.max(3, Math.min(6, languageOptions.length || 3))}
              />
              <SelectionPillList items={selectedLanguages} labelMap={labelOf} />
            </div>
            <div class="create-field">
              <span class="label-caps"
                >Idiomas raros {#if selectedRareLanguages.length > 0}<span
                    class="selection-count">{selectedRareLanguages.length}</span
                  >{/if}</span
              >
              <MultiSelect
                options={rareLanguageOptions}
                selected={selectedRareLanguages}
                onchange={(v) => (selectedRareLanguages = v)}
                size={Math.max(3, Math.min(6, rareLanguageOptions.length || 3))}
              />
              <SelectionPillList
                items={selectedRareLanguages}
                labelMap={labelOf}
              />
            </div>
          </div>
          <div class="create-grid create-grid--two">
            <div class="create-field">
              <span class="label-caps"
                >Skills {#if selectedSkills.length > 0}<span
                    class="selection-count">{selectedSkills.length}</span
                  >{/if}</span
              >
              <MultiSelect
                options={skillOptions}
                selected={selectedSkills}
                onchange={(v) => (selectedSkills = v)}
                size={Math.max(4, Math.min(8, skillOptions.length || 4))}
              />
              <SelectionPillList items={selectedSkills} labelMap={labelOf} />
            </div>
            <div class="create-field">
              <span class="label-caps"
                >Herramientas {#if selectedTools.length > 0}<span
                    class="selection-count">{selectedTools.length}</span
                  >{/if}</span
              >
              <MultiSelect
                options={toolOptions}
                selected={selectedTools}
                onchange={(v) => (selectedTools = v)}
                size={Math.max(4, Math.min(8, toolOptions.length || 4))}
              />
              <SelectionPillList items={selectedTools} labelMap={labelOf} />
            </div>
          </div>
          <div class="create-grid create-grid--two">
            <div class="create-field">
              <span class="label-caps"
                >Armadura {#if selectedArmorProficiencies.length > 0}<span
                    class="selection-count"
                    >{selectedArmorProficiencies.length}/{armorOptions.length}</span
                  >{/if}</span
              >
              <MultiSelect
                options={armorOptions}
                selected={selectedArmorProficiencies}
                onchange={(v) => (selectedArmorProficiencies = v)}
                size={Math.max(3, Math.min(6, armorOptions.length || 3))}
              />
              <SelectionPillList
                items={selectedArmorProficiencies}
                labelMap={labelOf}
              />
            </div>
            <div class="create-field">
              <span class="label-caps"
                >Armas {#if selectedWeaponProficiencies.length > 0}<span
                    class="selection-count"
                    >{selectedWeaponProficiencies.length}/{weaponOptions.length}</span
                  >{/if}</span
              >
              <MultiSelect
                options={weaponOptions}
                selected={selectedWeaponProficiencies}
                onchange={(v) => (selectedWeaponProficiencies = v)}
                size={Math.max(3, Math.min(6, weaponOptions.length || 3))}
              />
              <SelectionPillList
                items={selectedWeaponProficiencies}
                labelMap={labelOf}
              />
            </div>
          </div>
        </div>

        <!-- Section: Equipment -->
        <div class="create-section">
          <h3 class="section-title">Equipo</h3>
          <div class="create-grid create-grid--two equipment-section">
            <div class="create-field">
              <span class="label-caps"
                >Items {#if selectedItems.length > 0}<span
                    class="selection-count">{selectedItems.length}</span
                  >{/if}</span
              >
              <MultiSelect
                options={itemOptions}
                selected={selectedItems}
                onchange={(v) => (selectedItems = v)}
                disabled={itemOptions.length === 0}
                size={Math.max(3, Math.min(6, itemOptions.length || 3))}
              />
              <SelectionPillList items={selectedItems} labelMap={labelOf} />
            </div>
            <label class="create-field">
              <span class="label-caps">Trinket</span>
              <select
                class="selector"
                bind:value={selectedTrinket}
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
      </div>

      <!-- photo picker moved inline into fields to avoid empty sidebar space -->
    </div>

    <!-- Submit button stays disabled until form is valid and not in-flight. -->
    <Button
      class="create-submit"
      type="submit"
      disabled={!isFormValid || isSubmitting}
    >
      {isSubmitting ? "CREANDO..." : "CREAR PERSONAJE"}
    </Button>

    <!-- Inline API feedback for operators during live sessions. -->
    {#if errorMessage}
      <p class="create-feedback error">{errorMessage}</p>
    {/if}
    {#if successMessage}
      <p class="create-feedback success">{successMessage}</p>
    {/if}
  </form>
</section>
