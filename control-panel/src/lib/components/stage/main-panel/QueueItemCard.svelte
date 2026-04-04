<!--
  QueueItemCard
  =============
  Single item in the overlay reveal queue.
-->
<script lang="ts">
  let {
    item,
    onConfirm,
  }: {
    item: { id: string; title: string; target?: string; kind?: string };
    onConfirm: (id: string) => void;
  } = $props();
</script>

<div class="queue-item-card">
  <div class="queue-item-card__header">
    {#if item.kind}
      <span class="queue-item-card__kind">{item.kind}</span>
    {/if}
    <span class="queue-item-card__title">{item.title}</span>
  </div>
  {#if item.target}
    <span class="queue-item-card__target">{item.target}</span>
  {/if}
  <button class="queue-item-card__confirm" onclick={() => onConfirm(item.id)}>
    CONFIRM
  </button>
</div>

<style>
  .queue-item-card {
    background: var(--black-card);
    border: 1px solid var(--grey-dim);
    border-radius: var(--radius-md);
    padding: var(--space-3);
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .queue-item-card__header {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }

  .queue-item-card__kind {
    font-family: var(--font-display);
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.08em;
    color: var(--cyan);
    background: var(--cyan-dim);
    border: 1px solid var(--cyan);
    border-radius: var(--radius-sm);
    padding: 2px var(--space-2);
    text-transform: uppercase;
    flex-shrink: 0;
  }

  .queue-item-card__title {
    font-family: var(--font-display);
    font-size: 13px;
    font-weight: 700;
    color: var(--white);
  }

  .queue-item-card__target {
    font-family: var(--font-ui);
    font-size: 12px;
    color: var(--grey);
  }

  .queue-item-card__confirm {
    align-self: flex-end;
    height: 32px;
    padding: 0 var(--space-4);
    background: transparent;
    border: 1px solid var(--cyan);
    border-radius: var(--radius-sm);
    color: var(--cyan);
    font-family: var(--font-display);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
    cursor: pointer;
    transition:
      background var(--t-fast),
      color var(--t-fast);
  }

  .queue-item-card__confirm:hover {
    background: var(--cyan);
    color: var(--black);
  }

  .queue-item-card__confirm:focus-visible {
    outline: 2px solid var(--cyan);
    outline-offset: 2px;
  }
</style>
