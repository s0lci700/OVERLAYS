<!--
  CharacterCreationForm
  =====================
  Controlled form for creating new characters and optional photo assignment.
  Submits to POST /api/characters and resets on success.
-->
<script>
  import "./CharacterCreationForm.css";
  import PhotoSourcePicker from "./PhotoSourcePicker.svelte";
  import { SERVER_URL } from "./socket";
  import characterOptions from "../../../docs/character-options.template.json";

  // Controlled form fields for the character payload.
  let name = $state("");
  let player = $state("");
  let hpMax = $state(30);
  let armorClass = $state(10);
  let speedWalk = $state(30);
  let classPrimary = $state("");
  let classSubclass = $state("");
  let classLevel = $state(1);
  let backgroundName = $state("");
  let backgroundFeat = $state("");
  let speciesName = $state("");
  let speciesSize = $state("");
  let alignment = $state("");
  let selectedLanguages = $state([]);
  let selectedRareLanguages = $state([]);
  let selectedSkills = $state([]);
  let selectedTools = $state([]);
  let selectedArmorProficiencies = $state([]);
  let selectedWeaponProficiencies = $state([]);
  let selectedItems = $state([]);
  let selectedTrinket = $state("");

  // Photo selection supports preset assets, external URL, or local image data URL.
  let photoSource = $state("preset");
  let photo = $state(""); // Preset value. Empty string means random.
  let customPhotoUrl = $state("");
  let localPhotoDataUrl = $state("");

  // UI feedback state for submit lifecycle.
  let isSubmitting = $state(false);
  let errorMessage = $state("");
  let successMessage = $state("");

  // Preset image options rendered by PhotoSourcePicker.
  const AVAILABLE_PHOTOS = [
    { label: "Aleatorio", value: "" },
    { label: "Barbarian", value: "/assets/img/barbarian.png" },
    { label: "Elf", value: "/assets/img/elf.png" },
    { label: "Wizard", value: "/assets/img/wizard.png" },
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

  // Minimal client-side validation before enabling submit.
  const isFormValid = $derived(
    name.trim().length > 0 && player.trim().length > 0 && hpMax > 0,
  );

  /**
   * Normalize multi-select values into trimmed, non-empty keys.
   * @param {string[] | undefined | null} values
   * @returns {string[]}
   */
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
  function getResolvedPhotoValue() {
    if (photoSource === "local") return localPhotoDataUrl;
    if (photoSource === "url") return customPhotoUrl.trim();
    return photo;
  }

  /**
   * Handle PhotoSourcePicker validation errors and clear stale messages.
   * @param {string} message
   */
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
        <!-- Required identity fields. -->
        <label class="create-field">
          <span class="label-caps">Nombre</span>
          <input
            type="text"
            placeholder="Ej. Valeria"
            bind:value={name}
            maxlength="40"
            required
          />
        </label>

        <label class="create-field">
          <span class="label-caps">Jugador</span>
          <input
            type="text"
            placeholder="Ej. Sol"
            bind:value={player}
            maxlength="40"
            required
          />
        </label>

        <!-- Core combat stats. -->
        <div class="create-grid">
          <label class="create-field">
            <span class="label-caps">HP MAX</span>
            <input
              type="number"
              min="1"
              max="999"
              bind:value={hpMax}
              required
            />
          </label>
          <label class="create-field">
            <span class="label-caps">AC</span>
            <input type="number" min="0" max="99" bind:value={armorClass} />
          </label>
          <label class="create-field">
            <span class="label-caps">VEL</span>
            <input type="number" min="0" max="200" bind:value={speedWalk} />
          </label>
        </div>

        <div class="create-section">
          <h3 class="section-title">Opciones de personaje</h3>

          <div class="create-grid create-grid--two">
            <label class="create-field">
              <span class="label-caps">Clase</span>
              <select bind:value={classPrimary}>
                <option value="">Sin definir</option>
                {#each classOptions as option}
                  <option value={option.key}>{option.label}</option>
                {/each}
              </select>
            </label>
            <label class="create-field">
              <span class="label-caps">Subclase</span>
              <select
                bind:value={classSubclass}
                disabled={subclassOptions.length === 0}
              >
                {#if subclassOptions.length === 0}
                  <option value="">Sin opciones</option>
                {:else}
                  <option value="">Sin definir</option>
                  {#each subclassOptions as option}
                    <option value={option.key}>{option.label}</option>
                  {/each}
                {/if}
              </select>
            </label>
            <label class="create-field">
              <span class="label-caps">Nivel</span>
              <input type="number" min="1" max="20" bind:value={classLevel} />
            </label>
            <label class="create-field">
              <span class="label-caps">Background</span>
              <select bind:value={backgroundName}>
                <option value="">Sin definir</option>
                {#each backgroundOptions as option}
                  <option value={option.key}>{option.label}</option>
                {/each}
              </select>
            </label>
            <label class="create-field">
              <span class="label-caps">Feat</span>
              <select
                bind:value={backgroundFeat}
                disabled={featOptions.length === 0}
              >
                {#if featOptions.length === 0}
                  <option value="">Sin opciones</option>
                {:else}
                  <option value="">Sin definir</option>
                  {#each featOptions as option}
                    <option value={option.key}>{option.label}</option>
                  {/each}
                {/if}
              </select>
            </label>
            <label class="create-field">
              <span class="label-caps">Especie</span>
              <select bind:value={speciesName}>
                <option value="">Sin definir</option>
                {#each speciesOptions as option}
                  <option value={option.key}>{option.label}</option>
                {/each}
              </select>
            </label>
            <label class="create-field">
              <span class="label-caps">Tamaño</span>
              <select bind:value={speciesSize}>
                <option value="">Sin definir</option>
                {#each sizeOptions as option}
                  <option value={option.key}>{option.label}</option>
                {/each}
              </select>
            </label>
            <label class="create-field">
              <span class="label-caps">Alineamiento</span>
              <select bind:value={alignment}>
                <option value="">Sin definir</option>
                {#each alignmentOptions as option}
                  <option value={option.key}>{option.label}</option>
                {/each}
              </select>
            </label>
          </div>

          <div class="create-grid create-grid--two">
            <label class="create-field">
              <span class="label-caps">Idiomas</span>
              <select
                bind:value={selectedLanguages}
                multiple
                size={Math.max(3, Math.min(6, languageOptions.length || 3))}
              >
                {#if languageOptions.length === 0}
                  <option value="">Sin opciones</option>
                {:else}
                  {#each languageOptions as option}
                    <option value={option.key}>{option.label}</option>
                  {/each}
                {/if}
              </select>
            </label>
            <label class="create-field">
              <span class="label-caps">Idiomas raros</span>
              <select
                bind:value={selectedRareLanguages}
                multiple
                size={Math.max(3, Math.min(6, rareLanguageOptions.length || 3))}
              >
                {#if rareLanguageOptions.length === 0}
                  <option value="">Sin opciones</option>
                {:else}
                  {#each rareLanguageOptions as option}
                    <option value={option.key}>{option.label}</option>
                  {/each}
                {/if}
              </select>
            </label>
          </div>

          <div class="create-grid create-grid--two">
            <label class="create-field">
              <span class="label-caps">Skills</span>
              <select
                bind:value={selectedSkills}
                multiple
                size={Math.max(4, Math.min(8, skillOptions.length || 4))}
              >
                {#if skillOptions.length === 0}
                  <option value="">Sin opciones</option>
                {:else}
                  {#each skillOptions as option}
                    <option value={option.key}>{option.label}</option>
                  {/each}
                {/if}
              </select>
            </label>
            <label class="create-field">
              <span class="label-caps">Herramientas</span>
              <select
                bind:value={selectedTools}
                multiple
                size={Math.max(4, Math.min(8, toolOptions.length || 4))}
              >
                {#if toolOptions.length === 0}
                  <option value="">Sin opciones</option>
                {:else}
                  {#each toolOptions as option}
                    <option value={option.key}>{option.label}</option>
                  {/each}
                {/if}
              </select>
            </label>
          </div>

          <div class="create-grid create-grid--two">
            <label class="create-field">
              <span class="label-caps">Armadura</span>
              <select
                bind:value={selectedArmorProficiencies}
                multiple
                size={Math.max(3, Math.min(6, armorOptions.length || 3))}
              >
                {#if armorOptions.length === 0}
                  <option value="">Sin opciones</option>
                {:else}
                  {#each armorOptions as option}
                    <option value={option.key}>{option.label}</option>
                  {/each}
                {/if}
              </select>
            </label>
            <label class="create-field">
              <span class="label-caps">Armas</span>
              <select
                bind:value={selectedWeaponProficiencies}
                multiple
                size={Math.max(3, Math.min(6, weaponOptions.length || 3))}
              >
                {#if weaponOptions.length === 0}
                  <option value="">Sin opciones</option>
                {:else}
                  {#each weaponOptions as option}
                    <option value={option.key}>{option.label}</option>
                  {/each}
                {/if}
              </select>
            </label>
          </div>

          <div class="create-grid create-grid--two">
            <label class="create-field">
              <span class="label-caps">Items</span>
              <select
                bind:value={selectedItems}
                multiple
                size={Math.max(3, Math.min(6, itemOptions.length || 3))}
                disabled={itemOptions.length === 0}
              >
                {#if itemOptions.length === 0}
                  <option value="">Sin opciones</option>
                {:else}
                  {#each itemOptions as option}
                    <option value={option.key}>{option.label}</option>
                  {/each}
                {/if}
              </select>
            </label>
            <label class="create-field">
              <span class="label-caps">Trinket</span>
              <select
                bind:value={selectedTrinket}
                disabled={trinketOptions.length === 0}
              >
                {#if trinketOptions.length === 0}
                  <option value="">Sin opciones</option>
                {:else}
                  <option value="">Sin definir</option>
                  {#each trinketOptions as option}
                    <option value={option.key}>{option.label}</option>
                  {/each}
                {/if}
              </select>
            </label>
          </div>
        </div>
      </div>

      <!-- Shared photo source component (preset, URL, local upload). -->
      <aside class="create-photo">
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
      </aside>
    </div>

    <!-- Submit button stays disabled until form is valid and not in-flight. -->
    <button
      class="create-submit btn-base"
      type="submit"
      disabled={!isFormValid || isSubmitting}
    >
      {isSubmitting ? "CREANDO..." : "CREAR PERSONAJE"}
    </button>

    <!-- Inline API feedback for operators during live sessions. -->
    {#if errorMessage}
      <p class="create-feedback error">{errorMessage}</p>
    {/if}
    {#if successMessage}
      <p class="create-feedback success">{successMessage}</p>
    {/if}
  </form>
</section>
