<script lang="ts">
  import * as Dialog from "$lib/components/shared/dialog/index.js";
  import { fade, fly } from 'svelte/transition';

  let {
    open = $bindable(false),
    title = "GUÍA DE PRODUCCIÓN",
    message = ""
  }: {
    open: boolean;
    title?: string;
    message: string;
  } = $props();
</script>

<Dialog.Root bind:open>
  <Dialog.Portal>
    <Dialog.Overlay
      transition={fade}
      transitionConfig={{ duration: 200 }}
      style="position: fixed; inset: 0; background: rgba(0,0,0,0.8); backdrop-filter: blur(4px); z-index: 1000;"
    />
    <Dialog.Content
      transition={fly}
      transitionConfig={{ y: 20, duration: 300, opacity: 1 }}
      style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); width: min(400px, 90vw); z-index: 1001; outline: none;"
    >
      <div class="stage-guide-card">
        <div class="guide-rail"></div>
        <header class="guide-header">
          <h3 class="guide-title">{title}</h3>
          <Dialog.Close asChild>
            <button class="guide-close" aria-label="Cerrar">✕</button>
          </Dialog.Close>
        </header>
        
        <div class="guide-body">
          <div class="guide-icon-box">
            <span class="material-symbols-outlined">info</span>
          </div>
          <p class="guide-text">{message}</p>
        </div>

        <footer class="guide-footer">
          <Dialog.Close asChild>
            <button class="guide-confirm">ENTENDIDO</button>
          </Dialog.Close>
        </footer>
      </div>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>

<style>
  .stage-guide-card {
    background: var(--black-elevated);
    border: 1px solid var(--cast-amber-border);
    padding: var(--space-6);
    position: relative;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.8);
  }

  .guide-rail {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background: var(--cast-amber);
  }

  .guide-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-4);
  }

  .guide-title {
    font-family: var(--font-display);
    font-size: 1.2rem;
    letter-spacing: 0.1em;
    color: var(--cast-amber);
    margin: 0;
  }

  .guide-close {
    color: var(--grey-dim);
    font-size: 1.2rem;
    background: transparent;
    border: none;
    cursor: pointer;
    transition: color var(--t-fast);
  }

  .guide-close:hover {
    color: var(--white);
  }

  .guide-body {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-4);
    text-align: center;
    margin-bottom: var(--space-6);
  }

  .guide-icon-box {
    width: 48px;
    height: 48px;
    background: rgba(200, 148, 74, 0.1);
    color: var(--cast-amber);
    display: grid;
    place-items: center;
    clip-path: var(--hex-clip-md);
  }

  .guide-text {
    font-family: var(--font-ui);
    font-size: 0.95rem;
    line-height: 1.5;
    color: var(--grey);
    margin: 0;
  }

  .guide-footer {
    display: flex;
    justify-content: center;
  }

  .guide-confirm {
    background: var(--cast-amber);
    color: var(--black);
    font-family: var(--font-display);
    font-size: 0.9rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    padding: 0.75rem 2rem;
    border: none;
    cursor: pointer;
    clip-path: var(--hex-clip-md);
    transition: all var(--t-fast);
  }

  .guide-confirm:hover {
    background: var(--white);
    transform: translateY(-2px);
  }

  .guide-confirm:active {
    transform: scale(0.96);
  }
</style>
