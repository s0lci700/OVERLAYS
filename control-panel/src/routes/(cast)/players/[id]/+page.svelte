<!--
  Cast › Players — mobile character sheet for a single player.
  Route: /players/[id]

  Read-only view. Receives live HP updates via Socket.io (characters store).
  Mobile-first, one-handed — player holds dice with the other hand.
-->
<script>
  import { page } from "$app/stores";
  import { characters, SERVER_URL } from "$lib/stores/socket.js";
  import { resolvePhotoSrc } from "$lib/utils.js";
  import { ConditionPill } from "$lib/components/ui/condition-pill/index.js";
  import * as Tooltip from "$lib/components/ui/tooltip/index.js";
  import "./PlayerSheet.css";

  let characterId = $derived($page.params.id);
  let character = $derived(($characters ?? []).find(c => c.id === characterId));

  /* ── Ability score helpers ── */
  const ABILITIES = [
    { key: "str", label: "STR", name: "Strength",     tip: "Melee attacks, athletics, carrying capacity" },
    { key: "dex", label: "DEX", name: "Dexterity",    tip: "Ranged attacks, AC, initiative, stealth" },
    { key: "con", label: "CON", name: "Constitution",  tip: "Hit points, concentration saves" },
    { key: "int", label: "INT", name: "Intelligence",  tip: "Arcana, history, investigation" },
    { key: "wis", label: "WIS", name: "Wisdom",        tip: "Perception, insight, medicine" },
    { key: "cha", label: "CHA", name: "Charisma",      tip: "Persuasion, deception, intimidation" },
  ];

  function calcMod(score) {
    return Math.floor((score - 10) / 2);
  }

  function fmtMod(mod) {
    return mod >= 0 ? `+${mod}` : `${mod}`;
  }

  function profBonus(level) {
    if (level <= 4)  return 2;
    if (level <= 8)  return 3;
    if (level <= 12) return 4;
    if (level <= 16) return 5;
    return 6;
  }

  /* ── Derived character data ── */
  let level = $derived(character?.class_primary?.level ?? 1);
  let prof = $derived(profBonus(level));
  let hpPercent = $derived(
    character ? Math.round((character.hp_current / character.hp_max) * 100) : 100
  );
  let hpClass = $derived(
    hpPercent <= 0 ? "is-down" : hpPercent <= 30 ? "is-critical" : hpPercent <= 60 ? "is-wounded" : ""
  );
  let photoSrc = $derived(
    character ? resolvePhotoSrc(character.photo, SERVER_URL, character.id) : ""
  );

  /* ── Format equipment item names ── */
  function fmtItem(raw) {
    return raw.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
  }

  /* ── Format skill names ── */
  function fmtSkill(raw) {
    return raw.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
  }

  /* ── Alignment display ── */
  const ALIGNMENTS = {
    lg: "Lawful Good", ng: "Neutral Good", cg: "Chaotic Good",
    ln: "Lawful Neutral", nn: "True Neutral", cn: "Chaotic Neutral",
    le: "Lawful Evil", ne: "Neutral Evil", ce: "Chaotic Evil",
  };
</script>

{#if character}
  <div class="player-sheet">

    <!-- ═══ HEADER: Photo + Identity ═══ -->
    <header class="ps-header">
      <div class="ps-photo-frame">
        <img
          src={photoSrc}
          alt={character.name}
          class="ps-photo"
        />
      </div>
      <div class="ps-identity">
        <h1 class="ps-name">{character.name}</h1>
        <p class="ps-meta">
          {character.species?.name ? fmtItem(character.species.name) : ""}
          {character.class_primary?.name ? fmtItem(character.class_primary.name) : ""}
          {level}
        </p>
        {#if character.alignment}
          <p class="ps-alignment">{ALIGNMENTS[character.alignment] ?? character.alignment}</p>
        {/if}
      </div>
    </header>

    <!-- ═══ HP BAR ═══ -->
    <section class="ps-hp-section {hpClass}">
      <div class="ps-hp-row">
        <span class="ps-hp-label label-caps">HP</span>
        <span class="ps-hp-numbers mono-num">
          {character.hp_current}<span class="ps-hp-sep">/</span>{character.hp_max}
        </span>
        {#if character.hp_temp > 0}
          <span class="ps-hp-temp mono-num">+{character.hp_temp} temp</span>
        {/if}
      </div>
      <div class="ps-hp-track">
        <div
          class="ps-hp-fill"
          style="width: {Math.max(0, Math.min(100, hpPercent))}%"
        ></div>
      </div>
    </section>

    <!-- ═══ COMBAT STATS ROW ═══ -->
    <section class="ps-combat-row">
      <div class="ps-combat-stat">
        <span class="ps-combat-value mono-num">{character.armor_class}</span>
        <span class="ps-combat-label label-caps">AC</span>
      </div>
      <div class="ps-combat-stat">
        <span class="ps-combat-value mono-num">{fmtMod(prof)}</span>
        <span class="ps-combat-label label-caps">Prof</span>
      </div>
      <div class="ps-combat-stat">
        <span class="ps-combat-value mono-num">{character.speed_walk ?? character.species?.speed_walk ?? 30} ft</span>
        <span class="ps-combat-label label-caps">Speed</span>
      </div>
    </section>

    <!-- ═══ ABILITY SCORES ═══ -->
    <section class="ps-abilities">
      <Tooltip.Provider delayDuration={200}>
        {#each ABILITIES as ab}
          {@const score = character.ability_scores?.[ab.key] ?? 10}
          {@const mod = calcMod(score)}
          {@const isSavingThrow = character.proficiencies?.saving_throws?.includes(ab.key)}
          <Tooltip.Root>
            <Tooltip.Trigger class="ps-ability-cell" data-save={isSavingThrow ? "true" : undefined}>
              <span class="ps-ability-label label-caps">{ab.label}</span>
              <span class="ps-ability-mod mono-num">{fmtMod(mod)}</span>
              <span class="ps-ability-score">{score}</span>
              {#if isSavingThrow}
                <span class="ps-save-dot" title="Saving throw proficiency"></span>
              {/if}
            </Tooltip.Trigger>
            <Tooltip.Content>
              <strong>{ab.name} ({score})</strong><br />
              Modifier: {fmtMod(mod)}<br />
              {#if isSavingThrow}
                Save: {fmtMod(mod + prof)} (proficient)<br />
              {:else}
                Save: {fmtMod(mod)}<br />
              {/if}
              {ab.tip}
            </Tooltip.Content>
          </Tooltip.Root>
        {/each}
      </Tooltip.Provider>
    </section>

    <!-- ═══ CONDITIONS (if any active) ═══ -->
    {#if character.conditions?.length > 0}
      <section class="ps-section">
        <h2 class="ps-section-title label-caps">Conditions</h2>
        <div class="ps-conditions">
          {#each character.conditions as cond}
            <ConditionPill
              label={fmtItem(cond.condition_name)}
              variant="condition"
            />
          {/each}
        </div>
      </section>
    {/if}

    <!-- ═══ SAVING THROWS ═══ -->
    <section class="ps-section">
      <h2 class="ps-section-title label-caps">Saving Throws</h2>
      <div class="ps-save-grid">
        {#each ABILITIES as ab}
          {@const score = character.ability_scores?.[ab.key] ?? 10}
          {@const mod = calcMod(score)}
          {@const isProficient = character.proficiencies?.saving_throws?.includes(ab.key)}
          {@const saveVal = isProficient ? mod + prof : mod}
          <div class="ps-save-row" class:is-proficient={isProficient}>
            <span class="ps-prof-marker">{isProficient ? "●" : "○"}</span>
            <span class="ps-save-label">{ab.label}</span>
            <span class="ps-save-value mono-num">{fmtMod(saveVal)}</span>
          </div>
        {/each}
      </div>
    </section>

    <!-- ═══ SKILL PROFICIENCIES ═══ -->
    {#if character.proficiencies?.skills?.length > 0}
      <section class="ps-section">
        <h2 class="ps-section-title label-caps">Skills</h2>
        <div class="ps-skills">
          {#each character.proficiencies.skills as skill}
            <span class="ps-skill-pill">{fmtSkill(skill)}</span>
          {/each}
        </div>
      </section>
    {/if}

    <!-- ═══ RESOURCES (spell slots, ki, etc.) ═══ -->
    {#if character.resources?.length > 0}
      <section class="ps-section">
        <h2 class="ps-section-title label-caps">Resources</h2>
        <div class="ps-resources">
          {#each character.resources as res}
            <div class="ps-resource-row">
              <span class="ps-resource-name">{res.name}</span>
              <span class="ps-resource-pips">
                {#each Array(res.pool_max) as _, i}
                  <span class="ps-pip" class:is-spent={i >= res.pool_current}></span>
                {/each}
              </span>
              <span class="ps-resource-count mono-num">{res.pool_current}/{res.pool_max}</span>
            </div>
          {/each}
        </div>
      </section>
    {/if}

    <!-- ═══ EQUIPMENT ═══ -->
    {#if character.equipment?.items?.length > 0}
      <section class="ps-section">
        <h2 class="ps-section-title label-caps">Equipment</h2>
        <ul class="ps-equipment">
          {#each character.equipment.items as item}
            <li class="ps-equip-item">{fmtItem(item)}</li>
          {/each}
        </ul>
        {#if character.equipment.coins}
          {@const coins = character.equipment.coins}
          {#if coins.gp || coins.sp || coins.cp}
            <p class="ps-coins mono-num">
              {#if coins.gp}<span class="ps-coin gold">{coins.gp} GP</span>{/if}
              {#if coins.sp}<span class="ps-coin silver">{coins.sp} SP</span>{/if}
              {#if coins.cp}<span class="ps-coin copper">{coins.cp} CP</span>{/if}
            </p>
          {/if}
        {/if}
      </section>
    {/if}

    <!-- ═══ PROFICIENCIES (armor, weapons, tools) ═══ -->
    <section class="ps-section">
      <h2 class="ps-section-title label-caps">Proficiencies</h2>
      <div class="ps-prof-group">
        {#if character.proficiencies?.armor?.length > 0}
          <div class="ps-prof-line">
            <span class="ps-prof-type label-caps">Armor</span>
            <span class="ps-prof-list">{character.proficiencies.armor.map(fmtItem).join(", ")}</span>
          </div>
        {/if}
        {#if character.proficiencies?.weapons?.length > 0}
          <div class="ps-prof-line">
            <span class="ps-prof-type label-caps">Weapons</span>
            <span class="ps-prof-list">{character.proficiencies.weapons.map(fmtItem).join(", ")}</span>
          </div>
        {/if}
        {#if character.proficiencies?.tools?.length > 0}
          <div class="ps-prof-line">
            <span class="ps-prof-type label-caps">Tools</span>
            <span class="ps-prof-list">{character.proficiencies.tools.map(fmtItem).join(", ")}</span>
          </div>
        {/if}
        {#if character.languages?.length > 0}
          <div class="ps-prof-line">
            <span class="ps-prof-type label-caps">Languages</span>
            <span class="ps-prof-list">{character.languages.map(fmtItem).join(", ")}</span>
          </div>
        {/if}
      </div>
    </section>

    <!-- ═══ SPECIES TRAITS ═══ -->
    {#if character.species?.traits?.length > 0}
      <section class="ps-section">
        <h2 class="ps-section-title label-caps">Traits</h2>
        <div class="ps-skills">
          {#each character.species.traits as trait}
            <span class="ps-skill-pill">{fmtItem(trait)}</span>
          {/each}
        </div>
      </section>
    {/if}

    <!-- ═══ NOTES ═══ -->
    {#if character.notes}
      <section class="ps-section ps-notes-section">
        <h2 class="ps-section-title label-caps">Notes</h2>
        <div class="ps-notes">
          {#if character.notes.personality}
            <div class="ps-note-block">
              <span class="ps-note-label label-caps">Personality</span>
              <p class="ps-note-text">{character.notes.personality}</p>
            </div>
          {/if}
          {#if character.notes.ideals}
            <div class="ps-note-block">
              <span class="ps-note-label label-caps">Ideals</span>
              <p class="ps-note-text">{character.notes.ideals}</p>
            </div>
          {/if}
          {#if character.notes.bonds}
            <div class="ps-note-block">
              <span class="ps-note-label label-caps">Bonds</span>
              <p class="ps-note-text">{character.notes.bonds}</p>
            </div>
          {/if}
          {#if character.notes.flaws}
            <div class="ps-note-block">
              <span class="ps-note-label label-caps">Flaws</span>
              <p class="ps-note-text">{character.notes.flaws}</p>
            </div>
          {/if}
        </div>
      </section>
    {/if}

  </div>

{:else}

  <div class="ps-not-found">
    <p class="ps-not-found-title">Character not found</p>
    <p class="ps-not-found-id mono-num">{characterId}</p>
  </div>

{/if}
