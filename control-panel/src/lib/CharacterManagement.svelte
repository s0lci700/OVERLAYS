<!--
  CharacterManagement
  ===================
  Admin panel for managing per-character photos (preset, URL, local file).
  Persists changes via PUT /api/characters/:id/photo and relies on socket sync.
-->
<script>
  import "./CharacterManagement.css";
  import "$lib/components/ui/pills/Pills.css";
  import MultiSelect from "./MultiSelect.svelte";
  import SelectionPills from "$lib/components/ui/pills/SelectionPills.svelte";
  import LevelPill from "$lib/components/ui/pills/LevelPill.svelte";
  import PhotoSourcePicker from "./PhotoSourcePicker.svelte";
  import { characters, SERVER_URL } from "./socket";
  import * as Dialog from "$lib/components/ui/dialog";
  import { Button } from "$lib/components/ui/button/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { Label } from "$lib/components/ui/label/index.js";
  import { resolvePhotoSrc } from "./utils.js";
  import * as AlertDialog from "$lib/components/ui/alert-dialog";
  import characterOptions from "../../../docs/character-options.template.json";
  import { fade } from "svelte/transition";

  const PHOTO_OPTIONS = [
    { label: "Aleatorio", value: "" },
    { label: "Barbarian", value: "/assets/img/barbarian.png" },
    { label: "Elf", value: "/assets/img/elf.png" },
    { label: "Wizard", value: "/assets/img/wizard.png" },
  ];

  let photoSourceById = $state({});
  let presetPhotoById = $state({});
  let customUrlById = $state({});
  let localPhotoById = $state({});
  let isSavingById = $state({});
  let feedbackById = $state({});
  let isSavingProfileById = $state({});
  let profileFeedbackById = $state({});
  let nameById = $state({});
  let playerById = $state({});
  let hpMaxById = $state({});
  let armorClassById = $state({});
  let speedWalkById = $state({});
  let classPrimaryById = $state({});
  let classSubclassById = $state({});
  let classLevelById = $state({});
  let backgroundNameById = $state({});
  let backgroundFeatById = $state({});
  let speciesNameById = $state({});
  let speciesSizeById = $state({});
  let alignmentById = $state({});
  let languagesById = $state({});
  let rareLanguagesById = $state({});
  let skillsById = $state({});
  let toolsById = $state({});
  let armorById = $state({});
  let weaponsById = $state({});
  let itemsById = $state({});
  let trinketById = $state({});
  let editOpenById = $state({});
  // Per-card toggle state for read-only info panel (true = open, false = closed)
  let infoOpenById = $state({});
  // Per-card toggle state for nested loadout detail (true = expanded, false = collapsed)
  let loadoutOpenById = $state({});

  let activePhotoId = $state(null);

  /** ID of the character pending deletion — drives the AlertDialog. */
  let pendingDeleteId = $state(null);

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
  const rareLanguageKeys = new Set(
    rareLanguageOptions.map((option) => option.key),
  );
  const labelMaps = {
    class: new Map(classOptions.map((option) => [option.key, option.label])),
    species: new Map(
      speciesOptions.map((option) => [option.key, option.label]),
    ),
    alignment: new Map(
      alignmentOptions.map((option) => [option.key, option.label]),
    ),
  };

  // Unified label lookup for pill previews.
  const labelOf = new Map([
    ...languageOptions.map((o) => [o.key, o.label]),
    ...rareLanguageOptions.map((o) => [o.key, o.label]),
    ...skillOptions.map((o) => [o.key, o.label]),
    ...toolOptions.map((o) => [o.key, o.label]),
    ...armorOptions.map((o) => [o.key, o.label]),
    ...weaponOptions.map((o) => [o.key, o.label]),
    ...itemOptions.map((o) => [o.key, o.label]),
  ]);

  function inferSource(photoValue) {
    if (!photoValue || PHOTO_OPTIONS.some((o) => o.value === photoValue)) {
      return "preset";
    }
    if (photoValue.startsWith("data:")) return "local";
    return "url";
  }

  function initCharacterState(character) {
    const charId = character.id;
    if (photoSourceById[charId] !== undefined) return;

    const currentPhoto = character.photo || "";
    const source = inferSource(currentPhoto);

    photoSourceById = { ...photoSourceById, [charId]: source };
    presetPhotoById = {
      ...presetPhotoById,
      [charId]: source === "preset" ? currentPhoto : "",
    };
    customUrlById = {
      ...customUrlById,
      [charId]: source === "url" ? currentPhoto : "",
    };
    localPhotoById = {
      ...localPhotoById,
      [charId]: source === "local" ? currentPhoto : "",
    };
    isSavingById = { ...isSavingById, [charId]: false };
    feedbackById = { ...feedbackById, [charId]: { type: "", text: "" } };
    isSavingProfileById = { ...isSavingProfileById, [charId]: false };
    profileFeedbackById = {
      ...profileFeedbackById,
      [charId]: { type: "", text: "" },
    };
    nameById = { ...nameById, [charId]: character.name };
    playerById = { ...playerById, [charId]: character.player };
    hpMaxById = { ...hpMaxById, [charId]: character.hp_max };
    armorClassById = { ...armorClassById, [charId]: character.armor_class };
    speedWalkById = { ...speedWalkById, [charId]: character.speed_walk };

    const classPrimary = character.class_primary || {};
    const background = character.background || {};
    const species = character.species || {};
    const proficiencies = character.proficiencies || {};
    const equipment = character.equipment || {};
    const languages = Array.isArray(character.languages)
      ? character.languages
      : [];
    const baseLanguages = [];
    const rareLanguages = [];

    languages.forEach((language) => {
      if (rareLanguageKeys.has(language)) {
        rareLanguages.push(language);
      } else {
        baseLanguages.push(language);
      }
    });

    const backgroundTools = background.tool_proficiency
      ? [background.tool_proficiency]
      : [];

    classPrimaryById = {
      ...classPrimaryById,
      [charId]: classPrimary.name || "",
    };
    classSubclassById = {
      ...classSubclassById,
      [charId]: classPrimary.subclass || "",
    };
    classLevelById = {
      ...classLevelById,
      [charId]: classPrimary.level || 1,
    };
    backgroundNameById = {
      ...backgroundNameById,
      [charId]: background.name || "",
    };
    backgroundFeatById = {
      ...backgroundFeatById,
      [charId]: background.feat || "",
    };
    speciesNameById = { ...speciesNameById, [charId]: species.name || "" };
    speciesSizeById = { ...speciesSizeById, [charId]: species.size || "" };
    alignmentById = { ...alignmentById, [charId]: character.alignment || "" };
    languagesById = { ...languagesById, [charId]: baseLanguages };
    rareLanguagesById = { ...rareLanguagesById, [charId]: rareLanguages };
    skillsById = {
      ...skillsById,
      [charId]: proficiencies.skills || background.skill_proficiencies || [],
    };
    toolsById = {
      ...toolsById,
      [charId]: proficiencies.tools || backgroundTools,
    };
    armorById = { ...armorById, [charId]: proficiencies.armor || [] };
    weaponsById = { ...weaponsById, [charId]: proficiencies.weapons || [] };
    itemsById = { ...itemsById, [charId]: equipment.items || [] };
    trinketById = { ...trinketById, [charId]: equipment.trinket || "" };
    editOpenById = { ...editOpenById, [charId]: false };
  }

  $effect(() => {
    $characters.forEach((character) => initCharacterState(character));
  });

  function setPhotoSource(charId, source) {
    photoSourceById = { ...photoSourceById, [charId]: source };
    feedbackById = { ...feedbackById, [charId]: { type: "", text: "" } };
  }

  function setPresetPhoto(charId, value) {
    presetPhotoById = { ...presetPhotoById, [charId]: value };
  }

  function setCustomPhotoUrl(charId, value) {
    customUrlById = { ...customUrlById, [charId]: value };
  }

  function setLocalPhoto(charId, value) {
    localPhotoById = { ...localPhotoById, [charId]: value };
  }

  function openPhotoEditor(charId) {
    activePhotoId = charId;
  }

  function closePhotoEditor() {
    activePhotoId = null;
  }

  function handlePickerError(charId, message) {
    if (!message) {
      if (feedbackById[charId]?.type === "error") {
        feedbackById = { ...feedbackById, [charId]: { type: "", text: "" } };
      }
      return;
    }

    feedbackById = {
      ...feedbackById,
      [charId]: { type: "error", text: message },
    };
  }

  function getResolvedPhotoValue(charId) {
    const source = photoSourceById[charId] || "preset";
    if (source === "local") return localPhotoById[charId] || "";
    if (source === "url") return (customUrlById[charId] || "").trim();
    return presetPhotoById[charId] || "";
  }

  async function savePhoto(charId) {
    if (isSavingById[charId]) return;

    isSavingById = { ...isSavingById, [charId]: true };
    feedbackById = { ...feedbackById, [charId]: { type: "", text: "" } };

    try {
      const response = await fetch(
        `${SERVER_URL}/api/characters/${charId}/photo`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ photo: getResolvedPhotoValue(charId) }),
        },
      );

      if (!response.ok) {
        feedbackById = {
          ...feedbackById,
          [charId]: { type: "error", text: "No se pudo actualizar la foto." },
        };
        return;
      }

      feedbackById = {
        ...feedbackById,
        [charId]: { type: "success", text: "Foto actualizada." },
      };
    } catch (error) {
      console.error("Error updating photo", error);
      feedbackById = {
        ...feedbackById,
        [charId]: { type: "error", text: "Error de conexión al guardar." },
      };
    } finally {
      isSavingById = { ...isSavingById, [charId]: false };
    }
  }

  async function deleteCharacter(charId) {
    try {
      const response = await fetch(`${SERVER_URL}/api/characters/${charId}`, {
        method: "DELETE",
      });
      if (!response.ok)
        console.error("Failed to delete character", response.status);
    } catch (error) {
      console.error("Error deleting character", error);
    } finally {
      pendingDeleteId = null;
    }
  }

  function updateField(map, charId, value) {
    map = { ...map, [charId]: value };
    return map;
  }

  function updateListField(map, charId, values) {
    map = { ...map, [charId]: Array.isArray(values) ? values : [] };
    return map;
  }

  function getSelectValues(event) {
    return Array.from(event.currentTarget.selectedOptions).map(
      (option) => option.value,
    );
  }

  function normalizeSelection(values) {
    if (!Array.isArray(values)) return [];
    return values
      .map((value) => String(value).trim())
      .filter((value) => value.length > 0);
  }

  /**
   * Toggle edit mode for a character card.
   * When opening edit mode, automatically close the info panel to avoid UI clutter.
   */
  function toggleEdit(charId) {
    const nowOpen = !editOpenById[charId];
    editOpenById = {
      ...editOpenById,
      [charId]: nowOpen,
    };
    // Auto-close info panel when entering edit mode
    if (nowOpen && infoOpenById[charId]) {
      infoOpenById = { ...infoOpenById, [charId]: false };
      loadoutOpenById = { ...loadoutOpenById, [charId]: false };
    }
  }

  /**
   * Toggle read-only info panel for a character card.
   * When closed, also reset the nested loadout detail state to avoid orphaned UI.
   */
  function toggleInfo(charId) {
    const nowOpen = !infoOpenById[charId];
    infoOpenById = { ...infoOpenById, [charId]: nowOpen };
    // Auto-reset loadout detail when closing parent info panel
    if (!nowOpen) {
      loadoutOpenById = { ...loadoutOpenById, [charId]: false };
    }
  }

  /**
   * Toggle nested loadout detail within the info panel.
   * Shows full equipment breakdown (armor/weapons/items/trinket).
   */
  function toggleLoadout(charId) {
    loadoutOpenById = {
      ...loadoutOpenById,
      [charId]: !loadoutOpenById[charId],
    };
  }

  /**
   * Build a human-readable class+level string (e.g., "Guerrero 5").
   */
  function buildReadOnlyClass(charId) {
    const classKey = classPrimaryById[charId];
    if (!classKey) return "Sin clase";
    const label = resolveLabel(labelMaps.class, classKey, classKey);
    const level = Number(classLevelById[charId] ?? 1) || 1;
    return `${label} ${level}`;
  }

  /**
   * Build a compact "Background / Especie" line for read-only display.
   */
  function buildProfileSummary(charId) {
    const bg = backgroundNameById[charId]
      ? labelOf.get(backgroundNameById[charId]) || backgroundNameById[charId]
      : "Sin background";
    const sp = speciesNameById[charId]
      ? resolveLabel(
          labelMaps.species,
          speciesNameById[charId],
          speciesNameById[charId],
        )
      : "Sin especie";
    return `${bg} / ${sp}`;
  }

  /**
   * Build a comma-separated languages list (common + rare combined).
   */
  function buildLanguagesSummary(charId) {
    const common = languagesById[charId] || [];
    const rare = rareLanguagesById[charId] || [];
    const all = [...common, ...rare].map((key) => labelOf.get(key) || key);
    return all.length > 0 ? all.join(", ") : "Ninguno";
  }

  /**
   * Build a short loadout summary showing counts (e.g., "2 skills, 3 armaduras").
   */
  function buildLoadoutSummary(charId) {
    const skillCount = (skillsById[charId] || []).length;
    const armorCount = (armorById[charId] || []).length;
    const weaponCount = (weaponsById[charId] || []).length;
    const itemCount = (itemsById[charId] || []).length;
    const parts = [];
    if (skillCount > 0) parts.push(`${skillCount} skills`);
    if (armorCount > 0) parts.push(`${armorCount} armaduras`);
    if (weaponCount > 0) parts.push(`${weaponCount} armas`);
    if (itemCount > 0) parts.push(`${itemCount} items`);
    return parts.length > 0 ? parts.join(", ") : "Sin competencias";
  }

  /**
   * Format a selection list into a compact comma-separated string.
   */
  function formatSelectionListCompact(keys) {
    if (!Array.isArray(keys) || keys.length === 0) return "Ninguno";
    const labels = keys.map((key) => labelOf.get(key) || key);
    return labels.join(", ");
  }

  function resolveLabel(map, key, fallback) {
    if (!key) return fallback;
    return map?.get(key) || key;
  }

  function buildClassSummary(charId) {
    const classKey = classPrimaryById[charId];
    if (!classKey) return "Clase no definida";
    const label = resolveLabel(labelMaps.class, classKey, classKey);
    const level = Number(classLevelById[charId] ?? 1) || 1;
    return `${label} ${level}`;
  }

  function levelUpCharacter(charId) {
    const currentLevel = Number(classLevelById[charId] ?? 1) || 1;
    const nextLevel = Math.min(20, currentLevel + 1);
    classLevelById = updateField(classLevelById, charId, nextLevel);
    saveProfile(charId);
  }

  async function saveProfile(charId) {
    if (isSavingProfileById[charId]) return;

    const name = String(nameById[charId] ?? "").trim();
    const player = String(playerById[charId] ?? "").trim();
    const hpMax = Number(hpMaxById[charId]);
    const armorClass = Number(armorClassById[charId]);
    const speedWalk = Number(speedWalkById[charId]);
    const classPrimary = String(classPrimaryById[charId] ?? "");
    const classSubclass = String(classSubclassById[charId] ?? "");
    const classLevel = Number(classLevelById[charId]);
    const backgroundName = String(backgroundNameById[charId] ?? "");
    const backgroundFeat = String(backgroundFeatById[charId] ?? "");
    const speciesName = String(speciesNameById[charId] ?? "");
    const speciesSize = String(speciesSizeById[charId] ?? "");
    const alignment = String(alignmentById[charId] ?? "");
    const languages = normalizeSelection(languagesById[charId]);
    const rareLanguages = normalizeSelection(rareLanguagesById[charId]);
    const skills = normalizeSelection(skillsById[charId]);
    const tools = normalizeSelection(toolsById[charId]);
    const armor = normalizeSelection(armorById[charId]);
    const weapons = normalizeSelection(weaponsById[charId]);
    const items = normalizeSelection(itemsById[charId]);
    const trinket = String(trinketById[charId] ?? "");

    if (!name || !player || !Number.isFinite(hpMax) || hpMax <= 0) {
      profileFeedbackById = {
        ...profileFeedbackById,
        [charId]: { type: "error", text: "Revisa los datos obligatorios." },
      };
      return;
    }

    isSavingProfileById = { ...isSavingProfileById, [charId]: true };
    profileFeedbackById = {
      ...profileFeedbackById,
      [charId]: { type: "", text: "" },
    };

    try {
      const response = await fetch(`${SERVER_URL}/api/characters/${charId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          player,
          hp_max: hpMax,
          armor_class: Number.isFinite(armorClass) ? armorClass : 0,
          speed_walk: Number.isFinite(speedWalk) ? speedWalk : 0,
          class_primary: {
            name: classPrimary,
            level: Number.isFinite(classLevel) ? classLevel : 1,
            subclass: classSubclass,
          },
          background: {
            name: backgroundName,
            feat: backgroundFeat,
            skill_proficiencies: skills,
            tool_proficiency: tools[0] || "",
          },
          species: {
            name: speciesName,
            size: speciesSize,
            speed_walk: Number.isFinite(speedWalk) ? speedWalk : 0,
            traits: [],
          },
          languages: [...languages, ...rareLanguages],
          alignment,
          proficiencies: {
            skills,
            saving_throws: [],
            armor,
            weapons,
            tools,
          },
          equipment: {
            items,
            coins: { gp: 0, sp: 0, cp: 0 },
            trinket,
          },
        }),
      });

      if (!response.ok) {
        profileFeedbackById = {
          ...profileFeedbackById,
          [charId]: { type: "error", text: "No se pudo guardar." },
        };
        return;
      }

      profileFeedbackById = {
        ...profileFeedbackById,
        [charId]: { type: "success", text: "Datos actualizados." },
      };
    } catch (error) {
      console.error("Error updating profile", error);
      profileFeedbackById = {
        ...profileFeedbackById,
        [charId]: { type: "error", text: "Error de conexión." },
      };
    } finally {
      isSavingProfileById = { ...isSavingProfileById, [charId]: false };
    }
  }
</script>

<section class="character-management" aria-labelledby="manage-character-title">
  <div class="manage-header">
    <h2 id="manage-character-title" class="manage-title">
      GESTION DE PERSONAJES
    </h2>
  </div>

  <div class="characters-grid" class:grid-three={$characters.length > 2}>
    {#each $characters as character (character.id)}
      <article class="manage-card card-base" data-char-id={character.id}>
        <header class="manage-card-head">
          <div class="manage-identity">
            <Button
              class="manage-photo-btn"
              type="button"
              onclick={() => openPhotoEditor(character.id)}
              aria-label={`Editar foto de ${character.name}`}
            >
              <img
                class="manage-photo"
                src={resolvePhotoSrc(character.photo, SERVER_URL, character.id)}
                alt={character.name}
              />
              <span class="manage-photo-hint">Editar foto</span>
            </Button>
            <div class="manage-names">
              <h3 class="manage-char-name">{character.name}</h3>
              <span class="manage-char-player">{character.player}</span>
              <LevelPill level={classLevelById[character.id]} />
            </div>
          </div>
          <Button
            class="btn-base manage-edit-toggle"
            type="button"
            onclick={() => toggleEdit(character.id)}
            aria-expanded={editOpenById[character.id] ? "true" : "false"}
          >
            {editOpenById[character.id] ? "CERRAR EDICION" : "EDITAR PERSONAJE"}
          </Button>
        </header>

        {#if !editOpenById[character.id]}
          <div class="manage-summary">
            <span>
              {buildClassSummary(character.id)}
            </span>
            <span class="manage-summary-sep">•</span>
            <span>
              {resolveLabel(
                labelMaps.species,
                speciesNameById[character.id],
                "Especie no definida",
              )}
            </span>
            <span class="manage-summary-sep">•</span>
            <span>
              {resolveLabel(
                labelMaps.alignment,
                alignmentById[character.id],
                "Alineamiento no definido",
              )}
            </span>
          </div>

          <!-- Read-only info panel: toggle to show/hide full character data -->
          <div class="manage-readonly">
            <Button
              class="btn-base manage-info-toggle"
              type="button"
              onclick={() => toggleInfo(character.id)}
              aria-expanded={infoOpenById[character.id] ? "true" : "false"}
            >
              {infoOpenById[character.id] ? "OCULTAR INFO" : "VER INFO"}
            </Button>

            {#if infoOpenById[character.id]}
              <div
                class="manage-readonly-grid"
                transition:fade={{ duration: 140 }}
              >
                <div class="manage-readonly-item">
                  <span class="manage-readonly-label">Clase / Nivel</span>
                  <span class="manage-readonly-value"
                    >{buildReadOnlyClass(character.id)}</span
                  >
                </div>
                <div class="manage-readonly-item">
                  <span class="manage-readonly-label">Background / Especie</span
                  >
                  <span class="manage-readonly-value"
                    >{buildProfileSummary(character.id)}</span
                  >
                </div>
                <div class="manage-readonly-item">
                  <span class="manage-readonly-label">Alineamiento</span>
                  <span class="manage-readonly-value"
                    >{resolveLabel(
                      labelMaps.alignment,
                      alignmentById[character.id],
                      "No definido",
                    )}</span
                  >
                </div>
                <div class="manage-readonly-item">
                  <span class="manage-readonly-label">Idiomas</span>
                  <span class="manage-readonly-value"
                    >{buildLanguagesSummary(character.id)}</span
                  >
                </div>
                <div class="manage-readonly-item">
                  <span class="manage-readonly-label manage-readonly-expand">
                    Competencias y equipo
                    <Button
                      type="button"
                      class="btn-base manage-info-toggle"
                      onclick={() => toggleLoadout(character.id)}
                      aria-expanded={loadoutOpenById[character.id]
                        ? "true"
                        : "false"}
                    >
                      {loadoutOpenById[character.id]
                        ? "ocultar detalle"
                        : "ver detalle"}
                    </Button>
                  </span>
                  {#if !loadoutOpenById[character.id]}
                    <span class="manage-readonly-value"
                      >{buildLoadoutSummary(character.id)}</span
                    >
                  {:else}
                    <div
                      class="manage-loadout-details"
                      transition:fade={{ duration: 120 }}
                    >
                      <div class="manage-loadout-line">
                        <span class="manage-loadout-key">Skills:</span>
                        <span class="manage-loadout-val"
                          >{formatSelectionListCompact(
                            skillsById[character.id],
                          )}</span
                        >
                      </div>
                      <div class="manage-loadout-line">
                        <span class="manage-loadout-key">Herramientas:</span>
                        <span class="manage-loadout-val"
                          >{formatSelectionListCompact(
                            toolsById[character.id],
                          )}</span
                        >
                      </div>
                      <div class="manage-loadout-line">
                        <span class="manage-loadout-key">Armadura:</span>
                        <span class="manage-loadout-val"
                          >{formatSelectionListCompact(
                            armorById[character.id],
                          )}</span
                        >
                      </div>
                      <div class="manage-loadout-line">
                        <span class="manage-loadout-key">Armas:</span>
                        <span class="manage-loadout-val"
                          >{formatSelectionListCompact(
                            weaponsById[character.id],
                          )}</span
                        >
                      </div>
                      <div class="manage-loadout-line">
                        <span class="manage-loadout-key">Items:</span>
                        <span class="manage-loadout-val"
                          >{formatSelectionListCompact(
                            itemsById[character.id],
                          )}</span
                        >
                      </div>
                      <div class="manage-loadout-line">
                        <span class="manage-loadout-key">Trinket:</span>
                        <span class="manage-loadout-val"
                          >{trinketById[character.id]
                            ? labelOf.get(trinketById[character.id]) ||
                              trinketById[character.id]
                            : "Ninguno"}</span
                        >
                      </div>
                    </div>
                  {/if}
                </div>
              </div>
            {/if}
          </div>
        {/if}

        {#if editOpenById[character.id]}
          <div class="manage-form">
            <div class="manage-field">
              <Label for={`name-${character.id}`} class="label-caps">Nombre</Label>
              <Input
                id={`name-${character.id}`}
                type="text"
                value={nameById[character.id]}
                oninput={(event) =>
                  (nameById = updateField(
                    nameById,
                    character.id,
                    event.currentTarget.value,
                  ))}
                maxlength="40"
              />
            </div>
            <div class="manage-field">
              <Label for={`player-${character.id}`} class="label-caps">Jugador</Label>
              <Input
                id={`player-${character.id}`}
                type="text"
                value={playerById[character.id]}
                oninput={(event) =>
                  (playerById = updateField(
                    playerById,
                    character.id,
                    event.currentTarget.value,
                  ))}
                maxlength="40"
              />
            </div>
            <div class="manage-grid-fields">
              <div class="manage-field">
                <Label for={`hp-max-${character.id}`} class="label-caps">HP MAX</Label>
                <Input
                  id={`hp-max-${character.id}`}
                  type="number"
                  min="1"
                  max="999"
                  value={hpMaxById[character.id]}
                  oninput={(event) =>
                    (hpMaxById = updateField(
                      hpMaxById,
                      character.id,
                      event.currentTarget.value,
                    ))}
                />
              </div>
              <div class="manage-field">
                <Label for={`ac-${character.id}`} class="label-caps">AC</Label>
                <Input
                  id={`ac-${character.id}`}
                  type="number"
                  min="0"
                  max="99"
                  value={armorClassById[character.id]}
                  oninput={(event) =>
                    (armorClassById = updateField(
                      armorClassById,
                      character.id,
                      event.currentTarget.value,
                    ))}
                />
              </div>
              <div class="manage-field">
                <Label for={`speed-${character.id}`} class="label-caps">VEL</Label>
                <Input
                  id={`speed-${character.id}`}
                  type="number"
                  min="0"
                  max="200"
                  value={speedWalkById[character.id]}
                  oninput={(event) =>
                    (speedWalkById = updateField(
                      speedWalkById,
                      character.id,
                      event.currentTarget.value,
                    ))}
                />
              </div>
            </div>

            <div class="manage-section">
              <h4 class="manage-section-title">Opciones de personaje</h4>
              <div class="manage-grid-two">
                <label class="manage-field">
                  <span class="label-caps">Clase</span>
                  <select
                    class="selector"
                    value={classPrimaryById[character.id]}
                    oninput={(event) =>
                      (classPrimaryById = updateField(
                        classPrimaryById,
                        character.id,
                        event.currentTarget.value,
                      ))}
                  >
                    <option value="">Sin definir</option>
                    {#each classOptions as option}
                      <option value={option.key}>{option.label}</option>
                    {/each}
                  </select>
                </label>
                <label class="manage-field">
                  <span class="label-caps">Subclase</span>
                  <select
                    class="selector"
                    value={classSubclassById[character.id]}
                    oninput={(event) =>
                      (classSubclassById = updateField(
                        classSubclassById,
                        character.id,
                        event.currentTarget.value,
                      ))}
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
                <div class="manage-field">
                  <Label for={`level-${character.id}`} class="label-caps">Nivel</Label>
                  <Input
                    id={`level-${character.id}`}
                    type="number"
                    min="1"
                    max="20"
                    value={classLevelById[character.id]}
                    oninput={(event) =>
                      (classLevelById = updateField(
                        classLevelById,
                        character.id,
                        event.currentTarget.value,
                      ))}
                  />
                </div>
                <label class="manage-field">
                  <span class="label-caps">Background</span>
                  <select
                    class="selector"
                    value={backgroundNameById[character.id]}
                    oninput={(event) =>
                      (backgroundNameById = updateField(
                        backgroundNameById,
                        character.id,
                        event.currentTarget.value,
                      ))}
                  >
                    <option value="">Sin definir</option>
                    {#each backgroundOptions as option}
                      <option value={option.key}>{option.label}</option>
                    {/each}
                  </select>
                </label>
                <label class="manage-field">
                  <span class="label-caps">Feat</span>
                  <select
                    class="selector"
                    value={backgroundFeatById[character.id]}
                    oninput={(event) =>
                      (backgroundFeatById = updateField(
                        backgroundFeatById,
                        character.id,
                        event.currentTarget.value,
                      ))}
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
                <label class="manage-field">
                  <span class="label-caps">Especie</span>
                  <select
                    class="selector"
                    value={speciesNameById[character.id]}
                    oninput={(event) =>
                      (speciesNameById = updateField(
                        speciesNameById,
                        character.id,
                        event.currentTarget.value,
                      ))}
                  >
                    <option value="">Sin definir</option>
                    {#each speciesOptions as option}
                      <option value={option.key}>{option.label}</option>
                    {/each}
                  </select>
                </label>
                <label class="manage-field">
                  <span class="label-caps">Tamaño</span>
                  <select
                    class="selector"
                    value={speciesSizeById[character.id]}
                    oninput={(event) =>
                      (speciesSizeById = updateField(
                        speciesSizeById,
                        character.id,
                        event.currentTarget.value,
                      ))}
                  >
                    <option value="">Sin definir</option>
                    {#each sizeOptions as option}
                      <option value={option.key}>{option.label}</option>
                    {/each}
                  </select>
                </label>
                <label class="manage-field">
                  <span class="label-caps">Alineamiento</span>
                  <select
                    class="selector"
                    value={alignmentById[character.id]}
                    oninput={(event) =>
                      (alignmentById = updateField(
                        alignmentById,
                        character.id,
                        event.currentTarget.value,
                      ))}
                  >
                    <option value="">Sin definir</option>
                    {#each alignmentOptions as option}
                      <option value={option.key}>{option.label}</option>
                    {/each}
                  </select>
                </label>
              </div>
            </div>

            <div class="manage-section">
              <h4 class="manage-section-title">Idiomas y proficiencias</h4>
              <div class="manage-grid-two">
                <div class="manage-field">
                  <span class="label-caps"
                    >Idiomas {#if languagesById[character.id]?.length > 0}<span
                        class="selection-count"
                        >{languagesById[character.id].length}</span
                      >{/if}</span
                  >
                  <MultiSelect
                    options={languageOptions}
                    selected={languagesById[character.id] || []}
                    onchange={(v) =>
                      (languagesById = updateListField(
                        languagesById,
                        character.id,
                        v,
                      ))}
                    size={Math.max(3, Math.min(6, languageOptions.length || 3))}
                  />
                  <SelectionPills
                    keys={languagesById[character.id] || []}
                    {labelOf}
                  />
                </div>
                <div class="manage-field">
                  <span class="label-caps"
                    >Idiomas raros {#if rareLanguagesById[character.id]?.length > 0}<span
                        class="selection-count"
                        >{rareLanguagesById[character.id].length}</span
                      >{/if}</span
                  >
                  <MultiSelect
                    options={rareLanguageOptions}
                    selected={rareLanguagesById[character.id] || []}
                    onchange={(v) =>
                      (rareLanguagesById = updateListField(
                        rareLanguagesById,
                        character.id,
                        v,
                      ))}
                    size={Math.max(
                      3,
                      Math.min(6, rareLanguageOptions.length || 3),
                    )}
                  />
                  <SelectionPills
                    keys={rareLanguagesById[character.id] || []}
                    {labelOf}
                  />
                </div>
              </div>
              <div class="manage-grid-two">
                <div class="manage-field">
                  <span class="label-caps"
                    >Skills {#if skillsById[character.id]?.length > 0}<span
                        class="selection-count"
                        >{skillsById[character.id].length}</span
                      >{/if}</span
                  >
                  <MultiSelect
                    options={skillOptions}
                    selected={skillsById[character.id] || []}
                    onchange={(v) =>
                      (skillsById = updateListField(
                        skillsById,
                        character.id,
                        v,
                      ))}
                    size={Math.max(4, Math.min(8, skillOptions.length || 4))}
                  />
                  <SelectionPills
                    keys={skillsById[character.id] || []}
                    {labelOf}
                  />
                </div>
                <div class="manage-field">
                  <span class="label-caps"
                    >Herramientas {#if toolsById[character.id]?.length > 0}<span
                        class="selection-count"
                        >{toolsById[character.id].length}</span
                      >{/if}</span
                  >
                  <MultiSelect
                    options={toolOptions}
                    selected={toolsById[character.id] || []}
                    onchange={(v) =>
                      (toolsById = updateListField(toolsById, character.id, v))}
                    size={Math.max(4, Math.min(8, toolOptions.length || 4))}
                  />
                  <SelectionPills
                    keys={toolsById[character.id] || []}
                    {labelOf}
                  />
                </div>
              </div>
              <div class="manage-grid-two">
                <div class="manage-field">
                  <span class="label-caps"
                    >Armadura {#if armorById[character.id]?.length > 0}<span
                        class="selection-count"
                        >{armorById[character.id]
                          .length}/{armorOptions.length}</span
                      >{/if}</span
                  >
                  <MultiSelect
                    options={armorOptions}
                    selected={armorById[character.id] || []}
                    onchange={(v) =>
                      (armorById = updateListField(armorById, character.id, v))}
                    size={Math.max(3, Math.min(6, armorOptions.length || 3))}
                  />
                  <SelectionPills
                    keys={armorById[character.id] || []}
                    {labelOf}
                  />
                </div>
                <div class="manage-field">
                  <span class="label-caps"
                    >Armas {#if weaponsById[character.id]?.length > 0}<span
                        class="selection-count"
                        >{weaponsById[character.id]
                          .length}/{weaponOptions.length}</span
                      >{/if}</span
                  >
                  <MultiSelect
                    options={weaponOptions}
                    selected={weaponsById[character.id] || []}
                    onchange={(v) =>
                      (weaponsById = updateListField(
                        weaponsById,
                        character.id,
                        v,
                      ))}
                    size={Math.max(3, Math.min(6, weaponOptions.length || 3))}
                  />
                  <SelectionPills
                    keys={weaponsById[character.id] || []}
                    {labelOf}
                  />
                </div>
              </div>
            </div>

            <div class="manage-section">
              <h4 class="manage-section-title">Equipo</h4>
              <div class="manage-grid-two">
                <div class="manage-field">
                  <span class="label-caps"
                    >Items {#if itemsById[character.id]?.length > 0}<span
                        class="selection-count"
                        >{itemsById[character.id].length}</span
                      >{/if}</span
                  >
                  <MultiSelect
                    options={itemOptions}
                    selected={itemsById[character.id] || []}
                    onchange={(v) =>
                      (itemsById = updateListField(itemsById, character.id, v))}
                    disabled={itemOptions.length === 0}
                    size={Math.max(3, Math.min(6, itemOptions.length || 3))}
                  />
                  <SelectionPills
                    keys={itemsById[character.id] || []}
                    {labelOf}
                  />
                </div>
                <label class="manage-field">
                  <span class="label-caps">Trinket</span>
                  <select
                    class="selector"
                    value={trinketById[character.id]}
                    oninput={(event) =>
                      (trinketById = updateField(
                        trinketById,
                        character.id,
                        event.currentTarget.value,
                      ))}
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

            <div class="manage-actions">
              <Button
                class="btn-base manage-save-btn manage-save-btn--outline"
                type="button"
                onclick={() => levelUpCharacter(character.id)}
                disabled={isSavingProfileById[character.id]}
              >
                SUBIR NIVEL
              </Button>
              <Button
                class="btn-base manage-save-btn manage-save-btn--neutral"
                type="button"
                onclick={() => saveProfile(character.id)}
                disabled={isSavingProfileById[character.id]}
              >
                {isSavingProfileById[character.id]
                  ? "GUARDANDO..."
                  : "GUARDAR DATOS"}
              </Button>
              {#if profileFeedbackById[character.id]?.text}
                <span
                  class={`manage-feedback ${profileFeedbackById[character.id].type}`}
                >
                  {profileFeedbackById[character.id].text}
                </span>
              {/if}
              <span class="manage-note">
                Subir nivel solo ajusta el nivel por ahora.
              </span>
              <Button
                class="btn-base manage-delete-btn"
                type="button"
                onclick={() => (pendingDeleteId = character.id)}
              >
                ELIMINAR PERSONAJE
              </Button>
            </div>
          </div>
        {/if}
      </article>
    {/each}
  </div>
</section>

<Dialog.Root
  open={!!activePhotoId}
  onOpenChange={(open) => {
    if (!open) closePhotoEditor();
  }}
>
  <Dialog.Content
    class="photo-modal-card card-base"
    showCloseButton={false}
    aria-labelledby="photo-modal-title"
  >
    <header class="photo-modal-head">
      <h3 id="photo-modal-title" class="photo-modal-title">Editar foto</h3>
      <button
        class="photo-modal-close"
        type="button"
        aria-label="Cerrar"
        onclick={closePhotoEditor}
      >
        ✕
      </button>
    </header>

    {#if activePhotoId}
      <PhotoSourcePicker
        title="Foto"
        options={PHOTO_OPTIONS}
        source={photoSourceById[activePhotoId] || "preset"}
        presetValue={presetPhotoById[activePhotoId] || ""}
        urlValue={customUrlById[activePhotoId] || ""}
        localValue={localPhotoById[activePhotoId] || ""}
        serverUrl={SERVER_URL}
        onSourceChange={(value) => setPhotoSource(activePhotoId, value)}
        onPresetChange={(value) => setPresetPhoto(activePhotoId, value)}
        onUrlChange={(value) => setCustomPhotoUrl(activePhotoId, value)}
        onLocalChange={(value) => setLocalPhoto(activePhotoId, value)}
        onError={(message) => handlePickerError(activePhotoId, message)}
      />

      <div class="photo-modal-actions">
        <Button
          class="btn-base manage-save-btn"
          type="button"
          onclick={() => savePhoto(activePhotoId)}
          disabled={isSavingById[activePhotoId]}
        >
          {isSavingById[activePhotoId] ? "GUARDANDO..." : "ACTUALIZAR FOTO"}
        </Button>
        {#if feedbackById[activePhotoId]?.text}
          <span class={`manage-feedback ${feedbackById[activePhotoId].type}`}>
            {feedbackById[activePhotoId].text}
          </span>
        {/if}
      </div>
    {/if}
  </Dialog.Content>
</Dialog.Root>

<AlertDialog.Root
  open={!!pendingDeleteId}
  onOpenChange={(open) => {
    if (!open) pendingDeleteId = null;
  }}
>
  <AlertDialog.Content class="card-base delete-confirm-dialog">
    <AlertDialog.Title class="delete-confirm-title">
      ¿Eliminar personaje?
    </AlertDialog.Title>
    <AlertDialog.Description class="delete-confirm-desc">
      Esta acción no se puede deshacer. El personaje se eliminará de la sesión
      para todos los jugadores.
    </AlertDialog.Description>
    <div class="delete-confirm-actions">
      <AlertDialog.Cancel
        class="btn-base manage-save-btn manage-save-btn--neutral"
        onclick={() => (pendingDeleteId = null)}
      >
        CANCELAR
      </AlertDialog.Cancel>
      <AlertDialog.Action
        class="btn-base manage-delete-btn"
        onclick={() => deleteCharacter(pendingDeleteId)}
      >
        SÍ, ELIMINAR
      </AlertDialog.Action>
    </div>
  </AlertDialog.Content>
</AlertDialog.Root>
