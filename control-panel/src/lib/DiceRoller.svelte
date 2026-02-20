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

const isCrit = $derived($lastRoll?.rollResult === $lastRoll?.sides && $lastRoll?.sides === 20);
const isFail = $derived($lastRoll?.rollResult === 1);
</script>

<div class="dice-panel">

  <div class="char-selector">
    <label class="selector-label" for="char-select">PERSONAJE ACTIVO</label>
    <div class="select-wrap">
      <select id="char-select" bind:value={selectedCharId}>
        {#each $characters as character}
          <option value={character.id}>{character.name}</option>
        {/each}
      </select>
      <span class="select-arrow" aria-hidden="true">▾</span>
    </div>
  </div>

  <div class="dice-grid">
    {#each [4, 6, 8, 10, 12] as diceType}
      <button class="dice-btn" onclick={() => rollDice(diceType)}>
        <span class="dice-label">d{diceType}</span>
      </button>
    {/each}
    <button class="dice-btn d20-btn" onclick={() => rollDice(20)}>
      <span class="dice-label">d20</span>
    </button>
  </div>

  {#if $lastRoll}
    <div class="roll-result" class:is-crit={isCrit} class:is-fail={isFail}>
      <div class="roll-die-label">D{$lastRoll.sides}</div>
      <div class="roll-number" class:crit={isCrit} class:fail={isFail}>
        {$lastRoll.rollResult}
      </div>
      <div class="roll-label" class:crit={isCrit} class:fail={isFail}>
        {#if isCrit}¡CRÍTICO!{:else if isFail}¡PIFIA!{:else}{$lastRoll.charId}{/if}
      </div>
    </div>
  {/if}

</div>

<style>
  .dice-panel {
    display: flex;
    flex-direction: column;
    gap: var(--space-5);
    padding-bottom: var(--space-4);
  }

  /* ── Character Selector ── */
  .char-selector {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .selector-label {
    font-family: var(--font-display);
    font-size: 0.8rem;
    color: var(--grey);
    letter-spacing: 0.12em;
  }

  .select-wrap {
    position: relative;
    background: var(--black-elevated);
    border: 1px solid var(--grey-dim);
    border-radius: var(--radius-md);
    overflow: hidden;
  }

  .select-wrap select {
    width: 100%;
    padding: var(--space-3) var(--space-10) var(--space-3) var(--space-4);
    background: transparent;
    color: var(--white);
    font-size: 1rem;
    font-weight: 500;
    min-height: var(--space-12);
  }

  .select-wrap select:focus {
    outline: 2px solid var(--cyan);
    outline-offset: -2px;
  }

  .select-arrow {
    position: absolute;
    right: var(--space-4);
    top: 50%;
    transform: translateY(-50%);
    color: var(--cyan);
    pointer-events: none;
    font-size: 1.25rem;
    line-height: 1;
  }

  /* ── Dice Grid ── */
  .dice-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-3);
  }

  .dice-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 72px;
    border-radius: var(--radius-md);
    border: 1px solid var(--grey-dim);
    background: var(--black-card);
    box-shadow: 3px 3px 0px rgba(255, 255, 255, 0.05);
    transition: border-color var(--t-fast), color var(--t-fast), box-shadow var(--t-fast), transform var(--t-fast), background var(--t-fast);
  }

  .dice-btn:hover {
    border-color: var(--purple);
    box-shadow: var(--shadow-purple);
  }

  .dice-btn:active {
    transform: translate(3px, 3px);
    box-shadow: none;
    border-color: var(--purple);
  }

  .dice-btn:hover .dice-label {
    color: var(--purple);
  }

  .dice-label {
    font-family: var(--font-mono);
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--white);
    transition: color var(--t-fast);
    line-height: 1;
  }

  /* d20 — full width, purple accent */
  .d20-btn {
    grid-column: 1 / -1;
    min-height: 78px;
    border-color: rgba(80, 13, 245, 0.5);
    box-shadow: var(--shadow-purple);
  }

  .d20-btn .dice-label {
    font-size: 2rem;
    color: var(--purple);
  }

  .d20-btn:hover {
    background: var(--purple-dim);
    border-color: var(--purple);
  }

  .d20-btn:active {
    transform: translate(4px, 4px);
    box-shadow: none;
  }

  /* ── Roll Result ── */
  .roll-result {
    background: var(--black-card);
    border: 1px solid var(--grey-dim);
    border-top: 3px solid var(--cyan);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-cyan);
    padding: var(--space-5) var(--space-4);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-2);
    animation: slideUp 200ms ease;
  }

  @keyframes slideUp {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .roll-die-label {
    font-family: var(--font-display);
    font-size: 1rem;
    color: var(--grey);
    letter-spacing: 0.1em;
  }

  .roll-number {
    font-family: var(--font-mono);
    font-size: 5rem;
    font-weight: 700;
    color: var(--white);
    line-height: 1;
    transition: color var(--t-fast), text-shadow var(--t-fast);
  }

  .roll-number.crit {
    color: var(--cyan);
    text-shadow: 0 0 24px rgba(0, 212, 232, 0.5);
  }

  .roll-number.fail {
    color: var(--red);
    text-shadow: 0 0 24px rgba(255, 77, 106, 0.5);
  }

  .roll-label {
    font-family: var(--font-display);
    font-size: 1rem;
    color: var(--grey);
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .roll-label.crit {
    color: var(--cyan);
  }

  .roll-label.fail {
    color: var(--red);
  }
</style>
