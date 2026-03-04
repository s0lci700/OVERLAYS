<!--
  Stage › Setup layout: bottom nav for pre-session tabs.
-->
<script>
  import { page } from "$app/stores";
  let { children } = $props();
</script>

{@render children()}

<nav class="bottom-nav">
  <a
    class="nav-tab"
    class:active={$page.url.pathname === "/setup/create"}
    href="/setup/create"
  >
    <span class="nav-icon">＋</span>
    <span class="nav-label">CREAR</span>
  </a>
  <a
    class="nav-tab"
    class:active={$page.url.pathname === "/setup/manage"}
    href="/setup/manage"
  >
    <span class="nav-icon">⛭</span>
    <span class="nav-label">GESTIONAR</span>
  </a>
</nav>
