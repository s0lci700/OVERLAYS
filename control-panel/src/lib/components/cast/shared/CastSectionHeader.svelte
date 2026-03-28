<script lang="ts">
  let {
    title,
    meta = ''
  }: {
    title: string;
    meta?: string;
  } = $props();
</script>

<div class="cast-section-header">
  <h2 class="cast-section-title">{title}</h2>
  {#if meta}
    <span class="cast-section-meta">{meta}</span>
  {/if}
</div>

<style>
  .cast-section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid rgba(200, 148, 74, 0.25);
    padding-bottom: 4px;
    margin-bottom: 1rem;
  }
  .cast-section-title {
    font-family: var(--cast-font-identity);
    font-weight: 600;
    font-size: 1.125rem;
    letter-spacing: -0.02em;
    color: var(--cast-text-primary);
    margin: 0;
  }
  .cast-section-meta {
    font-family: var(--cast-font-chrome);
    font-size: 10px;
    letter-spacing: 0.1em;
    color: rgba(200, 148, 74, 0.6);
  }
</style>
