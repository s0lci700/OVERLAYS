import { a as attr_class, s as store_get, u as unsubscribe_stores } from "../../../chunks/index2.js";
import { p as page } from "../../../chunks/stores.js";
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
export {
  _layout as default
};
