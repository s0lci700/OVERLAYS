<script>
  import * as Dialog from "$lib/components/shared/dialog/index.js";
  import "./CastModal.css";

  /**
   * @typedef {Object} Props
   * @property {boolean} [open]
   * @property {string} [title]
   * @property {boolean} [showCloseButton]
   * @property {import('svelte').Snippet} [children]
   */

  /** @type {Props} */
  let {
    open = $bindable(false),
    title = "",
    showCloseButton = true,
    children,
  } = $props();

  function handleClose() {
    open = false;
  }
</script>

<Dialog.Root bind:open>
  <Dialog.Content
    class="cast-modal-panel"
    {showCloseButton}
    aria-labelledby="modal-title"
    portalProps={{}}
  >
    <div class="cast-modal-rail"></div>
    <header class="cast-modal-head">
      {#if title}
        <h3 id="modal-title" class="cast-modal-title">{title}</h3>
      {/if}
      {#if showCloseButton}
        <Dialog.Close asChild>
          <button
            class="cast-modal-close"
            type="button"
            aria-label="Cerrar"
            onclick={handleClose}>
            <span class="material-symbols-outlined">close</span>
          </button>
        </Dialog.Close>
      {/if}
    </header>

    <div class="cast-modal-body">
      {@render children?.()}
    </div>
  </Dialog.Content>
</Dialog.Root>
