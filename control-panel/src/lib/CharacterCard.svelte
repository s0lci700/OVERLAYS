<script>

import { serverPort } from "./socket";

 let { character } = $props();
 let amount = $state(5);

 async function updateHp(type) {
	let newHp = type === 'damage' 
	? character.hp_current - amount 
	: character.hp_current + amount;

	newHp = Math.max(0, Math.min(newHp, character.hp_max));
	
	const response = await fetch(`${serverPort}/api/characters/${character.id}/hp`, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ hp_current: newHp })
	})
	if (!response.ok) {
		console.error('Failed to update HP', response.status);
	}
};

	

 
</script>

<div>
  <h2>{character.name} ({character.player})</h2>
  <p>{character.hp_current} / {character.hp_max}</p>

  <div style="background:#333; width:100%; height:20px;">
    <div style="background:green; height:100%; width:{(character.hp_current / character.hp_max) * 100}%"></div>
  </div>

  <input type="number" bind:value={amount} min="1" />
  <button onclick={() => updateHp('damage')}>Damage</button>
  <button onclick={() => updateHp('heal')}>Heal</button>
</div>