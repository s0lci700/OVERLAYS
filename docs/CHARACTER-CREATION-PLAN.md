# Character Creation Plan (2024 rules)

Purpose: A structured, implementation-ready plan for expanding character creation
in this project, aligned with the 2024 DnD Beyond guidance. This is a
paraphrase/summary for design and engineering use.

## Goals

- Support a full creation flow for table use (DM + players).
- Keep it modular so we can start with a slim MVP and expand later.
- Align field names with existing data where practical, and document new fields.

## Creation Flow (User-facing steps)

1. Get Ready
   - Talk with DM (campaign tone, house rules, starting level, equipment).
   - Pick a sheet type (in-app in our case).

2. Choose a Class
   - Class selection + level (default 1; allow higher if DM sets it).
   - Record armor training, class features, and proficiencies (light detail now,
     deeper later if we build full rules support).

3. Determine Origin
   - Choose background (drives skills, tool proficiency, and an origin feat).
   - Choose species (size, speed, traits).
   - Choose languages (Common + 2 standard; allow rare if DM enables).
   - Record starting equipment (background + class + optional coins/trinket).

4. Determine Ability Scores
   - Generate scores (standard array, point cost, or roll).
   - Assign to STR/DEX/CON/INT/WIS/CHA.
   - Apply background-based increases (+2/+1 or +1/+1/+1).
   - Calculate ability modifiers.

5. Choose Alignment (optional but tracked)
   - Allow 9 alignments, optional/nullable if table ignores alignment.

6. Fill in Details
   - Name, appearance notes, personality hooks.
   - Compute derived stats (HP max, AC, initiative, passive perception,
     attacks, spell save DC and spell attack bonus when relevant).
   - Record class features and starting resources/spell slots.

7. Review + Save
   - Validate required fields, lock in choices, and create the character record.

## Proposed UI/UX Flow

- Stepper wizard with persistent summary sidebar.
- Save-as-draft at every step.
- DM options surface: starting level, allowed sources, language list, and
  equipment rules.

## Option Lists + Templates (Immediate Plan)

Any field that uses a fixed choice list should have a template-backed option
set. Until we wire the real rules data, we will:

- Expose only user-fillable fields in the UI.
- Provide placeholder templates for list-based fields.
- Store the selected value as a stable key (string) with a display label.

Suggested template structure (for later JSON files):

```
{
   "classes": [{ "key": "fighter", "label": "Fighter" }],
   "backgrounds": [{ "key": "soldier", "label": "Soldier" }],
   "species": [{ "key": "human", "label": "Human" }],
   "languages": [{ "key": "common", "label": "Common" }],
   "alignments": [{ "key": "lg", "label": "Lawful Good" }],
   "tools": [{ "key": "thieves_tools", "label": "Thieves' Tools" }],
   "skills": [{ "key": "perception", "label": "Perception" }]
}
```

Fields that should be list-backed:

- class_primary.name
- class_primary.subclass (when level allows it)
- background.name, background.feat
- species.name, species.size
- languages[]
- alignment
- proficiencies.skills[], proficiencies.saving_throws[], proficiencies.armor[],
  proficiencies.weapons[], proficiencies.tools[]
- equipment.items[] (later)

Template file (placeholder options used for demo):

- docs/character-options.template.json

## Data Model Extensions (Draft)

Current core fields (existing):

- id, name, player, hp_current, hp_max, hp_temp
- armor_class, speed_walk
- ability_scores { str, dex, con, int, wis, cha }
- conditions[], resources[], photo

Suggested additions (minimal set):

- class_primary { name, level, subclass? }
- background { name, feat?, skill_proficiencies[], tool_proficiency? }
- species { name, size, speed_walk, traits[] }
- languages[]
- alignment
- proficiencies { skills[], saving_throws[], armor[], weapons[], tools[] }
- equipment { items[], coins?, trinket? }
- notes { appearance?, personality?, ideals?, bonds?, flaws? }

Derived/optional fields (computed or later):

- ability_mods { str, dex, con, int, wis, cha }
- initiative, passive_perception
- hit_dice { type, count }
- spellcasting { ability, save_dc, attack_bonus, slots[], prepared_spells[] }
- attacks[] (weapon + bonus + damage)

## Validation Rules (v1)

- Required: name, player, class_primary.name, class_primary.level,
  background.name, species.name, ability_scores.
- Level >= 1; hp_max >= 1; hp_current between 0 and hp_max.
- Ability scores in 1..20 (post adjustments), modifiers derived.
- Languages min 3 unless DM overrides.

## Implementation Phases

Phase 1: Data capture + storage

- Add fields to character JSON structure.
- Update create form with new fields (class, background, species, languages,
  alignment).
- Keep derived stats simple (manual entry for HP/AC if needed).

Phase 2: Rules helpers

- Ability score generation helpers (array, point cost, roll).
- Auto-calc ability modifiers and passive perception.
- Optional computed HP max based on class + CON mod.

Phase 3: Equipment + spells

- Basic equipment selection and coins.
- Spellcasting section for caster classes.

Phase 4: DM configuration

- Campaign setup (allowed sources, starting level, house rules).

## Open Questions

- Will we store full equipment/spells or just the summary used in overlays?
- Do we support multiclassing in the MVP or defer to a later phase?
- How strict should validation be for a fast demo workflow?

## Source

Summary based on DnD Beyond 2024 "Creating a Character" guidance:
https://www.dndbeyond.com/sources/dnd/br-2024/creating-a-character
