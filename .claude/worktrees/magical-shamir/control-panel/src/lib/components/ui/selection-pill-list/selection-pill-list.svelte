<script module>
  /**
   * SelectionPillList
   * =================
   * Renders a row of cyan pills for selected items below a MultiSelect.
   * Appears 7 times in CharacterCreationForm — this component consolidates them.
   *
   * @prop items    - Array of selected value keys
   * @prop labelMap - Map<key, displayLabel> for resolving display names
   *                 Pass undefined to use the key itself as the label
   */
  import { cn } from "$lib/utils.js";
  import { ConditionPill } from "$lib/components/ui/condition-pill/index.js";
</script>

<script>
  let {
    items = [],
    labelMap = undefined,
    class: className,
  } = $props();

  function resolveLabel(key) {
    if (labelMap instanceof Map) return labelMap.get(key) ?? key;
    if (labelMap && typeof labelMap === "object") return labelMap[key] ?? key;
    return key;
  }
</script>

{#if items.length > 0}
  <div class={cn("flex flex-wrap gap-1 mt-1", className)}>
    {#each items as key (key)}
      <ConditionPill label={resolveLabel(key)} variant="tag" />
    {/each}
  </div>
{/if}
