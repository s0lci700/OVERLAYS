<script module>
  /**
   * ReadOnlyField
   * =============
   * A label + value pair for read-only info panels (CharacterManagement info panel).
   *
   * Variants:
   *   - "default" — stacked label above value
   *   - "inline"  — label and value on the same row (separator colon)
   *
   * Pass `children` to render rich content instead of the plain `value` string.
   */
  import { tv } from "tailwind-variants";
  import { cn } from "$lib/utils.js";

  export const readOnlyFieldVariants = tv({
    slots: {
      root: "flex",
      label: [
        "font-display text-[0.7rem] font-bold tracking-[0.12em] uppercase",
        "text-[var(--grey)] shrink-0",
      ],
      value: "text-sm text-white",
    },
    variants: {
      variant: {
        default: {
          root: "flex-col gap-0.5",
        },
        inline: {
          root: "flex-row items-baseline gap-2",
          value: "text-sm text-[var(--grey-light)]",
        },
      },
    },
    defaultVariants: {
      variant: "default",
    },
  });
</script>

<script>
  let {
    label,
    value = "",
    variant = "default",
    class: className,
    children,
    ...restProps
  } = $props();

  const s = $derived(readOnlyFieldVariants({ variant }));
</script>

<div class={cn(s.root(), className)} {...restProps}>
  <span class={s.label()}>{label}</span>
  {#if children}
    <span class={s.value()}>{@render children()}</span>
  {:else}
    <span class={s.value()}>{value || "—"}</span>
  {/if}
</div>
