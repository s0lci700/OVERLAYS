import { f as attr_class, d as store_get, h as unsubscribe_stores } from './index2-Bm6XKjCP.js';
import { p as page } from './stores-Bup0C1Bq.js';
import './root-Cc1zMo0i.js';
import './state.svelte-C9IS90BG.js';

function _layout($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let { children } = $$props;
    children($$renderer2);
    $$renderer2.push(`<!----> <nav class="bottom-nav"><a${attr_class("nav-tab", void 0, {
      "active": store_get($$store_subs ??= {}, "$page", page).url.pathname.includes("/create")
    })} href="/management/create"><span class="nav-icon">＋</span> <span class="nav-label">CREAR</span></a> <a${attr_class("nav-tab", void 0, {
      "active": store_get($$store_subs ??= {}, "$page", page).url.pathname.includes("/manage")
    })} href="/management/manage"><span class="nav-icon">⛭</span> <span class="nav-label">GESTIONAR</span></a></nav>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}

export { _layout as default };
//# sourceMappingURL=_layout.svelte-Bx8gIUH0.js.map
