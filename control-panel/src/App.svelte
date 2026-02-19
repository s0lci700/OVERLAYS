<script>
    import DiceRoller from "./lib/DiceRoller.svelte";
    import CharacterCard from "./lib/CharacterCard.svelte";
    import { characters } from "./lib/socket.js";
</script>
<div class="chars">
<p>Characters</p>
<p>{$characters.length} characters loaded</p>
{#each $characters as character}
  <CharacterCard {character} />
{/each}
</div>
<div class="rolls">
    <p>DICE ROLL</p>
    <DiceRoller />
</div>
