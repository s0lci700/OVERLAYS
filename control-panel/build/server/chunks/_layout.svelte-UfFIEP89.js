import { c as escape_html, d as store_get, f as attr_class, h as unsubscribe_stores } from './index2-Bm6XKjCP.js';
import { p as page } from './stores-Bup0C1Bq.js';
import { s as socket, c as characters } from './socket-DmIQDCCJ.js';
import './root-Cc1zMo0i.js';
import './state.svelte-C9IS90BG.js';
import 'socket.io-client';
import './index-U49jboUm.js';

function _layout($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let connected = false;
    let isSidebarOpen = false;
    let { children } = $$props;
    socket.on("connect", () => connected = true);
    socket.on("disconnect", () => connected = false);
    $$renderer2.push(`<div class="app-shell"><header class="app-header"><div class="brand-wordmark"><span class="brand-block">ESDH</span> <span class="brand-script">TTRPG</span></div> <span class="page-title">${escape_html(store_get($$store_subs ??= {}, "$page", page).url.pathname.includes("/management") ? "GESTIÓN DE PERSONAJES" : "PANEL DE CONTROL")}</span> <div class="header-meta"><div${attr_class("conn-dot", void 0, { "connected": connected })}></div> <span class="header-count">${escape_html(store_get($$store_subs ??= {}, "$characters", characters).length)}</span> <button class="header-menu" type="button" aria-label="Abrir navegación">☰</button></div></header> <main class="app-main">`);
    children($$renderer2);
    $$renderer2.push(`<!----></main> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> <aside${attr_class("app-sidebar", void 0, { "open": isSidebarOpen })}><div class="app-sidebar-head"><h2 class="app-sidebar-title">NAVEGACIÓN</h2> <button class="app-sidebar-close" type="button" aria-label="Cerrar navegación">✕</button></div> <a${attr_class("app-sidebar-link", void 0, {
      "active": store_get($$store_subs ??= {}, "$page", page).url.pathname.startsWith("/control")
    })} href="/control/characters">PANEL DE CONTROL</a> <a${attr_class("app-sidebar-link", void 0, {
      "active": store_get($$store_subs ??= {}, "$page", page).url.pathname.startsWith("/management")
    })} href="/management/create">GESTIÓN DE PERSONAJES</a></aside></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}

export { _layout as default };
//# sourceMappingURL=_layout.svelte-UfFIEP89.js.map
