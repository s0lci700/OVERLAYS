<script>
  import "../app.css";
  import { page } from "$app/stores";
  import { characters, socket } from "$lib/socket.js";

  let connected = $state(false);
  let isSidebarOpen = $state(false);
  let { children } = $props();

  socket.on("connect", () => (connected = true));
  socket.on("disconnect", () => (connected = false));

  function toggleSidebar() {
    isSidebarOpen = !isSidebarOpen;
  }

  function navigateTo(path) {
    window.location.hash = "";
    window.location.pathname = path;
    isSidebarOpen = false;
  }
</script>

<div class="app-shell">
  <header class="app-header">
    <div class="brand-wordmark">
      <span class="brand-block">ESDH</span>
      <span class="brand-script">TTRPG</span>
    </div>
    <span class="page-title">
      {$page.url.pathname.includes("/management")
        ? "GESTIÓN DE PERSONAJES"
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

  <main class="app-main">
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
      class:active={$page.url.pathname.startsWith("/control")}
      href="/control/characters"
    >
      PANEL DE CONTROL
    </a>
    <a
      class="app-sidebar-link"
      class:active={$page.url.pathname.startsWith("/management")}
      href="/management/create"
    >
      GESTIÓN DE PERSONAJES
    </a>
  </aside>
</div>
