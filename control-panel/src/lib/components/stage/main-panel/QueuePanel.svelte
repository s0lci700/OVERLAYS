<!--
  QueuePanel
  ==========
  Overlay reveal queue. Shows pending items or an empty state.
-->
<script lang="ts">
  import QueueItemCard from './QueueItemCard.svelte';
  import MysticalEmptyState from '$lib/components/cast/shared/MysticalEmptyState.svelte';
  import StageGuide from '../shared/StageGuide.svelte';
  import { slide, fade, fly } from 'svelte/transition';

  let {
    items = [],
  }: {
    items: { id: string; title: string; target?: string; kind?: string }[];
  } = $props();

  let showGuide = $state(false);

  function handleConfirm(_id: string) {
    // Queue management is handled by the parent
  }
</script>

<div class="queue-panel">
  {#if items.length === 0}
    <div in:fade={{ duration: 200, delay: 100 }}>
      <MysticalEmptyState 
        title="COLA VACÍA" 
        message="Aquí aparecerán los elementos que planeas revelar a la audiencia."
        icon="hourglass_empty"
        ctaLabel="VER GUÍA DE REVELACIÓN"
        onCta={() => (showGuide = true)}
      />
    </div>
  {:else}
    {#each items as item, i (item.id)}
      <div 
        out:slide={{ duration: 250 }}
        in:fly={{ y: 10, duration: 300, delay: Math.min(i * 50, 500), opacity: 0 }}
      >
        <QueueItemCard {item} onConfirm={handleConfirm} />
      </div>
    {/each}
  {/if}
</div>

<StageGuide 
  bind:open={showGuide}
  title="GUÍA DE REVELACIÓN"
  message='Para añadir elementos a la cola de producción, busca el icono de "REVELAR" (ojo) en la ficha de cualquier personaje o recurso. Los elementos en cola se mostrarán aquí antes de ser enviados a los gráficos de la audiencia.'
/>

<style>
  .queue-panel {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }
</style>
