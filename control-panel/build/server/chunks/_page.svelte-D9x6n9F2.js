import { d as attr_class, f as store_get, aj as ensure_array_like, ai as attr, c as escape_html, h as unsubscribe_stores } from './index2-Cj7uYY7n.js';
import { c as characterOptions } from './character-options.template-B37ut2lx.js';
import { c as characters, S as SERVER_URL } from './socket-DMJiBPKB.js';
import 'socket.io-client';
import './index-D7gxnwqs.js';

function CharacterManagement($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let isSavingProfileById = {};
    let profileFeedbackById = {};
    let nameById = {};
    let playerById = {};
    let hpMaxById = {};
    let armorClassById = {};
    let speedWalkById = {};
    let classPrimaryById = {};
    let classSubclassById = {};
    let classLevelById = {};
    let backgroundNameById = {};
    let backgroundFeatById = {};
    let speciesNameById = {};
    let speciesSizeById = {};
    let alignmentById = {};
    let languagesById = {};
    let rareLanguagesById = {};
    let skillsById = {};
    let toolsById = {};
    let armorById = {};
    let weaponsById = {};
    let itemsById = {};
    let trinketById = {};
    let editOpenById = {};
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
    new Set(rareLanguageOptions.map((option) => option.key));
    const labelMaps = {
      class: new Map(classOptions.map((option) => [option.key, option.label])),
      species: new Map(speciesOptions.map((option) => [option.key, option.label])),
      alignment: new Map(alignmentOptions.map((option) => [option.key, option.label]))
    };
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
    function updateField(map, charId, value) {
      map = { ...map, [charId]: value };
      return map;
    }
    function updateListField(map, charId, values) {
      map = { ...map, [charId]: Array.isArray(values) ? values : [] };
      return map;
    }
    function getSelectValues(event) {
      return Array.from(event.currentTarget.selectedOptions).map((option) => option.value);
    }
    function resolveLabel(map, key, fallback) {
      if (!key) return fallback;
      return map?.get(key) || key;
    }
    function buildClassSummary(charId) {
      const classKey = classPrimaryById[charId];
      if (!classKey) return "Clase no definida";
      const label = resolveLabel(labelMaps.class, classKey, classKey);
      const level = Number(classLevelById[charId] ?? 1) || 1;
      return `${label} ${level}`;
    }
    $$renderer2.push(`<section class="character-management" aria-labelledby="manage-character-title"><div class="manage-header"><h2 id="manage-character-title" class="manage-title">GESTION DE PERSONAJES</h2></div> <div${attr_class("characters-grid", void 0, {
      "grid-three": store_get($$store_subs ??= {}, "$characters", characters).length > 2
    })}><!--[-->`);
    const each_array = ensure_array_like(store_get($$store_subs ??= {}, "$characters", characters));
    for (let $$index_15 = 0, $$length = each_array.length; $$index_15 < $$length; $$index_15++) {
      let character = each_array[$$index_15];
      $$renderer2.push(`<article class="manage-card card-base"${attr("data-char-id", character.id)}><header class="manage-card-head"><div class="manage-identity"><button class="manage-photo-btn" type="button"${attr("aria-label", `Editar foto de ${character.name}`)}><img class="manage-photo"${attr("src", resolvePhotoSrc(character.photo))}${attr("alt", character.name)}/> <span class="manage-photo-hint">Editar foto</span></button> <div class="manage-names"><h3 class="manage-char-name">${escape_html(character.name)}</h3> <span class="manage-char-player">${escape_html(character.player)}</span></div></div> <button class="btn-base manage-edit-toggle" type="button"${attr("aria-expanded", editOpenById[character.id] ? "true" : "false")}>${escape_html(editOpenById[character.id] ? "CERRAR EDICION" : "EDITAR PERSONAJE")}</button></header> `);
      if (!editOpenById[character.id]) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div class="manage-summary"><span>${escape_html(buildClassSummary(character.id))}</span> <span class="manage-summary-sep">•</span> <span>${escape_html(resolveLabel(labelMaps.species, speciesNameById[character.id], "Especie no definida"))}</span> <span class="manage-summary-sep">•</span> <span>${escape_html(resolveLabel(labelMaps.alignment, alignmentById[character.id], "Alineamiento no definido"))}</span></div>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--> `);
      if (editOpenById[character.id]) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div class="manage-form"><label class="manage-field"><span class="label-caps">Nombre</span> <input type="text"${attr("value", nameById[character.id])} maxlength="40"/></label> <label class="manage-field"><span class="label-caps">Jugador</span> <input type="text"${attr("value", playerById[character.id])} maxlength="40"/></label> <div class="manage-grid-fields"><label class="manage-field"><span class="label-caps">HP MAX</span> <input type="number" min="1" max="999"${attr("value", hpMaxById[character.id])}/></label> <label class="manage-field"><span class="label-caps">AC</span> <input type="number" min="0" max="99"${attr("value", armorClassById[character.id])}/></label> <label class="manage-field"><span class="label-caps">VEL</span> <input type="number" min="0" max="200"${attr("value", speedWalkById[character.id])}/></label></div> <div class="manage-section"><h4 class="manage-section-title">Opciones de personaje</h4> <div class="manage-grid-two"><label class="manage-field"><span class="label-caps">Clase</span> `);
        $$renderer2.select(
          {
            value: classPrimaryById[character.id],
            oninput: (event) => classPrimaryById = updateField(classPrimaryById, character.id, event.currentTarget.value)
          },
          ($$renderer3) => {
            $$renderer3.option({ value: "" }, ($$renderer4) => {
              $$renderer4.push(`Sin definir`);
            });
            $$renderer3.push(`<!--[-->`);
            const each_array_1 = ensure_array_like(classOptions);
            for (let $$index = 0, $$length2 = each_array_1.length; $$index < $$length2; $$index++) {
              let option = each_array_1[$$index];
              $$renderer3.option({ value: option.key }, ($$renderer4) => {
                $$renderer4.push(`${escape_html(option.label)}`);
              });
            }
            $$renderer3.push(`<!--]-->`);
          }
        );
        $$renderer2.push(`</label> <label class="manage-field"><span class="label-caps">Subclase</span> `);
        $$renderer2.select(
          {
            value: classSubclassById[character.id],
            oninput: (event) => classSubclassById = updateField(classSubclassById, character.id, event.currentTarget.value),
            disabled: subclassOptions.length === 0
          },
          ($$renderer3) => {
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
              const each_array_2 = ensure_array_like(subclassOptions);
              for (let $$index_1 = 0, $$length2 = each_array_2.length; $$index_1 < $$length2; $$index_1++) {
                let option = each_array_2[$$index_1];
                $$renderer3.option({ value: option.key }, ($$renderer4) => {
                  $$renderer4.push(`${escape_html(option.label)}`);
                });
              }
              $$renderer3.push(`<!--]-->`);
            }
            $$renderer3.push(`<!--]-->`);
          }
        );
        $$renderer2.push(`</label> <label class="manage-field"><span class="label-caps">Nivel</span> <input type="number" min="1" max="20"${attr("value", classLevelById[character.id])}/></label> <label class="manage-field"><span class="label-caps">Background</span> `);
        $$renderer2.select(
          {
            value: backgroundNameById[character.id],
            oninput: (event) => backgroundNameById = updateField(backgroundNameById, character.id, event.currentTarget.value)
          },
          ($$renderer3) => {
            $$renderer3.option({ value: "" }, ($$renderer4) => {
              $$renderer4.push(`Sin definir`);
            });
            $$renderer3.push(`<!--[-->`);
            const each_array_3 = ensure_array_like(backgroundOptions);
            for (let $$index_2 = 0, $$length2 = each_array_3.length; $$index_2 < $$length2; $$index_2++) {
              let option = each_array_3[$$index_2];
              $$renderer3.option({ value: option.key }, ($$renderer4) => {
                $$renderer4.push(`${escape_html(option.label)}`);
              });
            }
            $$renderer3.push(`<!--]-->`);
          }
        );
        $$renderer2.push(`</label> <label class="manage-field"><span class="label-caps">Feat</span> `);
        $$renderer2.select(
          {
            value: backgroundFeatById[character.id],
            oninput: (event) => backgroundFeatById = updateField(backgroundFeatById, character.id, event.currentTarget.value),
            disabled: featOptions.length === 0
          },
          ($$renderer3) => {
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
              const each_array_4 = ensure_array_like(featOptions);
              for (let $$index_3 = 0, $$length2 = each_array_4.length; $$index_3 < $$length2; $$index_3++) {
                let option = each_array_4[$$index_3];
                $$renderer3.option({ value: option.key }, ($$renderer4) => {
                  $$renderer4.push(`${escape_html(option.label)}`);
                });
              }
              $$renderer3.push(`<!--]-->`);
            }
            $$renderer3.push(`<!--]-->`);
          }
        );
        $$renderer2.push(`</label> <label class="manage-field"><span class="label-caps">Especie</span> `);
        $$renderer2.select(
          {
            value: speciesNameById[character.id],
            oninput: (event) => speciesNameById = updateField(speciesNameById, character.id, event.currentTarget.value)
          },
          ($$renderer3) => {
            $$renderer3.option({ value: "" }, ($$renderer4) => {
              $$renderer4.push(`Sin definir`);
            });
            $$renderer3.push(`<!--[-->`);
            const each_array_5 = ensure_array_like(speciesOptions);
            for (let $$index_4 = 0, $$length2 = each_array_5.length; $$index_4 < $$length2; $$index_4++) {
              let option = each_array_5[$$index_4];
              $$renderer3.option({ value: option.key }, ($$renderer4) => {
                $$renderer4.push(`${escape_html(option.label)}`);
              });
            }
            $$renderer3.push(`<!--]-->`);
          }
        );
        $$renderer2.push(`</label> <label class="manage-field"><span class="label-caps">Tamaño</span> `);
        $$renderer2.select(
          {
            value: speciesSizeById[character.id],
            oninput: (event) => speciesSizeById = updateField(speciesSizeById, character.id, event.currentTarget.value)
          },
          ($$renderer3) => {
            $$renderer3.option({ value: "" }, ($$renderer4) => {
              $$renderer4.push(`Sin definir`);
            });
            $$renderer3.push(`<!--[-->`);
            const each_array_6 = ensure_array_like(sizeOptions);
            for (let $$index_5 = 0, $$length2 = each_array_6.length; $$index_5 < $$length2; $$index_5++) {
              let option = each_array_6[$$index_5];
              $$renderer3.option({ value: option.key }, ($$renderer4) => {
                $$renderer4.push(`${escape_html(option.label)}`);
              });
            }
            $$renderer3.push(`<!--]-->`);
          }
        );
        $$renderer2.push(`</label> <label class="manage-field"><span class="label-caps">Alineamiento</span> `);
        $$renderer2.select(
          {
            value: alignmentById[character.id],
            oninput: (event) => alignmentById = updateField(alignmentById, character.id, event.currentTarget.value)
          },
          ($$renderer3) => {
            $$renderer3.option({ value: "" }, ($$renderer4) => {
              $$renderer4.push(`Sin definir`);
            });
            $$renderer3.push(`<!--[-->`);
            const each_array_7 = ensure_array_like(alignmentOptions);
            for (let $$index_6 = 0, $$length2 = each_array_7.length; $$index_6 < $$length2; $$index_6++) {
              let option = each_array_7[$$index_6];
              $$renderer3.option({ value: option.key }, ($$renderer4) => {
                $$renderer4.push(`${escape_html(option.label)}`);
              });
            }
            $$renderer3.push(`<!--]-->`);
          }
        );
        $$renderer2.push(`</label></div></div> <div class="manage-section"><h4 class="manage-section-title">Idiomas y proficiencias</h4> <div class="manage-grid-two"><label class="manage-field"><span class="label-caps">Idiomas</span> `);
        $$renderer2.select(
          {
            multiple: true,
            size: Math.max(3, Math.min(6, languageOptions.length || 3)),
            value: languagesById[character.id],
            oninput: (event) => languagesById = updateListField(languagesById, character.id, getSelectValues(event))
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
              const each_array_8 = ensure_array_like(languageOptions);
              for (let $$index_7 = 0, $$length2 = each_array_8.length; $$index_7 < $$length2; $$index_7++) {
                let option = each_array_8[$$index_7];
                $$renderer3.option(
                  {
                    value: option.key,
                    selected: languagesById[character.id]?.includes(option.key)
                  },
                  ($$renderer4) => {
                    $$renderer4.push(`${escape_html(option.label)}`);
                  }
                );
              }
              $$renderer3.push(`<!--]-->`);
            }
            $$renderer3.push(`<!--]-->`);
          }
        );
        $$renderer2.push(`</label> <label class="manage-field"><span class="label-caps">Idiomas raros</span> `);
        $$renderer2.select(
          {
            multiple: true,
            size: Math.max(3, Math.min(6, rareLanguageOptions.length || 3)),
            value: rareLanguagesById[character.id],
            oninput: (event) => rareLanguagesById = updateListField(rareLanguagesById, character.id, getSelectValues(event))
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
              const each_array_9 = ensure_array_like(rareLanguageOptions);
              for (let $$index_8 = 0, $$length2 = each_array_9.length; $$index_8 < $$length2; $$index_8++) {
                let option = each_array_9[$$index_8];
                $$renderer3.option(
                  {
                    value: option.key,
                    selected: rareLanguagesById[character.id]?.includes(option.key)
                  },
                  ($$renderer4) => {
                    $$renderer4.push(`${escape_html(option.label)}`);
                  }
                );
              }
              $$renderer3.push(`<!--]-->`);
            }
            $$renderer3.push(`<!--]-->`);
          }
        );
        $$renderer2.push(`</label></div> <div class="manage-grid-two"><label class="manage-field"><span class="label-caps">Skills</span> `);
        $$renderer2.select(
          {
            multiple: true,
            size: Math.max(4, Math.min(8, skillOptions.length || 4)),
            value: skillsById[character.id],
            oninput: (event) => skillsById = updateListField(skillsById, character.id, getSelectValues(event))
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
              const each_array_10 = ensure_array_like(skillOptions);
              for (let $$index_9 = 0, $$length2 = each_array_10.length; $$index_9 < $$length2; $$index_9++) {
                let option = each_array_10[$$index_9];
                $$renderer3.option(
                  {
                    value: option.key,
                    selected: skillsById[character.id]?.includes(option.key)
                  },
                  ($$renderer4) => {
                    $$renderer4.push(`${escape_html(option.label)}`);
                  }
                );
              }
              $$renderer3.push(`<!--]-->`);
            }
            $$renderer3.push(`<!--]-->`);
          }
        );
        $$renderer2.push(`</label> <label class="manage-field"><span class="label-caps">Herramientas</span> `);
        $$renderer2.select(
          {
            multiple: true,
            size: Math.max(4, Math.min(8, toolOptions.length || 4)),
            value: toolsById[character.id],
            oninput: (event) => toolsById = updateListField(toolsById, character.id, getSelectValues(event))
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
              const each_array_11 = ensure_array_like(toolOptions);
              for (let $$index_10 = 0, $$length2 = each_array_11.length; $$index_10 < $$length2; $$index_10++) {
                let option = each_array_11[$$index_10];
                $$renderer3.option(
                  {
                    value: option.key,
                    selected: toolsById[character.id]?.includes(option.key)
                  },
                  ($$renderer4) => {
                    $$renderer4.push(`${escape_html(option.label)}`);
                  }
                );
              }
              $$renderer3.push(`<!--]-->`);
            }
            $$renderer3.push(`<!--]-->`);
          }
        );
        $$renderer2.push(`</label></div> <div class="manage-grid-two"><label class="manage-field"><span class="label-caps">Armadura</span> `);
        $$renderer2.select(
          {
            multiple: true,
            size: Math.max(3, Math.min(6, armorOptions.length || 3)),
            value: armorById[character.id],
            oninput: (event) => armorById = updateListField(armorById, character.id, getSelectValues(event))
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
              const each_array_12 = ensure_array_like(armorOptions);
              for (let $$index_11 = 0, $$length2 = each_array_12.length; $$index_11 < $$length2; $$index_11++) {
                let option = each_array_12[$$index_11];
                $$renderer3.option(
                  {
                    value: option.key,
                    selected: armorById[character.id]?.includes(option.key)
                  },
                  ($$renderer4) => {
                    $$renderer4.push(`${escape_html(option.label)}`);
                  }
                );
              }
              $$renderer3.push(`<!--]-->`);
            }
            $$renderer3.push(`<!--]-->`);
          }
        );
        $$renderer2.push(`</label> <label class="manage-field"><span class="label-caps">Armas</span> `);
        $$renderer2.select(
          {
            multiple: true,
            size: Math.max(3, Math.min(6, weaponOptions.length || 3)),
            value: weaponsById[character.id],
            oninput: (event) => weaponsById = updateListField(weaponsById, character.id, getSelectValues(event))
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
              const each_array_13 = ensure_array_like(weaponOptions);
              for (let $$index_12 = 0, $$length2 = each_array_13.length; $$index_12 < $$length2; $$index_12++) {
                let option = each_array_13[$$index_12];
                $$renderer3.option(
                  {
                    value: option.key,
                    selected: weaponsById[character.id]?.includes(option.key)
                  },
                  ($$renderer4) => {
                    $$renderer4.push(`${escape_html(option.label)}`);
                  }
                );
              }
              $$renderer3.push(`<!--]-->`);
            }
            $$renderer3.push(`<!--]-->`);
          }
        );
        $$renderer2.push(`</label></div></div> <div class="manage-section"><h4 class="manage-section-title">Equipo</h4> <div class="manage-grid-two"><label class="manage-field"><span class="label-caps">Items</span> `);
        $$renderer2.select(
          {
            multiple: true,
            size: Math.max(3, Math.min(6, itemOptions.length || 3)),
            value: itemsById[character.id],
            oninput: (event) => itemsById = updateListField(itemsById, character.id, getSelectValues(event)),
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
              const each_array_14 = ensure_array_like(itemOptions);
              for (let $$index_13 = 0, $$length2 = each_array_14.length; $$index_13 < $$length2; $$index_13++) {
                let option = each_array_14[$$index_13];
                $$renderer3.option(
                  {
                    value: option.key,
                    selected: itemsById[character.id]?.includes(option.key)
                  },
                  ($$renderer4) => {
                    $$renderer4.push(`${escape_html(option.label)}`);
                  }
                );
              }
              $$renderer3.push(`<!--]-->`);
            }
            $$renderer3.push(`<!--]-->`);
          }
        );
        $$renderer2.push(`</label> <label class="manage-field"><span class="label-caps">Trinket</span> `);
        $$renderer2.select(
          {
            value: trinketById[character.id],
            oninput: (event) => trinketById = updateField(trinketById, character.id, event.currentTarget.value),
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
              const each_array_15 = ensure_array_like(trinketOptions);
              for (let $$index_14 = 0, $$length2 = each_array_15.length; $$index_14 < $$length2; $$index_14++) {
                let option = each_array_15[$$index_14];
                $$renderer3.option({ value: option.key }, ($$renderer4) => {
                  $$renderer4.push(`${escape_html(option.label)}`);
                });
              }
              $$renderer3.push(`<!--]-->`);
            }
            $$renderer3.push(`<!--]-->`);
          }
        );
        $$renderer2.push(`</label></div></div> <div class="manage-actions"><button class="btn-base manage-save-btn manage-save-btn--outline" type="button"${attr("disabled", isSavingProfileById[character.id], true)}>SUBIR NIVEL</button> <button class="btn-base manage-save-btn manage-save-btn--neutral" type="button"${attr("disabled", isSavingProfileById[character.id], true)}>${escape_html(isSavingProfileById[character.id] ? "GUARDANDO..." : "GUARDAR DATOS")}</button> `);
        if (profileFeedbackById[character.id]?.text) {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<span${attr_class(`manage-feedback ${profileFeedbackById[character.id].type}`)}>${escape_html(profileFeedbackById[character.id].text)}</span>`);
        } else {
          $$renderer2.push("<!--[!-->");
        }
        $$renderer2.push(`<!--]--> <span class="manage-note">Subir nivel solo ajusta el nivel por ahora.</span></div></div>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--></article>`);
    }
    $$renderer2.push(`<!--]--></div></section> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]-->`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
function _page($$renderer) {
  $$renderer.push(`<section class="tab-panel">`);
  CharacterManagement($$renderer);
  $$renderer.push(`<!----></section>`);
}

export { _page as default };
//# sourceMappingURL=_page.svelte-D9x6n9F2.js.map
