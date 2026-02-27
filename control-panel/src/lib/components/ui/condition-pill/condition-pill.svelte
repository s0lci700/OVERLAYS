<script module>
  /**
   * ConditionPill
   * =============
   * Displays a D&D status condition as a styled pill badge.
   *
   * Variants:
   *   - "condition" (default) — red, used for active status effects (Envenenado, Aturdido, etc.)
   *   - "tag"                 — cyan, used for selection preview badges
   *   - "info"               — grey, used for read-only / dashboard display
   *
   * When `interactive` is true, the pill renders as a <button> with a × and
   * calls `onRemove` on click. Set to false (default) for display-only spans.
   */
  import { tv } from "tailwind-variants";
  import { cn } from "$lib/utils.js";

  export const conditionPillVariants = tv({
    base: [
      "inline-flex items-center gap-1",
      "px-2 py-0.5",
      "rounded-full border",
      "font-display text-xs tracking-wider uppercase",
      "transition-colors duration-150",
    ],
    variants: {
      variant: {
        condition: [
          "bg-[rgba(255,77,106,0.12)] border-[var(--red)] text-[var(--red)]",
          "data-[interactive=true]:cursor-pointer",
          "data-[interactive=true]:hover:bg-[var(--red)] data-[interactive=true]:hover:text-white",
        ],
        tag: [
          "bg-[rgba(0,212,232,0.08)] border-[var(--cyan)] text-[var(--cyan)]",
          "data-[interactive=true]:cursor-pointer",
          "data-[interactive=true]:hover:bg-[var(--cyan)] data-[interactive=true]:hover:text-[var(--black)]",
        ],
        info: [
          "bg-transparent border-[var(--grey-dim)] text-[var(--grey)]",
        ],
      },
    },
    defaultVariants: {
      variant: "condition",
    },
  });
</script>

<script>
  let {
    label,
    variant = "condition",
    interactive = false,
    onRemove = () => {},
    class: className,
    ...restProps
  } = $props();
</script>

{#if interactive}
  <button
    type="button"
    class={cn(conditionPillVariants({ variant }), className)}
    data-interactive="true"
    onclick={onRemove}
    {...restProps}
  >
    {label} <span aria-hidden="true">×</span>
  </button>
{:else}
  <span
    class={cn(conditionPillVariants({ variant }), className)}
    data-interactive="false"
    {...restProps}
  >
    {label}
  </span>
{/if}
