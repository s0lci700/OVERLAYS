<!--
  HudTabBar
  =========
  Tab navigation bar for the main HUD panel.
  Tabs: QUEUE | DADOS | LOG
-->
<script lang="ts">
  let {
    activeTab,
    onChange,
    queueCount = 0,
  }: {
    activeTab: 'queue' | 'dice' | 'log';
    onChange: (tab: 'queue' | 'dice' | 'log') => void;
    queueCount?: number;
  } = $props();

  const tabs: { id: 'queue' | 'dice' | 'log'; label: string }[] = [
    { id: 'queue', label: 'COLA' },
    { id: 'dice', label: 'DADOS' },
    { id: 'log', label: 'HISTORIAL' },
  ];
</script>

<div class="hud-tab-bar" role="tablist" aria-label="Panel principal">
  {#each tabs as tab (tab.id)}
    <button
      class="hud-tab"
      class:is-active={activeTab === tab.id}
      role="tab"
      aria-selected={activeTab === tab.id}
      aria-label={`Ver panel de ${tab.label.toLowerCase()}`}
      onclick={() => onChange(tab.id)}
    >
      {tab.label}
      {#if tab.id === 'queue' && queueCount > 0}
        <span class="tab-badge">{queueCount}</span>
      {/if}
    </button>
  {/each}
</div>

<style>
  .hud-tab-bar {
    display: flex;
    align-items: flex-end;
    height: 48px;
    background: var(--black-elevated);
    border-bottom: 1px solid var(--grey-dim);
    padding-left: var(--space-4);
    flex-shrink: 0;
  }

  .hud-tab {
    height: 48px;
    padding: 0 var(--space-4);
    background: transparent;
    border: none;
    border-bottom: 2px solid transparent;
    color: var(--grey);
    font-family: var(--font-display);
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.08em;
    cursor: pointer;
    transition:
      color var(--t-fast),
      border-color var(--t-fast);
    margin-bottom: -1px;
    display: flex;
    align-items: center;
    gap: var(--space-1);
  }

  .hud-tab:hover {
    color: var(--white);
  }

  .hud-tab.is-active {
    color: var(--white);
    border-bottom-color: var(--cyan);
  }

  .hud-tab:focus-visible {
    outline: 2px solid var(--cyan);
    outline-offset: -2px;
  }

  .tab-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    background: var(--red);
    color: var(--white);
    font-family: var(--font-mono);
    font-size: 9px;
    font-weight: 700;
    border-radius: 50%;
  }
</style>
