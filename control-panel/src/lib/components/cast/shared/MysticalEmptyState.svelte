<script lang="ts">
  let { 
    title = "SILENCIO EN LA SALA", 
    message = "No hay registros en este plano.",
    icon = "auto_awesome",
    ctaLabel = "",
    onCta = () => {}
  } = $props();
</script>

<div class="mystical-empty">
  <div class="rune-container">
    <span class="material-symbols-outlined rune-icon" aria-hidden="true">{icon}</span>
    <div class="rune-glow"></div>
  </div>
  <h3 class="empty-title">{title}</h3>
  <p class="empty-message">{message}</p>
  
  {#if ctaLabel}
    <button class="empty-cta" onclick={onCta}>
      {ctaLabel}
    </button>
  {/if}
</div>

<style>
  .mystical-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--space-12) var(--space-6);
    text-align: center;
    gap: var(--space-4);
    animation: fadeIn var(--t-normal) ease-out;
    overflow: hidden;
  }

  .rune-container {
    position: relative;
    width: 80px;
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: var(--space-4);
  }

  .rune-icon {
    font-size: 3rem;
    color: var(--cast-amber-border);
    z-index: 1;
    animation: breathe 4s ease-in-out infinite;
  }

  .rune-glow {
    position: absolute;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle, var(--cast-amber-dim) 0%, transparent 70%);
    border-radius: 50%;
    animation: pulse 4s ease-in-out infinite;
  }

  .empty-title {
    font-family: var(--font-display);
    font-size: 24px;
    letter-spacing: 0.1em;
    color: var(--cast-amber);
    text-transform: uppercase;
    margin: 0;
  }

  .empty-message {
    font-family: var(--cast-font-chrome);
    font-size: 0.9rem;
    color: var(--grey);
    max-width: 300px;
    line-height: 1.4;
    margin: 0;
  }

  .empty-cta {
    margin-top: 1.5rem;
    padding: 0.75rem 1.5rem;
    background: var(--cast-amber-dim);
    border: 1px solid var(--cast-amber-border);
    color: var(--white);
    font-family: var(--font-display);
    font-size: 0.9rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    cursor: pointer;
    transition: all var(--t-fast);
    clip-path: var(--hex-clip-md);
  }

  .empty-cta:hover {
    background: var(--cast-amber);
    color: var(--black);
    transform: translateY(-2px);
  }

  .empty-cta:active {
    transform: scale(0.96);
  }

  @keyframes breathe {
    0%, 100% { transform: scale(1); opacity: 0.5; }
    50% { transform: scale(1.1); opacity: 0.8; }
  }

  @keyframes pulse {
    0%, 100% { transform: scale(0.8); opacity: 0.2; }
    50% { transform: scale(1.2); opacity: 0.4; }
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @media (prefers-reduced-motion: reduce) {
    .rune-icon { animation: none; opacity: 0.6; }
    .rune-glow { animation: none; opacity: 0.3; }
    .mystical-empty { animation: none; }
  }
</style>
