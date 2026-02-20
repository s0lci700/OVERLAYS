<script>
  import DiceRoller from "./lib/DiceRoller.svelte";
  import CharacterCard from "./lib/CharacterCard.svelte";
  import { characters, socket } from "./lib/socket.js";

  let activeTab = $state('characters');
  let connected = $state(false);

  socket.on('connect', () => connected = true);
  socket.on('disconnect', () => connected = false);
</script>

<div class="app-shell">

  <header class="app-header">
    <div class="brand-wordmark">
      <span class="brand-block">DADOS</span>
      <span class="brand-script">& Risas</span>
    </div>
    <div class="header-meta">
      <div class="conn-dot" class:connected></div>
      <span class="header-count">{$characters.length}</span>
    </div>
  </header>

  <main class="app-main">
    {#if activeTab === 'characters'}
      <section class="tab-panel" key="characters">
        {#each $characters as character (character.id)}
          <CharacterCard {character} />
        {/each}
      </section>
    {:else}
      <section class="tab-panel" key="dice">
        <DiceRoller />
      </section>
    {/if}
  </main>

  <nav class="bottom-nav">
    <button
      class="nav-tab"
      class:active={activeTab === 'characters'}
      onclick={() => activeTab = 'characters'}
    >
      <span class="nav-icon">⚔</span>
      <span class="nav-label">PERSONAJES</span>
    </button>
    <button
      class="nav-tab"
      class:active={activeTab === 'dice'}
      onclick={() => activeTab = 'dice'}
    >
      <span class="nav-icon">⬡</span>
      <span class="nav-label">DADOS</span>
    </button>
  </nav>

</div>

<style>
  .app-shell {
    display: flex;
    flex-direction: column;
    height: 100dvh;
    overflow: hidden;
    background: var(--black);
  }

  /* ── Header ── */
  .app-header {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-3) var(--space-4);
    background: var(--black);
    border-bottom: 1px solid var(--grey-dim);
  }

  .brand-wordmark {
    display: flex;
    align-items: baseline;
    gap: var(--space-2);
  }

  .brand-block {
    font-family: var(--font-display);
    font-size: 1.75rem;
    color: var(--red);
    letter-spacing: 0.04em;
    line-height: 1;
  }

  .brand-script {
    font-family: var(--font-script);
    font-size: 1.25rem;
    color: var(--cyan);
    line-height: 1;
  }

  .header-meta {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }

  .conn-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--grey-dim);
    transition: background var(--t-normal), box-shadow var(--t-normal);
  }

  .conn-dot.connected {
    background: var(--cyan);
    box-shadow: 0 0 8px var(--cyan);
  }

  .header-count {
    font-family: var(--font-mono);
    font-size: 0.75rem;
    color: var(--grey);
  }

  /* ── Main ── */
  .app-main {
    flex: 1;
    overflow-y: auto;
    padding: var(--space-4);
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .tab-panel {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    animation: fadeUp var(--t-fast) ease;
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* ── Bottom Nav ── */
  .bottom-nav {
    flex-shrink: 0;
    display: flex;
    background: var(--black);
    border-top: 1px solid var(--grey-dim);
    padding-bottom: env(safe-area-inset-bottom, 0px);
  }

  .nav-tab {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--space-1);
    padding: var(--space-3) 0;
    min-height: 56px;
    color: var(--grey);
    background: transparent;
    border-top: 2px solid transparent;
    transition: color var(--t-fast), background var(--t-fast), border-color var(--t-fast);
  }

  .nav-tab.active {
    color: var(--red);
    border-top-color: var(--red);
    background: rgba(255, 77, 106, 0.06);
  }

  .nav-icon {
    font-size: 1.25rem;
    line-height: 1;
  }

  .nav-label {
    font-family: var(--font-display);
    font-size: 0.8rem;
    letter-spacing: 0.06em;
    line-height: 1;
  }
</style>
