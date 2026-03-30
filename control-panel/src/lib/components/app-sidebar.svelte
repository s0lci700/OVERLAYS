<script>
  import * as Sidebar from "$lib/components/shared/sidebar/index.js";
  import * as Collapsible from "$lib/components/shared/collapsible/index.js";
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

<Sidebar.Root collapsible="offcanvas" class="grimoire-sidebar">

  <!-- Brand header strip -->
  <Sidebar.Header class="sidebar-brand">
    <div class="brand-wordmark">
      <span class="brand-block">table</span>
      <span class="brand-script">Relay</span>
    </div>
    <!-- Decorative corner accents -->
    <div class="sidebar-corner tl"></div>
    <div class="sidebar-corner tr"></div>
  </Sidebar.Header>
  <Sidebar.Content aria-label="Navegación principal">
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
  /* ── Sidebar Shell ─────────────────────────────────── */
  :global(.grimoire-sidebar) {
    background: var(--black-bg) !important;
    border-right: 1px solid var(--grey-dim) !important;
  }

  /* ── Brand header ─────────────────────────────────── */
  :global([data-sidebar="header"].sidebar-brand) {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    padding: var(--space-6) var(--space-4);
    border-bottom: 1px solid var(--grey-dim);
    margin-bottom: var(--space-2);
    position: relative;
    background: var(--black-card);
  }

  .brand-wordmark {
    display: flex;
    align-items: baseline;
    gap: var(--space-1);
    z-index: 2;
  }

  .brand-block {
    font-family: var(--font-display);
    font-size: 1.75rem;
    letter-spacing: 0.05em;
    color: var(--red);
    text-transform: lowercase;
    line-height: 1;
  }

  .brand-script {
    font-family: var(--font-script);
    font-size: 1.5rem;
    color: var(--cyan);
    line-height: 1;
  }

  /* Decorative corner accents matching CharacterSheet */
  .sidebar-corner {
    position: absolute;
    width: 10px;
    height: 10px;
    border: 2px solid var(--cast-amber-border);
    opacity: 0.3;
    z-index: 1;
    pointer-events: none;
  }

  .sidebar-corner.tl { top: 8px; left: 8px; border-right: none; border-bottom: none; }
  .sidebar-corner.tr { top: 8px; right: 8px; border-left: none; border-bottom: none; }

  /* ── Section buttons (STAGE / CAST / AUDIENCE) ─────── */
  :global([data-sidebar="menu-button"]) {
    font-family: var(--font-display);
    letter-spacing: 0.12em;
    font-size: 0.9rem;
    color: var(--grey);
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid var(--grey-dim);
    border-radius: var(--radius-sm);
    min-height: 40px;
    margin: var(--space-1) 0;
    padding: 0 var(--space-3);
    transition: all var(--t-fast);
  }
  
  :global([data-sidebar="menu-button"]:hover) {
    color: var(--white);
    border-color: var(--grey);
    background: rgba(255, 255, 255, 0.05);
    box-shadow: 0 0 15px rgba(0, 0, 0, 0.5);
  }

  :global(.sidebar-section-icon) {
    width: 14px;
    height: 14px;
    flex-shrink: 0;
    opacity: 0.5;
    color: var(--cast-amber);
  }
  
  :global(.sidebar-section-label) {
    flex: 1;
    font-weight: 500;
  }
  
  :global(.sidebar-chevron) {
    width: 12px;
    height: 12px;
    flex-shrink: 0;
    opacity: 0.3;
  }

  /* ── Sub-menu connector ────────────────────────────── */
  :global([data-sidebar="menu-sub"]) {
    margin: 0 0 var(--space-2) var(--space-4);
    padding-left: var(--space-3);
    border-left: 1px solid rgba(200, 148, 74, 0.15);
  }

  /* ── Sub-item links ───────────────────────────────── */
  :global([data-sidebar="menu-sub-button"]) {
    font-family: var(--font-mono);
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--grey);
    border-radius: var(--radius-xs);
    min-height: 30px;
    padding: 0 var(--space-2);
    transition: all var(--t-fast);
  }
  
  :global([data-sidebar="menu-sub-button"]:hover) {
    color: var(--cast-amber-pale);
    background: rgba(200, 148, 74, 0.05);
  }
  
  :global([data-sidebar="menu-sub-button"][data-active="true"]) {
    color: var(--cyan);
    background: var(--cyan-dim);
    box-shadow: inset 0 0 10px rgba(0, 212, 232, 0.05);
  }

  :global(.sidebar-sub-link) {
    display: flex;
    align-items: center;
    width: 100%;
  }

  /* Focus ring */
  :global([data-sidebar="menu-button"]:focus-visible,
          [data-sidebar="menu-sub-button"]:focus-visible) {
    outline: 2px solid var(--cast-amber);
    outline-offset: 2px;
  }
</style>