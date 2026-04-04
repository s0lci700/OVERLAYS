<!--
  ConditionDot
  ============
  Tiny colored dot representing a single D&D condition in compact strip view.
  Shows condition name as a tooltip via `title` attribute.
-->
<script lang="ts">
  import type { Condition } from '$lib/contracts/records';

  let { condition }: { condition: Condition } = $props();

  const CONDITION_COLORS: Record<string, string> = {
    blinded: 'var(--grey)',
    charmed: 'var(--cyan)',
    deafened: 'var(--grey)',
    exhaustion: 'var(--hp-injured, #f59e0b)',
    frightened: 'var(--purple-mid)',
    grappled: 'var(--grey)',
    incapacitated: 'var(--red)',
    invisible: 'var(--white)',
    paralyzed: 'var(--red)',
    petrified: 'var(--grey)',
    poisoned: 'var(--hp-healthy, #22c55e)',
    prone: 'var(--hp-injured, #f59e0b)',
    restrained: 'var(--hp-injured, #f59e0b)',
    stunned: 'var(--red)',
    unconscious: 'var(--hp-critical, #ff4d6a)',
  };

  const dotColor = $derived(
    CONDITION_COLORS[condition.condition_name.toLowerCase()] ?? 'var(--grey)'
  );
</script>

<span
  class="condition-dot"
  title={condition.condition_name}
  style="background: {dotColor}"
  aria-label={condition.condition_name}
></span>

<style>
  .condition-dot {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
  }
</style>
