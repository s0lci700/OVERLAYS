/*
Source Of Truth: PocketBase persistent records
Owned by: Stage (Player for self-authored notes; DM/Player limited by policy)
Mirrored to: Stage, Cast (DM/Players), and summaries to Commons/Audience via API
*/
export type RecordID = string; // Unique identifier for a record in PocketBase
/* ## Persistent Record Contracts (PocketBase)

### Character Record

Used by:

- Stage setup/manage
- Player sheet
- DM reference

Contains:

- profile / identity
- mechanical base
- roleplay fields

Examples:

- character_profile
- character_mechanics
- character_notes
- character_equipment

### Entity Records

Examples:

- npc
- enemy
- lore_entry
- template
- codex_entry
- location

### Campaign / Session Records

Examples:

- campaign
- session
- map
- terrain
- reveal_preset
*/