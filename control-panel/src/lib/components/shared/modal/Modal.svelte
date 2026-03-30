<script>
  import * as Dialog from "$lib/components/shared/dialog/index.js";
  import "./modal.css";

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
    class="cp-modal-card card-base"
    {showCloseButton}
    aria-labelledby="modal-title"
    portalProps={{}}
  >
    <header class="cp-modal-head">
      {#if title}
        <h3 id="modal-title" class="cp-modal-title">{title}</h3>
      {/if}
      {#if showCloseButton}
        <Dialog.Close asChild>
          <button
            class="cp-modal-close"
            type="button"
            aria-label="Cerrar"
            onclick={handleClose}>✕</button
          >
        </Dialog.Close>
      {/if}
    </header>

    {@render children?.()}
  </Dialog.Content>
</Dialog.Root>
