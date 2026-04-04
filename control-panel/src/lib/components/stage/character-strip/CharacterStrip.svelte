<!--
  CharacterStrip
  ==============
  Left-side fixed panel showing all characters as compact expandable cards.
  Includes bulk DMG/HEAL header and sync footer.
-->
<script lang="ts">
  import type { CharacterRecord } from '$lib/contracts/records';
  import StripHeader from './StripHeader.svelte';
  import StripCard from './StripCard.svelte';
  import StripFooter from './StripFooter.svelte';
  import './CharacterStrip.css';

  let { characters }: { characters: CharacterRecord[] } = $props();

  let expandedId: string | null = $state(null);

  function handleExpand(id: string) {
    expandedId = expandedId === id ? null : id;
  }
</script>

<aside class="char-strip">
  <StripHeader {characters} />
  <div class="strip-cards">
    {#each characters as character (character.id)}
      <StripCard
        {character}
        isExpanded={expandedId === character.id}
        onExpandRequest={handleExpand}
      />
    {/each}
    {#if characters.length === 0}
      <p class="strip-empty">No hay personajes cargados.</p>
    {/if}
  </div>
  <StripFooter />
</aside>
