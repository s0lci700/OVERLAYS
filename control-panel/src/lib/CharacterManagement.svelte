<script>
  import "./CharacterManagement.css";
  import PhotoSourcePicker from "./PhotoSourcePicker.svelte";
  import { characters, SERVER_URL } from "./socket";

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
</script>

<section class="character-management" aria-labelledby="manage-character-title">
  <div class="manage-header card-base">
    <h2 id="manage-character-title" class="manage-title">GESTIÓN DE FOTOS</h2>
    <p class="manage-subtitle">Preset or URL or Local File + drag & drop</p>
  </div>

  <div class="manage-grid">
    {#each $characters as character (character.id)}
      <article class="manage-card card-base" data-char-id={character.id}>
        <header class="manage-card-head">
          <h3 class="manage-char-name">{character.name}</h3>
          <span class="manage-char-player">{character.player}</span>
        </header>

        <PhotoSourcePicker
          title="Foto: Preset or URL or Local File"
          options={PHOTO_OPTIONS}
          dense={true}
          source={photoSourceById[character.id] || "preset"}
          presetValue={presetPhotoById[character.id] || ""}
          urlValue={customUrlById[character.id] || ""}
          localValue={localPhotoById[character.id] || ""}
          serverUrl={SERVER_URL}
          onSourceChange={(value) => setPhotoSource(character.id, value)}
          onPresetChange={(value) => setPresetPhoto(character.id, value)}
          onUrlChange={(value) => setCustomPhotoUrl(character.id, value)}
          onLocalChange={(value) => setLocalPhoto(character.id, value)}
          onError={(message) => handlePickerError(character.id, message)}
        />

        <button
          class="btn-base manage-save-btn"
          type="button"
          onclick={() => savePhoto(character.id)}
          disabled={isSavingById[character.id]}
        >
          {isSavingById[character.id] ? "GUARDANDO..." : "ACTUALIZAR FOTO"}
        </button>

        {#if feedbackById[character.id]?.text}
          <p class={`manage-feedback ${feedbackById[character.id].type}`}>
            {feedbackById[character.id].text}
          </p>
        {/if}
      </article>
    {/each}
  </div>
</section>
