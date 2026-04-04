<!--
  CharacterPhotoEditor
  ====================
  Photo-edit trigger button + modal for a single character.
  Renders the clickable photo thumbnail in the card header and
  owns the Dialog + PhotoSourcePicker modal internally.

  Props:
    character   – the character object (needs .id, .portrait, .name)
    SERVER_URL  – base URL for API calls
    PHOTO_OPTIONS – preset photo options array
    onPhotoSaved – optional callback(id, newUrl) after successful save
-->
<script>
  import PhotoSourcePicker from "../photo-source-picker/PhotoSourcePicker.svelte";
  import { Button } from "$lib/components/shared/button/index.js";
  import * as Dialog from "$lib/components/shared/dialog";
  import { resolvePhotoSrc } from "$lib/services/utils.js";
  import { untrack } from "svelte";

  /** @type {{ character: { id: string, photo?: string, name: string }, SERVER_URL: string, PHOTO_OPTIONS: any[], onPhotoSaved?: (id: string, url: string) => void }} */
  let { character, SERVER_URL, PHOTO_OPTIONS, onPhotoSaved } = $props();
  // Note: character.portrait is the PocketBase field name (not .photo)

  // ── Helpers ───────────────────────────────────────────────────────
  function inferSource(photoValue) {
    if (!photoValue || PHOTO_OPTIONS.some((o) => o.value === photoValue)) {
      return "preset";
    }
    if (photoValue.startsWith("data:")) return "local";
    return "url";
  }

  // Capture initial photo values from the prop exactly once.
  // untrack() explicitly opts out of reactivity tracking — intentional here
  // because we want the form to initialize from the persisted value on mount,
  // not re-sync on every socket update.
  const _photo0 = untrack(() => character.portrait) || "";
  const _source0 = inferSource(_photo0);

  // ── Internal state ────────────────────────────────────────────────
  let showModal = $state(false);
  let isSaving = $state(false);
  let feedback = $state({ type: "", text: "" });
  let photoSource = $state(_source0);
  let presetPhoto = $state(_source0 === "preset" ? _photo0 : "");
  let customUrl = $state(_source0 === "url" ? _photo0 : "");
  let localPhoto = $state(_source0 === "local" ? _photo0 : "");

  function getResolvedPhotoValue() {
    if (photoSource === "local") return localPhoto;
    if (photoSource === "url") return customUrl.trim();
    return presetPhoto;
  }

  function handlePickerError(message) {
    if (!message) {
      if (feedback.type === "error") feedback = { type: "", text: "" };
      return;
    }
    feedback = { type: "error", text: message };
  }

  // ── API ───────────────────────────────────────────────────────────
  async function savePhoto() {
    if (isSaving) return;
    isSaving = true;
    feedback = { type: "", text: "" };

    try {
      const newUrl = getResolvedPhotoValue();
      const response = await fetch(
        `${SERVER_URL}/api/characters/${character.id}/photo`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ photo: newUrl }),
        },
      );

      if (!response.ok) {
        feedback = { type: "error", text: "No se pudo actualizar la foto." };
        return;
      }

      feedback = { type: "success", text: "Foto actualizada." };
      onPhotoSaved?.(character.id, newUrl);
    } catch (error) {
      console.error("Error updating photo", error);
      feedback = { type: "error", text: "Error de conexión al guardar." };
    } finally {
      isSaving = false;
    }
  }
</script>

<!--
  Photo button — rendered inside the card header by the parent.
  Clicking opens the Dialog modal.
-->
<Button
  class="manage-photo-btn"
  type="button"
  onclick={() => (showModal = true)}
  aria-label={`Editar foto de ${character.name}`}
>
  <img
    class="manage-photo"
    src={resolvePhotoSrc(character.portrait, SERVER_URL, character.id)}
    alt={character.name}
  />
  <span class="manage-photo-hint">Editar foto</span>
</Button>

<!-- Photo-edit Dialog modal -->
<Dialog.Root
  open={showModal}
  onOpenChange={(open) => {
    if (!open) showModal = false;
  }}
>
  <Dialog.Content
    class="photo-modal-card card-base"
    showCloseButton={false}
    aria-labelledby={`photo-modal-title-${character.id}`}
    portalProps={{}}
  >
    <header class="photo-modal-head">
      <h3 id={`photo-modal-title-${character.id}`} class="photo-modal-title">
        Editar foto
      </h3>
      <button
        class="photo-modal-close"
        type="button"
        aria-label="Cerrar"
        onclick={() => (showModal = false)}
      >
        ✕
      </button>
    </header>

    <PhotoSourcePicker
      title="Foto"
      options={PHOTO_OPTIONS}
      source={photoSource}
      presetValue={presetPhoto}
      urlValue={customUrl}
      localValue={localPhoto}
      serverUrl={SERVER_URL}
      onSourceChange={(value) => {
        photoSource = value;
        feedback = { type: "", text: "" };
      }}
      onPresetChange={(value) => (presetPhoto = value)}
      onUrlChange={(value) => (customUrl = value)}
      onLocalChange={(value) => (localPhoto = value)}
      onError={(message) => handlePickerError(message)}
    />

    <div class="photo-modal-actions">
      <Button
        class="btn-base manage-save-btn"
        type="button"
        onclick={savePhoto}
        disabled={isSaving}
      >
        {isSaving ? "GUARDANDO..." : "ACTUALIZAR FOTO"}
      </Button>
      {#if feedback.text}
        <span class={`manage-feedback ${feedback.type}`}>
          {feedback.text}
        </span>
      {/if}
    </div>
  </Dialog.Content>
</Dialog.Root>
