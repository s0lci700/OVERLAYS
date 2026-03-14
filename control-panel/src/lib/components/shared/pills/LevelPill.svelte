<!--
  LevelPill
  =========
  Displays a character's level as a small badge.
  Used in CharacterCard (control view) and CharacterManagement (management view).

  Props:
    level {number} — the class level to display (default 1)
-->
<script>
  import "./Pills.css";

  let { level = 1 } = $props();
  const displayLevel = $derived(Number(level ?? 1) || 1);
</script>

<span class="level-pill">LVL {displayLevel}</span>
