<!--
  DiceIntakeForm
  ==============
  Dice roll input form for the Stage HUD main panel.
  Operator selects character, die type, count, modifier, then logs the result.
-->
<script lang="ts">
  import './DiceIntakeForm.css';
  import { characters } from '$lib/services/socket.svelte';
  import { SERVER_URL } from '$lib/services/socket.svelte.js';
  import HelpBeacon from '../shared/HelpBeacon.svelte';

  type DieSides = 4 | 6 | 8 | 10 | 12 | 20;
  const DIE_OPTIONS: DieSides[] = [4, 6, 8, 10, 12, 20];

  let selectedCharId = $state('');
  let selectedDie = $state<DieSides>(20);
  let count = $state(1);
  let result = $state<number | null>(null);
  let modifier = $state(0);
  let isSubmitting = $state(false);
  let errorMessage = $state("");

  const total = $derived(result !== null ? result + modifier : null);

  // Default to first character when roster loads
  $effect(() => {
    if (selectedCharId === '' && $characters.length > 0) {
      selectedCharId = $characters[0]?.id ?? '';
    }
  });

  async function handleSubmit() {
    if (result === null || !selectedCharId || isSubmitting) return;
    isSubmitting = true;
    errorMessage = "";
    try {
      const response = await fetch(`${SERVER_URL}/api/rolls`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          charId: selectedCharId,
          result: total,
          modifier,
          sides: selectedDie,
          count,
        }),
      });
      if (!response.ok) throw new Error("Error en el servidor");
      result = null;
    } catch (err) {
      errorMessage = "No se pudo registrar la tirada. Verifica la conexión.";
      console.error(err);
    } finally {
      isSubmitting = false;
    }
  }
</script>

<form class="dice-form" onsubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
  <!-- Character selector -->
  <div class="dice-form__field">
    <label class="dice-form__label" for="dice-char">PERSONAJE</label>
    <select class="dice-form__select" id="dice-char" bind:value={selectedCharId}>
      {#each $characters as char (char.id)}
        <option value={char.id}>{char.name}</option>
      {/each}
      {#if $characters.length === 0}
        <option value="">Sin personajes</option>
      {/if}
    </select>
  </div>

  <!-- Die type selector -->
  <div class="dice-form__field">
    <div style="position:relative; display:inline-block; width:fit-content;">
      <span class="dice-form__label" id="die-group-label">DADO SELECCIONADO</span>
      <HelpBeacon 
        id="dice_onboard" 
        message="Selecciona un personaje y el dado lanzado, luego ingresa el resultado para enviarlo a los gráficos."
        position="top-right"
      />
    </div>
    <div class="die-group" role="radiogroup" aria-labelledby="die-group-label">
      {#each DIE_OPTIONS as die (die)}
        <button
          type="button"
          class="die-btn"
          class:is-active={selectedDie === die}
          role="radio"
          aria-checked={selectedDie === die}
          onclick={() => (selectedDie = die)}
        >
          D{die}
        </button>
      {/each}
    </div>
  </div>

  <!-- Count, Result, Modifier inputs -->
  <div class="dice-form__row">
    <div class="dice-form__field dice-form__field--sm">
      <label class="dice-form__label" for="dice-count" title="Número de dados a lanzar">NÚM. DADOS</label>
      <input
        class="dice-form__input"
        id="dice-count"
        type="number"
        min={1}
        max={20}
        bind:value={count}
      />
    </div>
    <div class="dice-form__field dice-form__field--sm">
      <label class="dice-form__label" for="dice-result" title="Suma total de los valores naturales del dado">SUMA DADOS</label>
      <input
        class="dice-form__input"
        id="dice-result"
        type="number"
        min={1}
        placeholder="—"
        bind:value={result}
      />
    </div>
    <div class="dice-form__field dice-form__field--sm">
      <label class="dice-form__label" for="dice-modifier" title="Bono o penalizador aplicado al resultado">MODIFICADOR</label>
      <input
        class="dice-form__input"
        id="dice-modifier"
        type="number"
        bind:value={modifier}
      />
    </div>
  </div>

  <!-- Total display -->
  {#if total !== null}
    <div class="dice-form__total" title="Resultado final (Suma + Modificador)">
      <span class="dice-form__total-label">TOTAL FINAL</span>
      <span class="dice-form__total-value">{total}</span>
    </div>
  {/if}

  <!-- Submit -->
  <div class="dice-form__actions">
    {#if errorMessage}
      <p class="dice-form__error" role="alert">{errorMessage}</p>
    {/if}
    <button
      class="dice-form__submit"
      type="submit"
      disabled={result === null || isSubmitting}
      aria-label="Registrar y mostrar tirada en pantalla"
    >
      {isSubmitting ? 'REGISTRANDO...' : 'LANZAR A PANTALLA'}
    </button>
  </div>
</form>
