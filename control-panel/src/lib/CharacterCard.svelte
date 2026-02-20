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

const hpPercent = $derived((character.hp_current / character.hp_max) * 100);
const hpClass = $derived(
  hpPercent > 60 ? 'hp--healthy' :
  hpPercent > 30 ? 'hp--injured' : 'hp--critical'
);
</script>

<article class="char-card" data-char-id={character.id} class:is-critical={hpPercent <= 30}>

  <div class="char-header">
    <div class="char-identity">
      <h2 class="char-name">{character.name}</h2>
      <span class="char-player">{character.player}</span>
    </div>
    <div class="char-hp-nums">
      <span class="hp-cur" class:critical={hpPercent <= 30}>{character.hp_current}</span>
      <span class="hp-sep">/</span>
      <span class="hp-max">{character.hp_max}</span>
    </div>
  </div>

  <div class="hp-track" role="progressbar" aria-valuenow={character.hp_current} aria-valuemax={character.hp_max} aria-label="Puntos de vida">
    <div class="hp-fill {hpClass}" style="width: {hpPercent}%"></div>
  </div>

  <div class="char-controls">
    <button class="btn btn-damage" onclick={() => updateHp('damage')}>
      − DAÑO
    </button>

    <div class="stepper-cluster">
      <button class="stepper" onclick={() => amount = Math.max(1, amount - 1)} aria-label="Reducir">−</button>
      <input class="amount-input" type="number" bind:value={amount} min="1" max="999" aria-label="Cantidad" />
      <button class="stepper" onclick={() => amount = Math.min(999, amount + 1)} aria-label="Aumentar">+</button>
    </div>

    <button class="btn btn-heal" onclick={() => updateHp('heal')}>
      + CURAR
    </button>
  </div>

</article>

<style>
  .char-card {
    background: var(--black-card);
    border: 1px solid var(--grey-dim);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-card);
    padding: var(--space-4);
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    transition: border-color var(--t-fast);
  }

  .char-card.is-critical {
    border-color: var(--red);
  }

  /* ── Header ── */
  .char-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--space-3);
  }

  .char-identity {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
    overflow: hidden;
  }

  .char-name {
    font-family: var(--font-display);
    font-size: 1.75rem;
    color: var(--white);
    text-transform: uppercase;
    letter-spacing: 0.02em;
    line-height: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .char-player {
    font-size: 0.7rem;
    color: var(--grey);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    font-family: var(--font-ui);
  }

  /* ── HP Numbers ── */
  .char-hp-nums {
    display: flex;
    align-items: baseline;
    gap: 2px;
    flex-shrink: 0;
  }

  .hp-cur {
    font-family: var(--font-mono);
    font-size: 2.25rem;
    font-weight: 700;
    color: var(--white);
    line-height: 1;
    transition: color var(--t-fast);
  }

  .hp-cur.critical {
    color: var(--red);
  }

  .hp-sep {
    font-family: var(--font-mono);
    font-size: 1.25rem;
    color: var(--grey);
    line-height: 1;
  }

  .hp-max {
    font-family: var(--font-mono);
    font-size: 0.9rem;
    color: var(--grey);
    line-height: 1;
  }

  /* ── HP Bar ── */
  .hp-track {
    height: 6px;
    background: #222;
    border-radius: var(--radius-pill);
    overflow: hidden;
  }

  .hp-fill {
    height: 100%;
    border-radius: var(--radius-pill);
    transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1), background var(--t-normal);
  }

  .hp-fill.hp--healthy {
    background: linear-gradient(90deg, #15803D, #22C55E);
    box-shadow: 0 0 6px rgba(34, 197, 94, 0.4);
  }

  .hp-fill.hp--injured {
    background: linear-gradient(90deg, #B45309, #F59E0B);
    box-shadow: 0 0 6px rgba(245, 158, 11, 0.4);
  }

  .hp-fill.hp--critical {
    background: linear-gradient(90deg, #991B1B, #FF4D6A);
    box-shadow: 0 0 6px rgba(255, 77, 106, 0.4);
    animation: barPulse 1.5s ease-in-out infinite;
  }

  @keyframes barPulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.6; }
  }

  /* ── Controls ── */
  .char-controls {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    gap: var(--space-2);
    align-items: center;
  }

  .btn {
    font-family: var(--font-display);
    font-size: 1.1rem;
    letter-spacing: 0.04em;
    border-radius: var(--radius-md);
    min-height: 52px;
    border: 1px solid;
    transition: background var(--t-fast), color var(--t-fast), box-shadow var(--t-fast), transform var(--t-fast);
  }

  .btn:active {
    transform: translate(3px, 3px);
    box-shadow: none !important;
  }

  .btn-damage {
    background: var(--red-dim);
    border-color: var(--red);
    color: var(--red);
  }

  .btn-damage:hover {
    background: var(--red);
    color: var(--white);
    box-shadow: var(--shadow-red);
  }

  .btn-heal {
    background: var(--cyan-dim);
    border-color: var(--cyan);
    color: var(--cyan);
  }

  .btn-heal:hover {
    background: var(--cyan);
    color: var(--black);
    box-shadow: var(--shadow-cyan);
  }

  /* ── Stepper Cluster ── */
  .stepper-cluster {
    display: flex;
    align-items: center;
    gap: var(--space-1);
    background: var(--black-elevated);
    border: 1px solid var(--grey-dim);
    border-radius: var(--radius-md);
    padding: var(--space-1);
  }

  .stepper {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-sm);
    color: var(--grey);
    font-size: 1.25rem;
    line-height: 1;
    transition: background var(--t-fast), color var(--t-fast);
  }

  .stepper:hover {
    background: var(--grey-dim);
    color: var(--white);
  }

  .amount-input {
    width: 48px;
    text-align: center;
    font-family: var(--font-mono);
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--white);
  }
</style>
