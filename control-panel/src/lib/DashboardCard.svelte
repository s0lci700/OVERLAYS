<!--
  DashboardCard
  =============
  Read-only, monitor-first character card for the live dashboard view.
-->
<script>
  import "./DashboardCard.css";
  import { SERVER_URL } from "./socket";

  const FALLBACK_PHOTO_OPTIONS = [
    "/assets/img/barbarian.png",
    "/assets/img/elf.png",
    "/assets/img/wizard.png",
  ];

  const abilityList = [
    { key: "str", label: "STR" },
    { key: "dex", label: "DEX" },
    { key: "con", label: "CON" },
    { key: "int", label: "INT" },
    { key: "wis", label: "WIS" },
    { key: "cha", label: "CHA" },
  ];

  const rechargeLabels = {
    SHORT_REST: "descanso corto",
    LONG_REST: "descanso largo",
    TURN: "turno",
    DM: "DM",
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
      return trimmed ? trimmed : "no definida";
    }
    return "no definida";
  }

  function formatNumber(value) {
    return Number.isFinite(value) ? String(value) : "no definida";
  }

  function formatHp(current, max) {
    if (!Number.isFinite(current) || !Number.isFinite(max)) {
      return "no definida";
    }
    return `${current}/${max}`;
  }

  function formatCondition(condition) {
    const name = formatText(condition?.condition_name);
    if (name === "no definida") return name;

    if (Number.isFinite(condition?.intensity_level)) {
      return `${name} · nivel ${condition.intensity_level}`;
    }
    return name;
  }

  function formatResourceCount(resource) {
    if (!resource) return "no definida";
    if (
      !Number.isFinite(resource.pool_current) ||
      !Number.isFinite(resource.pool_max)
    ) {
      return "no definida";
    }
    return `${resource.pool_current}/${resource.pool_max}`;
  }

  function formatRecharge(recharge) {
    return rechargeLabels[recharge] || "no definida";
  }

  function getSafeName() {
    const name =
      typeof character?.name === "string" ? character.name.trim() : "";
    return name || "personaje";
  }
</script>

<article class="dashboard-card card-base">
  <header class="dash-card-header">
    <img
      class="dash-photo"
      src={resolvePhotoSrc(character?.photo || "")}
      alt={`Foto de ${getSafeName()}`}
      loading="lazy"
    />
    <div class="dash-identity">
      <div class="dash-name-row">
        <span class="dash-name">{formatText(character?.name)}</span>
        <span class="dash-id">#{formatText(character?.id)}</span>
      </div>
      <span class="dash-player">Jugador: {formatText(character?.player)}</span>
      <div class="dash-vitals">
        <div class="dash-vital">
          <span class="dash-vital-label">HP</span>
          <span class="dash-vital-value mono-num">
            {formatHp(character?.hp_current, character?.hp_max)}
          </span>
        </div>
        <div class="dash-vital">
          <span class="dash-vital-label">Temp</span>
          <span class="dash-vital-value mono-num">
            {formatNumber(character?.hp_temp)}
          </span>
        </div>
        <div class="dash-vital">
          <span class="dash-vital-label">AC</span>
          <span class="dash-vital-value mono-num">
            {formatNumber(character?.armor_class)}
          </span>
        </div>
        <div class="dash-vital">
          <span class="dash-vital-label">Vel</span>
          <span class="dash-vital-value mono-num">
            {formatNumber(character?.speed_walk)}
          </span>
        </div>
      </div>
    </div>
  </header>

  <section class="dash-section">
    <h3 class="dash-section-title">ATRIBUTOS</h3>
    <div class="dash-ability-grid">
      {#each abilityList as ability}
        <div class="dash-ability">
          <span class="dash-ability-label">{ability.label}</span>
          <span class="dash-ability-value mono-num">
            {formatNumber(character?.ability_scores?.[ability.key])}
          </span>
        </div>
      {/each}
    </div>
  </section>

  <section class="dash-section">
    <h3 class="dash-section-title">CONDICIONES</h3>
    {#if Array.isArray(character?.conditions) && character.conditions.length}
      <div class="dash-pill-row">
        {#each character.conditions as condition (condition.id)}
          <span class="dash-pill">{formatCondition(condition)}</span>
        {/each}
      </div>
    {:else}
      <p class="dash-empty">no definida</p>
    {/if}
  </section>

  <section class="dash-section">
    <h3 class="dash-section-title">RECURSOS</h3>
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
              {formatRecharge(resource?.recharge)}
            </span>
          </div>
        {/each}
      </div>
    {:else}
      <p class="dash-empty">no definida</p>
    {/if}
  </section>
</article>
