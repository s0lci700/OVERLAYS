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
  import CharacterCreationForm from "./lib/CharacterCreationForm.svelte";
  import CharacterManagement from "./lib/CharacterManagement.svelte";
  // import Dashboard from "./lib/dashboard/Dashboard.svelte";
  import { characters, socket } from "./lib/socket.js";
  import { parseHash, updateHash, onHashChange } from "./lib/router.js";

  // ───────────────────────────────────────────────────────────────────────────
  // State Management
  // ───────────────────────────────────────────────────────────────────────────

  // Initialize from URL hash, fallback to defaults
  const initialRoute = parseHash();

  /** Top-level page route. */
  let activePage = $state(initialRoute.page);

  /** Bottom-nav mode inside the control page. */
  let controlTab = $state(
    initialRoute.page === "control" ? initialRoute.tab : "characters"
  );

  /** Bottom-nav mode inside the management page. */
  let managementTab = $state(
    initialRoute.page === "management" ? initialRoute.tab : "create"
  );

  /** Sidebar navigation visibility. */
  let isSidebarOpen = $state(false);

  /**
   * Socket.io connection status.
   * Used to show visual connection indicator in the header.
   */
  let connected = $state(false);

  // ───────────────────────────────────────────────────────────────────────────
  // Router Effects
  // ───────────────────────────────────────────────────────────────────────────

  // Sync state to URL whenever page or tab changes
  $effect(() => {
    const tab = activePage === "control" ? controlTab : managementTab;
    updateHash(activePage, tab);
  });

  // Listen for hash changes (browser back/forward buttons)
  $effect(() => {
    const unsubscribe = onHashChange(({ page, tab }) => {
      activePage = page;
      if (page === "control") {
        controlTab = tab;
      } else {
        managementTab = tab;
      }
    });

    return unsubscribe;
  });

  // ───────────────────────────────────────────────────────────────────────────
  // Socket.io Event Handlers
  // ───────────────────────────────────────────────────────────────────────────

  /** Updates connection status to true when Socket.io connects */
  socket.on("connect", () => (connected = true));

  /** Updates connection status to false when Socket.io disconnects */
  socket.on("disconnect", () => (connected = false));

  function setControlTab(tab) {
    controlTab = tab;
  }

  function setManagementTab(tab) {
    managementTab = tab;
  }

  function toggleSidebar() {
    isSidebarOpen = !isSidebarOpen;
  }

  function openPage(page) {
    activePage = page;
    isSidebarOpen = false;
  }
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
    {#if activePage === "control"}
      <span class="page-title">PANEL DE CONTROL</span>
    {:else if activePage === "management"}
      <span class="page-title">GESTIÓN DE PERSONAJES</span>
    {/if}
    <div class="header-meta">
      <!-- Connection status dot (green when connected) -->
      <div class="conn-dot" class:connected></div>
      <!-- Number of characters currently loaded -->
      <span class="header-count">{$characters.length}</span>
      <button
        class="header-menu"
        type="button"
        aria-label="Abrir navegación"
        onclick={toggleSidebar}>☰</button
      >
    </div>
  </header>

  <!-- Main content area - switches by page -->
  <main class="app-main">
    {#if activePage === "control"}
      <section class="tab-panel">
        {#if controlTab === "characters"}
          <div
            class="characters-grid"
            class:grid-three={$characters.length > 2}
          >
            {#each $characters as character (character.id)}
              <CharacterCard {character} />
            {/each}
          </div>
        {:else if controlTab === "dice"}
          <section class="tab-panel">
            <DiceRoller />
          </section>
        {/if}
      </section>
    {:else if activePage === "management"}
      <section class="tab-panel">
        {#if managementTab === "create"}
          <CharacterCreationForm />
        {:else if managementTab === "manage"}
          <CharacterManagement />
        {/if}
      </section>
    {/if}
  </main>

  {#if activePage === "control"}
    <nav class="bottom-nav">
      <button
        class="nav-tab"
        class:active={controlTab === "characters"}
        onclick={() => setControlTab("characters")}
      >
        <span class="nav-icon">⚔</span>
        <span class="nav-label">PERSONAJES</span>
      </button>
      <button
        class="nav-tab"
        class:active={controlTab === "dice"}
        onclick={() => setControlTab("dice")}
      >
        <span class="nav-icon">⬡</span>
        <span class="nav-label">DADOS</span>
      </button>
    </nav>
  {:else if activePage === "management"}
    <nav class="bottom-nav">
      <button
        class="nav-tab"
        class:active={managementTab === "create"}
        onclick={() => setManagementTab("create")}
      >
        <span class="nav-icon">＋</span>
        <span class="nav-label">CREAR</span>
      </button>
      <button
        class="nav-tab"
        class:active={managementTab === "manage"}
        onclick={() => setManagementTab("manage")}
      >
        <span class="nav-icon">⛭</span>
        <span class="nav-label">GESTIONAR</span>
      </button>
    </nav>
  {/if}

  {#if isSidebarOpen}
    <button
      class="sidebar-backdrop"
      type="button"
      aria-label="Cerrar navegación"
      onclick={toggleSidebar}
    ></button>
  {/if}

  <aside class="app-sidebar" class:open={isSidebarOpen}>
    <div class="app-sidebar-head">
      <h2 class="app-sidebar-title">NAVEGACIÓN</h2>
      <button
        class="app-sidebar-close"
        type="button"
        aria-label="Cerrar navegación"
        onclick={toggleSidebar}
      >
        ✕
      </button>
    </div>
    <button
      class="app-sidebar-link"
      class:active={activePage === "control"}
      type="button"
      onclick={() => openPage("control")}
    >
      PANEL DE CONTROL
    </button>
    <button
      class="app-sidebar-link"
      class:active={activePage === "management"}
      type="button"
      onclick={() => openPage("management")}
    >
      GESTIÓN DE PERSONAJES
    </button>
  </aside>
</div>
