<!--
  ConditionPopover
  ================
  Floating search popover for adding D&D conditions to a character.
  Closes on Escape or click outside.
-->
<script lang="ts">
  let {
    characterId: _characterId,
    onSelect,
    onClose,
  }: {
    characterId: string;
    onSelect: (name: string) => void;
    onClose: () => void;
  } = $props();

  const CONDITIONS = [
    'Blinded',
    'Charmed',
    'Deafened',
    'Exhaustion',
    'Frightened',
    'Grappled',
    'Incapacitated',
    'Invisible',
    'Paralyzed',
    'Petrified',
    'Poisoned',
    'Prone',
    'Restrained',
    'Stunned',
    'Unconscious',
  ];

  let search = $state('');
  let popoverEl: HTMLElement | undefined;

  const filtered = $derived(
    CONDITIONS.filter((c) => c.toLowerCase().includes(search.toLowerCase()))
  );

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      onClose();
    }
  }

  function handleDocumentClick(event: MouseEvent) {
    if (popoverEl && !popoverEl.contains(event.target as Node)) {
      onClose();
    }
  }

  $effect(() => {
    // Defer listener attachment by one tick so the triggering click that opened
    // the popover doesn't immediately propagate to the document and close it.
    const timeoutId = setTimeout(() => {
      document.addEventListener('click', handleDocumentClick);
      document.addEventListener('keydown', handleKeydown);
    }, 0);
    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('click', handleDocumentClick);
      document.removeEventListener('keydown', handleKeydown);
    };
  });
</script>

<div
  class="condition-popover"
  role="menu"
  aria-label="Agregar condición"
  aria-modal="true"
  bind:this={popoverEl}
>
  <input
    class="condition-search"
    type="text"
    placeholder="Buscar..."
    bind:value={search}
  />
  <ul class="condition-list">
    {#each filtered as name (name)}
      <li role="none">
        <button
          class="condition-option"
          role="menuitem"
          onclick={() => onSelect(name)}
        >
          {name}
        </button>
      </li>
    {/each}
    {#if filtered.length === 0}
      <li class="condition-empty">Sin resultados</li>
    {/if}
  </ul>
</div>

<style>
  .condition-popover {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    width: 220px;
    background: var(--black-elevated);
    border: 1px solid var(--grey-dim);
    border-radius: var(--radius-md);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6);
    z-index: 70;
    overflow: hidden;
  }

  .condition-search {
    width: 100%;
    height: 32px;
    background: var(--black-card);
    border: none;
    border-bottom: 1px solid var(--grey-dim);
    color: var(--white);
    font-family: var(--font-ui);
    font-size: 12px;
    padding: 0 var(--space-2);
    outline: none;
    box-sizing: border-box;
  }

  .condition-search:focus {
    border-bottom-color: var(--cyan);
  }

  .condition-list {
    list-style: none;
    margin: 0;
    padding: 0;
    max-height: 200px;
    overflow-y: auto;
  }

  .condition-option {
    width: 100%;
    height: 32px;
    background: transparent;
    border: none;
    color: var(--white);
    font-family: var(--font-ui);
    font-size: 12px;
    text-align: left;
    padding: 0 var(--space-2);
    cursor: pointer;
  }

  .condition-option:hover {
    background: var(--grey-dim);
  }

  .condition-empty {
    padding: var(--space-2);
    color: var(--grey);
    font-size: 12px;
    font-family: var(--font-ui);
  }
</style>
