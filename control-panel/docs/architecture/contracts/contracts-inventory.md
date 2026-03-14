# Contracts Inventory

This document is the source-of-truth inventory for the project's contracts.

Contract families:

1. Persistent records (PocketBase)
2. Live session state (Express + Socket.io)
3. Events (transient)
4. Display/view contracts

---

## Persistent Record Contracts (PocketBase)

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

---

## Live Session State (Socket.io)

### Character Live State

Fields:

- hp_current
- hp_temp
- resource_values
- conditions

### Combat State

Fields:

- combatActive
- roundNumber
- initiativeOrder
- activeIndex
- activeCombatantId

Owned by DM, mirrored to Commons.

### Scene State

Fields:

- location
- scene_label
- terrain_flags

### Queue State

Fields:

- reveal_queue
- payload_ready
- publish_status

---

## Event Contracts

### Dice Result Event

Fields:

- roll_type
- dice_results
- selected_die
- total
- target
- outcome
- critical

Represents ONE resolved test.

### Mutation Events

Examples:

- hp_updated
- condition_added
- condition_removed
- resource_updated
- combat_started
- turn_advanced
- location_updated

---

## Display Contracts

### Audience Overlay Payloads

Examples:

- party_stats_overlay
- dice_result_overlay
- character_intro_overlay
- info_block_overlay

Characteristics:

- display-only
- TTL-aware
- logic-free

### Commons Display

Examples:

- commons_party_status
- commons_combat_state
- commons_location_context

---

## Record‑Driven Route Rule

These routes should render from records first:

/players/[id]
/dm/npcs/[id]
/dm/enemies/[id]
/dm/lore/[id]

Live-first routes:

/live/characters
/live/dice
/live/queue
/dm
/session-display

---

## Contract Modules

src/lib/contracts/events.js
src/lib/contracts/rolls.js
src/lib/contracts/stage.js
src/lib/contracts/cast.js
src/lib/contracts/commons.js
src/lib/contracts/overlays.js

---

## Summary

PocketBase stores records.  
Express + Socket.io orchestrates live state and events.  
SvelteKit renders views built from those contracts.
