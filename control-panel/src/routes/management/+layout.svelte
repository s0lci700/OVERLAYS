<!--
  Management layout: renders the management tabs (Create/Manage).
-->
<script>
  import { page } from "$app/stores";
  let { children } = $props();
</script>

{@render children()}

<nav class="bottom-nav">
  <a
    class="nav-tab"
    class:active={$page.url.pathname === "/management/create"}
    href="/management/create"
  >
    <span class="nav-icon">＋</span>
    <span class="nav-label">CREAR</span>
  </a>
  <a
    class="nav-tab"
    class:active={$page.url.pathname === "/management/manage"}
    href="/management/manage"
  >
    <span class="nav-icon">⛭</span>
    <span class="nav-label">GESTIONAR</span>
  </a>
</nav>
