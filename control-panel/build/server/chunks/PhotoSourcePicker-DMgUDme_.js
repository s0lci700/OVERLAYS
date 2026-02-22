import { f as attr_class, c as escape_html, ai as ensure_array_like, aj as attr, a4 as derived } from './index2-Bm6XKjCP.js';

function PhotoSourcePicker($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let {
      title = "",
      options = [],
      source = "preset",
      presetValue = "",
      urlValue = "",
      localValue = "",
      dense = false,
      serverUrl = "",
      onSourceChange = () => {
      },
      onPresetChange = () => {
      },
      onUrlChange = () => {
      },
      onLocalChange = () => {
      },
      onError = () => {
      }
    } = $$props;
    let isDropActive = false;
    let previewLoadFailed = false;
    let fallbackPreview = "";
    function resolveOptionalPhotoSrc(photoPath) {
      if (!photoPath) return "";
      if (photoPath.startsWith("http://") || photoPath.startsWith("https://") || photoPath.startsWith("data:") || photoPath.startsWith("blob:")) {
        return photoPath;
      }
      if (photoPath.startsWith("/")) {
        return `${serverUrl}${photoPath}`;
      }
      return `${serverUrl}/${photoPath.replace(/^\/+/, "")}`;
    }
    const previewPhotoValue = derived(() => source === "local" ? localValue : source === "url" ? urlValue.trim() : presetValue);
    const previewPhotoSrc = derived(() => resolveOptionalPhotoSrc(previewPhotoValue()));
    $$renderer2.push(`<section${attr_class("photo-picker", void 0, { "dense": dense })} aria-label="Fuente de foto"><span class="label-caps">${escape_html(title)}</span> <div class="photo-content"><div class="photo-controls"><div class="photo-segment-controls" role="tablist" aria-label="Tipo de foto"><button type="button"${attr_class("photo-segment-btn", void 0, { "dense": dense, "active": source === "preset" })}>Preset</button> <button type="button"${attr_class("photo-segment-btn", void 0, { "dense": dense, "active": source === "url" })}>URL</button> <button type="button"${attr_class("photo-segment-btn", void 0, { "dense": dense, "active": source === "local" })}>Archivo Local</button></div> `);
    if (source === "preset") {
      $$renderer2.push("<!--[-->");
      $$renderer2.select(
        {
          class: "photo-select",
          value: presetValue,
          onchange: (event) => onPresetChange(event.currentTarget.value)
        },
        ($$renderer3) => {
          $$renderer3.push(`<!--[-->`);
          const each_array = ensure_array_like(options);
          for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
            let option = each_array[$$index];
            $$renderer3.option({ value: option.value }, ($$renderer4) => {
              $$renderer4.push(`${escape_html(option.label)}`);
            });
          }
          $$renderer3.push(`<!--]-->`);
        },
        void 0,
        { dense }
      );
    } else if (source === "url") {
      $$renderer2.push("<!--[1-->");
      $$renderer2.push(`<div${attr_class("photo-input-row", void 0, { "dense": dense })}><input type="url" placeholder="https://..."${attr("value", urlValue)}${attr_class("", void 0, { "dense": dense })}/> <button type="button"${attr_class("photo-clear-btn", void 0, { "dense": dense })} aria-label="Limpiar URL">✕</button></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<input type="file" class="photo-file-input-hidden" accept="image/*"/> <div${attr_class("photo-dropzone", void 0, { "dense": dense, "active": isDropActive })} role="button" tabindex="0"><span class="photo-dropzone-title">Arrastra imagen aquí</span> <span class="photo-dropzone-subtitle">o toca para elegir archivo</span></div> <div${attr_class("photo-input-row", void 0, { "dense": dense })}><input type="text"${attr_class("photo-file-input", void 0, { "dense": dense })} readonly=""${attr("value", localValue ? "Imagen local cargada ✅" : "Sin archivo")}/> <button type="button"${attr_class("photo-clear-btn", void 0, { "dense": dense })} aria-label="Limpiar archivo">✕</button></div>`);
    }
    $$renderer2.push(`<!--]--></div> `);
    if ((previewPhotoSrc() || fallbackPreview) && !previewLoadFailed) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="photo-preview-wrap" aria-live="polite"><span class="label-caps">Preview</span> <img${attr("src", previewPhotoSrc() || resolveOptionalPhotoSrc(fallbackPreview))} alt="Preview foto"${attr_class("photo-preview", void 0, { "dense": dense })} onerror="this.__e=event"/></div>`);
    } else if (previewPhotoSrc() && previewLoadFailed) ;
    else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div></section>`);
  });
}

export { PhotoSourcePicker as P };
//# sourceMappingURL=PhotoSourcePicker-DMgUDme_.js.map
