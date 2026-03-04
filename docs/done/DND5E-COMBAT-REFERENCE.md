# D&D 5e Combat Reference

> Implementation reference for the DADOS & RISAS DM Session Panel.
> Source: D&D 5e Basic Rules (2014), Chapter 9 — Combat.

---

## Combat Flow (Step-by-Step)

1. **Determine surprise** — DM decides if any side is surprised (surprised creatures skip their first turn)
2. **Establish positions** — DM places all combatants
3. **Roll initiative** — everyone rolls simultaneously; sets the fixed turn order for the whole combat
4. **Take turns** — each combatant acts in initiative order
5. **Next round** — after everyone has acted, repeat from step 4 until combat ends

---

## Initiative

- **Formula:** `d20 + DEX modifier`
- **Who rolls:** Every individual combatant. DM rolls **once per monster group** (all identical monsters act together on the same turn)
- **Order:** Highest to lowest, fixed for the **entire combat** — never re-rolled per round
- **Ties:** Players decide among tied PCs; DM decides among tied monsters; DM can break PC vs monster ties arbitrarily (or have them each roll a d20 — highest goes first)
- **Late arrivals:** New combatants joining mid-combat roll initiative and insert at their rolled position

### Software implications
- Store one `initiative_roll` per combatant on combat start
- Sort DESC by `initiative_roll`, break ties by `dex_modifier` DESC, then alphabetically
- Pointer advances through the array; wrapping back to 0 increments the round counter
- Support manual override for DM tie-breaking

---

## Turn Structure

On each turn, a creature can:

| Resource | Count | Notes |
|---|---|---|
| **Movement** | Up to speed (ft) | Can be split before/after action. Default 30 ft. |
| **Action** | 1 | The main thing you do (see Actions below) |
| **Bonus Action** | 0–1 | Only if a class feature/spell grants it |
| **Reaction** | 0–1 per round | Can happen on anyone's turn (not just yours); resets at start of your next turn |
| **Free interaction** | 1 | Draw weapon, open door, hand an item — one object, no action needed |

> A creature can skip any of these. If unsure what to do, Dodge or Ready are valid fallbacks.

### Actions in Combat

| Action | What it does |
|---|---|
| **Attack** | Make 1+ melee or ranged attack (some classes get Extra Attack) |
| **Cast a Spell** | Cast a spell with casting time of 1 action |
| **Dash** | Double your movement this turn |
| **Disengage** | Your movement doesn't provoke opportunity attacks this turn |
| **Dodge** | Attacks against you have disadvantage; you have advantage on DEX saves. Until your next turn. |
| **Help** | Give an ally advantage on their next ability check or attack roll |
| **Hide** | Make a DEX (Stealth) check to hide |
| **Ready** | Declare a trigger and an action/movement to do as a reaction when it occurs |
| **Search** | Make a WIS (Perception) or INT (Investigation) check to find something |
| **Use an Object** | Interact with an object that requires your action |

### Reactions (common examples)
- **Opportunity Attack** — when a hostile creature leaves your reach, you can attack with your reaction
- **Readied Action** — trigger condition met, you execute your readied action
- **Counterspell / Shield** — spell reactions (class-specific)

---

## HP & Damage

### Hit Points
- `hp_current` can be 0 to `hp_max`
- Losing HP has **no mechanical effect** until 0 (no penalties for being at 1 HP)
- HP loss is reversed by healing; capped at `hp_max`

### Temporary HP (`hp_temp`)
- A separate buffer — damage depletes temp HP first, then bleeds into real HP
- Cannot be healed back — only granted by spells/features
- Don't stack: if you receive more, choose the higher value
- Lost at end of long rest

### Damage Resistance / Vulnerability
- **Resistance** → halve damage of that type
- **Vulnerability** → double damage of that type
- Applied after all other modifiers

### Damage Types (13 total)
`Acid`, `Bludgeoning`, `Cold`, `Fire`, `Force`, `Lightning`, `Necrotic`, `Piercing`, `Poison`, `Psychic`, `Radiant`, `Slashing`, `Thunder`

---

## Death & Dying

### Dropping to 0 HP
1. Fall **unconscious** (unless instant death — see below)
2. Each subsequent turn: roll a **death saving throw** (plain d20, no modifiers)
   - Roll ≥ 10 → **success**
   - Roll < 10 → **failure**
   - Roll **20** → regain 1 HP immediately (conscious)
   - Roll **1** → counts as **two failures**
3. **3 successes** → stable (stop rolling, stay unconscious)
4. **3 failures** → **dead**
5. Any healing → conscious, death saves reset
6. Any damage while at 0 → 1 death save failure (crit = 2 failures)

> Successes and failures don't need to be consecutive — track both totals.

### Instant Death
If damage at 0 HP equals or exceeds `hp_max` → instant death (no death saves).

### Stabilizing Without Healing
DC 10 Wisdom (Medicine) check as an action → creature is stable (won't roll death saves but stays unconscious).

### Monsters
Typically die at 0 HP — no death saves (unless the DM decides they're important).

---

## Conditions (Full List)

| Condition | Key effect |
|---|---|
| **Blinded** | Can't see; attack rolls against you have advantage; your attacks have disadvantage |
| **Charmed** | Can't attack the charmer; charmer has advantage on social checks against you |
| **Deafened** | Can't hear; auto-fail hearing-based checks |
| **Exhaustion** | Levels 1–6; accumulating penalties to checks, saves, attacks, speed; level 6 = death |
| **Frightened** | Disadvantage on checks/attacks while source is in sight; can't willingly move closer to source |
| **Grappled** | Speed 0; ends if grappler is incapacitated or you're moved out of reach |
| **Incapacitated** | Can't take actions or reactions |
| **Invisible** | Unseen; attacks against you have disadvantage; your attacks have advantage |
| **Paralyzed** | Incapacitated + can't move/speak; auto-fail STR/DEX saves; melee hits within 5 ft are crits |
| **Petrified** | Turned to stone; incapacitated + resistance to all damage; auto-fail STR/DEX saves |
| **Poisoned** | Disadvantage on attack rolls and ability checks |
| **Prone** | Crawling or standing costs movement; melee attacks against you have advantage; ranged attacks have disadvantage |
| **Restrained** | Speed 0; attacks against you have advantage; your attacks have disadvantage; disadvantage on DEX saves |
| **Stunned** | Incapacitated + can't move; auto-fail STR/DEX saves; attacks against you have advantage |
| **Unconscious** | Incapacitated + prone + drops items; auto-fail STR/DEX saves; attacks within 5 ft are crits |

---

## Resources & Rests

### Short Rest (1 hour)
- Spend **Hit Dice** (up to your level's worth) to regain HP: roll die + CON modifier per die
- Regains: Ki points (Monk), Rage (partial, Barbarian), Bardic Inspiration (some subclasses), Action Surge / Second Wind (Fighter), Channel Divinity (partial)

### Long Rest (8 hours)
- Regain all HP
- Regain up to half max Hit Dice
- Regain all **spell slots**
- Regain most class features (Rage, Action Surge, Second Wind, Channel Divinity, Wild Shape, etc.)

### Spell Slots
- Levels 1–9; shared pool per caster
- Most classes regain all slots on long rest
- Warlock: regains on short rest (but has very few slots)

---

## Round & Encounter End

- A **round** = ~6 seconds in-game; every combatant acts once
- Combat ends when one side is defeated, flees, or surrenders
- After combat: DM awards **XP**, players can take a short or long rest

---

## Common DM Shortcuts

| Shortcut | How it works |
|---|---|
| **Group initiative** | All monsters of the same type share one initiative roll — they all act on the same turn |
| **Passive Perception** | 10 + WIS modifier; used instead of rolling when not actively searching |
| **Action Economy tracking** | Track used Action/Bonus Action/Reaction per turn; reset at start of each creature's turn |
| **Flanking (optional rule)** | Two allies on opposite sides of an enemy → both get advantage on melee attacks |

---

## Software Implementation Notes

### What the DM tool needs to track per combatant
```
initiative_roll     // d20 + DEX mod, set once at combat start
hp_current          // changes during combat
hp_temp             // separate buffer
death_saves         // { successes: 0-3, failures: 0-3 } — only relevant at 0 HP
conditions[]        // active conditions with IDs
resources[]         // pools with pool_current / pool_max / recharge type
action_used         // boolean, reset on turn start
bonus_action_used   // boolean, reset on turn start
reaction_used       // boolean, reset on start of creature's next turn
```

### Turn pointer
```
combatants[]        // sorted by initiative DESC
current_index       // pointer into the array
round               // increments when index wraps back to 0
```

### "Next Turn" logic
```
current_index = (current_index + 1) % combatants.length
if (current_index === 0) round++
reset action_used, bonus_action_used for the new active combatant
```

### Condition application
Conditions are stored as an array on the character. The DM applies/removes them manually. The tool should display the condition name and ideally show the mechanical consequence as a tooltip.
