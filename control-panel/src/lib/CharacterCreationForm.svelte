<script>
  import "./CharacterCreationForm.css";
  import PhotoSourcePicker from "./PhotoSourcePicker.svelte";
  import { SERVER_URL } from "./socket";

  // Controlled form fields for the character payload.
  let name = $state("");
  let player = $state("");
  let hpMax = $state(30);
  let armorClass = $state(10);
  let speedWalk = $state(30);

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

  // Minimal client-side validation before enabling submit.
  const isFormValid = $derived(
    name.trim().length > 0 && player.trim().length > 0 && hpMax > 0,
  );

  // Normalizes photo value based on selected source mode.
  function getResolvedPhotoValue() {
    if (photoSource === "local") return localPhotoDataUrl;
    if (photoSource === "url") return customPhotoUrl.trim();
    return photo;
  }

  // Receives upload/validation errors from PhotoSourcePicker and maps them to form feedback.
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

  // Posts a new character and resets the form on success.
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
