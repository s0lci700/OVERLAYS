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
  import { cn } from "$lib/utils.js";

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
    variant = "inline",
    class: className,
    ...restProps
  } = $props();

  const styles = $derived(statDisplayVariants({ variant }));
</script>

<div class={cn(styles.root(), className)} {...restProps}>
  <span class={styles.label()}>{label}</span>
  <span class={styles.value()}>{value}</span>
</div>
