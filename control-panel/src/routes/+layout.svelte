<!--
  Root layout: shared app shell, header, and sidebar navigation.
-->
<script>
  import "../app.css";
  import { page } from "$app/state";
  import { characters, socket } from "$lib/services/socket.js";
  import { resolve } from "$app/paths";

  let connected = $state(false);
  let isSidebarOpen = $state(false);
  let { children } = $props();

  socket.on("connect", () => (connected = true));
  socket.on("disconnect", () => (connected = false));

  function toggleSidebar() {
    isSidebarOpen = !isSidebarOpen;
  }

  let isOverview = $derived(page.url.pathname.startsWith("/overview"));
  let isSetup = $derived(page.url.pathname.startsWith("/setup"));
  let isDM = $derived(page.url.pathname.startsWith("/dm"));
  let isPlayers = $derived(page.url.pathname.startsWith("/players"));
</script>

<div class="app-shell">
  <a class="skip-to-content" href="#main-content">Saltar al contenido</a>
  <header class="app-header">
    <div class="brand-wordmark">
      <span class="brand-block">ESDH</span>
      <span class="brand-script">TTRPG</span>
    </div>
    <span class="page-title">
      {isOverview
        ? "DASHBOARD EN VIVO"
        : isSetup
          ? "GESTIÓN DE PERSONAJES"
          : isDM
            ? "PANEL DM"
            : isPlayers
              ? "FICHA DE PERSONAJE"
              : "PANEL DE CONTROL"}
    </span>
    <div class="header-meta">
      <div class="conn-dot" class:connected></div>
      <span class="header-count">{$characters.length}</span>
      <button
        class="header-menu"
        type="button"
        aria-label="Abrir navegación"
        onclick={toggleSidebar}
      >
        ☰
      </button>
    </div>
  </header>

  <main class="app-main" id="main-content">
    {@render children()}
  </main>

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
    <a
      class="app-sidebar-link"
      class:active={page.url.pathname.startsWith("/live")}
      href={resolve("/live/characters")}
    >
      WIP
    </a>
    <a
      class="app-sidebar-link"
      class:active={page.url.pathname.startsWith("/setup")}
      href={resolve("/setup/create")}
    >
      Gestion de personajes
    </a>
    <a
      class="app-sidebar-link"
      class:active={page.url.pathname.startsWith("/overview")}
      href={resolve("/overview")}
    >
      DASHBOARD
    </a>
    <a
      class="app-sidebar-link"
      class:active={page.url.pathname.startsWith("/dm")}
      href={resolve("/dm")}
    >
      PANEL DM
    </a>
    <a
      class="app-sidebar-link"
      class:active={page.url.pathname.startsWith("/players")}
      href={resolve("/players")}
    >
      PANEL JUGADORES
    </a>
  </aside>
</div>
