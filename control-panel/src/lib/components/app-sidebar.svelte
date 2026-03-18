<script>
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  import * as Collapsible from "$lib/components/ui/collapsible/index.js";
  import { page } from "$app/state";
  import Monitor from "@lucide/svelte/icons/monitor";
  import Swords from "@lucide/svelte/icons/swords";
  import Eye from "@lucide/svelte/icons/eye";
  import ChevronRight from "@lucide/svelte/icons/chevron-right";

  const sections = [
    {
      label: "STAGE",
      icon: Monitor,
      items: [
        { title: "Dashboard en vivo",    href: "/overview" },
        { title: "Personajes",           href: "/live/characters" },
        { title: "Dados",                href: "/live/dice" },
        { title: "Crear personaje",      href: "/setup/create" },
        { title: "Gestionar personajes", href: "/setup/manage" },
      ],
    },
    {
      label: "CAST",
      icon: Swords,
      items: [
        { title: "Panel DM",            href: "/dm" },
        { title: "Fichas de jugadores", href: "/players" },
      ],
    },
    {
      label: "AUDIENCE",
      icon: Eye,
      items: [
        { title: "HP",           href: "/persistent/hp" },
        { title: "Condiciones",  href: "/persistent/conditions" },
        { title: "Dados",        href: "/moments/dice" },
        { title: "Anuncios",     href: "/announcements" },
      ],
    },
  ];
</script>

<Sidebar.Root collapsible="offcanvas">

  <!-- Brand header strip -->
  <Sidebar.Header class="sidebar-brand">
    <span class="sidebar-brand-block">DADOS</span>
    <span class="sidebar-brand-amp">&amp;</span>
    <span class="sidebar-brand-script">Risas</span>
  </Sidebar.Header>
  <Sidebar.Content>
    <Sidebar.Group>
      <Sidebar.GroupContent>
        <Sidebar.Menu>

          {#each sections as section (section.label)}
            <Collapsible.Root class="group/collapsible">
              <Sidebar.MenuItem>
                <Collapsible.Trigger>
                  {#snippet child({ props })}
                    <Sidebar.MenuButton {...props} class="sidebar-section-btn">
                      <section.icon class="sidebar-section-icon" />
                      <span class="sidebar-section-label">{section.label}</span>
                      <ChevronRight class="sidebar-chevron transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </Sidebar.MenuButton>
                  {/snippet}
                </Collapsible.Trigger>
                <Collapsible.Content>
                  <Sidebar.MenuSub>
                    {#each section.items as item (item.href)}
                      <Sidebar.MenuSubItem>
                        <Sidebar.MenuSubButton isActive={page.url.pathname.startsWith(item.href)}>
                          {#snippet child({ props })}
                            <a href={item.href} {...props} class="sidebar-sub-link">{item.title}</a>
                          {/snippet}
                        </Sidebar.MenuSubButton>
                      </Sidebar.MenuSubItem>
                    {/each}
                  </Sidebar.MenuSub>
                </Collapsible.Content>
              </Sidebar.MenuItem>
            </Collapsible.Root>
          {/each}

        </Sidebar.Menu>
      </Sidebar.GroupContent>
    </Sidebar.Group>
  </Sidebar.Content>

</Sidebar.Root>

<style>
  /* ── Brand header ─────────────────────────────────── */
  :global([data-sidebar="header"].sidebar-brand) {
    display: flex;
    flex-direction: row;
    align-items: baseline;
    gap: var(--space-2);
    padding: var(--space-4);
    border-bottom: 1px solid var(--grey-dim);
    margin-bottom: var(--space-2);
  }
  :global(.sidebar-brand-block) {
    font-family: var(--font-display);
    font-size: 1.5rem;
    letter-spacing: 0.08em;
    color: var(--red);
    line-height: 1;
  }
  :global(.sidebar-brand-amp) {
    font-family: var(--font-display);
    font-size: 1.1rem;
    color: var(--grey);
    line-height: 1;
  }
  :global(.sidebar-brand-script) {
    font-family: var(--font-script);
    font-size: 1.2rem;
    color: var(--cyan);
    line-height: 1;
  }

  /* ── Section buttons (STAGE / CAST / AUDIENCE) ─────── */
  :global([data-sidebar="menu-button"]) {
    font-family: var(--font-display);
    letter-spacing: 0.1em;
    font-size: 0.95rem;
    color: var(--grey);
    background: var(--black-card);
    border: 1px solid var(--grey-dim);
    border-radius: var(--radius-md);
    min-height: 44px;
    padding: 0 var(--space-3);
    box-shadow: var(--shadow-card);
    transition: color var(--t-fast), border-color var(--t-fast), background var(--t-fast);
  }
  :global([data-sidebar="menu-button"]:hover) {
    color: var(--white);
    border-color: var(--grey);
    background: var(--black-elevated);
  }
  :global([data-sidebar="menu-button"][data-active="true"]) {
    color: var(--cyan);
    border-color: var(--cyan);
    background: var(--cyan-dim);
    box-shadow: var(--shadow-cyan);
  }

  :global(.sidebar-section-icon) {
    width: 15px;
    height: 15px;
    flex-shrink: 0;
    opacity: 0.6;
  }
  :global(.sidebar-section-label) {
    flex: 1;
  }
  :global(.sidebar-chevron) {
    width: 13px;
    height: 13px;
    flex-shrink: 0;
    opacity: 0.4;
  }

  /* ── Sub-menu connector ────────────────────────────── */
  :global([data-sidebar="menu-sub"]) {
    margin: var(--space-1) 0 var(--space-2) var(--space-4);
    padding-left: var(--space-3);
    border-left: 1px solid var(--grey-dim);
  }

  /* ── Sub-item links ───────────────────────────────── */
  :global([data-sidebar="menu-sub-button"]) {
    font-family: var(--font-ui);
    font-size: 0.825rem;
    color: var(--grey);
    border-radius: var(--radius-sm);
    min-height: 32px;
    padding: 0 var(--space-2);
    transition: color var(--t-fast), background var(--t-fast);
  }
  :global([data-sidebar="menu-sub-button"]:hover) {
    color: var(--white);
    background: rgba(255, 255, 255, 0.04);
  }
  :global([data-sidebar="menu-sub-button"][data-active="true"]) {
    color: var(--cyan);
    background: var(--cyan-dim);
  }

  :global(.sidebar-sub-link) {
    display: flex;
    align-items: center;
    width: 100%;
  }

  /* Focus ring */
  :global([data-sidebar="menu-button"]:focus-visible,
          [data-sidebar="menu-sub-button"]:focus-visible) {
    outline: 2px solid var(--cyan);
    outline-offset: 2px;
  }
</style>