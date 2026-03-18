<!--
  CharacterManagement
  ===================
  Thin orchestrator: renders the character grid and wires together
  CharacterPhotoEditor, CharacterProfileForm, and CharacterInfoPanel.
  Owns: grid layout, delete AlertDialog, editOpen per-card coordination.
-->
<script>
  import "./CharacterManagement.css";
  import "$lib/components/ui/pills/Pills.css";
  import LevelPill from "$lib/components/ui/pills/LevelPill.svelte";
  import CharacterPhotoEditor from "./CharacterPhotoEditor.svelte";
  import CharacterProfileForm from "../character-profile-form/CharacterProfileForm.svelte";
  import CharacterInfoPanel from "./CharacterInfoPanel.svelte";
  import { characters, SERVER_URL } from "$lib/stores/socket";
  import { Button } from "$lib/components/ui/button/index.js";
  import * as AlertDialog from "$lib/components/ui/alert-dialog";
  import characterOptions from "$lib/data/character-options.template.json";

  const PHOTO_OPTIONS = [
    { label: "Aleatorio", value: "" },
    { label: "Barbarian", value: "/assets/img/barbarian.png" },
    { label: "Elf", value: "/assets/img/elf.png" },
    { label: "Wizard", value: "/assets/img/wizard.png" },
  ];

  // ── Option lookups (for CharacterInfoPanel label resolution) ───────
  const optionSets = characterOptions || {};
  const classOptions = optionSets.classes || [];
  const speciesOptions = optionSets.species || [];
  const alignmentOptions = optionSets.alignments || [];
  const languageOptions = optionSets.languages || [];
  const rareLanguageOptions = optionSets.rare_languages || [];
  const skillOptions = optionSets.skills || [];
  const toolOptions = optionSets.tools || [];
  const armorOptions = optionSets.armor_proficiencies || [];
  const weaponOptions = optionSets.weapon_proficiencies || [];
  const itemOptions = optionSets.items || [];

  const labelMaps = {
    class: new Map(classOptions.map((o) => [o.key, o.label])),
    species: new Map(speciesOptions.map((o) => [o.key, o.label])),
    alignment: new Map(alignmentOptions.map((o) => [o.key, o.label])),
  };

  const labelOf = new Map(/** @type {[string, string][]} */ ([
    ...languageOptions.map((o) => [o.key, o.label]),
    ...rareLanguageOptions.map((o) => [o.key, o.label]),
    ...skillOptions.map((o) => [o.key, o.label]),
    ...toolOptions.map((o) => [o.key, o.label]),
    ...armorOptions.map((o) => [o.key, o.label]),
    ...weaponOptions.map((o) => [o.key, o.label]),
    ...itemOptions.map((o) => [o.key, o.label]),
  ]));

  // ── Per-card edit state (lifted for cross-sibling coordination) ────
  /** @type {Record<string, boolean>} */
  let editOpenById = $state({});

  function toggleEdit(charId) {
    const nowOpen = !editOpenById[charId];
    editOpenById = { ...editOpenById, [charId]: nowOpen };
  }

  // ── Delete ─────────────────────────────────────────────────────────
  /** ID of the character pending deletion — drives the AlertDialog. */
  let pendingDeleteId = $state(null);

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
        <!-- Card header: photo (owned by CharacterPhotoEditor), identity, toggle -->
        <header class="manage-card-head">
          <div class="manage-identity">
            <CharacterPhotoEditor
              {character}
              {SERVER_URL}
              {PHOTO_OPTIONS}
            />
            <div class="manage-names">
              <h3 class="manage-char-name">{character.name}</h3>
              <span class="manage-char-player">{character.player}</span>
              <LevelPill level={character.class_primary?.level} />
            </div>
          </div>
          <Button
            class="btn-base manage-edit-toggle"
            type="button"
            onclick={() => toggleEdit(character.id)}
            aria-expanded={editOpenById[character.id] ? "true" : "false"}
          >
            {editOpenById[character.id] ? "CERRAR" : "EDITAR"}
          </Button>
        </header>

        <!-- Read-only summary + expandable info (hidden while editing) -->
        {#if !editOpenById[character.id]}
          <div class="manage-summary">
            <span>
              {character.class_primary?.name
                ? `${labelMaps.class.get(character.class_primary.name) || character.class_primary.name} ${character.class_primary.level ?? 1}`
                : "Sin clase"}
            </span>
            <span class="manage-summary-sep">•</span>
            <span>
              {character.species?.name
                ? labelMaps.species.get(character.species.name) ||
                  character.species.name
                : "Especie no definida"}
            </span>
            <span class="manage-summary-sep">•</span>
            <span>
              {character.alignment
                ? labelMaps.alignment.get(character.alignment) ||
                  character.alignment
                : "Alineamiento no definido"}
            </span>
          </div>

          <CharacterInfoPanel {character} {labelOf} {labelMaps} />
        {/if}

        <!-- Edit form (shown while editing) -->
        {#if editOpenById[character.id]}
          <CharacterProfileForm
            {character}
            {SERVER_URL}
            {characterOptions}
          />
        {/if}

        <!-- Delete button (always visible in edit mode via manage-actions in form,
             but the AlertDialog trigger lives here in the orchestrator) -->
        {#if editOpenById[character.id]}
          <div class="manage-actions manage-actions--delete">
            <Button
              class="btn-base manage-delete-btn"
              type="button"
              onclick={() => (pendingDeleteId = character.id)}
            >
              ELIMINAR PERSONAJE
            </Button>
          </div>
        {/if}
      </article>
    {/each}
  </div>
</section>

<!-- Delete confirmation dialog -->
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
