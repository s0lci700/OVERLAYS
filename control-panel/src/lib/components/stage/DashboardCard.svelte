<!--
  DashboardCard
  =============
  Read-only, monitor-first character card for the live overview.
-->
<script>
  import "$lib/components/cast/dashboard/DashboardCard.css";
  import { SERVER_URL } from "$lib/services/socket.svelte.js";
  import StatDisplay from "$lib/components/shared/stat-display/stat-display.svelte";
  import ConditionPill from "$lib/components/shared/condition-pill/condition-pill.svelte";

  const FALLBACK_PHOTO_OPTIONS = [
    "/assets/img/barbarian.png",
    "/assets/img/elf.png",
    "/assets/img/wizard.png",
  ];

  const abilityList = [
    { key: "str", label: "FUE" },
    { key: "dex", label: "DES" },
    { key: "con", label: "CON" },
    { key: "int", label: "INT" },
    { key: "wis", label: "SAB" },
    { key: "cha", label: "CAR" },
  ];

  const rechargeLabels = {
    SHORT_REST: "descanso corto",
    LONG_REST: "descanso largo",
    TURN: "turno",
    DM: "narrador",
  };

  let { character } = $props();

  function resolvePhotoSrc(photoPath) {
    if (!photoPath) {
      const randomOption =
        FALLBACK_PHOTO_OPTIONS[
          Math.floor(Math.random() * FALLBACK_PHOTO_OPTIONS.length)
        ];
      return `${SERVER_URL}${randomOption}`;
    }

    if (
      photoPath.startsWith("http://") ||
      photoPath.startsWith("https://") ||
      photoPath.startsWith("data:") ||
      photoPath.startsWith("blob:")
    ) {
      return photoPath;
    }

    if (photoPath.startsWith("/")) {
      return `${SERVER_URL}${photoPath}`;
    }

    return `${SERVER_URL}/${photoPath.replace(/^\/+/, "")}`;
  }

  function formatText(value) {
    if (typeof value === "string") {
      const trimmed = value.trim();
      return trimmed ? trimmed : "no definido";
    }
    return "no definido";
  }

  function formatNumber(value) {
    return Number.isFinite(value) ? String(value) : "no definido";
  }

  function formatHp(current, max) {
    if (!Number.isFinite(current) || !Number.isFinite(max)) {
      return "no definido";
    }
    return `${current}/${max}`;
  }

  function formatCondition(condition) {
    const name = formatText(condition?.condition_name);
    if (name === "no definido") return name;

    if (Number.isFinite(condition?.intensity_level)) {
      return `${name} · nivel ${condition.intensity_level}`;
    }
    return name;
  }

  function formatResourceCount(resource) {
    if (!resource) return "no definido";
    if (
      !Number.isFinite(resource.pool_current) ||
      !Number.isFinite(resource.pool_max)
    ) {
      return "no definido";
    }
    return `${resource.pool_current}/${resource.pool_max}`;
  }

  function formatRecharge(recharge) {
    return rechargeLabels[recharge] || "no definido";
  }

  function getSafeName() {
    const name =
      typeof character?.name === "string" ? character.name.trim() : "";
    return name || "personaje";
  }
</script>

<article class="dashboard-card card-base">
  <header class="dash-card-header">
    <div class="dash-photo-hex">
      <img
        class="dash-photo"
        src={resolvePhotoSrc(character?.portrait || "")}
        alt={`Foto de ${getSafeName()}`}
        loading="lazy"
      />
    </div>
    <div class="dash-identity">
      <div class="dash-name-row">
        <span class="dash-name">{formatText(character?.name)}</span>
        <span class="dash-id">#{formatText(character?.id)}</span>
      </div>
      <span class="dash-player">JUGADOR: {formatText(character?.player)}</span>
      <div class="dash-vitals">
        <StatDisplay
          label="VIT"
          value={formatHp(character?.hp_current, character?.hp_max)}
          variant="cast"
        />
        <StatDisplay
          label="TMP"
          value={formatNumber(character?.hp_temp)}
          variant="cast"
        />
        <StatDisplay
          label="CA"
          value={formatNumber(character?.armor_class)}
          variant="cast"
        />
        <StatDisplay
          label="VEL"
          value={formatNumber(character?.speed_walk)}
          variant="cast"
        />
      </div>
    </div>
  </header>

  <section class="dash-section">
    <h3 class="dash-section-title">ATRIBUTOS BASE</h3>
    <div class="dash-ability-grid">
      {#each abilityList as ability (ability.key)}
        <StatDisplay
          label={ability.label}
          value={formatNumber(character?.ability_scores?.[ability.key])}
          variant="cast"
        />
      {/each}
    </div>
  </section>

  <section class="dash-section">
    <h3 class="dash-section-title">CONDICIONES ACTIVAS</h3>
    {#if Array.isArray(character?.conditions) && character.conditions.length}
      <div class="dash-pill-row">
        {#each character.conditions as condition (condition.id)}
          <ConditionPill
            label={formatCondition(condition)}
            variant="cast"
          />
        {/each}
      </div>
    {:else}
      <p class="dash-empty">Ninguna condición activa</p>
    {/if}
  </section>

  <section class="dash-section">
    <h3 class="dash-section-title">RECURSOS DE CLASE</h3>
    {#if Array.isArray(character?.resources) && character.resources.length}
      <div class="dash-resource-grid">
        {#each character.resources as resource (resource.id)}
          <div class="dash-resource">
            <span class="dash-resource-name">
              {formatText(resource?.name)}
            </span>
            <span class="dash-resource-count mono-num">
              {formatResourceCount(resource)}
            </span>
            <span class="dash-resource-recharge">
              REC: {formatRecharge(resource?.recharge)}
            </span>
          </div>
        {/each}
      </div>
    {:else}
      <p class="dash-empty">Sin recursos definidos</p>
    {/if}
  </section>
</article>
