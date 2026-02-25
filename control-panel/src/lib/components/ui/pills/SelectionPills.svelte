<!--
  SelectionPills
  ==============
  Renders a row of read-only pills from a list of selected option keys,
  resolving each key to a human-readable label via a lookup Map.

  Used 8× in CharacterManagement for Languages, Skills, Tools, Armor,
  Weapons, Items, Rare Languages, and Trinket previews.

  Props:
    keys     {string[]}       — array of selected option keys
    labelOf  {Map<string,string>} — key → display label lookup
    empty    {string}         — text shown when no items selected (default "—")
-->
<script>
  import "./Pills.css";

  let { keys = [], labelOf = new Map(), empty = "—" } = $props();
</script>

{#if keys.length === 0}
  <span class="pills-empty">{empty}</span>
{:else}
  <div class="selection-pills">
    {#each keys as key (key)}
      <span class="selection-pill">{labelOf.get(key) ?? key}</span>
    {/each}
  </div>
{/if}
