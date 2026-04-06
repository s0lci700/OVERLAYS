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
    short_rest: "descanso corto",
    long_rest: "descanso largo",
    turn: "turno",
    dm: "narrador",
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

  let hpRatio = $derived((character?.hp_current || 0) / (character?.hp_max || 1));
  let hpStatus = $derived(
    character?.hp_current <= 0 ? "dead" :
    hpRatio < 0.25 ? "critical" :
    hpRatio < 0.5 ? "injured" : "healthy"
  );

  const statusLabels = {
    dead: "CAÍDO",
    critical: "CRITICAL",
    injured: "HERIDO",
    healthy: "SANO"
  };
</script>

<article class="dashboard-card card-base" data-hp-status={hpStatus}>
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
        <span class="dash-class-level">{formatText(character?.species)} {formatText(character?.class_name)} {formatNumber(character?.level)}</span>
      </div>
      <div class="dash-sub-identity">
        <span class="dash-player">JUGADOR: {formatText(character?.player)}</span>
        <span class="dash-id">#{formatText(character?.id)}</span>
      </div>
      
      <div class="dash-vitals">
        <div 
          class="dash-vital-main" 
          class:is-critical={hpStatus === 'critical' || hpStatus === 'dead'} 
          data-status={hpStatus}
        >
          <StatDisplay
            label="VIT"
            value={formatHp(character?.hp_current, character?.hp_max)}
            variant="cast"
          />
          {#if hpStatus === 'dead' || hpStatus === 'critical'}
            <span class="dash-status-badge">{statusLabels[hpStatus]}</span>
          {/if}
        </div>
        <div class="dash-vital-secondary">          <StatDisplay
            label="TMP"
            value={formatNumber(character?.hp_temp)}
            variant="cast"
          />
          <StatDisplay
            label="CA"
            value={formatNumber(character?.ac_base)}
            variant="cast"
          />
          <StatDisplay
            label="VEL"
            value={formatNumber(character?.speed)}
            variant="cast"
          />
        </div>
      </div>
    </div>
  </header>

  <section class="dash-section">
    <h3 class="dash-section-title">ATRIBUTOS BASE</h3>
    <div class="dash-ability-bolder">
      {#each abilityList as ability (ability.key)}
        <div class="ability-item">
          <span class="ability-label">{ability.label}</span>
          <span class="ability-value mono-num">
            {formatNumber(character?.ability_scores?.[ability.key])}
          </span>
          <span class="ability-ghost" aria-hidden="true">{ability.label}</span>
        </div>
      {/each}
    </div>
  </section>

  <section class="dash-section">
    <h3 class="dash-section-title">RECURSOS & CONDICIONES</h3>
    <div class="dash-dual-grid">
      <div class="dash-resources-col">
        {#if Array.isArray(character?.resources) && character.resources.length}
          <div class="dash-resource-stack">
            {#each character.resources as resource (resource.id)}
              <div class="dash-resource-inline">
                <span class="dash-resource-name">{formatText(resource?.name)}</span>
                <span class="dash-resource-val mono-num">{formatResourceCount(resource)}</span>
              </div>
            {/each}
          </div>
        {:else}
          <p class="dash-empty">Sin recursos de clase</p>
        {/if}
      </div>
      
      <div class="dash-conditions-col">
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
          <p class="dash-empty">Estado normal</p>
        {/if}
      </div>
    </div>
  </section>
</article>
