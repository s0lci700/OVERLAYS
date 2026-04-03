<script module>
  /**
   * StatDisplay
   * ===========
   * A label + numeric value pair used throughout character cards and dashboards.
   *
   * Variants:
   *   - "inline" (default) — horizontal label/value for compact stat rows (CharacterCard)
   *   - "cell"             — vertical stacked cell for ability score grids (DashboardCard)
   *
   * The value is always rendered in a monospace font for alignment.
   */
  import { tv } from "tailwind-variants";
  import { cn } from "$lib/services/utils.js";

  export const statDisplayVariants = tv({
    slots: {
      root: "flex",
      label: "font-display text-[0.7rem] font-bold tracking-[0.12em] uppercase",
      value: "font-mono font-bold tabular-nums",
    },
    variants: {
      variant: {
        inline: {
          root: "items-center gap-2",
          label: "text-[var(--grey)]",
          value: "text-sm text-white",
        },
        cell: {
          root: "flex-col items-center gap-0.5 text-center",
          label: "text-[var(--grey)] text-[0.65rem]",
          value: "text-base text-white",
        },
        cast: {
          root: "flex-col items-center gap-0.5 text-center",
          label: "text-[var(--cast-text-secondary)] text-[0.7rem] font-bold tracking-[0.15em] uppercase font-chrome",
          value: "text-[1.375rem] font-bold leading-none text-[var(--cast-amber-pale)] font-mono",
        },
      },
    },
    defaultVariants: {
      variant: "inline",
    },
  });
</script>

<script>
  let {
    label,
    value,
    icon = undefined,
    variant = "inline",
    class: className = '',
    ...restProps
  } = $props();

  const styles = $derived(statDisplayVariants({ variant: /** @type {any} */ (variant) }));
</script>

<div 
  class={cn(styles.root(), className)} 
  role="group" 
  aria-label="{label}: {value}"
  {...restProps}
>
  <span class={styles.label()} aria-hidden="true">{label}</span>
  <div class={cn("flex items-center gap-1.5", styles.value())}>
    {#if icon}
      <span class="stat-icon" aria-hidden="true">{@html icon}</span>
    {/if}
    <span aria-hidden="true">{value}</span>
  </div>
</div>

<style>
  .stat-icon {
    display: inline-flex;
    width: 1em;
    height: 1em;
    flex-shrink: 0;
  }
  .stat-icon :global(svg) {
    width: 100%;
    height: 100%;
    stroke: currentColor;
    fill: none;
  }
</style>
