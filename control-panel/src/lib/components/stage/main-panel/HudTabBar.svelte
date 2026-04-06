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
    activeTab: 'queue' | 'dice' | 'log' | 'combat';
    onChange: (tab: 'queue' | 'dice' | 'log' | 'combat') => void;
    queueCount?: number;
  } = $props();

  const tabs: { id: 'queue' | 'dice' | 'log' | 'combat'; label: string; locked?: boolean }[] = [
    { id: 'dice', label: 'DADOS' },
    { id: 'combat', label: 'COMBATE', locked: true },
    { id: 'queue', label: 'COLA' },
    { id: 'log', label: 'HISTORIAL' },
  ];
</script>

<div class="hud-tab-bar" role="tablist" aria-label="Panel principal">
  {#each tabs as tab (tab.id)}
    <button
      class="hud-tab"
      class:is-active={activeTab === tab.id}
      class:is-locked={tab.locked}
      class:is-desktop-hidden={tab.id === 'log' || tab.id === 'queue'}
      role="tab"
      aria-selected={activeTab === tab.id}
      aria-disabled={tab.locked}
      tabindex={tab.locked ? -1 : 0}
      aria-label={tab.locked ? `${tab.label} — en desarrollo` : `Ver panel de ${tab.label.toLowerCase()}`}
      data-tooltip={tab.locked ? 'En desarrollo' : undefined}
      onclick={() => !tab.locked && onChange(tab.id)}
    >
      {tab.label}
      {#if tab.locked}
        <svg class="tab-lock" viewBox="0 0 12 14" width="10" height="12" fill="currentColor" aria-hidden="true">
          <rect x="2" y="6" width="8" height="7" rx="1"/>
          <path d="M4 6V4a2 2 0 1 1 4 0v2" fill="none" stroke="currentColor" stroke-width="1.5"/>
        </svg>
      {/if}
      {#if tab.id === 'queue' && queueCount > 0}
        <span class="tab-badge">{queueCount}</span>
      {/if}
    </button>
  {/each}
</div>

<style>
  /* .is-desktop-hidden visibility is handled by the global utility in app.css */
  .hud-tab-bar {
    display: flex !important;
    flex-direction: row !important;
    align-items: center;
    height: 48px;
    background: var(--black-elevated);
    border-bottom: 1px solid var(--grey-dim);
    padding-left: var(--space-4);
    flex-shrink: 0;
    overflow: visible;
    position: relative;
    z-index: 20;
  }

  .hud-tab {
    height: 100%;
    padding: 0 var(--space-4);
    background: transparent;
    border: none;
    border-bottom: 2px solid transparent;
    color: var(--grey);
    font-family: var(--font-display);
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.06em;
    cursor: pointer;
    transition:
      color var(--t-fast),
      border-color var(--t-fast);
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
    letter-spacing: 0.04em;
  }

  .hud-tab.is-locked {
    color: var(--grey-dim);
    cursor: not-allowed;
    opacity: 0.5;
    position: relative;
  }

  .hud-tab.is-locked:hover {
    color: var(--grey);
  }

  .tab-lock {
    opacity: 0.6;
    flex-shrink: 0;
  }

  /* CSS tooltip for locked tabs */
  .hud-tab[data-tooltip] {
    position: relative;
  }

  .hud-tab[data-tooltip]::after {
    content: attr(data-tooltip);
    position: absolute;
    top: calc(100% + 4px);
    left: 50%;
    transform: translateX(-50%);
    background: var(--black-elevated);
    border: 1px solid var(--grey-dim);
    color: var(--grey);
    font-family: var(--font-display);
    font-size: 10px;
    letter-spacing: 0.08em;
    white-space: nowrap;
    padding: 4px 8px;
    pointer-events: none;
    opacity: 0;
    transition: opacity var(--t-fast);
    z-index: 100;
  }

  .hud-tab[data-tooltip]:hover::after {
    opacity: 1;
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
