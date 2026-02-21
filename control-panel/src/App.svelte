<!--
  App Component (Root)
  ====================
  Main control panel application shell for DADOS & RISAS.
  
  Features:
  - Mobile-first tabbed interface (Characters, Dice, Dashboard)
  - Real-time connection status indicator
  - Character count display
  - Socket.io connection management
  
  Architecture:
  - Characters tab: Grid of CharacterCard components for HP/resource management
  - Dice tab: DiceRoller component for rolling dice and sending to overlays
  - Dashboard tab: Activity history, pending actions, and analytics
  
  The app shell provides consistent header/nav chrome around tab content.
  All state updates flow through Socket.io to keep overlays in sync.
-->
<script>
  import "./app.css";
  import DiceRoller from "./lib/DiceRoller.svelte";
  import CharacterCard from "./lib/CharacterCard.svelte";
  // import Dashboard from "./lib/dashboard/Dashboard.svelte";
  import { characters, socket } from "./lib/socket.js";

  // ───────────────────────────────────────────────────────────────────────────
  // State Management
  // ───────────────────────────────────────────────────────────────────────────

  /**
   * Currently active tab in the bottom navigation.
   * Values: 'characters' | 'dice' | 'dashboard'
   */
  let activeTab = $state("characters");

  /**
   * Socket.io connection status.
   * Used to show visual connection indicator in the header.
   */
  let connected = $state(false);

  // ───────────────────────────────────────────────────────────────────────────
  // Socket.io Event Handlers
  // ───────────────────────────────────────────────────────────────────────────

  /** Updates connection status to true when Socket.io connects */
  socket.on("connect", () => (connected = true));

  /** Updates connection status to false when Socket.io disconnects */
  socket.on("disconnect", () => (connected = false));
</script>

<!-- ────────────────────────────────────────────────────────────────────────
     App Shell
     ──────────────────────────────────────────────────────────────────────── -->
<div class="app-shell">
  <!-- Brand header with connection indicator and character count -->
  <header class="app-header">
    <div class="brand-wordmark">
      <span class="brand-block">ESDH</span>
      <span class="brand-script">TTRPG</span>
    </div>
    <div class="header-meta">
      <!-- Connection status dot (green when connected) -->
      <div class="conn-dot" class:connected></div>
      <!-- Number of characters currently loaded -->
      <span class="header-count">{$characters.length}</span>
    </div>
  </header>

  <!-- Main content area - switches based on activeTab -->
  <main class="app-main">
    <!-- Characters Tab: HP management, conditions, resources, rest buttons -->
    {#if activeTab === "characters"}
      {#key activeTab}
        <section class="tab-panel characters-grid">
          {#each $characters as character (character.id)}
            <CharacterCard {character} />
          {/each}
        </section>
      {/key}

      <!-- Dice Tab: Dice roller with modifier input and character selection -->
    {:else if activeTab === "dice"}
      {#key activeTab}
        <section class="tab-panel">
          <DiceRoller />
        </section>
      {/key}

      <!-- Dashboard Tab: Activity history, pending actions, analytics -->
      <!-- {:else}
      {#key activeTab}
        <section class="tab-panel">
          <Dashboard />
        </section>
      {/key} -->
    {/if}
  </main>

  <!-- Bottom navigation tabs (mobile-first design) -->
  <nav class="bottom-nav">
    <button
      class="nav-tab"
      class:active={activeTab === "characters"}
      onclick={() => (activeTab = "characters")}
    >
      <span class="nav-icon">⚔</span>
      <span class="nav-label">PERSONAJES</span>
    </button>
    <button
      class="nav-tab"
      class:active={activeTab === "dice"}
      onclick={() => (activeTab = "dice")}
    >
      <span class="nav-icon">⬡</span>
      <span class="nav-label">DADOS</span>
    </button>
    <button
      class="nav-tab"
      class:active={activeTab === "dashboard"}
      onclick={() => (activeTab = "dashboard")}
    >
      <span class="nav-icon">⧉</span>
      <span class="nav-label">DASHBOARD</span>
    </button>
  </nav>
</div>
