import { f as store_get, aj as ensure_array_like, c as escape_html, h as unsubscribe_stores, ai as attr, j as derived } from './index2-Cj7uYY7n.js';
import { c as characters, S as SERVER_URL, s as socket } from './socket-DMJiBPKB.js';
import { w as writable, d as derived$1 } from './index-D7gxnwqs.js';
import 'socket.io-client';

function DashboardCard($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const FALLBACK_PHOTO_OPTIONS = [
      "/assets/img/barbarian.png",
      "/assets/img/elf.png",
      "/assets/img/wizard.png"
    ];
    const abilityList = [
      { key: "str", label: "STR" },
      { key: "dex", label: "DEX" },
      { key: "con", label: "CON" },
      { key: "int", label: "INT" },
      { key: "wis", label: "WIS" },
      { key: "cha", label: "CHA" }
    ];
    const rechargeLabels = {
      SHORT_REST: "descanso corto",
      LONG_REST: "descanso largo",
      TURN: "turno",
      DM: "DM"
    };
    let { character } = $$props;
    function resolvePhotoSrc(photoPath) {
      if (!photoPath) {
        const randomOption = FALLBACK_PHOTO_OPTIONS[Math.floor(Math.random() * FALLBACK_PHOTO_OPTIONS.length)];
        return `${SERVER_URL}${randomOption}`;
      }
      if (photoPath.startsWith("http://") || photoPath.startsWith("https://") || photoPath.startsWith("data:") || photoPath.startsWith("blob:")) {
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
      if (!Number.isFinite(resource.pool_current) || !Number.isFinite(resource.pool_max)) {
        return "no definida";
      }
      return `${resource.pool_current}/${resource.pool_max}`;
    }
    function formatRecharge(recharge) {
      return rechargeLabels[recharge] || "no definida";
    }
    function getSafeName() {
      const name = typeof character?.name === "string" ? character.name.trim() : "";
      return name || "personaje";
    }
    $$renderer2.push(`<article class="dashboard-card card-base"><header class="dash-card-header"><img class="dash-photo"${attr("src", resolvePhotoSrc(character?.photo || ""))}${attr("alt", `Foto de ${getSafeName()}`)} loading="lazy"/> <div class="dash-identity"><div class="dash-name-row"><span class="dash-name">${escape_html(formatText(character?.name))}</span> <span class="dash-id">#${escape_html(formatText(character?.id))}</span></div> <span class="dash-player">Jugador: ${escape_html(formatText(character?.player))}</span> <div class="dash-vitals"><div class="dash-vital"><span class="dash-vital-label">HP</span> <span class="dash-vital-value mono-num">${escape_html(formatHp(character?.hp_current, character?.hp_max))}</span></div> <div class="dash-vital"><span class="dash-vital-label">Temp</span> <span class="dash-vital-value mono-num">${escape_html(formatNumber(character?.hp_temp))}</span></div> <div class="dash-vital"><span class="dash-vital-label">AC</span> <span class="dash-vital-value mono-num">${escape_html(formatNumber(character?.armor_class))}</span></div> <div class="dash-vital"><span class="dash-vital-label">Vel</span> <span class="dash-vital-value mono-num">${escape_html(formatNumber(character?.speed_walk))}</span></div></div></div></header> <section class="dash-section"><h3 class="dash-section-title">ATRIBUTOS</h3> <div class="dash-ability-grid"><!--[-->`);
    const each_array = ensure_array_like(abilityList);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let ability = each_array[$$index];
      $$renderer2.push(`<div class="dash-ability"><span class="dash-ability-label">${escape_html(ability.label)}</span> <span class="dash-ability-value mono-num">${escape_html(formatNumber(character?.ability_scores?.[ability.key]))}</span></div>`);
    }
    $$renderer2.push(`<!--]--></div></section> <section class="dash-section"><h3 class="dash-section-title">CONDICIONES</h3> `);
    if (Array.isArray(character?.conditions) && character.conditions.length) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="dash-pill-row"><!--[-->`);
      const each_array_1 = ensure_array_like(character.conditions);
      for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
        let condition = each_array_1[$$index_1];
        $$renderer2.push(`<span class="dash-pill">${escape_html(formatCondition(condition))}</span>`);
      }
      $$renderer2.push(`<!--]--></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<p class="dash-empty">no definida</p>`);
    }
    $$renderer2.push(`<!--]--></section> <section class="dash-section"><h3 class="dash-section-title">RECURSOS</h3> `);
    if (Array.isArray(character?.resources) && character.resources.length) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="dash-resource-grid"><!--[-->`);
      const each_array_2 = ensure_array_like(character.resources);
      for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
        let resource = each_array_2[$$index_2];
        $$renderer2.push(`<div class="dash-resource"><span class="dash-resource-name">${escape_html(formatText(resource?.name))}</span> <span class="dash-resource-count mono-num">${escape_html(formatResourceCount(resource))}</span> <span class="dash-resource-recharge">${escape_html(formatRecharge(resource?.recharge))}</span></div>`);
      }
      $$renderer2.push(`<!--]--></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<p class="dash-empty">no definida</p>`);
    }
    $$renderer2.push(`<!--]--></section></article>`);
  });
}
const pendingActions = writable([]);
const history = writable([]);
derived$1(pendingActions, ($pending) => $pending.length > 0);
const MAX_HISTORY = 40;
function recordHistory(entry) {
  history.update((list) => {
    const next = [...list, { timestamp: Date.now(), ...entry }];
    if (next.length > MAX_HISTORY) next.shift();
    return next;
  });
}
socket.on("hp_updated", ({ character, hp_current }) => {
  recordHistory({
    type: "hp",
    label: `${character.name} HP`,
    value: `${hp_current}/${character.hp_max}`,
    detail: "Health updated"
  });
});
socket.on("resource_updated", ({ charId, resource }) => {
  recordHistory({
    type: "resource",
    label: `Character ${charId} resource`,
    value: `${resource.pool_current}/${resource.pool_max}`,
    detail: `Updated ${resource.name}`
  });
});
socket.on("condition_added", ({ charId, condition }) => {
  recordHistory({
    type: "condition",
    label: "Condition added",
    value: condition.condition_name,
    detail: charId
  });
});
socket.on("condition_removed", ({ charId, conditionId }) => {
  recordHistory({
    type: "condition",
    label: "Condition removed",
    value: conditionId,
    detail: charId
  });
});
socket.on("rest_taken", ({ charId, type }) => {
  recordHistory({
    type: "rest",
    label: `Rest (${type})`,
    value: charId,
    detail: "Resources restored"
  });
});
socket.on("dice_rolled", (payload) => {
  recordHistory({
    type: "roll",
    label: `${payload.characterName || payload.charId} rolled`,
    value: `${payload.rollResult}`,
    detail: `d${payload.sides} + ${payload.modifier ?? 0}`
  });
});
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let actionHistory = derived(() => store_get($$store_subs ??= {}, "$history", history).filter((entry) => entry.type !== "roll").slice(-10).reverse());
    let rollHistory = derived(() => store_get($$store_subs ??= {}, "$history", history).filter((entry) => entry.type === "roll").slice(-10).reverse());
    function formatTime(timestamp) {
      try {
        return new Date(timestamp).toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" });
      } catch {
        return "";
      }
    }
    $$renderer2.push(`<section class="dashboard-shell"><header class="dashboard-header"><h1 class="dashboard-title">Dashboard de personajes</h1> <p class="dashboard-subtitle">Vista en vivo para mesa o pantalla principal. Campos vacios muestran "no
      definida".</p></header> `);
    if (store_get($$store_subs ??= {}, "$characters", characters).length === 0) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="dashboard-empty"><p class="dashboard-empty-title">Sin personajes activos</p> <p class="dashboard-empty-subtitle">Crea personajes desde el panel de control o espera la sincronizacion.</p></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<div class="dashboard-grid"><!--[-->`);
      const each_array = ensure_array_like(store_get($$store_subs ??= {}, "$characters", characters));
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let character = each_array[$$index];
        DashboardCard($$renderer2, { character });
      }
      $$renderer2.push(`<!--]--></div>`);
    }
    $$renderer2.push(`<!--]--> <section class="dashboard-meta"><div class="dashboard-log"><div class="dashboard-log-head"><h2 class="dashboard-log-title">Ultimas acciones</h2></div> <ul class="dashboard-log-list"><!--[-->`);
    const each_array_1 = ensure_array_like(actionHistory());
    for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
      let entry = each_array_1[$$index_1];
      $$renderer2.push(`<li class="dashboard-log-item"><span class="dashboard-log-time">${escape_html(formatTime(entry.timestamp))}</span> <div class="dashboard-log-body"><span class="dashboard-log-label">${escape_html(entry.label)}</span> <span class="dashboard-log-value">${escape_html(entry.value)}</span> `);
      if (entry.detail) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<span class="dashboard-log-detail">${escape_html(entry.detail)}</span>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--></div></li>`);
    }
    $$renderer2.push(`<!--]--></ul></div> <div class="dashboard-log"><div class="dashboard-log-head"><h2 class="dashboard-log-title">Ultimos dados</h2></div> <ul class="dashboard-log-list"><!--[-->`);
    const each_array_2 = ensure_array_like(rollHistory());
    for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
      let entry = each_array_2[$$index_2];
      $$renderer2.push(`<li class="dashboard-log-item"><span class="dashboard-log-time">${escape_html(formatTime(entry.timestamp))}</span> <div class="dashboard-log-body"><span class="dashboard-log-label">${escape_html(entry.label)}</span> <span class="dashboard-log-value">${escape_html(entry.value)}</span> `);
      if (entry.detail) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<span class="dashboard-log-detail">${escape_html(entry.detail)}</span>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--></div></li>`);
    }
    $$renderer2.push(`<!--]--></ul></div></section></section>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}

export { _page as default };
//# sourceMappingURL=_page.svelte-B6bzClFb.js.map
