<script lang="ts">
  let {
    level = 'none'
  }: {
    level: 'none' | 'proficient' | 'expertise';
  } = $props();
</script>

<div class="prof-markers">
  {#if level === 'expertise'}
    <span class="triangle-marker"></span>
    <span class="triangle-marker"></span>
  {:else if level === 'proficient'}
    <span class="triangle-marker"></span>
  {:else}
    <span class="triangle-outline"></span>
  {/if}
</div>

<style>
  .prof-markers {
    display: flex;
    gap: 3px;
    align-items: center;
  }
  .triangle-marker {
    display: block;
    width: 0;
    height: 0;
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-bottom: 8px solid var(--cast-amber);
  }
  .triangle-outline {
    display: block;
    width: 0;
    height: 0;
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-bottom: 8px solid rgba(200, 148, 74, 0.3);
  }
</style>
