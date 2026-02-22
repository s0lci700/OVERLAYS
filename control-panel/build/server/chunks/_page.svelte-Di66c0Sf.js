import { aj as ensure_array_like, f as store_get, c as escape_html, ai as attr, d as attr_class, h as unsubscribe_stores, j as derived } from './index2-Cj7uYY7n.js';
import { c as characters, l as lastRoll } from './socket-DMJiBPKB.js';
import { g as get } from './index-D7gxnwqs.js';
import 'socket.io-client';

function DiceRoller($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let selectedCharId = get(characters)[0]?.id;
    let modifier = 0;
    const isCrit = derived(() => store_get($$store_subs ??= {}, "$lastRoll", lastRoll)?.result === 20 && store_get($$store_subs ??= {}, "$lastRoll", lastRoll)?.sides === 20);
    const isFail = derived(() => store_get($$store_subs ??= {}, "$lastRoll", lastRoll)?.result === 1);
    $$renderer2.push(`<div class="dice-panel"><div class="char-selector"><label class="selector-label" for="char-select">PERSONAJE ACTIVO</label> <div class="select-wrap">`);
    $$renderer2.select(
      {
        id: "char-select",
        value: (
          // ═══════════════════════════════════════════════════════════════
          // Reactive Effects
          // ═══════════════════════════════════════════════════════════════
          /**
           * Watches for new rolls from the server and triggers the animation effect.
           * Uses tick() to ensure DOM elements are rendered before querying them.
           */
          /** @type {HTMLElement | null} */
          /** @type {HTMLElement | null} */
          selectedCharId
        )
      },
      ($$renderer3) => {
        $$renderer3.push(`<!--[-->`);
        const each_array = ensure_array_like(store_get($$store_subs ??= {}, "$characters", characters));
        for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
          let character = each_array[$$index];
          $$renderer3.option({ value: character.id }, ($$renderer4) => {
            $$renderer4.push(`${escape_html(character.name)}`);
          });
        }
        $$renderer3.push(`<!--]-->`);
      }
    );
    $$renderer2.push(` <span class="select-arrow" aria-hidden="true">▾</span></div></div> <div class="modifier-input"><label class="modifier-label" for="modifier">MODIFICADOR</label> <div class="modifier-stepper-cluster"><button class="modifier-stepper" aria-label="Reducir modificador">−</button> <input id="modifier" class="modifier-value" type="number"${attr("value", modifier)} min="-20" max="20"/> <button class="modifier-stepper" aria-label="Aumentar modificador">+</button></div></div> <div class="dice-grid"><!--[-->`);
    const each_array_1 = ensure_array_like([4, 6, 8, 10, 12]);
    for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
      let diceType = each_array_1[$$index_1];
      $$renderer2.push(`<button class="dice-btn"><span${attr_class(`dice-icon dice-icon--d${diceType}`)} aria-hidden="true"></span> <span class="dice-label">d${escape_html(diceType)}</span></button>`);
    }
    $$renderer2.push(`<!--]--> <button class="dice-btn d20-btn"><span class="dice-icon dice-icon--d20" aria-hidden="true"></span> <span class="dice-label">d20</span></button></div> `);
    if (store_get($$store_subs ??= {}, "$lastRoll", lastRoll)) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div${attr_class("roll-result", void 0, { "is-crit": isCrit(), "is-fail": isFail() })}><div class="roll-die-label">D${escape_html(store_get($$store_subs ??= {}, "$lastRoll", lastRoll).sides)}</div> <div${attr_class("roll-number", void 0, { "crit": isCrit(), "fail": isFail() })}>${escape_html(store_get($$store_subs ??= {}, "$lastRoll", lastRoll).rollResult)}</div> <div${attr_class("roll-label", void 0, { "crit": isCrit(), "fail": isFail() })}>`);
      if (isCrit()) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`¡CRÍTICO!`);
      } else if (isFail()) {
        $$renderer2.push("<!--[1-->");
        $$renderer2.push(`¡PIFIA!`);
      } else {
        $$renderer2.push("<!--[!-->");
        $$renderer2.push(`${escape_html(store_get($$store_subs ??= {}, "$lastRoll", lastRoll).characterName ?? store_get($$store_subs ??= {}, "$lastRoll", lastRoll).charId)}`);
      }
      $$renderer2.push(`<!--]--></div></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
function _page($$renderer) {
  $$renderer.push(`<section class="tab-panel">`);
  DiceRoller($$renderer);
  $$renderer.push(`<!----></section>`);
}

export { _page as default };
//# sourceMappingURL=_page.svelte-Di66c0Sf.js.map
