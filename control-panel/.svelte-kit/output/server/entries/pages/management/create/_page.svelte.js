import "clsx";
import { a as attr_class, e as escape_html, ab as ensure_array_like, a8 as attr, d as derived } from "../../../../chunks/index2.js";
import { c as characterOptions } from "../../../../chunks/character-options.template.js";
import { S as SERVER_URL } from "../../../../chunks/socket.js";
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
      onPresetChange = () => {
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
function CharacterCreationForm($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let name = "";
    let player = "";
    let hpMax = 30;
    let armorClass = 10;
    let speedWalk = 30;
    let classPrimary = "";
    let classSubclass = "";
    let classLevel = 1;
    let backgroundName = "";
    let backgroundFeat = "";
    let speciesName = "";
    let speciesSize = "";
    let alignment = "";
    let selectedLanguages = [];
    let selectedRareLanguages = [];
    let selectedSkills = [];
    let selectedTools = [];
    let selectedArmorProficiencies = [];
    let selectedWeaponProficiencies = [];
    let selectedItems = [];
    let selectedTrinket = "";
    let photoSource = "preset";
    let photo = "";
    let customPhotoUrl = "";
    let localPhotoDataUrl = "";
    let isSubmitting = false;
    const AVAILABLE_PHOTOS = [
      { label: "Aleatorio", value: "" },
      { label: "Barbarian", value: "/assets/img/barbarian.png" },
      { label: "Elf", value: "/assets/img/elf.png" },
      { label: "Wizard", value: "/assets/img/wizard.png" }
    ];
    const optionSets = characterOptions || {};
    const classOptions = optionSets.classes || [];
    const subclassOptions = optionSets.subclasses || [];
    const backgroundOptions = optionSets.backgrounds || [];
    const featOptions = optionSets.feats || [];
    const speciesOptions = optionSets.species || [];
    const sizeOptions = optionSets.sizes || [];
    const languageOptions = optionSets.languages || [];
    const rareLanguageOptions = optionSets.rare_languages || [];
    const alignmentOptions = optionSets.alignments || [];
    const skillOptions = optionSets.skills || [];
    const toolOptions = optionSets.tools || [];
    const armorOptions = optionSets.armor_proficiencies || [];
    const weaponOptions = optionSets.weapon_proficiencies || [];
    const itemOptions = optionSets.items || [];
    const trinketOptions = optionSets.trinkets || [];
    const isFormValid = derived(() => name.trim().length > 0 && player.trim().length > 0 && hpMax > 0);
    $$renderer2.push(`<section class="character-create card-base" aria-labelledby="create-character-title"><div class="create-header"><h2 id="create-character-title" class="create-title">NUEVO PERSONAJE</h2> <p class="create-subtitle">Scaffold base para alta rápida en sesión</p></div> <form class="create-form"><div class="create-layout"><div class="create-fields"><label class="create-field"><span class="label-caps">Nombre</span> <input type="text" placeholder="Ej. Valeria"${attr("value", name)} maxlength="40" required=""/></label> <label class="create-field"><span class="label-caps">Jugador</span> <input type="text" placeholder="Ej. Sol"${attr("value", player)} maxlength="40" required=""/></label> <div class="create-grid"><label class="create-field"><span class="label-caps">HP MAX</span> <input type="number" min="1" max="999"${attr("value", hpMax)} required=""/></label> <label class="create-field"><span class="label-caps">AC</span> <input type="number" min="0" max="99"${attr("value", armorClass)}/></label> <label class="create-field"><span class="label-caps">VEL</span> <input type="number" min="0" max="200"${attr("value", speedWalk)}/></label></div> <div class="create-section"><h3 class="section-title">Opciones de personaje</h3> <div class="create-grid create-grid--two"><label class="create-field"><span class="label-caps">Clase</span> `);
    $$renderer2.select({ value: classPrimary }, ($$renderer3) => {
      $$renderer3.option({ value: "" }, ($$renderer4) => {
        $$renderer4.push(`Sin definir`);
      });
      $$renderer3.push(`<!--[-->`);
      const each_array = ensure_array_like(classOptions);
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let option = each_array[$$index];
        $$renderer3.option({ value: option.key }, ($$renderer4) => {
          $$renderer4.push(`${escape_html(option.label)}`);
        });
      }
      $$renderer3.push(`<!--]-->`);
    });
    $$renderer2.push(`</label> <label class="create-field"><span class="label-caps">Subclase</span> `);
    $$renderer2.select({ value: classSubclass, disabled: subclassOptions.length === 0 }, ($$renderer3) => {
      if (subclassOptions.length === 0) {
        $$renderer3.push("<!--[-->");
        $$renderer3.option({ value: "" }, ($$renderer4) => {
          $$renderer4.push(`Sin opciones`);
        });
      } else {
        $$renderer3.push("<!--[!-->");
        $$renderer3.option({ value: "" }, ($$renderer4) => {
          $$renderer4.push(`Sin definir`);
        });
        $$renderer3.push(` <!--[-->`);
        const each_array_1 = ensure_array_like(subclassOptions);
        for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
          let option = each_array_1[$$index_1];
          $$renderer3.option({ value: option.key }, ($$renderer4) => {
            $$renderer4.push(`${escape_html(option.label)}`);
          });
        }
        $$renderer3.push(`<!--]-->`);
      }
      $$renderer3.push(`<!--]-->`);
    });
    $$renderer2.push(`</label> <label class="create-field"><span class="label-caps">Nivel</span> <input type="number" min="1" max="20"${attr("value", classLevel)}/></label> <label class="create-field"><span class="label-caps">Background</span> `);
    $$renderer2.select({ value: backgroundName }, ($$renderer3) => {
      $$renderer3.option({ value: "" }, ($$renderer4) => {
        $$renderer4.push(`Sin definir`);
      });
      $$renderer3.push(`<!--[-->`);
      const each_array_2 = ensure_array_like(backgroundOptions);
      for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
        let option = each_array_2[$$index_2];
        $$renderer3.option({ value: option.key }, ($$renderer4) => {
          $$renderer4.push(`${escape_html(option.label)}`);
        });
      }
      $$renderer3.push(`<!--]-->`);
    });
    $$renderer2.push(`</label> <label class="create-field"><span class="label-caps">Feat</span> `);
    $$renderer2.select({ value: backgroundFeat, disabled: featOptions.length === 0 }, ($$renderer3) => {
      if (featOptions.length === 0) {
        $$renderer3.push("<!--[-->");
        $$renderer3.option({ value: "" }, ($$renderer4) => {
          $$renderer4.push(`Sin opciones`);
        });
      } else {
        $$renderer3.push("<!--[!-->");
        $$renderer3.option({ value: "" }, ($$renderer4) => {
          $$renderer4.push(`Sin definir`);
        });
        $$renderer3.push(` <!--[-->`);
        const each_array_3 = ensure_array_like(featOptions);
        for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
          let option = each_array_3[$$index_3];
          $$renderer3.option({ value: option.key }, ($$renderer4) => {
            $$renderer4.push(`${escape_html(option.label)}`);
          });
        }
        $$renderer3.push(`<!--]-->`);
      }
      $$renderer3.push(`<!--]-->`);
    });
    $$renderer2.push(`</label> <label class="create-field"><span class="label-caps">Especie</span> `);
    $$renderer2.select({ value: speciesName }, ($$renderer3) => {
      $$renderer3.option({ value: "" }, ($$renderer4) => {
        $$renderer4.push(`Sin definir`);
      });
      $$renderer3.push(`<!--[-->`);
      const each_array_4 = ensure_array_like(speciesOptions);
      for (let $$index_4 = 0, $$length = each_array_4.length; $$index_4 < $$length; $$index_4++) {
        let option = each_array_4[$$index_4];
        $$renderer3.option({ value: option.key }, ($$renderer4) => {
          $$renderer4.push(`${escape_html(option.label)}`);
        });
      }
      $$renderer3.push(`<!--]-->`);
    });
    $$renderer2.push(`</label> <label class="create-field"><span class="label-caps">Tamaño</span> `);
    $$renderer2.select({ value: speciesSize }, ($$renderer3) => {
      $$renderer3.option({ value: "" }, ($$renderer4) => {
        $$renderer4.push(`Sin definir`);
      });
      $$renderer3.push(`<!--[-->`);
      const each_array_5 = ensure_array_like(sizeOptions);
      for (let $$index_5 = 0, $$length = each_array_5.length; $$index_5 < $$length; $$index_5++) {
        let option = each_array_5[$$index_5];
        $$renderer3.option({ value: option.key }, ($$renderer4) => {
          $$renderer4.push(`${escape_html(option.label)}`);
        });
      }
      $$renderer3.push(`<!--]-->`);
    });
    $$renderer2.push(`</label> <label class="create-field"><span class="label-caps">Alineamiento</span> `);
    $$renderer2.select({ value: alignment }, ($$renderer3) => {
      $$renderer3.option({ value: "" }, ($$renderer4) => {
        $$renderer4.push(`Sin definir`);
      });
      $$renderer3.push(`<!--[-->`);
      const each_array_6 = ensure_array_like(alignmentOptions);
      for (let $$index_6 = 0, $$length = each_array_6.length; $$index_6 < $$length; $$index_6++) {
        let option = each_array_6[$$index_6];
        $$renderer3.option({ value: option.key }, ($$renderer4) => {
          $$renderer4.push(`${escape_html(option.label)}`);
        });
      }
      $$renderer3.push(`<!--]-->`);
    });
    $$renderer2.push(`</label></div> <div class="create-grid create-grid--two"><label class="create-field"><span class="label-caps">Idiomas</span> `);
    $$renderer2.select(
      {
        value: selectedLanguages,
        multiple: true,
        size: Math.max(3, Math.min(6, languageOptions.length || 3))
      },
      ($$renderer3) => {
        if (languageOptions.length === 0) {
          $$renderer3.push("<!--[-->");
          $$renderer3.option({ value: "" }, ($$renderer4) => {
            $$renderer4.push(`Sin opciones`);
          });
        } else {
          $$renderer3.push("<!--[!-->");
          $$renderer3.push(`<!--[-->`);
          const each_array_7 = ensure_array_like(languageOptions);
          for (let $$index_7 = 0, $$length = each_array_7.length; $$index_7 < $$length; $$index_7++) {
            let option = each_array_7[$$index_7];
            $$renderer3.option({ value: option.key }, ($$renderer4) => {
              $$renderer4.push(`${escape_html(option.label)}`);
            });
          }
          $$renderer3.push(`<!--]-->`);
        }
        $$renderer3.push(`<!--]-->`);
      }
    );
    $$renderer2.push(`</label> <label class="create-field"><span class="label-caps">Idiomas raros</span> `);
    $$renderer2.select(
      {
        value: selectedRareLanguages,
        multiple: true,
        size: Math.max(3, Math.min(6, rareLanguageOptions.length || 3))
      },
      ($$renderer3) => {
        if (rareLanguageOptions.length === 0) {
          $$renderer3.push("<!--[-->");
          $$renderer3.option({ value: "" }, ($$renderer4) => {
            $$renderer4.push(`Sin opciones`);
          });
        } else {
          $$renderer3.push("<!--[!-->");
          $$renderer3.push(`<!--[-->`);
          const each_array_8 = ensure_array_like(rareLanguageOptions);
          for (let $$index_8 = 0, $$length = each_array_8.length; $$index_8 < $$length; $$index_8++) {
            let option = each_array_8[$$index_8];
            $$renderer3.option({ value: option.key }, ($$renderer4) => {
              $$renderer4.push(`${escape_html(option.label)}`);
            });
          }
          $$renderer3.push(`<!--]-->`);
        }
        $$renderer3.push(`<!--]-->`);
      }
    );
    $$renderer2.push(`</label></div> <div class="create-grid create-grid--two"><label class="create-field"><span class="label-caps">Skills</span> `);
    $$renderer2.select(
      {
        value: selectedSkills,
        multiple: true,
        size: Math.max(4, Math.min(8, skillOptions.length || 4))
      },
      ($$renderer3) => {
        if (skillOptions.length === 0) {
          $$renderer3.push("<!--[-->");
          $$renderer3.option({ value: "" }, ($$renderer4) => {
            $$renderer4.push(`Sin opciones`);
          });
        } else {
          $$renderer3.push("<!--[!-->");
          $$renderer3.push(`<!--[-->`);
          const each_array_9 = ensure_array_like(skillOptions);
          for (let $$index_9 = 0, $$length = each_array_9.length; $$index_9 < $$length; $$index_9++) {
            let option = each_array_9[$$index_9];
            $$renderer3.option({ value: option.key }, ($$renderer4) => {
              $$renderer4.push(`${escape_html(option.label)}`);
            });
          }
          $$renderer3.push(`<!--]-->`);
        }
        $$renderer3.push(`<!--]-->`);
      }
    );
    $$renderer2.push(`</label> <label class="create-field"><span class="label-caps">Herramientas</span> `);
    $$renderer2.select(
      {
        value: selectedTools,
        multiple: true,
        size: Math.max(4, Math.min(8, toolOptions.length || 4))
      },
      ($$renderer3) => {
        if (toolOptions.length === 0) {
          $$renderer3.push("<!--[-->");
          $$renderer3.option({ value: "" }, ($$renderer4) => {
            $$renderer4.push(`Sin opciones`);
          });
        } else {
          $$renderer3.push("<!--[!-->");
          $$renderer3.push(`<!--[-->`);
          const each_array_10 = ensure_array_like(toolOptions);
          for (let $$index_10 = 0, $$length = each_array_10.length; $$index_10 < $$length; $$index_10++) {
            let option = each_array_10[$$index_10];
            $$renderer3.option({ value: option.key }, ($$renderer4) => {
              $$renderer4.push(`${escape_html(option.label)}`);
            });
          }
          $$renderer3.push(`<!--]-->`);
        }
        $$renderer3.push(`<!--]-->`);
      }
    );
    $$renderer2.push(`</label></div> <div class="create-grid create-grid--two"><label class="create-field"><span class="label-caps">Armadura</span> `);
    $$renderer2.select(
      {
        value: selectedArmorProficiencies,
        multiple: true,
        size: Math.max(3, Math.min(6, armorOptions.length || 3))
      },
      ($$renderer3) => {
        if (armorOptions.length === 0) {
          $$renderer3.push("<!--[-->");
          $$renderer3.option({ value: "" }, ($$renderer4) => {
            $$renderer4.push(`Sin opciones`);
          });
        } else {
          $$renderer3.push("<!--[!-->");
          $$renderer3.push(`<!--[-->`);
          const each_array_11 = ensure_array_like(armorOptions);
          for (let $$index_11 = 0, $$length = each_array_11.length; $$index_11 < $$length; $$index_11++) {
            let option = each_array_11[$$index_11];
            $$renderer3.option({ value: option.key }, ($$renderer4) => {
              $$renderer4.push(`${escape_html(option.label)}`);
            });
          }
          $$renderer3.push(`<!--]-->`);
        }
        $$renderer3.push(`<!--]-->`);
      }
    );
    $$renderer2.push(`</label> <label class="create-field"><span class="label-caps">Armas</span> `);
    $$renderer2.select(
      {
        value: selectedWeaponProficiencies,
        multiple: true,
        size: Math.max(3, Math.min(6, weaponOptions.length || 3))
      },
      ($$renderer3) => {
        if (weaponOptions.length === 0) {
          $$renderer3.push("<!--[-->");
          $$renderer3.option({ value: "" }, ($$renderer4) => {
            $$renderer4.push(`Sin opciones`);
          });
        } else {
          $$renderer3.push("<!--[!-->");
          $$renderer3.push(`<!--[-->`);
          const each_array_12 = ensure_array_like(weaponOptions);
          for (let $$index_12 = 0, $$length = each_array_12.length; $$index_12 < $$length; $$index_12++) {
            let option = each_array_12[$$index_12];
            $$renderer3.option({ value: option.key }, ($$renderer4) => {
              $$renderer4.push(`${escape_html(option.label)}`);
            });
          }
          $$renderer3.push(`<!--]-->`);
        }
        $$renderer3.push(`<!--]-->`);
      }
    );
    $$renderer2.push(`</label></div> <div class="create-grid create-grid--two"><label class="create-field"><span class="label-caps">Items</span> `);
    $$renderer2.select(
      {
        value: selectedItems,
        multiple: true,
        size: Math.max(3, Math.min(6, itemOptions.length || 3)),
        disabled: itemOptions.length === 0
      },
      ($$renderer3) => {
        if (itemOptions.length === 0) {
          $$renderer3.push("<!--[-->");
          $$renderer3.option({ value: "" }, ($$renderer4) => {
            $$renderer4.push(`Sin opciones`);
          });
        } else {
          $$renderer3.push("<!--[!-->");
          $$renderer3.push(`<!--[-->`);
          const each_array_13 = ensure_array_like(itemOptions);
          for (let $$index_13 = 0, $$length = each_array_13.length; $$index_13 < $$length; $$index_13++) {
            let option = each_array_13[$$index_13];
            $$renderer3.option({ value: option.key }, ($$renderer4) => {
              $$renderer4.push(`${escape_html(option.label)}`);
            });
          }
          $$renderer3.push(`<!--]-->`);
        }
        $$renderer3.push(`<!--]-->`);
      }
    );
    $$renderer2.push(`</label> <label class="create-field"><span class="label-caps">Trinket</span> `);
    $$renderer2.select(
      {
        value: selectedTrinket,
        disabled: trinketOptions.length === 0
      },
      ($$renderer3) => {
        if (trinketOptions.length === 0) {
          $$renderer3.push("<!--[-->");
          $$renderer3.option({ value: "" }, ($$renderer4) => {
            $$renderer4.push(`Sin opciones`);
          });
        } else {
          $$renderer3.push("<!--[!-->");
          $$renderer3.option({ value: "" }, ($$renderer4) => {
            $$renderer4.push(`Sin definir`);
          });
          $$renderer3.push(` <!--[-->`);
          const each_array_14 = ensure_array_like(trinketOptions);
          for (let $$index_14 = 0, $$length = each_array_14.length; $$index_14 < $$length; $$index_14++) {
            let option = each_array_14[$$index_14];
            $$renderer3.option({ value: option.key }, ($$renderer4) => {
              $$renderer4.push(`${escape_html(option.label)}`);
            });
          }
          $$renderer3.push(`<!--]-->`);
        }
        $$renderer3.push(`<!--]-->`);
      }
    );
    $$renderer2.push(`</label></div></div></div> <aside class="create-photo">`);
    PhotoSourcePicker($$renderer2, {
      options: AVAILABLE_PHOTOS,
      source: photoSource,
      presetValue: photo,
      urlValue: customPhotoUrl,
      localValue: localPhotoDataUrl,
      serverUrl: SERVER_URL,
      dense: true,
      onPresetChange: (value) => photo = value
    });
    $$renderer2.push(`<!----></aside></div> <button class="create-submit btn-base" type="submit"${attr("disabled", !isFormValid() || isSubmitting, true)}>${escape_html("CREAR PERSONAJE")}</button> `);
    {
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
export {
  _page as default
};
