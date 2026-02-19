<script>
import { characters, serverPort, lastRoll } from "./socket";

import { get } from "svelte/store";

let selectedCharId = $state(get(characters)[0]?.id);


function roll(diceType) {
    return Math.floor(Math.random() * diceType) + 1;
}

async function rollDice(diceType) {
    let rollValue = roll(diceType);

    const payload = { charId: selectedCharId, result: rollValue, modifier: 0, sides: diceType };
    console.log('Sending payload:', payload); // add this

    const response = await fetch(`${serverPort}/api/rolls`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ charId: selectedCharId, result: rollValue, modifier: 0, sides: diceType})
	})
	if (!response.ok) {
		console.error('Failed to update HP', response.status);
	}
    
}

</script>

<div>
  <h2>Dice Roller</h2>

  <select bind:value={selectedCharId}>
    {#each $characters as character}
      <option value={character.id}>{character.name}</option>
    {/each}
  </select>

  <div>
    {#each [4, 6, 8, 10, 12, 20] as diceType}
      <button onclick={() => rollDice(diceType)}>d{diceType}</button>
    {/each}
  </div>

  {#if $lastRoll}
    <p>{$lastRoll.charId} rolled a {$lastRoll.rollResult}</p>
  {/if}
</div>