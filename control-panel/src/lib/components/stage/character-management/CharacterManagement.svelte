<!--
  CharacterManagement
  ===================
  Thin orchestrator: renders the character grid and wires together
  CharacterPhotoEditor, CharacterProfileForm, and CharacterInfoPanel.
  Owns: grid layout, delete AlertDialog, editOpen per-card coordination.
  All field names map to the flat PocketBase `characters` schema.
-->
<script>
  import "./CharacterManagement.css";
  import "$lib/components/shared/pills/Pills.css";
  import LevelPill from "$lib/components/shared/pills/LevelPill.svelte";
  import CharacterProfileForm from "../character-profile-form/CharacterProfileForm.svelte";
  import CharacterInfoPanel from "./CharacterInfoPanel.svelte";
  import { characters, SERVER_URL } from "$lib/services/socket.svelte.js";
  import { Button } from "$lib/components/shared/button/index.js";
  import * as AlertDialog from "$lib/components/shared/alert-dialog";
  import characterOptions from "$lib/data/character-options.template.json";
  import { resolvePhotoSrc } from "$lib/services/utils.js";

  // Label resolution for class_name and species (stored as keys, displayed as labels)
  const classOptions = characterOptions.classes ?? [];
  const speciesOptions = characterOptions.species ?? [];
  const classLabelMap = new Map(classOptions.map((o) => [o.key, o.label]));
  const speciesLabelMap = new Map(speciesOptions.map((o) => [o.key, o.label]));

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
      GESTIÓN DE PERSONAJES
    </h2>
  </div>

  <div class="characters-grid">
    {#each $characters as character (character.id)}
      <article class="manage-card card-base" data-char-id={character.id}>
        <!-- Card header: photo (owned by CharacterPhotoEditor), identity, toggle -->
        <header class="manage-card-head">
          <div class="manage-identity">
            <div class="manage-portrait-preview">
              <img
                src={resolvePhotoSrc(character.portrait, SERVER_URL)}
                alt={character.name}
                class="manage-photo"
              />
            </div>
            <div class="manage-names">
              <h3 class="manage-char-name">{character.name}</h3>
              <span class="manage-char-player">{character.player ?? ""}</span>
              <LevelPill level={character.level} />
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
              {character.class_name
                ? `${classLabelMap.get(character.class_name) ?? character.class_name} ${character.level ?? 1}`
                : "Sin clase"}
            </span>
            {#if character.species}
              <span class="manage-summary-sep">•</span>
              <span>{speciesLabelMap.get(character.species) ?? character.species}</span>
            {/if}
          </div>

          <CharacterInfoPanel {character} />
        {/if}

        <!-- Edit form (shown while editing) -->
        {#if editOpenById[character.id]}
          <CharacterProfileForm
            {character}
            {SERVER_URL}
          />
        {/if}

        <!-- Delete button (always visible in edit mode) -->
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
