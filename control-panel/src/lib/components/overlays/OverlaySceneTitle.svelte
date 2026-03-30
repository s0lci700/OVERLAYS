<!--
  OverlaySceneTitle — Animated scene/location title card (center screen).
  Intended for: routes/(audience)/scene/+page.svelte
  OBS Browser Source: 1920×1080, transparent background.

  Props:
    serverUrl {string} — Socket.io server URL

  Socket events consumed:
    initialData   — bootstrap scene state
    scene_changed — show, update, or hide the title card
-->
<script>
  import { createOverlaySocket } from './shared/overlaySocket.svelte.js';
  import { tick } from "svelte";
  import { animate, utils } from "animejs";

  let { serverUrl = "http://localhost:3000", preview = null } = $props();

  let liveTitle = $state("");
  let liveSubtitle = $state("");
  let liveVisible = $state(false);

  const title = $derived(preview ? (preview.title ?? "") : liveTitle);
  const subtitle = $derived(preview ? (preview.subtitle ?? "") : liveSubtitle);
  const visible = $derived(preview ? true : liveVisible);

  let cardEl = $state();

  $effect(() => {
    if (preview) return;
    const { socket } = createOverlaySocket(serverUrl);

    socket.on("initialData", ({ scene }) => {
      if (scene) applyScene(scene, false);
    });

    socket.on("scene_changed", (state) => {
      applyScene(state, true);
    });

    return () => {
      socket.disconnect();
    };
  });

  async function applyScene(state, shouldAnimate) {
    const wasVisible = liveVisible;
    liveTitle = state.title || "";
    liveSubtitle = state.subtitle || "";
    liveVisible = state.visible ?? true;

    if (!shouldAnimate) return;

    await tick();

    if (liveVisible && cardEl) {
      animate(cardEl, {
        translateY: [-40, 0],
        opacity: [0, 1],
        duration: 700,
        ease: "outExpo",
      });
    } else if (!liveVisible && wasVisible && cardEl) {
      animate(cardEl, {
        translateY: [0, 40],
        opacity: [1, 0],
        duration: 500,
        ease: "inExpo",
      });
    }
  }
</script>

{#if visible}
  <div class="scene-card" bind:this={cardEl}>
    <div class="scene-line"></div>
    <div class="scene-title">{title}</div>
    {#if subtitle}
      <div class="scene-subtitle">{subtitle}</div>
    {/if}
    <div class="scene-line"></div>
  </div>
{/if}

<style>
  .scene-card {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    padding: 40px 80px;
    background: rgba(0, 0, 0, 0.92);
    border: 1px solid rgba(255, 255, 255, 0.1);
    min-width: 600px;
    max-width: 900px;
    text-align: center;
  }

  .scene-line {
    width: 100%;
    height: 1px;
    background: linear-gradient(90deg, transparent, #00d4e8, transparent);
  }

  .scene-title {
    color: #fff;
    font-family: "Bebas Neue", sans-serif;
    font-size: 72px;
    font-weight: normal;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    line-height: 1;
  }

  .scene-subtitle {
    color: #00d4e8;
    font-family: "JetBrains Mono", monospace;
    font-size: 16px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.22em;
  }
</style>
