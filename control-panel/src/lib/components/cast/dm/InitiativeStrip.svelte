<script>
  // One minor note — no validation on start: If the DM clicks "Iniciar Combate" before
  //   entering any rolls, everyone gets 0 and sort order will be arbitrary (input order). Not
  //   a crash, just a footgun. Not blocking for now.

  //   One minor note — --shadow-red token: Line 123 uses var(--shadow-red). Let me verify it
  //   exists:

  import "./InitiativeStrip.css";
  import { resolvePhotoSrc } from "$lib/services/utils.js";
  import { SERVER_URL } from "$lib/services/socket.js";

  let {
    characters,
    combatants = [],
    activeIndex = 0,
    round = 1,
    inCombat = false,
    onStart = () => {},
  } = $props();

  // Local roll state keyed by character id
  let rolls = $state({});

  function handleStart() {
    const rollsArray = characters.map((c) => ({
      charId: c.id,
      roll: Number(rolls[c.id] ?? 0),
    }));
    onStart(rollsArray);
  }
</script>

{#if inCombat}
  <!-- ── COMBAT MODE — horizontal token strip ── -->
  <div class="is-strip" role="region" aria-label="Orden de iniciativa">
    <span class="is-round-badge label-caps">Ronda {round}</span>

    <div class="is-scroll" role="list">
      {#each combatants as { character, roll }, i (character.id)}
        {@const isActive = i === activeIndex}
        <div
          class="is-token"
          class:is-active={isActive}
          role="listitem"
          aria-current={isActive ? "true" : undefined}
          data-char-id={character.id}
        >
          <img
            class="is-token-photo"
            src={resolvePhotoSrc(character.photo, SERVER_URL, character.id)}
            alt={character.name}
            loading="lazy"
          />
          <span class="is-token-name">{character.name.split(" ")[0]}</span>
          <span class="is-token-roll mono-num">{roll}</span>
          {#if isActive}
            <span class="is-token-indicator" aria-hidden="true"></span>
          {/if}
        </div>
      {/each}
    </div>
  </div>
{:else}
  <!-- ── PRE-COMBAT MODE — roll input rows ── -->
  <div class="is-precombat" role="region" aria-label="Configurar iniciativa">
    <h2 class="is-precombat-title label-caps">Iniciativa</h2>

    <ul class="is-roll-list" role="list">
      {#each characters as character (character.id)}
        <li class="is-roll-row">
          <img
            class="is-roll-photo"
            src={resolvePhotoSrc(character.photo, SERVER_URL, character.id)}
            alt={character.name}
            loading="lazy"
          />
          <span class="is-roll-name">{character.name}</span>
          <label class="sr-only" for="init-{character.id}">
            Iniciativa de {character.name}
          </label>
          <input
            id="init-{character.id}"
            class="is-roll-input mono-num"
            type="number"
            min="-5"
            max="30"
            placeholder="—"
            value={rolls[character.id] ?? ""}
            oninput={(e) => {
              rolls[character.id] = e.currentTarget.value;
            }}
          />
        </li>
      {/each}
    </ul>

    <button class="is-start-btn btn-base" onclick={handleStart}>
      ⚔ Iniciar Combate
    </button>
  </div>
{/if}
