<!--
  MainPanel
  =========
  Right-side flex panel for the Stage HUD.
  Houses the tab bar and tab content: QUEUE, DADOS (dice intake), LOG.
-->
<script lang="ts">
  import './MainPanel.css';
  import HudTabBar from './HudTabBar.svelte';
  import DiceIntakeForm from './DiceIntakeForm.svelte';
  import QueuePanel from './QueuePanel.svelte';
  import LogPanel from './LogPanel.svelte';
  import { fly, fade } from 'svelte/transition';

  let activeTab: 'queue' | 'dice' | 'log' = $state('dice');
</script>

<main class="main-panel">
  <HudTabBar {activeTab} onChange={(tab) => (activeTab = tab)} queueCount={0} />
  <div class="main-panel__content-wrapper">
    {#key activeTab}
      <div 
        class="main-panel__content"
        in:fly={{ y: 10, duration: 250, delay: 100, opacity: 0, easing: t => --t * t * t + 1 }}
        out:fade={{ duration: 100 }}
      >
        {#if activeTab === 'dice'}
          <DiceIntakeForm />
        {:else if activeTab === 'queue'}
          <QueuePanel items={[]} />
        {:else}
          <LogPanel />
        {/if}
      </div>
    {/key}
  </div>
</main>
