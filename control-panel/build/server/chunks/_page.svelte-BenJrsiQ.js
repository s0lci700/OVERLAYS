import { aj as attr, c as escape_html, a4 as derived } from './index2-Bm6XKjCP.js';
import { P as PhotoSourcePicker } from './PhotoSourcePicker-DMgUDme_.js';
import { S as SERVER_URL } from './socket-DmIQDCCJ.js';
import 'socket.io-client';
import './index-U49jboUm.js';

function CharacterCreationForm($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let name = "";
    let player = "";
    let hpMax = 30;
    let armorClass = 10;
    let speedWalk = 30;
    let photoSource = "preset";
    let photo = "";
    let customPhotoUrl = "";
    let localPhotoDataUrl = "";
    let isSubmitting = false;
    let errorMessage = "";
    const AVAILABLE_PHOTOS = [
      { label: "Aleatorio", value: "" },
      { label: "Barbarian", value: "/assets/img/barbarian.png" },
      { label: "Elf", value: "/assets/img/elf.png" },
      { label: "Wizard", value: "/assets/img/wizard.png" }
    ];
    const isFormValid = derived(() => name.trim().length > 0 && player.trim().length > 0 && hpMax > 0);
    function handlePhotoPickerError(message) {
      if (message) {
        errorMessage = message;
        return;
      }
      if (errorMessage === "El archivo debe ser una imagen." || errorMessage === "No se pudo procesar la imagen local.") {
        errorMessage = "";
      }
    }
    $$renderer2.push(`<section class="character-create card-base" aria-labelledby="create-character-title"><div class="create-header"><h2 id="create-character-title" class="create-title">NUEVO PERSONAJE</h2> <p class="create-subtitle">Scaffold base para alta rápida en sesión</p></div> <form class="create-form"><div class="create-layout"><div class="create-fields"><label class="create-field"><span class="label-caps">Nombre</span> <input type="text" placeholder="Ej. Valeria"${attr("value", name)} maxlength="40" required=""/></label> <label class="create-field"><span class="label-caps">Jugador</span> <input type="text" placeholder="Ej. Sol"${attr("value", player)} maxlength="40" required=""/></label> <div class="create-grid"><label class="create-field"><span class="label-caps">HP MAX</span> <input type="number" min="1" max="999"${attr("value", hpMax)} required=""/></label> <label class="create-field"><span class="label-caps">AC</span> <input type="number" min="0" max="99"${attr("value", armorClass)}/></label> <label class="create-field"><span class="label-caps">VEL</span> <input type="number" min="0" max="200"${attr("value", speedWalk)}/></label></div></div> <aside class="create-photo">`);
    PhotoSourcePicker($$renderer2, {
      options: AVAILABLE_PHOTOS,
      source: photoSource,
      presetValue: photo,
      urlValue: customPhotoUrl,
      localValue: localPhotoDataUrl,
      serverUrl: SERVER_URL,
      dense: true,
      onSourceChange: (value) => photoSource = value,
      onPresetChange: (value) => photo = value,
      onUrlChange: (value) => customPhotoUrl = value,
      onLocalChange: (value) => localPhotoDataUrl = value,
      onError: handlePhotoPickerError
    });
    $$renderer2.push(`<!----></aside></div> <button class="create-submit btn-base" type="submit"${attr("disabled", !isFormValid() || isSubmitting, true)}>${escape_html("CREAR PERSONAJE")}</button> `);
    if (errorMessage) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<p class="create-feedback error">${escape_html(errorMessage)}</p>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></form></section>`);
  });
}
function _page($$renderer) {
  $$renderer.push(`<section class="tab-panel">`);
  CharacterCreationForm($$renderer);
  $$renderer.push(`<!----></section>`);
}

export { _page as default };
//# sourceMappingURL=_page.svelte-BenJrsiQ.js.map
