<!--
  Root layout: shared app shell, header, and sidebar navigation.
-->
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

  let isDashboard = $derived($page.url.pathname.startsWith("/dashboard"));
  let isManagement = $derived($page.url.pathname.includes("/management"));
</script>

<div class="app-shell">
  <a class="skip-to-content" href="#main-content">Saltar al contenido</a>
  <header class="app-header">
    <div class="brand-wordmark">
      <span class="brand-block">ESDH</span>
      <span class="brand-script">TTRPG</span>
    </div>
    <span class="page-title">
      {isDashboard
        ? "DASHBOARD EN VIVO"
        : isManagement
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
      class:active={$page.url.pathname.startsWith("/control")}
      href="/control/characters"
    >
      PANEL DE CONTROL
    </a>
    <a
      class="app-sidebar-link"
      class:active={$page.url.pathname.startsWith("/dashboard")}
      href="/dashboard"
    >
      DASHBOARD
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
