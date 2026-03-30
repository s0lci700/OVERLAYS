<!--
  Stage › Setup layout: bottom nav for pre-session tabs.
-->
<script>
  import { page } from "$app/state";
  import { resolve } from "$app/paths";
  let { children } = $props();
  const createForm = resolve(`/setup/create`, {});
</script>

{@render children()}

<nav class="bottom-nav">
  <a
    class="nav-tab"
    class:active={page.url.pathname === createForm}
    href={createForm}
  >
    <span class="nav-icon">＋</span>
    <span class="nav-label">CREAR</span>
  </a>
  <a
    class="nav-tab"
    class:active={page.url.pathname === "/setup/manage"}
    href={resolve("/setup/manage", {})}
  >
    <span class="nav-icon">⛭</span>
    <span class="nav-label">GESTIONAR</span>
  </a>
</nav>
