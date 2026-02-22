<script>
  import { page } from "$app/stores";
  let { children } = $props();
</script>

{@render children()}

<nav class="bottom-nav">
  <a
    class="nav-tab"
    class:active={$page.url.pathname.includes("/characters")}
    href="/control/characters"
  >
    <span class="nav-icon">⚔</span>
    <span class="nav-label">PERSONAJES</span>
  </a>
  <a
    class="nav-tab"
    class:active={$page.url.pathname.includes("/dice")}
    href="/control/dice"
  >
    <span class="nav-icon">⬡</span>
    <span class="nav-label">DADOS</span>
  </a>
</nav>
