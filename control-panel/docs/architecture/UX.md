# UX.md — Product UX / IA Discussion Summary

## What this document is
This is a summary of the **UX discussion** for the project, with an emphasis on:

- product surfaces
- information architecture
- navigation structure
- interaction priorities
- mental-model consistency

It is **not** a visual design spec and it is **not** implementation code.

---

## 1. What kind of work this was

Most of the discussion so far has been a mix of:

- **product architecture**
- **information architecture (IA)**
- **navigation design**
- **interaction/UX strategy**

and only lightly about visual UI.

A useful distinction:

### Product architecture
Answers:
- what are the product surfaces?
- who uses each one?
- what does each one own?
- what must each one never own?

### Information architecture (IA)
Answers:
- how should the app be grouped?
- what routes belong together?
- what are the navigation categories?
- what is a home vs workflow vs detail route?

### UX / interaction design
Answers:
- what should feel easy and fast?
- what should be glanceable?
- what should be shallow or deep?
- what should be tablet-first?
- what should not distract the user?

### UI
Answers:
- how it looks visually
- spacing, color, type, motion, composition

We have mostly been doing the first three.

---

## 2. UX principles we established

## Principle A — preserve mental models
The app should not blur product surfaces together.

The strongest mental-model split is:

- **Stage** = backstage control / write authority
- **Cast** = private role-specific tools (DM + players)
- **Commons** = shared in-room display
- **Audience** = on-air/browser-source overlay clients

The app should communicate these surfaces clearly so users know where they are and what each area is for.

## Principle B — separate authority from presentation
Systems that **decide** state should not be the same as systems that merely **show** it.

Examples:
- Stage updates and prepares session state
- DM facilitates play
- Commons displays shared room state
- Audience displays overlay payloads
- Production decides what is on air

## Principle C — one state, multiple presentations
Where possible, use:
- one shared state model
- multiple surface-specific views

Examples:
- combat initiative state is owned in DM, mirrored to Commons
- character state is written via Stage, read in Cast and Commons, and selectively transformed for Audience

## Principle D — optimize by role, not by generic page type
Do not design “pages.”
Design around:
- the operator
- the DM
- the player
- the room
- the production/broadcast environment

---

## 3. Product surfaces

## Stage
Backstage control surface.

Used by:
- operator(s)
- advisor(s)
- backstage support

Owns:
- setup
- live state mutation
- content/reveal orchestration
- operator overview

Does not own:
- DM facilitation
- player private interaction
- OBS/vMix scene switching
- on-air visibility decisions

UX character:
- denser
- more explicit
- operational
- workflow-heavy
- high-frequency control surface

## Cast
Role-specific private tools.

Includes:
- **DM**
- **Players**

### DM
Tablet-first facilitation tool.

Should feel like:
- a digital DM screen
- reference-first
- low-friction
- minimal typing
- shallow navigation

Not:
- a production panel
- an overlay trigger desk
- a heavy admin console

### Players
Digital character sheet and player resource.

Should feel like:
- a smart sheet
- easy to scan
- easy to update
- helpful but not over-automated

Not:
- an overlay
- a rules engine
- a production/show tool

## Commons
Shared in-room display.

Should feel like:
- a wallboard / shared room HUD
- persistent
- passive
- easy to read from a distance

Good content:
- party status
- map/location context
- terrain/environment conditions
- combat turn order during combat

Bad content:
- controls
- long logs
- dense admin information
- DM-private details

## Audience
Separate browser-source overlay clients.

Should:
- connect
- read payloads
- render
- animate
- self-hide when appropriate

Should not:
- own game logic
- own show logic
- own production decisions

---

## 4. Information architecture model

The main operational app should not be thought of as “the control panel.”

It should be understood as:

> **one operational app shell with multiple internal surfaces**

Recommended internal route grouping:

- `(stage)`
- `(cast)`
- `(commons)`

Audience remains a separate overlay layer.

This keeps the app legible without forcing everything into one vague dashboard.

---

## 5. Route classification model

Every route should be thought of as one of four kinds:

## Home
A place a user can stay in.

Examples:
- `Stage / Live / Characters`
- `Cast / DM / Session`
- `Commons / Session Display`

## Workflow
A task route entered to complete something.

Examples:
- Stage dice entry/publish
- Stage reveal/content queue
- Stage setup/create/manage
- DM notes/templates

## Detail
A drill-down route focused on one entity.

Examples:
- NPC detail
- Enemy detail
- Lore detail
- Player sheet by ID

## Utility
A support/diagnostic screen.

Examples:
- operator overview
- service/sync confidence screens
- backstage logs

This classification reduces menu clutter and helps decide what deserves top prominence.

---

## 6. Top-level navigation UX

## Primary nav
The top-level nav should answer only:

> **Which product surface am I in?**

Recommended top-level nav:
- **Stage**
- **Cast**
- **Commons**

Avoid using vague labels like:
- Dashboard
- Management
- Control Panel

as the primary product categories.

## Surface-local nav
Once inside a surface, show only the navigation relevant to that surface.

### Stage local nav
- Live
- Setup
- Overview

Then inside Live:
- Characters
- Dice
- Queue

Then inside Setup:
- Create
- Manage
- Campaign
- Reveals

### Cast local nav
- DM
- Players

Then inside DM:
- Session
- NPCs
- Enemies
- Lore
- Notes
- Templates

### Commons local nav
- Session Display

Keep Commons intentionally shallow.

---

## 7. UX guidance by surface

## Stage UX
Stage is for backstage operators.

Good Stage UX:
- explicit controls
- denser information
- strong state clarity
- short, fast mutations
- clear queue/reveal workflows
- operator confidence indicators

Bad Stage UX:
- pretending to be a DM tool
- pretending to be production switching
- mixing slow prep and fast live work into one muddy flow

### Important Stage split
Stage has two types of work:

#### Fast live work
- HP
- conditions
- resources
- quick reveals
- publish/clear payloads

#### Slow prep work
- character creation/editing
- codex prep
- map/location prep
- template prep
- media management

These should be separated in the IA.

## DM UX
The DM uses a tablet during sessions.

Good DM UX:
- tablet-first
- one stable session home screen
- shallow sidebar
- drawers or slide-over detail views
- minimal writing
- large touch targets
- glanceable state
- combat turn tracking

Bad DM UX:
- production controls
- overlay visibility controls
- deep nested menus
- full-screen forms for tiny changes
- heavy backstage workflows

### DM mental model
The DM UI should feel like:
> **a digital DM screen**

not:
> **an admin dashboard**

## Player UX
Players need a digital sheet and safe campaign reference.

Good Player UX:
- clear sheet structure
- derived values visible
- low cognitive load
- rules help/tooltips
- notes/codex available without clutter

Bad Player UX:
- too much hidden complexity
- forcing them through admin workflows
- mixing player view with stage/operator concerns

## Commons UX
Commons is a room-facing shared display.

Good Commons UX:
- readable from a distance
- large labels and tiles
- passive presentation
- no controls
- map/location context
- terrain/environment conditions
- combat turn order during combat
- party status

Bad Commons UX:
- long action logs
- dense dice history
- backstage controls
- private player/DM content

---

## 8. Combat turn tracking UX

Combat turn tracking should be:

- **owned by DM**
- **mirrored to Commons**

This is one state with two presentations.

### DM view
Editable / facilitation-oriented:
- full initiative order
- round number
- current active combatant
- next / previous turn
- simple combatant management
- simple badges/conditions

### Commons view
Passive room-facing:
- full initiative order
- strong highlight for current turn
- lighter highlight for next
- round number
- minimal supporting detail

The important UX rule:
- Commons mirrors combat state
- Commons does not control combat

---

## 9. Dice/result UX

The dice interface should not be built visually first and invent logic later.

The right model is:

### A. Input
What happened at the table?
- roll type
- rolled dice
- modifier
- target

### B. Resolution
What does the game logic say?
- selected die
- total
- success/failure
- critical state

### C. Presentation
How is it displayed?
- result breakdown
- success/failure overlay
- critical flourish
- history/logging

This is important because “two dice” usually means:
- advantage
- disadvantage

which is still **one resolved test**, not two separate roll results.

Good dice UX:
- capture one test cleanly
- support advantage/disadvantage explicitly
- do not make the frontend infer rules from visuals

---

## 10. Shared display/dashboard clarification

The earlier “dashboard” concept created confusion because it was acting like a mix of:
- Stage
- Cast
- Audience

The clean solution is to treat it as **Commons**:
- a shared room display
- fed by Stage state
- not a backstage control panel
- not a private cast tool
- not an on-air overlay surface

This resolves the conceptual ambiguity.

---

## 11. Summary of key UX recommendations

### Structural

- Use clear product-surface boundaries
- keep Stage / Cast / Commons distinct
- keep Audience separate from the main app shell

### Navigation

- top-level nav by surface
- local nav by surface section
- details opened contextually, not as equal first-class tabs

### DM

- tablet-first
- low interaction cost
- session home + sidebar + drawers
- no production burden

### Players

- digital sheet first
- raw input data + derived sheet values
- simple, safe, readable

### Commons

- wallboard-style shared display
- party/map/terrain/combat awareness
- little or no long logging
- no controls

### Stage

- operator-centric
- explicit
- denser
- split live work from prep work
- add a reveal/content queue as a first-class backstage workflow

---

## 12. One-line summary

The UX direction for this project is:

> **clear product-surface boundaries, role-appropriate interaction cost, and one shared state model expressed through Stage, Cast, Commons, and Audience in different ways.**