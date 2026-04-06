<!--
  CharacterRadio
  ==============
  Visual radio group for selecting a single character from the active roster.
  Each option shows a hex-clipped avatar and the character's name.

  Usage:
    <CharacterRadio characters={$characters} bind:value={selectedCharId} />
-->
<script lang="ts">
  import './character-radio.css';
  import type { CharacterRecord } from '$lib/contracts/records';
  import { resolvePhotoSrc } from '$lib/services/utils.js';
  import { SERVER_URL } from '$lib/services/socket.svelte';
  import dwarfFallback from '$lib/assets/img/dwarf.webp';

  let {
    characters,
    value = $bindable(''),
  }: {
    characters: CharacterRecord[];
    value: string;
  } = $props();
</script>

<div class="char-radio" role="radiogroup" aria-label="Personaje">
  {#each characters as character (character.id)}
    {@const photo = resolvePhotoSrc(character.portrait, SERVER_URL) ?? dwarfFallback}
    {@const selected = value === character.id}
    <button
      type="button"
      class="char-radio__item"
      class:is-selected={selected}
      role="radio"
      aria-checked={selected}
      aria-label={character.name}
      onclick={() => (value = character.id)}
    >
      <img
        class="char-radio__photo"
        src={photo}
        alt={character.name}
        width="32"
        height="32"
        loading="lazy"
        decoding="async"
      />
      <span class="char-radio__name">{character.name}</span>
    </button>
  {/each}
</div>
