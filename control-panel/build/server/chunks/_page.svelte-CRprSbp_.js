import { ai as ensure_array_like, d as store_get, aj as attr, c as escape_html, f as attr_class, h as unsubscribe_stores } from './index2-Bm6XKjCP.js';
import { P as PhotoSourcePicker } from './PhotoSourcePicker-DMgUDme_.js';
import { c as characters, S as SERVER_URL } from './socket-DmIQDCCJ.js';
import 'socket.io-client';
import './index-U49jboUm.js';

function CharacterManagement($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const PHOTO_OPTIONS = [
      { label: "Aleatorio", value: "" },
      { label: "Barbarian", value: "/assets/img/barbarian.png" },
      { label: "Elf", value: "/assets/img/elf.png" },
      { label: "Wizard", value: "/assets/img/wizard.png" }
    ];
    let photoSourceById = {};
    let presetPhotoById = {};
    let customUrlById = {};
    let localPhotoById = {};
    let isSavingById = {};
    let feedbackById = {};
    function setPhotoSource(charId, source) {
      photoSourceById = { ...photoSourceById, [charId]: source };
      feedbackById = { ...feedbackById, [charId]: { type: "", text: "" } };
    }
    function setPresetPhoto(charId, value) {
      presetPhotoById = { ...presetPhotoById, [charId]: value };
    }
    function setCustomPhotoUrl(charId, value) {
      customUrlById = { ...customUrlById, [charId]: value };
    }
    function setLocalPhoto(charId, value) {
      localPhotoById = { ...localPhotoById, [charId]: value };
    }
    function handlePickerError(charId, message) {
      if (!message) {
        if (feedbackById[charId]?.type === "error") {
          feedbackById = { ...feedbackById, [charId]: { type: "", text: "" } };
        }
        return;
      }
      feedbackById = { ...feedbackById, [charId]: { type: "error", text: message } };
    }
    $$renderer2.push(`<section class="character-management" aria-labelledby="manage-character-title"><div class="manage-header card-base"><h2 id="manage-character-title" class="manage-title">GESTIÓN DE FOTOS</h2> <p class="manage-subtitle">Preset or URL or Local File + drag &amp; drop</p></div> <div class="manage-grid"><!--[-->`);
    const each_array = ensure_array_like(store_get($$store_subs ??= {}, "$characters", characters));
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let character = each_array[$$index];
      $$renderer2.push(`<article class="manage-card card-base"${attr("data-char-id", character.id)}><header class="manage-card-head"><h3 class="manage-char-name">${escape_html(character.name)}</h3> <span class="manage-char-player">${escape_html(character.player)}</span></header> `);
      PhotoSourcePicker($$renderer2, {
        title: "Foto: Preset or URL or Local File",
        options: PHOTO_OPTIONS,
        dense: true,
        source: photoSourceById[character.id] || "preset",
        presetValue: presetPhotoById[character.id] || "",
        urlValue: customUrlById[character.id] || "",
        localValue: localPhotoById[character.id] || "",
        serverUrl: SERVER_URL,
        onSourceChange: (value) => setPhotoSource(character.id, value),
        onPresetChange: (value) => setPresetPhoto(character.id, value),
        onUrlChange: (value) => setCustomPhotoUrl(character.id, value),
        onLocalChange: (value) => setLocalPhoto(character.id, value),
        onError: (message) => handlePickerError(character.id, message)
      });
      $$renderer2.push(`<!----> <button class="btn-base manage-save-btn" type="button"${attr("disabled", isSavingById[character.id], true)}>${escape_html(isSavingById[character.id] ? "GUARDANDO..." : "ACTUALIZAR FOTO")}</button> `);
      if (feedbackById[character.id]?.text) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<p${attr_class(`manage-feedback ${feedbackById[character.id].type}`)}>${escape_html(feedbackById[character.id].text)}</p>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--></article>`);
    }
    $$renderer2.push(`<!--]--></div></section>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
function _page($$renderer) {
  $$renderer.push(`<section class="tab-panel">`);
  CharacterManagement($$renderer);
  $$renderer.push(`<!----></section>`);
}

export { _page as default };
//# sourceMappingURL=_page.svelte-CRprSbp_.js.map
