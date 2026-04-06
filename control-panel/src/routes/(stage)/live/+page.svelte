<!--
  Stage HUD — unified operator console.
  Replaces the old tabbed /live/characters + /live/dice routing.
-->
<script lang="ts">
  import { characters } from '$lib/services/socket.svelte';
  import { initializeRoster } from '$lib/derived/stage.svelte';
  import CharacterStrip from '$lib/components/stage/character-strip/CharacterStrip.svelte';
  import MainPanel from '$lib/components/stage/main-panel/MainPanel.svelte';

  $effect(() => {
    initializeRoster($characters);
  });
</script>

<div class="stage-hud">
  <CharacterStrip characters={$characters} />
  <MainPanel />
</div>

<style>
  .stage-hud {
    display: flex;
    position: fixed;
    top: 64px;
    left: 0;
    right: 0;
    bottom: 0;
    overflow: hidden;
    background: var(--black);
    z-index: 10;
  }

  @media (max-width: 768px) {
    .stage-hud {
      position: static;
      flex-direction: column;
      height: auto;
      min-height: calc(100dvh - 64px);
      overflow: visible;
    }
  }
</style>
