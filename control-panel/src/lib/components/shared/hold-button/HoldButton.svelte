<!--
  HoldButton
  ==========
  A hold-to-confirm button for significant or destructive actions.
  The ::before fill gives visual feedback as the user holds; the onConfirm
  callback fires only when the hold duration completes.

  Variants:
    - "dmg"  — red, damage / destructive actions
    - "heal" — cyan, healing / restorative actions

  Size is intentionally unset — the parent controls width/flex.
  Pass `style` or a `class` for layout-specific sizing.

  Usage:
    <HoldButton
      variant="dmg"
      label="DAÑO"
      holdDuration={200}
      onConfirm={() => mutateHp(id, { delta: -amount })}
      ariaLabel="Mantener para aplicar daño"
    />
-->
<script lang="ts">
  import './hold-button.css';

  let {
    label,
    variant,
    holdDuration = 500,
    onConfirm,
    ariaLabel,
    disabled = false,
    style: extraStyle = '',
    class: className = '',
  }: {
    label: string;
    variant: 'dmg' | 'heal';
    holdDuration?: number;
    onConfirm: () => void;
    ariaLabel?: string;
    disabled?: boolean;
    style?: string;
    class?: string;
  } = $props();

  let holdProgress = $state(0);
  let holdInterval: ReturnType<typeof setInterval> | null = null;

  function startHold() {
    if (disabled) return;
    const start = Date.now();
    holdInterval = setInterval(() => {
      const progress = Math.min(100, ((Date.now() - start) / holdDuration) * 100);
      holdProgress = progress;
      if (progress >= 100) {
        clearInterval(holdInterval!);
        holdInterval = null;
        holdProgress = 0;
        onConfirm();
      }
    }, 16);
  }

  function cancelHold() {
    if (holdInterval) {
      clearInterval(holdInterval);
      holdInterval = null;
    }
    holdProgress = 0;
  }
</script>

<button
  class="hold-btn hold-btn--{variant} {className}"
  style="--hold-progress: {holdProgress}%; {extraStyle}"
  {disabled}
  aria-label={ariaLabel ?? label}
  title="Mantener presionado para aplicar"
  onpointerdown={startHold}
  onpointerup={cancelHold}
  onpointerleave={cancelHold}
  onpointercancel={cancelHold}
>
  {label}
</button>
