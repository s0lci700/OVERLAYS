<script module>
  /**
   * Stepper
   * =======
   * A −/value/+ numeric input control with hold-to-repeat support.
   *
   * Sizes:
   *   - "sm" — compact (32×32px buttons), used for HP damage amounts
   *   - "lg" — large (80×60px buttons), used for dice roll modifiers
   *
   * Hold-to-repeat: holding down a stepper button begins incrementing/decrementing
   * after HOLD_DELAY_MS, then repeats every HOLD_INTERVAL_MS.
   *
   * All state is controlled — the parent owns the value and passes `onchange`.
   */
  import { tv } from "tailwind-variants";
  import { cn } from "$lib/utils.js";

  export const stepperVariants = tv({
    slots: {
      root: [
        "flex items-center gap-1",
        "bg-[var(--black-elevated)] border border-[var(--grey-dim)]",
        "rounded-md p-1",
      ],
      button: [
        "grid place-items-center",
        "rounded-sm text-[var(--grey)] font-bold",
        "transition-colors duration-100",
        "hover:bg-[var(--grey-dim)] hover:text-white",
        "active:scale-90",
        "select-none touch-none",
      ],
      input: [
        "text-center font-mono font-bold text-white",
        "bg-transparent border-none outline-none",
        "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
      ],
    },
    variants: {
      size: {
        sm: {
          button: "w-8 h-8 text-xl",
          input: "w-12 text-lg",
        },
        lg: {
          button: "w-20 h-[60px] text-2xl",
          input: "w-16 text-xl flex-1",
        },
      },
    },
    defaultVariants: {
      size: "sm",
    },
  });
</script>

<script>
  const HOLD_DELAY_MS = 250;
  const HOLD_INTERVAL_MS = 80;

  let {
    value = $bindable(0),
    min = -Infinity,
    max = Infinity,
    size = "sm",
    onchange = () => {},
    class: className,
    ...restProps
  } = $props();

  let holdTimeoutId = null;
  let holdIntervalId = null;

  function clamp(v) {
    return Math.max(min, Math.min(max, Number(v) || 0));
  }

  function increment() {
    value = clamp(value + 1);
    onchange(value);
  }

  function decrement() {
    value = clamp(value - 1);
    onchange(value);
  }

  function clearHold() {
    clearTimeout(holdTimeoutId);
    clearInterval(holdIntervalId);
    holdTimeoutId = null;
    holdIntervalId = null;
  }

  function startHold(action) {
    clearHold();
    action();
    holdTimeoutId = setTimeout(() => {
      holdIntervalId = setInterval(action, HOLD_INTERVAL_MS);
    }, HOLD_DELAY_MS);
  }

  function handleInputBlur() {
    value = clamp(value);
    onchange(value);
  }

  const s = $derived(stepperVariants({ size }));
</script>

<div class={cn(s.root(), className)} {...restProps}>
  <button
    type="button"
    class={s.button()}
    aria-label="Reducir"
    onpointerdown={() => startHold(decrement)}
    onpointerup={clearHold}
    onpointerleave={clearHold}
    onpointercancel={clearHold}
  >
    <span style="display:block; transform:translateY(-0.1em)">−</span>
  </button>

  <input
    type="number"
    class={s.input()}
    bind:value
    {min}
    {max}
    onblur={handleInputBlur}
    aria-label="Valor"
  />

  <button
    type="button"
    class={s.button()}
    aria-label="Aumentar"
    onpointerdown={() => startHold(increment)}
    onpointerup={clearHold}
    onpointerleave={clearHold}
    onpointercancel={clearHold}
  >
    <span style="display:block; transform:translateY(-0.1em)">+</span>
  </button>
</div>
