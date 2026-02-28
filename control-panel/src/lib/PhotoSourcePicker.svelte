<!--
  PhotoSourcePicker
  =================
  Shared picker for preset assets, URL input, or local file upload.
  Emits changes through callback props for parent-controlled state.
-->
<script>
  import "./PhotoSourcePicker.css";
  import "$lib/components/ui/modal/modal.css";
  import { Button } from "$lib/components/ui/button/index.js";

  let {
    title = "",
    options = [],
    source = "preset",
    presetValue = "",
    urlValue = "",
    localValue = "",
    dense = false,
    serverUrl = "",
    onSourceChange = () => {},
    onPresetChange = () => {},
    onUrlChange = () => {},
    onLocalChange = () => {},
    onError = () => {},
  } = $props();

  let isDropActive = $state(false);
  let previewLoadFailed = $state(false);
  let localPhotoInputEl = $state();
  let fallbackPreview = $state("");

  function resolveOptionalPhotoSrc(photoPath) {
    if (!photoPath) return "";

    if (
      photoPath.startsWith("http://") ||
      photoPath.startsWith("https://") ||
      photoPath.startsWith("data:") ||
      photoPath.startsWith("blob:")
    ) {
      return photoPath;
    }

    if (photoPath.startsWith("/")) {
      return `${serverUrl}${photoPath}`;
    }

    return `${serverUrl}/${photoPath.replace(/^\/+/, "")}`;
  }

  function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("No se pudo leer el archivo"));
      reader.readAsDataURL(file);
    });
  }

  async function processLocalPhotoFile(file) {
    if (!file) {
      onLocalChange("");
      return;
    }

    if (!file.type.startsWith("image/")) {
      onError("El archivo debe ser una imagen.");
      onLocalChange("");
      return;
    }

    try {
      const dataUrl = await fileToDataUrl(file);
      onLocalChange(dataUrl);
      onError("");
      previewLoadFailed = false;
    } catch (error) {
      console.error("Error reading local photo", error);
      onError("No se pudo procesar la imagen local.");
      onLocalChange("");
    }
  }

  async function handleLocalPhotoSelected(event) {
    const file = event.currentTarget.files?.[0];
    await processLocalPhotoFile(file);
  }

  function openLocalPhotoPicker() {
    localPhotoInputEl?.click();
  }

  function handleDropZoneDragOver(event) {
    event.preventDefault();
    isDropActive = true;
  }

  function handleDropZoneDragLeave(event) {
    event.preventDefault();
    isDropActive = false;
  }

  async function handleDropZoneDrop(event) {
    event.preventDefault();
    isDropActive = false;

    const file = event.dataTransfer?.files?.[0];
    await processLocalPhotoFile(file);
  }

  function clearCustomPhotoUrl() {
    onUrlChange("");
  }

  function clearLocalPhoto() {
    onLocalChange("");
    if (localPhotoInputEl) {
      localPhotoInputEl.value = "";
    }
  }

  const previewPhotoValue = $derived(
    source === "local"
      ? localValue
      : source === "url"
        ? urlValue.trim()
        : presetValue,
  );
  const previewPhotoSrc = $derived(resolveOptionalPhotoSrc(previewPhotoValue));

  $effect(() => {
    previewPhotoSrc;
    previewLoadFailed = false;
  });

  function handlePreviewError() {
    previewLoadFailed = true;
  }

  $effect(() => {
    const selectablePhotos = options
      .map((option) => option.value)
      .filter((value) => typeof value === "string" && value.trim().length > 0);

    if (selectablePhotos.length === 0) {
      fallbackPreview = "";
      return;
    }

    const randomIndex = Math.floor(Math.random() * selectablePhotos.length);
    fallbackPreview = selectablePhotos[randomIndex];
  });
</script>

<section class="photo-picker" class:dense aria-label="Fuente de foto">
  <span class="label-caps">{title}</span>
  <div class="photo-content">
    <div class="photo-controls">
      <div
        class="photo-segment-controls"
        role="tablist"
        aria-label="Tipo de foto"
      >
        <Button
          type="button"
          disabled={false}
          class="photo-segment-btn {dense ? 'dense' : ''} {source === 'preset'
            ? 'active'
            : ''}"
          role="tab"
          aria-selected={source === "preset"}
          onclick={() => onSourceChange("preset")}
        >
          Preset
        </Button>
        <Button
          type="button"
          disabled={false}
          class="photo-segment-btn {dense ? 'dense' : ''} {source === 'url'
            ? 'active'
            : ''}"
          role="tab"
          aria-selected={source === "url"}
          onclick={() => onSourceChange("url")}
        >
          URL
        </Button>
        <Button
          type="button"
          disabled={false}
          class="photo-segment-btn {dense ? 'dense' : ''} {source === 'local'
            ? 'active'
            : ''}"
          role="tab"
          aria-selected={source === "local"}
          onclick={() => onSourceChange("local")}
        >
          Archivo Local
        </Button>
      </div>

      {#if source === "preset"}
        <!-- Preset gallery: show thumbnails for quick selection similar to the modal design -->
        <div class="photo-gallery" role="list">
          {#each options as option (option.value)}
            <Button
              type="button"
              disabled={false}
              class="photo-thumb {option.value === presetValue ? 'active' : ''}"
              aria-pressed={option.value === presetValue}
              onclick={() => onPresetChange(option.value)}
              title={option.label}
            >
              {#if option.value}
                <img
                  src={resolveOptionalPhotoSrc(option.value)}
                  alt={option.label}
                />
              {:else}
                <div class="photo-random">Aleatorio</div>
              {/if}
              <span class="thumb-label">{option.label}</span>
              {#if option.value === presetValue}
                <span class="thumb-check">✓</span>
              {/if}
            </Button>
          {/each}
        </div>
        <!-- Hidden native select kept for accessibility/ forms integration -->
        <select
          class="photo-select visually-hidden"
          value={presetValue}
          onchange={(event) => onPresetChange(event.currentTarget.value)}
        >
          {#each options as option (option.value)}
            <option value={option.value}>{option.label}</option>
          {/each}
        </select>
      {:else if source === "url"}
        <div class="photo-input-row" class:dense>
          <input
            type="url"
            class:dense
            placeholder="https://..."
            value={urlValue}
            oninput={(event) => onUrlChange(event.currentTarget.value)}
          />
          <button
            type="button"
            class="photo-clear-btn"
            class:dense
            onclick={clearCustomPhotoUrl}
            aria-label="Limpiar URL"
          >
            ✕
          </button>
        </div>
      {:else}
        <input
          type="file"
          class="photo-file-input-hidden"
          accept="image/*"
          onchange={handleLocalPhotoSelected}
          bind:this={localPhotoInputEl}
        />

        <div
          class="photo-dropzone"
          class:dense
          class:active={isDropActive}
          ondragover={handleDropZoneDragOver}
          ondragleave={handleDropZoneDragLeave}
          ondrop={handleDropZoneDrop}
          role="button"
          tabindex="0"
          onclick={openLocalPhotoPicker}
          onkeydown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              openLocalPhotoPicker();
            }
          }}
        >
          <span class="photo-dropzone-title">Arrastra imagen aquí</span>
          <span class="photo-dropzone-subtitle">o toca para elegir archivo</span
          >
        </div>

        <div class="photo-input-row" class:dense>
          <input
            type="text"
            class="photo-file-input"
            class:dense
            readonly
            value={localValue ? "Imagen local cargada ✅" : "Sin archivo"}
          />
          <button
            type="button"
            class="photo-clear-btn"
            class:dense
            onclick={clearLocalPhoto}
            aria-label="Limpiar archivo"
          >
            ✕
          </button>
        </div>
      {/if}
    </div>

    {#if (previewPhotoSrc || fallbackPreview) && !previewLoadFailed}
      <div class="photo-preview-wrap" aria-live="polite">
        <span class="label-caps">Preview</span>
        <img
          src={previewPhotoSrc || resolveOptionalPhotoSrc(fallbackPreview)}
          alt="Preview foto"
          class="photo-preview"
          class:dense
          onerror={handlePreviewError}
        />
      </div>
    {:else if previewPhotoSrc && previewLoadFailed}
      <p class="photo-picker-error">
        No se pudo cargar el preview de la imagen.
      </p>
    {/if}
  </div>
</section>
