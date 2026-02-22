<script>
  import CharacterCard from '$lib/CharacterCard.svelte';
  import { characters } from '$lib/socket.js';
</script>

<div class="characters-grid" class:grid-three={$characters.length > 2}>
  {#each $characters as character (character.id)}
    <CharacterCard {character} />
  {/each}
</div>
