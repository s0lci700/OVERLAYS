import { a as attr_class, a8 as attr, e as escape_html, a9 as stringify, aa as attr_style, ab as ensure_array_like, a7 as derived, s as store_get, u as unsubscribe_stores } from "../../../../chunks/index2.js";
import { S as SERVER_URL, c as characters } from "../../../../chunks/socket.js";
function CharacterCard($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const FALLBACK_PHOTO_OPTIONS = [
      "/assets/img/barbarian.png",
      "/assets/img/elf.png",
      "/assets/img/wizard.png"
    ];
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
    let { character } = $$props;
    let amount = 5;
    let isVisualCollapsed = false;
    const hpPercent = derived(() => character.hp_current / character.hp_max * 100);
    const hpClass = derived(() => hpPercent() > 60 ? "hp--healthy" : hpPercent() > 30 ? "hp--injured" : "hp--critical");
    const photoSrc = derived(() => resolvePhotoSrc(character.photo));
    $$renderer2.push(`<article${attr_class("char-card card-base", void 0, {
      "is-critical": hpPercent() <= 30,
      "collapsed": isVisualCollapsed
    })}${attr("data-char-id", character.id)}><div class="hit-flash"></div> <div class="char-header"><img${attr("src", photoSrc())}${attr("alt", character.name)} class="char-photo" loading="lazy" onerror="this.__e=event"/> <div class="char-identity"><h2 class="char-name">${escape_html(character.name)}</h2> <span class="char-player">${escape_html(character.player)}</span></div> <div class="char-header-actions"><div class="char-hp-nums"><span${attr_class("hp-cur", void 0, { "critical": hpPercent() <= 30 })}>${escape_html(character.hp_current)}</span> <span class="hp-sep">/</span> <span class="hp-max">${escape_html(character.hp_max)}</span></div> <button class="collapse-toggle" type="button"${attr("aria-expanded", true)}${attr("aria-controls", `char-body-${character.id}`)}><span class="collapse-icon" aria-hidden="true">▾</span> <span class="sr-only">${escape_html("Colapsar")}</span></button></div></div>  <div class="hp-track" role="progressbar"${attr("aria-valuenow", character.hp_current)}${attr("aria-valuemax", character.hp_max)} aria-label="Puntos de vida"><div${attr_class(`hp-fill ${stringify(hpClass())}`)}${attr_style(`width: ${stringify(hpPercent())}%`)}></div></div> <div class="char-body"${attr("id", `char-body-${character.id}`)}><div class="char-stats"><div class="stat-item"><span class="stat-label">CA</span> <span class="stat-value">${escape_html(character.armor_class)}</span></div> <span class="stat-divider">|</span> <div class="stat-item"><span class="stat-label">VEL</span> <span class="stat-value">${escape_html(character.speed_walk)}ft</span></div></div> `);
    if (character.conditions && character.conditions.length > 0) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="conditions-row"><!--[-->`);
      const each_array = ensure_array_like(character.conditions);
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let condition = each_array[$$index];
        $$renderer2.push(`<button class="condition-pill">${escape_html(condition.condition_name)} ×</button>`);
      }
      $$renderer2.push(`<!--]--></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> `);
    if (character.resources && character.resources.length > 0) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="resources-section"><!--[-->`);
      const each_array_1 = ensure_array_like(character.resources);
      for (let $$index_2 = 0, $$length = each_array_1.length; $$index_2 < $$length; $$index_2++) {
        let resource = each_array_1[$$index_2];
        $$renderer2.push(`<div class="resource-row"><span class="resource-label">${escape_html(resource.name)}</span> <div class="resource-pips"><!--[-->`);
        const each_array_2 = ensure_array_like(Array(resource.pool_max));
        for (let i = 0, $$length2 = each_array_2.length; i < $$length2; i++) {
          each_array_2[i];
          const filled = i < resource.pool_current;
          $$renderer2.push(`<button${attr_class(`pip pip--${stringify(resource.recharge.toLowerCase())} ${stringify(filled ? "pip--filled" : "pip--empty")}`)}${attr("aria-label", `${stringify(filled ? "Gastar" : "Recuperar")} ${stringify(resource.name)}`)}></button>`);
        }
        $$renderer2.push(`<!--]--></div></div>`);
      }
      $$renderer2.push(`<!--]--></div> <fieldset class="rest-buttons"><legend class="rest-label">DESCANSOS</legend> <button class="btn-base btn-rest">CORTO</button> <button class="btn-base btn-rest">LARGO</button></fieldset>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> <div class="char-controls"><button class="btn-base btn-damage">− DAÑO</button> <div class="stepper-cluster"><button class="stepper" aria-label="Reducir"><span class="stepper-text">−</span></button> <input class="amount-input" type="number"${attr("value", amount)} min="1" max="999" aria-label="Cantidad"/> <button class="stepper" aria-label="Aumentar"><span class="stepper-text">+</span></button></div> <button class="btn-base btn-heal">+ CURAR</button></div></div></article>`);
  });
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    $$renderer2.push(`<div${attr_class("characters-grid", void 0, {
      "grid-three": store_get($$store_subs ??= {}, "$characters", characters).length > 2
    })}><!--[-->`);
    const each_array = ensure_array_like(store_get($$store_subs ??= {}, "$characters", characters));
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let character = each_array[$$index];
      CharacterCard($$renderer2, { character });
    }
    $$renderer2.push(`<!--]--></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  _page as default
};
