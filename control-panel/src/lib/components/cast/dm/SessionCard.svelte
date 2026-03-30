<script>
  import "./SessionCard.css";
  import { resolvePhotoSrc } from "$lib/services/utils.js";
  import { SERVER_URL } from "$lib/services/socket.svelte.js";

  let {
    character,
    isActive = false,
    isSelectable = false,
    isSelected = false,
    onSelect = () => {},
  } = $props();

  const hpPercent = $derived((character.hp_current / character.hp_max) * 100);
  const hpClass = $derived(
    hpPercent > 60 ? "hp--healthy" : hpPercent > 30 ? "hp--injured" : "hp--critical",
  );
  const classLabel = $derived(
    character.class_primary?.name
      ? `${character.class_primary.name} L${character.class_primary.level}`
      : "",
  );
  const photoSrc = $derived(
    resolvePhotoSrc(character.photo, SERVER_URL, character.id),
  );
</script>

<article
  class="session-card"
  class:is-active={isActive}
  class:is-selectable={isSelectable}
  class:is-selected={isSelected}
  class:is-critical={hpPercent <= 30}
  data-char-id={character.id}
  onclick={isSelectable ? () => onSelect(character.id) : undefined}
  onkeydown={isSelectable
    ? (e) => (e.key === "Enter" || e.key === " ") && onSelect(character.id)
    : undefined}
  tabindex={isSelectable ? 0 : undefined}
  aria-pressed={isSelectable ? isSelected : undefined}
>
  <img class="sc-photo" src={photoSrc} alt={character.name} loading="lazy" />

  <div class="sc-body">
    <div class="sc-header">
      <span class="sc-name">{character.name}</span>
      {#if classLabel}
        <span class="sc-class label-caps">{classLabel}</span>
      {/if}
    </div>

    <div
      class="sc-hp-track"
      role="progressbar"
      aria-valuenow={character.hp_current}
      aria-valuemax={character.hp_max}
      aria-label="Puntos de vida"
    >
      <div class="hp-fill {hpClass}" style="width: {hpPercent}%"></div>
    </div>

    <div class="sc-hp-nums">
      <span class="sc-hp-cur" class:is-critical={hpPercent <= 30}
        >{character.hp_current}</span
      >
      <span class="sc-hp-sep">/</span>
      <span class="sc-hp-max">{character.hp_max}</span>
    </div>

    {#if character.conditions?.length}
      <div class="sc-conditions">
        {#each character.conditions as condition (condition.id)}
          <span class="sc-condition-badge">{condition.condition_name}</span>
        {/each}
      </div>
    {/if}

    {#if character.resources?.length}
      <div class="sc-resources">
        {#each character.resources as resource (resource.id)}
          <div class="sc-resource-row">
            <span class="label-caps">{resource.name}</span>
            <div class="sc-pips" aria-label="{resource.name}: {resource.pool_current}/{resource.pool_max}">
              {#each Array.from({length: resource.pool_max}, (_, i) => i) as idx (idx)}
                <span
                  class="sc-pip sc-pip--{resource.recharge.toLowerCase()}"
                  class:sc-pip--filled={idx < resource.pool_current}
                  aria-hidden="true"
                ></span>
              {/each}
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</article>
