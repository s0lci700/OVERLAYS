<!--
  CharacterInfoPanel
  ==================
  Collapsible read-only summary of a single character's stats,
  languages, proficiencies, and equipment.
  Reads exclusively from the `character` prop (persisted data).

  Props:
    character – full character object from the socket store
    labelOf   – Map<key, label> for all selectable values
    labelMaps – { class, species, alignment } Maps for single-value lookups
-->
<script>
  import ReadOnlyField from "$lib/components/shared/read-only-field/read-only-field.svelte";
  import { Button } from "$lib/components/shared/button/index.js";
  import { fade } from "svelte/transition";

  let { character, labelOf, labelMaps } = $props();

  // ── Collapse state ─────────────────────────────────────────────────
  let infoOpen = $state(false);
  let loadoutOpen = $state(false);

  function toggleInfo() {
    infoOpen = !infoOpen;
    if (!infoOpen) loadoutOpen = false;
  }

  function toggleLoadout() {
    loadoutOpen = !loadoutOpen;
  }

  // ── Label helpers ──────────────────────────────────────────────────
  function resolveLabel(map, key, fallback) {
    if (!key) return fallback;
    return map?.get(key) || key;
  }

  function formatSelectionListCompact(keys) {
    if (!Array.isArray(keys) || keys.length === 0) return "Ninguno";
    return keys.map((key) => labelOf.get(key) || key).join(", ");
  }

  // ── Derived display strings ────────────────────────────────────────
  const classPrimary = $derived(character.class_primary || {});
  const species = $derived(character.species || {});
  const background = $derived(character.background || {});
  const proficiencies = $derived(character.proficiencies || {});
  const equipment = $derived(character.equipment || {});
  const languages = $derived(
    Array.isArray(character.languages) ? character.languages : [],
  );

  function buildReadOnlyClass() {
    const classKey = classPrimary.name;
    if (!classKey) return "Sin clase";
    const label = resolveLabel(labelMaps.class, classKey, classKey);
    const level = Number(classPrimary.level ?? 1) || 1;
    return `${label} ${level}`;
  }

  function buildProfileSummary() {
    const bg = background.name
      ? labelOf.get(background.name) || background.name
      : "Sin background";
    const sp = species.name
      ? resolveLabel(labelMaps.species, species.name, species.name)
      : "Sin especie";
    return `${bg} / ${sp}`;
  }

  function buildLanguagesSummary() {
    const all = languages.map((key) => labelOf.get(key) || key);
    return all.length > 0 ? all.join(", ") : "Ninguno";
  }

  function buildLoadoutSummary() {
    const skillCount = (proficiencies.skills || []).length;
    const armorCount = (proficiencies.armor || []).length;
    const weaponCount = (proficiencies.weapons || []).length;
    const itemCount = (equipment.items || []).length;
    const parts = [];
    if (skillCount > 0) parts.push(`${skillCount} skills`);
    if (armorCount > 0) parts.push(`${armorCount} armaduras`);
    if (weaponCount > 0) parts.push(`${weaponCount} armas`);
    if (itemCount > 0) parts.push(`${itemCount} items`);
    return parts.length > 0 ? parts.join(", ") : "Sin competencias";
  }
</script>

<div class="manage-readonly">
  <Button
    class="btn-base manage-info-toggle"
    type="button"
    onclick={toggleInfo}
    aria-expanded={infoOpen ? "true" : "false"}
  >
    {infoOpen ? "OCULTAR INFO" : "VER INFO"}
  </Button>

  {#if infoOpen}
    <div class="manage-readonly-grid" transition:fade={{ duration: 140 }}>
      <ReadOnlyField
        label="Clase / Nivel"
        value={buildReadOnlyClass()}
        class="manage-readonly-item"
      />
      <ReadOnlyField
        label="Background / Especie"
        value={buildProfileSummary()}
        class="manage-readonly-item"
      />
      <ReadOnlyField
        label="Alineamiento"
        value={resolveLabel(
          labelMaps.alignment,
          character.alignment,
          "No definido",
        )}
        class="manage-readonly-item"
      />
      <ReadOnlyField
        label="Idiomas"
        value={buildLanguagesSummary()}
        class="manage-readonly-item"
      />

      <div class="manage-readonly-item">
        <span class="manage-readonly-label manage-readonly-expand">
          Competencias y equipo
          <Button
            type="button"
            class="btn-base manage-info-toggle"
            onclick={toggleLoadout}
            aria-expanded={loadoutOpen ? "true" : "false"}
          >
            {loadoutOpen ? "ocultar detalle" : "ver detalle"}
          </Button>
        </span>
        {#if !loadoutOpen}
          <span class="manage-readonly-value">{buildLoadoutSummary()}</span>
        {:else}
          <div class="manage-loadout-details" transition:fade={{ duration: 120 }}>
            <div class="manage-loadout-line">
              <span class="manage-loadout-key">Skills:</span>
              <span class="manage-loadout-val"
                >{formatSelectionListCompact(proficiencies.skills)}</span
              >
            </div>
            <div class="manage-loadout-line">
              <span class="manage-loadout-key">Herramientas:</span>
              <span class="manage-loadout-val"
                >{formatSelectionListCompact(proficiencies.tools)}</span
              >
            </div>
            <div class="manage-loadout-line">
              <span class="manage-loadout-key">Armadura:</span>
              <span class="manage-loadout-val"
                >{formatSelectionListCompact(proficiencies.armor)}</span
              >
            </div>
            <div class="manage-loadout-line">
              <span class="manage-loadout-key">Armas:</span>
              <span class="manage-loadout-val"
                >{formatSelectionListCompact(proficiencies.weapons)}</span
              >
            </div>
            <div class="manage-loadout-line">
              <span class="manage-loadout-key">Items:</span>
              <span class="manage-loadout-val"
                >{formatSelectionListCompact(equipment.items)}</span
              >
            </div>
            <div class="manage-loadout-line">
              <span class="manage-loadout-key">Trinket:</span>
              <span class="manage-loadout-val">
                {equipment.trinket
                  ? labelOf.get(equipment.trinket) || equipment.trinket
                  : "Ninguno"}
              </span>
            </div>
          </div>
        {/if}
      </div>
    </div>
  {/if}
</div>
