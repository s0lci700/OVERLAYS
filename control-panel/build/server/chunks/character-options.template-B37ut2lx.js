const classes = [{ "key": "barbarian", "label": "Barbarian" }, { "key": "bard", "label": "Bard" }, { "key": "cleric", "label": "Cleric" }, { "key": "druid", "label": "Druid" }, { "key": "fighter", "label": "Fighter" }, { "key": "monk", "label": "Monk" }, { "key": "paladin", "label": "Paladin" }, { "key": "ranger", "label": "Ranger" }, { "key": "rogue", "label": "Rogue" }, { "key": "sorcerer", "label": "Sorcerer" }, { "key": "warlock", "label": "Warlock" }, { "key": "wizard", "label": "Wizard" }];
const subclasses = [];
const backgrounds = [{ "key": "acolyte", "label": "Acolyte" }, { "key": "criminal", "label": "Criminal" }, { "key": "sage", "label": "Sage" }, { "key": "soldier", "label": "Soldier" }];
const feats = [];
const species = [{ "key": "dragonborn", "label": "Dragonborn" }, { "key": "dwarf", "label": "Dwarf" }, { "key": "elf", "label": "Elf" }, { "key": "gnome", "label": "Gnome" }, { "key": "goliath", "label": "Goliath" }, { "key": "halfling", "label": "Halfling" }, { "key": "human", "label": "Human" }, { "key": "orc", "label": "Orc" }, { "key": "tiefling", "label": "Tiefling" }];
const sizes = [{ "key": "small", "label": "Small" }, { "key": "medium", "label": "Medium" }];
const languages = [{ "key": "common", "label": "Common" }, { "key": "common_sign", "label": "Common Sign Language" }, { "key": "draconic", "label": "Draconic" }, { "key": "dwarvish", "label": "Dwarvish" }, { "key": "elvish", "label": "Elvish" }, { "key": "giant", "label": "Giant" }, { "key": "gnomish", "label": "Gnomish" }, { "key": "goblin", "label": "Goblin" }, { "key": "halfling", "label": "Halfling" }, { "key": "orc", "label": "Orc" }];
const rare_languages = [{ "key": "abyssal", "label": "Abyssal" }, { "key": "celestial", "label": "Celestial" }, { "key": "deep_speech", "label": "Deep Speech" }, { "key": "druidic", "label": "Druidic" }, { "key": "infernal", "label": "Infernal" }, { "key": "primordial", "label": "Primordial" }, { "key": "sylvan", "label": "Sylvan" }, { "key": "thieves_cant", "label": "Thieves' Cant" }, { "key": "undercommon", "label": "Undercommon" }];
const alignments = [{ "key": "lg", "label": "Lawful Good" }, { "key": "ng", "label": "Neutral Good" }, { "key": "cg", "label": "Chaotic Good" }, { "key": "ln", "label": "Lawful Neutral" }, { "key": "n", "label": "Neutral" }, { "key": "cn", "label": "Chaotic Neutral" }, { "key": "le", "label": "Lawful Evil" }, { "key": "ne", "label": "Neutral Evil" }, { "key": "ce", "label": "Chaotic Evil" }];
const skills = [{ "key": "athletics", "label": "Athletics" }, { "key": "acrobatics", "label": "Acrobatics" }, { "key": "sleight_of_hand", "label": "Sleight of Hand" }, { "key": "stealth", "label": "Stealth" }, { "key": "arcana", "label": "Arcana" }, { "key": "history", "label": "History" }, { "key": "investigation", "label": "Investigation" }, { "key": "nature", "label": "Nature" }, { "key": "religion", "label": "Religion" }, { "key": "animal_handling", "label": "Animal Handling" }, { "key": "insight", "label": "Insight" }, { "key": "medicine", "label": "Medicine" }, { "key": "perception", "label": "Perception" }, { "key": "survival", "label": "Survival" }, { "key": "deception", "label": "Deception" }, { "key": "intimidation", "label": "Intimidation" }, { "key": "performance", "label": "Performance" }, { "key": "persuasion", "label": "Persuasion" }];
const tools = [{ "key": "alchemists_supplies", "label": "Alchemist's Supplies" }, { "key": "brewers_supplies", "label": "Brewer's Supplies" }, { "key": "calligraphers_supplies", "label": "Calligrapher's Supplies" }, { "key": "carpenters_tools", "label": "Carpenter's Tools" }, { "key": "cobblers_tools", "label": "Cobbler's Tools" }, { "key": "cooks_utensils", "label": "Cook's Utensils" }, { "key": "glassblowers_tools", "label": "Glassblower's Tools" }, { "key": "jewelers_tools", "label": "Jeweler's Tools" }, { "key": "leatherworkers_tools", "label": "Leatherworker's Tools" }, { "key": "masons_tools", "label": "Mason's Tools" }, { "key": "painters_supplies", "label": "Painter's Supplies" }, { "key": "potters_tools", "label": "Potter's Tools" }, { "key": "smiths_tools", "label": "Smith's Tools" }, { "key": "tinkers_tools", "label": "Tinker's Tools" }, { "key": "weavers_tools", "label": "Weaver's Tools" }, { "key": "woodcarvers_tools", "label": "Woodcarver's Tools" }, { "key": "disguise_kit", "label": "Disguise Kit" }, { "key": "forgery_kit", "label": "Forgery Kit" }, { "key": "gaming_set", "label": "Gaming Set" }, { "key": "herbalism_kit", "label": "Herbalism Kit" }, { "key": "musical_instrument", "label": "Musical Instrument" }, { "key": "navigator_tools", "label": "Navigator's Tools" }, { "key": "poisoners_kit", "label": "Poisoner's Kit" }, { "key": "thieves_tools", "label": "Thieves' Tools" }];
const armor_proficiencies = [{ "key": "light", "label": "Light" }, { "key": "medium", "label": "Medium" }, { "key": "heavy", "label": "Heavy" }, { "key": "shields", "label": "Shields" }];
const weapon_proficiencies = [{ "key": "simple", "label": "Simple" }, { "key": "martial", "label": "Martial" }];
const items = [];
const trinkets = [];
const characterOptions = {
  classes,
  subclasses,
  backgrounds,
  feats,
  species,
  sizes,
  languages,
  rare_languages,
  alignments,
  skills,
  tools,
  armor_proficiencies,
  weapon_proficiencies,
  items,
  trinkets
};

export { characterOptions as c };
//# sourceMappingURL=character-options.template-B37ut2lx.js.map
