import { d as attr_class, f as store_get, h as unsubscribe_stores } from './index2-Cj7uYY7n.js';
import { p as page } from './stores--iiyZnyU.js';
import './root-Bkd_M1-B.js';
import './state.svelte-BpOwNV9T.js';

function _layout($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let { children } = $$props;
    children($$renderer2);
    $$renderer2.push(`<!----> <nav class="bottom-nav"><a${attr_class("nav-tab", void 0, {
      "active": store_get($$store_subs ??= {}, "$page", page).url.pathname === "/management/create"
    })} href="/management/create"><span class="nav-icon">＋</span> <span class="nav-label">CREAR</span></a> <a${attr_class("nav-tab", void 0, {
      "active": store_get($$store_subs ??= {}, "$page", page).url.pathname === "/management/manage"
    })} href="/management/manage"><span class="nav-icon">⛭</span> <span class="nav-label">GESTIONAR</span></a></nav>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}

export { _layout as default };
//# sourceMappingURL=_layout.svelte-Cv9J-6w9.js.map
