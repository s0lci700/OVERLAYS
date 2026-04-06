<!--
  MainPanel
  =========
  Right-side flex panel for the Stage HUD.
  Houses the tab bar and primary action: DADOS (dice intake) or COMBATE (future).
  On wide screens (1400px+), secondary panels (QUEUE + LOG) are moved to the Sidebar.
-->
<script lang="ts">
  import './MainPanel.css';
  import HudTabBar from './HudTabBar.svelte';
  import DiceIntakeForm from './DiceIntakeForm.svelte';
  import QueuePanel from './QueuePanel.svelte';
  import LogPanel from './LogPanel.svelte';
  import { fly, fade } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';

  // activeTab defaults to 'dice' on desktop, 'queue' on mobile/tablet
  let activeTab = $state<'queue' | 'dice' | 'log' | 'combat'>('dice');

  // Resizing logic
  let sidebarNode: HTMLElement | null = $state(null);
  let queueFlex = $state(40); // 40% height for queue
  let isDragging = $state(false);
  
  // Toggling logic
  let queueCollapsed = $state(false);
  let logCollapsed = $state(false);

  function startResizing(e: PointerEvent) {
    if (queueCollapsed || logCollapsed) return;
    isDragging = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }

  function handleResize(e: PointerEvent) {
    if (!isDragging || !sidebarNode || queueCollapsed || logCollapsed) return;
    const rect = sidebarNode.getBoundingClientRect();
    const relativeY = e.clientY - rect.top;
    let newPercent = (relativeY / rect.height) * 100;
    
    // Constrain resizing so panels don't disappear (10% to 90%)
    newPercent = Math.max(10, Math.min(newPercent, 90));
    queueFlex = newPercent;
  }

  function stopResizing(e: PointerEvent) {
    if (!isDragging) return;
    isDragging = false;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  }
</script>

<main class="main-panel">
  <!-- Desktop: Log and Queue are permanent in sidebar, so we only need tabs for Dice/Combat -->
  <HudTabBar 
    {activeTab} 
    onChange={(tab) => (activeTab = tab)} 
    queueCount={0} 
  />

  <div class="main-panel__content-wrapper">
    <!-- PRIMARY RITUAL AREA (DADOS, COMBATE) -->
    <div class="main-panel__ritual-area">
      {#key activeTab}
        <div
          class="main-panel__content"
          in:fly={{ y: 10, duration: 250, delay: 100, opacity: 0, easing: cubicOut }}
          out:fade={{ duration: 100 }}
        >
          {#if activeTab === 'dice'}
            <DiceIntakeForm />
          {:else if activeTab === 'combat'}
            <!-- FUTURE: Combat Manager -->
            <div class="future-placeholder">
              <h3>GESTOR DE COMBATE</h3>
              <p>Próximamente: Iniciativa, turnos y estados dinámicos.</p>
            </div>
          {:else}
            <!-- Fallback for mobile/tablet where Queue/Log are tabs -->
            {#if activeTab === 'queue'}
              <QueuePanel items={[]} />
            {:else}
              <LogPanel />
            {/if}
          {/if}
        </div>
      {/key}
    </div>

    <!-- PERSISTENT AUXILIARY SIDEBAR (Desktop Only) -->
    <aside class="main-panel__chronicle-sidebar is-desktop-only" bind:this={sidebarNode}>
      <!-- QUEUE SECTION -->
      <section 
        class="sidebar-section" 
        class:is-collapsed={queueCollapsed}
        style="flex: {queueCollapsed ? '0 0 48px' : logCollapsed ? '1 1 0%' : `${queueFlex} 1 0%`};"
      >
        <header class="sidebar-header">
          <div class="sidebar-header__group">
            <button 
              class="sidebar-toggle" 
              onclick={() => queueCollapsed = !queueCollapsed}
              aria-label={queueCollapsed ? 'Expandir Cola' : 'Colapsar Cola'}
            >
              <svg 
                class="sidebar-toggle__icon" 
                class:is-rotated={queueCollapsed}
                viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="butt" stroke-linejoin="miter"
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
            <span class="sidebar-title">COLA DE PRODUCCIÓN</span>
          </div>
          <span class="tab-badge" style="position:static;">0</span>
        </header>
        <div class="sidebar-section__content">
          <div class="sidebar-section__scrollable">
            <QueuePanel items={[]} />
          </div>
        </div>
      </section>

      <!-- RESIZER DIVIDER -->
      {#if !queueCollapsed && !logCollapsed}
        <div 
          role="separator"
          aria-label="Redimensionador entre cola y crónica"
          class="sidebar-resizer" 
          class:is-active={isDragging}
          onpointerdown={startResizing}
          onpointermove={handleResize}
          onpointerup={stopResizing}
          onpointercancel={stopResizing}
        >
          <div class="sidebar-resizer__line"></div>
          <div class="sidebar-resizer__handle">
            <svg viewBox="0 0 20 10" width="20" height="10" fill="currentColor">
              <path d="M4 2h2v2H4V2zm4 0h2v2H8V2zm4 0h2v2h-2V2zM4 6h2v2H4V6zm4 0h2v2H8V6zm4 0h2v2h-2V6z" opacity="0.5"/>
            </svg>
          </div>
        </div>
      {/if}

      <!-- LOG SECTION -->
      <section 
        class="sidebar-section" 
        class:is-collapsed={logCollapsed}
        style="flex: {logCollapsed ? '0 0 48px' : queueCollapsed ? '1 1 0%' : `${100 - queueFlex} 1 0%`}; border-top: none;"
      >
        <header class="sidebar-header">
          <div class="sidebar-header__group">
            <button 
              class="sidebar-toggle" 
              onclick={() => logCollapsed = !logCollapsed}
              aria-label={logCollapsed ? 'Expandir Crónica' : 'Colapsar Crónica'}
            >
              <svg 
                class="sidebar-toggle__icon" 
                class:is-rotated={logCollapsed}
                viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="butt" stroke-linejoin="miter"
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
            <span class="sidebar-title">CRÓNICA DE SESIÓN</span>
          </div>
          <span class="label-caps" style="font-size: 10px; opacity: 0.5;">HISTORIAL</span>
        </header>
        <div class="sidebar-section__content">
          <div class="sidebar-section__scrollable">
            <LogPanel />
          </div>
        </div>
      </section>
    </aside>
  </div>
</main>
