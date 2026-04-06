<script lang="ts">
  import type { Condition } from '$lib/contracts/records';

  interface Props {
    condition: Condition;
    size?: 'sm' | 'md' | 'lg';
    showLabel?: boolean;
  }

  let { condition, size = 'md', showLabel = false }: Props = $props();

  // Mock library of "Root" sketches (Paths or URLs)
  // In production, these would be in /static/assets/icons/alchemical/
  const MOCK_ROOT_LIBRARY: Record<string, string> = {
    'poisoned': 'M12 2L4.5 20.29L5.21 21L12 18L18.79 21L19.5 20.29L12 2Z', // Simple triangle/leaf
    'stunned': 'M12 2C6.47 2 2 6.47 2 12C2 17.53 6.47 22 12 22C17.53 22 22 17.53 22 12C22 6.47 17.53 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z', // Circle
    'envenenado': 'M12 2L4.5 20.29L5.21 21L12 18L18.79 21L19.5 20.29L12 2Z',
  };

  let normalizedName = $derived(condition.condition_name.toLowerCase());
  let asset = $derived(condition.asset);
  let mockPath = $derived(MOCK_ROOT_LIBRARY[normalizedName]);

  let sizeClass = $derived({
    'sm': 'w-6 h-6',
    'md': 'w-10 h-10',
    'lg': 'w-16 h-16'
  }[size]);
</script>

<div class="alchemical-icon-container {sizeClass}" title={condition.condition_name}>
  <!-- Organic Ink Stain Background -->
  <div class="ink-stain"></div>

  <!-- The Sketch/Icon -->
  <div class="sketch-wrapper">
    {#if asset?.image_url}
      <img src={asset.image_url} alt={condition.condition_name} class="sketch-img" />
    {:else if mockPath}
      <svg viewBox="0 0 24 24" class="sketch-svg">
        <path d={mockPath} fill="currentColor" />
      </svg>
    {:else}
      <!-- Placeholder: First letter of condition -->
      <span class="sketch-placeholder">{condition.condition_name[0]}</span>
    {/if}
  </div>

  <!-- Intensity Badge -->
  {#if condition.intensity_level > 1}
    <div class="intensity-badge">
      {condition.intensity_level}
    </div>
  {/if}

  {#if showLabel}
    <span class="label">{condition.condition_name}</span>
  {/if}
</div>

<style>
  .alchemical-icon-container {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--c-ink, #1a1a1a);
  }

  .ink-stain {
    position: absolute;
    inset: 0;
    background: var(--c-ink-stain, rgba(0, 0, 0, 0.05));
    border-radius: 50%;
    /* In production, use a mask-image here for organic edges */
    /* mask-image: url('/assets/ink-blob-mask.png'); */
    filter: blur(2px);
    transform: scale(1.1) rotate(var(--random-rotate, 0deg));
  }

  .sketch-wrapper {
    position: relative;
    z-index: 1;
    width: 70%;
    height: 70%;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0.85;
    mix-blend-mode: multiply;
  }

  .sketch-img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    filter: contrast(1.2) sepia(0.2);
  }

  .sketch-svg {
    width: 100%;
    height: 100%;
  }

  .sketch-placeholder {
    font-family: 'Crimson Text', serif;
    font-weight: bold;
    font-size: 1.2em;
    text-transform: uppercase;
  }

  .intensity-badge {
    position: absolute;
    top: -2px;
    right: -2px;
    background: #8b0000; /* Blood red */
    color: white;
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2;
    box-shadow: 0 1px 3px rgba(0,0,0,0.3);
  }

  .label {
    position: absolute;
    bottom: -1.2em;
    font-size: 10px;
    white-space: nowrap;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    opacity: 0.7;
  }
</style>
