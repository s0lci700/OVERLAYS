# State Ownership Matrix

This document defines **who owns what state** across the product surfaces:

- **Stage** — backstage control / write authority
- **Cast / DM** — facilitation and reference
- **Cast / Players** — private character sheets and player-safe reference
- **Commons** — shared in-room passive display
- **Audience** — OBS/vMix browser-source overlay clients
- **Production** — external broadcast/scene control

It is intended to be:

- easy to read
- easy to share
- easy to revise as the architecture settles

---

## Surface shorthand

- **PB** = PocketBase
- **API** = Express + Socket.io orchestration layer
- **Stage** = backstage operator/advisor surface
- **DM** = `(cast)/dm`
- **Players** = `(cast)/players/[id]`
- **Commons** = shared in-room display
- **Audience** = overlay/browser-source clients
- **Production** = OBS/vMix operators and broadcast tooling

---

## Matrix

| Domain | Source of truth | Primary writer | Allowed secondary writers | Main readers | Mirrored / transformed to | Persistent or live | Notes |
|---|---|---|---|---|---|---|---|
| Character profile / identity | PB | Stage | Player only for limited self-editable fields if allowed later | Player, DM, Stage | none by default | Persistent | Includes name, species, class, subclass, level, background, alignment, languages, portrait, ideals, bonds, flaws, descriptive notes |
| Character mechanical base | PB | Stage | none by default | Player, DM, Stage | Commons only through summaries if needed | Persistent | Includes ability scores, proficiencies, expertise, equipment definitions, spellcasting inputs, AC base, speed base, HP max |
| Character derived values | Derived from base data in app/API | none directly | none | Player, DM, Stage, Commons if needed | Audience only through explicit payloads | Computed | Includes modifiers, saves, skills, passives, spell save DC, spell attack bonus, compact attack summaries |
| Character live state | API-backed live session state, with PB persistence/snapshots where useful | Stage | DM only for tightly scoped facilitation actions if allowed | Player, DM, Stage, Commons | Audience through overlay payload contracts only | Live + optionally persisted | Includes HP current, temp HP, current resources, active conditions, active roster presence |
| Character notes / journal | PB | Player for their own notes | Stage or DM if shared/admin notes are supported | Player, DM, Stage | none by default | Persistent | Keep player-authored notes separate from backstage/admin notes if possible |
| Character codex unlocks / discovered info | PB | Stage | DM if “mark discovered” is allowed | Player, DM, Stage | Audience only through explicit reveal payloads | Persistent | Includes discovered creatures, NPCs, locations, items, clues |
| Combat turn state | API live session state | DM | Stage only as fallback/admin override if ever needed | DM, Commons, Stage optionally | Commons full passive mirror | Live / transient | Includes combat active, round number, initiative order, active turn, next turn |
| Dice / result events | API result event, resolved by backend logic | Stage | DM later only if you deliberately support it | Stage, Commons optionally, operator history | Audience result overlay, Commons compact highlight | Transient event, optionally logged | One roll event = one resolved test, even with advantage/disadvantage |
| Map / location state | Stage-managed session state, optionally persisted in PB | Stage | DM only if you explicitly allow facilitation edits | DM, Stage, Commons | Audience only through explicit location/map reveal payloads | Session state, optionally persistent | Includes current location, scene label, map reference, region/room |
| Terrain / environment state | Stage-managed session state, optionally persisted in PB | Stage | DM only if you explicitly allow it | DM, Stage, Commons | Audience only through explicit environment payloads | Session state, optionally persistent | Includes terrain tags, weather, darkness, hazards, difficult terrain, other shared context |
| Reveal / content queue | API + Stage queue state | Stage | none by default | Stage, operator overview | Audience and Commons via payload-specific transforms | Live / transient | Includes intro cards, info blocks, codex reveals, map/location updates, spotlight content |
| Overlay payloads | API-built display contracts | Stage | none by default | Audience clients, Stage operator preview | Audience directly; Commons only for selected shared-display payloads | Live / transient | Overlays should never own logic; they only connect, read, render, animate, self-hide |
| Commons display state | Transformed from Stage and DM-owned state | none directly in Commons | none | Everyone in room | n/a | Passive mirror | Includes party status, map/location, terrain/environment, combat order during combat |
| Operator overview / diagnostics | API + app runtime state | Stage | none | Stage operators | none | Live / diagnostic | Includes recent actions, queue status, service health, sync confidence |
| OBS/vMix on-air visibility | Production tools/workflow | Production | none inside app by default | Production, maybe Stage as advisory only | n/a | External operational state | Scene switching and source visibility should stay with production |
| Auth / identity session | PB auth + app session state | user sign-in flow / auth backend | none | relevant logged-in surfaces | none | Live session + persistent auth token/session | PB provides auth collections and auth refresh patterns |

---

## Key architectural rules

### 1. Stage is the main write-authority surface

Stage owns:

- setup
- live state mutation
- content/reveal orchestration
- operator-facing monitoring

Stage should not become:

- the DM tablet
- the Commons display
- the production switcher

### 2. DM owns combat facilitation state

DM should own:

- initiative order
- current turn
- round progression

Commons should mirror that state passively.

### 3. Players should read stable character records

Player sheets should be able to render primarily from:

- stable character record data
- derived values
- optional live state overlays

They should not require a full backstage/live runtime just to preview or read the sheet.

### 4. Commons is a passive shared mirror

Commons should read and present:

- party status
- current location/map
- terrain/environment
- combat order during combat

Commons should not control state.

### 5. Audience only renders payloads

Audience clients should:

- connect
- read payloads
- render
- animate
- self-hide on empty/expired/error state

They should not own:

- game logic
- show logic
- production visibility logic

### 6. Production owns on-air decisions

OBS/vMix visibility and scene switching should remain outside app authority by default.

---

## Character domain breakdown

To avoid collapsing everything into “character data,” it is useful to think in layers:

### Character profile / identity

Examples:

- name
- species
- class / subclass
- level
- background
- alignment
- languages
- portrait
- personality-style notes

### Character mechanical base

Examples:

- ability scores
- proficiencies
- equipment definitions
- spellcasting inputs
- HP max
- AC base
- speed base

### Character derived values

Examples:

- modifiers
- saving throws
- skills
- passive scores
- spell DC / spell attack

### Character live state

Examples:

- HP current
- temp HP
- current resources
- active conditions
- current roster presence

This split helps both architecture and DX.

---

## Dice/result model reminder

A dice event should be modeled as **one resolved test**.

That means:

- one roll type
- one or more raw rolled dice
- one selected die if advantage/disadvantage applies
- one final total
- one outcome
- one critical state policy

This keeps logic stable before any visual treatment.

---

## DX implications

This matrix suggests a few clear DX priorities later:

### Record-driven views

Routes like player sheets and DM detail views should be able to render from stable record loads.

### Live mirrors only where needed

Not every surface should depend on a full live socket session.

### TS shared contracts

Define shared contract modules for:

- roll types
- combat state keys
- overlay payload kinds
- shared state shapes

### Naming and docs sync

Keep route labels, product surfaces, and repo docs aligned so the mental model stays clear.

---

## Stack alignment notes

This model fits the current stack well:

- **SvelteKit** supports route groups and nested layouts, which is a good match for separating Stage, Cast, and Commons inside one app shell.
- **PocketBase** provides auth collections, record APIs, rules/filters, files, and realtime subscriptions.
- **PocketBase realtime is SSE-based**, so it complements rather than replaces the current Express + Socket.io orchestration layer.
- **Express + Socket.io** remains the better place for live session orchestration, event fan-out, and display payload shaping.

---

## One-line summary

Use **PocketBase for persistence/auth/files/relations**, **Express + Socket.io for live orchestration**, and keep the product surfaces honest:

- **Stage writes**
- **DM facilitates**
- **Players read and update only their safe fields**
- **Commons mirrors**
- **Audience renders**
- **Production broadcasts**
