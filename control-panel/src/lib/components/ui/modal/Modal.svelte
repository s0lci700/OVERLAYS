<script>
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import "./modal.css";

  export let open = false;
  export let title = "";
  export let showCloseButton = true;

  function handleClose() {
    open = false;
  }
</script>

<Dialog.Root bind:open>
  <Dialog.Content
    class="photo-modal-card card-base"
    {showCloseButton}
    aria-labelledby="modal-title"
  >
    <header class="photo-modal-head">
      {#if title}
        <h3 id="modal-title" class="photo-modal-title">{title}</h3>
      {/if}
      {#if showCloseButton}
        <Dialog.Close asChild>
          <button
            class="photo-modal-close"
            type="button"
            aria-label="Cerrar"
            on:click={handleClose}>✕</button
          >
        </Dialog.Close>
      {/if}
    </header>

    <slot />
  </Dialog.Content>
</Dialog.Root>
