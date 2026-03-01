# **Database Architecture and Real-Time Statistical Tracking for Tabletop Roleplaying Broadcast Overlays**

The integration of real-time statistical tracking into tabletop roleplaying game (TTRPG) live streams represents a critical evolution in broadcast production. As demonstrated by the operational requirements of the DADOS & RISAS project, developing a low-latency, responsive overlay system demands a highly structured backend architecture.1 The project, currently in its final stages of developing a minimum viable product (MVP), utilizes a Node.js server with Express and Socket.io to facilitate bidirectional communication between a Svelte-based producer control panel and a transparent HTML/CSS browser source rendered within Open Broadcaster Software (OBS).1 While the current MVP relies on ephemeral, in-memory data storage to achieve sub-100 millisecond latency 1, transitioning this architecture to a persistent relational database—specifically SQLite, as outlined in the project's future roadmap—is essential for ensuring long-term data integrity, supporting complex state queries, and enabling deep post-session analytics.1  
The following architectural analysis provides an exhaustive blueprint for the database schema required to drive a dynamic, web-socket-enabled OBS overlay. This schema is tailored explicitly to the mechanical intricacies, statistical tracking requirements, and real-time demands of the Dungeons & Dragons 5th Edition (D\&D 5e) ruleset.2 By rigorously normalizing the database structure, the production system can prevent data anomalies, minimize payload sizes during WebSocket transmission, and guarantee that the broadcast producer can manipulate the state of the game without encountering desynchronization between the authoritative server state and the visual overlay presented to the audience.3

## **System Reference Document Ingestion and API Interoperability**

Before a database can track the dynamic state of a live game, it must first be populated with the immutable rules, statistics, and definitions that govern the D\&D 5e universe. The System Reference Document (SRD) contains the official, freely available data for the 5e ruleset, which can be programmatically ingested to form the foundational dictionary tables of the broadcast database.4  
Architecting the ingestion pipeline requires selecting the appropriate application programming interface (API) paradigm. Traditional RESTful APIs, such as the widely utilized D\&D 5e API, provide a uniform interface where specific endpoints correspond directly to resources (e.g., querying /api/2014/ability-scores/cha returns the data for Charisma).4 However, RESTful architectures often suffer from over-fetching or under-fetching data. For example, a basic GET request to a /monsters endpoint might only return an index, a name, and a URL, necessitating hundreds of subsequent individual HTTP requests to build a complete statistical profile for every creature.6  
To optimize the initial seeding of the SQLite database, integrating a GraphQL API is highly recommended. GraphQL solves the limitations of REST by allowing the ingestion script to specify precisely which fields are required in a single query.6 This allows the database architect to extract the armor class, hit points, and damage resistances of all 334 monsters in the SRD database in one optimized payload, significantly reducing bandwidth consumption and processing overhead during the database initialization phase.6 Furthermore, utilizing standardized JSON schema definitions during this ingestion process ensures that the incoming data strictly conforms to the expected relational models, preventing malformed objects from corrupting the static dictionary tables.7

## **Core Entity Modeling: The Character and Creature Schema**

The functional epicenter of any TTRPG database is the character entity. In a live broadcast environment, the OBS overlay must display vital statistics instantly and accurately, requiring the database to store a complex matrix of static physical attributes, derived statistics, and highly volatile state data.9 The schema must accommodate not only the player characters controlled by the cast but also the non-player characters (NPCs) and hostile monsters managed by the Dungeon Master.

### **Base Attributes and Ability Score Mechanics**

The mathematical engine of the 5e ruleset relies on six core ability scores: Strength (STR), Dexterity (DEX), Constitution (CON), Intelligence (INT), Wisdom (WIS), and Charisma (CHA).10 These scores represent a creature's fundamental physical and mental capabilities and serve as the foundation for determining ability modifiers. These modifiers directly influence almost every attack roll, ability check, and saving throw executed during a game session.11  
To maintain a normalized and mathematically sound database, the schema must store the raw integer value of the ability score, which typically ranges from 1 to 30\.11 The ability modifier, which is calculated by subtracting 10 from the raw score and dividing the total by 2 (rounded down), should ideally be calculated dynamically by the Node.js backend prior to payload transmission, or stored as a generated, read-only column within the database to reduce computational overhead during high-frequency real-time queries.11

| Score Range | Modifier | Score Range | Modifier | Score Range | Modifier |
| :---- | :---- | :---- | :---- | :---- | :---- |
| 1 | −5 | 10–11 | \+0 | 20–21 | \+5 |
| 2–3 | −4 | 12–13 | \+1 | 22–23 | \+6 |
| 4–5 | −3 | 14–15 | \+2 | 24–25 | \+7 |
| 6–7 | −2 | 16–17 | \+3 | 26–27 | \+8 |
| 8–9 | −1 | 18–19 | \+4 | 28–29 | \+9 |

The primary character table must encapsulate these scores alongside metadata that defines the character's identity on the stream. Furthermore, it is critical to track the character's proficiency bonus—a scaling mathematical modifier tied to the character's total level that applies to any skill, weapon, or saving throw the character is trained in.9

| Column Name | Data Type | Constraints | Description |
| :---- | :---- | :---- | :---- |
| character\_id | CHAR(5) | PRIMARY KEY | Unique identifier for the character or creature entity. |
| display\_name | VARCHAR(255) | NOT NULL | The broadcast display name rendered on the OBS overlay.9 |
| race\_id | CHAR(5) | FOREIGN KEY | Reference to the species/race dictionary table.9 |
| background\_id | CHAR(5) | FOREIGN KEY | Reference to the character's narrative background.9 |
| score\_str | SMALLINT | CHECK (1-30) | Raw Strength score, dictating physical power.10 |
| score\_dex | SMALLINT | CHECK (1-30) | Raw Dexterity score, dictating agility and reflexes.10 |
| score\_con | SMALLINT | CHECK (1-30) | Raw Constitution score, dictating endurance and health.10 |
| score\_int | SMALLINT | CHECK (1-30) | Raw Intelligence score, dictating reasoning and memory.10 |
| score\_wis | SMALLINT | CHECK (1-30) | Raw Wisdom score, dictating perception and willpower.10 |
| score\_cha | SMALLINT | CHECK (1-30) | Raw Charisma score, dictating persuasive presence.10 |
| proficiency\_bonus | SMALLINT | NOT NULL | Derived mathematically from total character level.9 |
| alignment | VARCHAR(50) | NULL | Free text field denoting moral and ethical alignment.9 |

### **Passive Statistics for Dungeon Master Telemetry**

In addition to active rolls, the 5e ruleset relies heavily on passive statistics. Passive Perception and Passive Investigation represent a character's constant, baseline awareness of their surroundings without actively searching.14 In a broadcast setting, the Dungeon Master (DM) frequently requires immediate access to these numbers to determine if a character notices a hidden trap or an invisible stalker without prompting the player to roll a die, which would inadvertently alert the audience and the players to the hidden danger.14  
The database must calculate and store these passive values, making them readily available to a specialized "DM Screen" view within the Svelte control panel. These values are calculated as 10 plus the relevant skill modifier, factoring in the proficiency bonus if the character is trained in that specific skill. Providing these metrics instantly to the producer and the DM streamlines the narrative flow of the broadcast, preventing dead air caused by manually referencing paper character sheets.14

## **Volatile State Mechanics: Health, Defenses, and Status Conditions**

The visual impact of a TTRPG stream relies heavily on the tension created by fluctuating health points and the application of debilitating conditions. The DADOS & RISAS project MVP successfully implemented a highly responsive, color-coded health bar system rendered in an OBS browser source.1 This overlay shifts from a green gradient when the character is healthy (above 60%), to an orange gradient when injured (30% to 60%), and finally triggers a pulsating red CSS animation to signify a critical status (below 30%).1 To support this sophisticated logic persistently, the database must track several intersecting health and state metrics with absolute precision.

### **Multidimensional Hit Point Tracking**

Hit Points (HP) in the 5e ruleset are not represented by a single integer. A character possesses a theoretical maximum HP, a current standing HP, and potentially a layer of temporary HP.9 Temporary hit points act as an ablative buffer against incoming damage; they are depleted first, and unlike regular healing, temporary hit points do not stack with one another. If a character with 5 temporary hit points receives an effect granting 10 temporary hit points, the value becomes 10, not 15\. Furthermore, specific undead monsters and necrotic magical effects possess mechanics that can dynamically reduce a character's maximum HP ceiling until a long rest or specific magical intervention occurs.15  
Armor Class (AC) and movement speed are similarly volatile. While a character has a base AC derived from their armor and Dexterity modifier, spells like *Shield* or *Haste* can temporarily spike this number.9

| Column Name | Data Type | Constraints | Description |
| :---- | :---- | :---- | :---- |
| hp\_max\_base | INT | NOT NULL | The character's maximum hit points calculated from level and CON. |
| hp\_max\_reduction | INT | DEFAULT 0 | Tracks specific debuffs that temporarily lower the HP ceiling.15 |
| hp\_current | INT | NOT NULL | The current standing health of the character.9 |
| hp\_temp | INT | DEFAULT 0 | Ablative hit point buffer. Depleted prior to hp\_current. |
| armor\_class | SMALLINT | NOT NULL | The target number required for an attack roll to strike the entity.9 |
| speed\_walk | SMALLINT | NOT NULL | Base terrestrial movement speed measured in feet.14 |
| speed\_fly | SMALLINT | DEFAULT 0 | Aerial movement capabilities, if applicable to the race or spell. |

The Socket.io architecture described in the DADOS & RISAS specifications utilizes a specific PUT /api/characters/:id/hp endpoint to manage damage and healing.1 When the producer inputs a damage value via the Svelte control panel, the database transaction must execute a specific sequential logic. First, the damage is deducted from hp\_temp. If the incoming damage exceeds the temporary buffer, the remaining integer is subtracted from hp\_current. Once the SQLite database commits this transaction, the Node.js service layer immediately emits a broadcast event via WebSockets containing the updated health array to all connected OBS browser sources. This payload triggers the CSS width transitions and color shifts on the overlay in under 100 milliseconds, ensuring the audience witnesses the impact simultaneously with the narrative description.1

### **Status Conditions and Exhaustion Scaling**

Beyond simple hit point depletion, conditions significantly alter a character's mechanical capabilities and represent vital tactical information that an audience must be able to visually comprehend.16 The 5e SRD defines fifteen distinct conditions that impair or alter a creature: Blinded, Charmed, Deafened, Exhaustion, Frightened, Grappled, Incapacitated, Invisible, Paralyzed, Petrified, Poisoned, Prone, Restrained, Stunned, and Unconscious.15  
Implementing a robust condition tracking schema prevents the broadcast producer or the Dungeon Master from forgetting active debuffs, and it informs the audience why certain dice rolls may suddenly have advantage or disadvantage.17 For instance, a character suffering from the Blinded condition automatically fails checks requiring sight, and attack rolls against them have advantage.16 If a character is Grappled, their movement speed is instantly reduced to zero.15  
While most conditions operate as a binary state (a creature is either Poisoned or it is not), Exhaustion operates on a strictly tiered scale from level 1 to level 6, with escalating penalties that culminate in the character's death.15 Therefore, the relational database table responsible for condition tracking must be capable of storing intensity levels alongside temporary durations.

| Exhaustion Level | Mechanical Effect on the Character |
| :---- | :---- |
| Level 1 | Disadvantage on all ability checks.15 |
| Level 2 | Movement speed is halved.15 |
| Level 3 | Disadvantage on attack rolls and saving throws.15 |
| Level 4 | Hit point maximum is halved.15 |
| Level 5 | Movement speed is reduced to 0\.15 |
| Level 6 | Death.15 |

To model this within SQLite, a many-to-many relationship must be established between the character table and a condition dictionary table, mediated by an active effects junction table.

| Column Name | Data Type | Constraints | Description |
| :---- | :---- | :---- | :---- |
| active\_cond\_id | CHAR(5) | PRIMARY KEY | Unique identifier for the applied condition instance. |
| character\_id | CHAR(5) | FOREIGN KEY | The entity currently suffering the condition. |
| condition\_name | VARCHAR(50) | NOT NULL | The specific debuff (e.g., "Prone", "Incapacitated").15 |
| intensity\_level | SMALLINT | DEFAULT 1 | Utilized specifically for tracking Exhaustion tiers (1-6).15 |
| duration\_rounds | INT | NULL | The number of combat rounds remaining before the condition automatically expires.16 |
| source\_entity\_id | CHAR(5) | FOREIGN KEY, NULL | The entity responsible for applying the condition (critical for resolving Grapples).17 |

Integrating this table with the WebSocket architecture allows the OBS overlay to display customized iconography next to a character's portrait. If a player is rendered Unconscious, the database logs the state change, the server broadcasts the event, and the overlay instantly overlays a grayscale filter or a specialized status icon over the character's visual representation, instantly communicating the dire stakes to the viewing audience.

## **Class Architecture, Multiclassing, and the Resource Economy**

Modeling character classes presents one of the most significant architectural challenges in a TTRPG database due to the immense mechanical diversity and asymmetrical design of the 5e system.19 The game features a wide array of official classes: Artificer, Barbarian, Bard, Cleric, Druid, Fighter, Monk, Paladin, Ranger, Rogue, Sorcerer, Warlock, and Wizard.22 Each class possesses a unique conceptual identity and a distinct power source—whether martial, arcane, or divine—that translates into highly specific mechanical features.21

### **Multiclassing Data Structures**

Characters are not restricted to a single path; they can distribute their levels across multiple classes, creating hybrid combinations.9 The database must record this specific distribution accurately, as a character's overall proficiency bonus is tied to their aggregate character level, while their access to specific features and spellcasting slots is determined by their individual class levels.9

| Column Name | Data Type | Constraints | Description |
| :---- | :---- | :---- | :---- |
| char\_class\_id | CHAR(5) | PRIMARY KEY | Unique identifier for the multiclass relationship. |
| character\_id | CHAR(5) | FOREIGN KEY | Reference to the core Character table. |
| class\_id | CHAR(5) | FOREIGN KEY | Reference to the Class dictionary table (e.g., Rogue, Wizard).20 |
| subclass\_id | CHAR(5) | FOREIGN KEY, NULL | Reference to the specific archetype, domain, or subclass.9 |
| level\_invested | SMALLINT | CHECK (1-20) | Number of levels the character has invested in this specific class.9 |

### **Polymorphic Resource Tracking**

The flow of a D\&D game revolves entirely around the expenditure, management, and recovery of limited-use resources.24 A Fighter relies heavily on Action Surge and Superiority Dice, a Monk utilizes a rapidly depleting pool of Ki points, a Sorcerer manipulates raw magic via Sorcery Points, and a Barbarian expends daily uses of Rage.24  
A highly normalized database design avoids creating distinct, hardcoded columns for every possible resource (e.g., ki\_points\_current, rage\_current, bardic\_inspiration\_current) within the main character table. Such a flat structure would result in massive amounts of null data and require schema alterations every time a new homebrew class or subclass is introduced.26 Instead, a polymorphic resource tracking system must be implemented.

| Column Name | Data Type | Constraints | Description |
| :---- | :---- | :---- | :---- |
| resource\_id | CHAR(5) | PRIMARY KEY | Unique identifier for the specific resource pool. |
| character\_id | CHAR(5) | FOREIGN KEY | The owner of the resource pool. |
| resource\_name | VARCHAR(100) | NOT NULL | The string identifier (e.g., "Ki", "Bardic Inspiration", "Rage").24 |
| pool\_max | INT | NOT NULL | The maximum capacity of the resource pool based on level and stats. |
| pool\_current | INT | NOT NULL | The current available uses remaining. |
| recharge\_type | ENUM | NOT NULL | Enum defining recovery rules: 'SHORT\_REST', 'LONG\_REST', 'DAWN', 'TURN'.28 |
| die\_size | SMALLINT | NULL | The size of the die if the resource involves rolling (e.g., d8 for a Battlemaster's Superiority Dice).24 |

This polymorphic structure empowers the broadcast overlay to dynamically render a resource tracker beneath the character's HP bar. The Svelte control panel queries this table and generates a dynamic array of buttons based on the character's unique loadout. If the database detects that a Bard possesses a resource labeled "Bardic Inspiration" with a pool\_max of 4 and a pool\_current of 2, the OBS overlay can graphically display four musical note icons, with two marked in a depleted, transparent state.

### **The Rest Economy: Short vs. Long Rests**

To automate the Svelte control panel utilized by the broadcast producer 1, the database backend must codify the game's resting rules.30 The balance of the 5e ruleset is predicated on the friction between classes that recover resources quickly and those that require extensive downtime.28  
Some classes, such as the Warlock or Monk, recover their primary operational resources (Pact Magic Spell Slots and Ki points, respectively) during a one-hour Short Rest.26 Conversely, classes like the Cleric, Paladin, or Wizard rely almost exclusively on an eight-hour Long Rest to replenish their vast spellcasting reserves and healing capabilities.28 Optional rulesets, such as Gritty Realism, alter these durations (making a Short Rest take 8 hours and a Long Rest take 7 days) to enforce a different narrative pacing, heavily favoring Short Rest-dependent classes.29  
When a producer clicks a master "Short Rest" button on the control interface, the Node.js backend must query the recharge\_type column of the resource table. The server automatically resets the pool\_current to equal the pool\_max only for rows where recharge\_type equals 'SHORT\_REST', leaving Long Rest resources depleted. This automated database transaction eliminates human mathematical error during the broadcast and ensures the overlay instantly reflects the party's rejuvenated state.

## **Spellcasting Infrastructure and Slot Management**

Magic represents the most complex data structures within the 5e ruleset, requiring extensive tracking of casting times, ranges, physical components, persistent durations, and scaling power levels.31 For a live broadcast overlay, presenting spell data effectively drastically enhances the audience's understanding of the tactical situation. When a player declares they are casting a complex spell like *Fireball* or *Acid Arrow*, the producer can trigger an event that queries the spell database and instantly displays a lower-third graphic detailing the spell's school of magic, the required saving throw, and its potential damage.

### **The Spell Dictionary Schema**

A complete spell database must account for the hundreds of spells available in the SRD, as well as any homebrew additions generated by the Dungeon Master.31 Spells are categorized by levels, ranging from level 0 (Cantrips, which cost no resources to cast) up to level 9 (reality-altering magic).32 Furthermore, spells can scale in power; casting a level 1 *Magic Missile* using a level 2 spell slot increases the damage output.34 The database must store structural data regarding these base mechanics.

| Column Name | Data Type | Constraints | Description |
| :---- | :---- | :---- | :---- |
| spell\_id | CHAR(5) | PRIMARY KEY | Unique identifier for the spell entry. |
| name | VARCHAR(255) | UNIQUE | The official name of the spell.33 |
| level | SMALLINT | CHECK (0-9) | Spell level indicator, where 0 denotes an infinite-use cantrip.32 |
| school | VARCHAR(50) | NOT NULL | Categorization such as Evocation, Abjuration, Divination, or Necromancy.33 |
| casting\_time | VARCHAR(50) | NOT NULL | Action economy cost: "1 Action", "1 Bonus Action", "Reaction", or "1 Minute".32 |
| range | VARCHAR(50) | NOT NULL | Target distance parameters: "120 feet", "Touch", "Self", "Sight".33 |
| duration | VARCHAR(50) | NOT NULL | Temporal lifespan: "Instantaneous", "1 Minute", "8 Hours".32 |
| is\_concentration | BOOLEAN | NOT NULL | True if the spell requires ongoing mental focus to sustain.32 |
| is\_ritual | BOOLEAN | NOT NULL | True if the spell can be cast over 10 minutes to avoid expending a slot.31 |
| components\_vsm | VARCHAR(10) | NOT NULL | String containing 'V' (Verbal), 'S' (Somatic), 'M' (Material) denoting physical requirements.32 |

### **Spell Slot Matrix and Pact Magic**

Spell slots act as the primary ammunition for magic users. As described in the official rules, a spell slot is analogous to a groove of a certain size—a lower-level spell can be placed into a higher-level groove, expanding to fill it and generating a more powerful effect, but a high-level spell cannot be forced into a small groove.34 A character possesses a specific matrix of slots across various levels depending on their class and level progression.34  
When a character casts a spell, the corresponding slot is expended. Similar to the class resource architecture, spell slots must be tracked dynamically via a relational table linked to the character entity.

| Column Name | Data Type | Constraints | Description |
| :---- | :---- | :---- | :---- |
| slot\_id | CHAR(5) | PRIMARY KEY | Unique identifier for the slot pool. |
| character\_id | CHAR(5) | FOREIGN KEY | Reference to the caster who owns the slots. |
| slot\_level | SMALLINT | CHECK (1-9) | The power level of the spell slot.34 |
| total\_slots | SMALLINT | NOT NULL | The maximum number of slots the character possesses at this level. |
| expended\_slots | SMALLINT | NOT NULL | The number of slots that have currently been consumed.34 |
| is\_pact\_magic | BOOLEAN | DEFAULT FALSE | Flag specifically for Warlock slots, dictating they recharge on a Short Rest rather than a Long Rest.25 |

### **Concentration State Management and Enforcement**

The 5e ruleset introduces a strict balancing mechanic regarding persistent magic: a spellcaster may only maintain concentration on a single spell at any given time.35 If a Wizard maintaining concentration on *Haste* takes physical damage, they must succeed on a Constitution saving throw, or the magical connection breaks and the spell ends immediately. Furthermore, if the caster decides to cast a different concentration spell, the first spell automatically dissipates.35 There are virtually no exceptions to this rule in the official mechanics.35  
For a broadcast overlay, visualizing concentration is vital for narrative storytelling and tactical transparency. The Svelte control panel 1 should feature a direct toggle for concentration status. Within the database, this requires an active state tracking table to map the relationship between the caster, the spell, and the combat timeline.

| Column Name | Data Type | Constraints | Description |
| :---- | :---- | :---- | :---- |
| active\_effect\_id | CHAR(5) | PRIMARY KEY | Unique identifier for the active magical effect. |
| caster\_id | CHAR(5) | FOREIGN KEY | The character currently maintaining mental concentration. |
| spell\_id | CHAR(5) | FOREIGN KEY | Reference to the specific spell being sustained. |
| target\_id | CHAR(5) | FOREIGN KEY, NULL | The recipient of the spell effect, if applicable. |
| round\_started | INT | NOT NULL | The combat round integer in which the spell was originally cast. |

By maintaining this centralized ledger of active magic, the Node.js backend can programmatically enforce the rules of the game. If an event is fired indicating that caster\_id has failed a saving throw after taking damage, the backend can automatically drop the corresponding record from the active\_effect\_id table. Upon deletion, a WebSocket payload is emitted to the OBS overlay, smoothly fading out the glowing concentration indicator from the character's portrait without requiring manual intervention from the broadcast producer.

## **Equipment, Weapon Properties, and Attunement Tracking**

Inventory management is notoriously difficult to track visually in TTRPG streams, often relegated to scribbled notes on a player's physical character sheet. However, integrating a comprehensive, relational item schema into the broadcast database allows the OBS overlay to dynamically display the weapons, armor, and magical artifacts actively equipped by the characters, complete with real-time damage statistics and magical modifiers.36

### **Base Weapon Schematics and Modifier Logic**

Weapons in 5e possess a variety of mechanical properties that dictate exactly how they function in combat. A weapon with the "Finesse" property allows the wielder to choose between their Strength or Dexterity modifier for the attack roll.38 A "Versatile" weapon deals a different damage die depending on whether it is swung with one hand or two (e.g., a Longsword deals 1d8 one-handed, but 1d10 two-handed).38 "Heavy" weapons impose strict disadvantage penalties on small creatures, and "Loading" weapons restrict the user to a single attack per turn regardless of their class features.39 Other properties include "Light" (enabling dual-wielding) and "Thrown" (dictating specific short and long-range increments).38  
To build a robust database architecture for the overlay, the equipment schema must strictly separate theoretical base items from the specific, instantiated items owned by the characters.40  
**Base Weapon Dictionary Table:**

| Column Name | Data Type | Constraints | Description |
| :---- | :---- | :---- | :---- |
| base\_weapon\_id | CHAR(5) | PRIMARY KEY | Unique identifier for the dictionary entry. |
| name | VARCHAR(100) | NOT NULL | The standard name (e.g., "Flail", "Hammer", "Hatchet").38 |
| cost\_copper | INT | NOT NULL | Base economic cost, completely normalized to copper pieces to prevent currency conversion errors.38 |
| damage\_dice | VARCHAR(10) | NOT NULL | The core damage output (e.g., "1d8", "2d6", "1d4").38 |
| damage\_type | VARCHAR(50) | NOT NULL | Classification defining vulnerabilities and resistances: Slashing, Piercing, or Bludgeoning.41 |
| weight\_lbs | DECIMAL | NOT NULL | Mathematical encumbrance tracking value.36 |

Because a single weapon can possess multiple distinct properties (for example, a Handaxe is simultaneously "Light" and "Thrown" with a range of 20/60) 38, a many-to-many junction table is necessary to map base weapons to a dictionary of recognized weapon properties.

### **Instantiated Equipment and Magical Enhancements**

In a typical campaign, characters rarely wield mundane baseline weapons for long. Magical enhancements, such as a *\+1 Longsword* or *Adamantine Armor* (a specific material type that entirely negates critical hits against the wearer) 42, alter the fundamental math of the combat system. Furthermore, powerful artifacts require "Attunement"—a mechanic that limits a character to bonding with only three major magical items simultaneously.42  
The database must record the specific instance of the item held by the character in an active inventory table, tracking its modifications away from the base dictionary template.

| Column Name | Data Type | Constraints | Description |
| :---- | :---- | :---- | :---- |
| inventory\_id | CHAR(5) | PRIMARY KEY | Unique identifier for the specific item instance owned by a player. |
| character\_id | CHAR(5) | FOREIGN KEY | The owner of the item. |
| base\_item\_id | CHAR(5) | FOREIGN KEY | Reference to the base dictionary item for underlying stats. |
| magic\_bonus | SMALLINT | DEFAULT 0 | Flat Attack/Damage or AC bonus provided by enchantment (+1, \+2, \+3).42 |
| is\_equipped | BOOLEAN | DEFAULT FALSE | Flag indicating if the weapon is currently drawn or the armor is worn. |
| requires\_attunement | BOOLEAN | DEFAULT FALSE | Flag denoting if the item is powerful enough to occupy an attunement slot.42 |
| custom\_name | VARCHAR(255) | NULL | Text field for uniquely named artifacts, historical heirlooms, or highly customized homebrew weapons.43 |

By tracking the is\_equipped state directly in the database, the Svelte control panel 1 can automate complex mathematical calculations for the producer. When a weapon is toggled as equipped, the Node.js backend calculates the character's total attack bonus by querying their proficiency\_bonus, determining the optimal ability modifier based on the weapon's Finesse property, and adding the specific magic\_bonus of that inventory instance. This pre-calculated, highly accurate integer is then broadcasted to the OBS overlay, allowing the stream to display real-time, mathematically perfect attack modifiers beneath the character's nameplate, reducing the cognitive load on the players and the audience.

## **Combat Synchronization, Initiative Queueing, and Turn State**

The core developmental objective outlined in the DADOS & RISAS project roadmap post-MVP is the integration of a dedicated combat and initiative tracker.1 Combat in 5e is a highly structured, turn-based procedure that can often become bogged down by administrative tracking. Visualizing this precise order through an automated OBS overlay keeps the audience deeply engaged, instantly answering the constant viewer questions of "who is acting right now?" and "who is on deck to act next?".44

### **Initiative and Turn Order Modeling**

Initiative determines the sequential order in which entities act during a chaotic combat round, calculated by rolling a 20-sided die (d20) and adding the character's Dexterity modifier.45 Tracking this effectively requires a hierarchical schema that monitors the overarching combat encounter, the progression of individual combat rounds, and the exact, sorted position of every participant currently in the initiative queue.44  
**Combat Encounter State Table:**

| Column Name | Data Type | Constraints | Description |
| :---- | :---- | :---- | :---- |
| combat\_id | CHAR(5) | PRIMARY KEY | Unique identifier for the combat encounter instance. |
| session\_id | CHAR(5) | FOREIGN KEY | Links the specific combat encounter to a broader broadcast episode. |
| current\_round | INT | DEFAULT 1 | The integer representing the current round of combat.45 |
| active\_turn\_id | CHAR(5) | FOREIGN KEY | References the Initiative\_Queue table to denote exactly whose turn it is currently.44 |
| is\_active | BOOLEAN | DEFAULT TRUE | Boolean indicating if the combat encounter is currently ongoing or resolved. |

**Initiative Queue Table:**

| Column Name | Data Type | Constraints | Description |
| :---- | :---- | :---- | :---- |
| queue\_id | CHAR(5) | PRIMARY KEY | Unique identifier for the queue entry. |
| combat\_id | CHAR(5) | FOREIGN KEY | The specific combat encounter this queue operates within. |
| entity\_id | CHAR(5) | FOREIGN KEY | Reference to a Character or NPC participating in the fight. |
| initiative\_roll | SMALLINT | NOT NULL | The rolled numerical value utilized by the backend for sorting the turn order.44 |
| dex\_modifier | SMALLINT | NOT NULL | Stored to act as an automated tiebreaker for matching initiative rolls. |
| has\_acted | BOOLEAN | DEFAULT FALSE | Boolean tracking if the entity has completed their turn in the current round, aiding in delay mechanics.46 |

The real-time synchronization of this table is what elevates a standard broadcast into a professional production. When the producer clicks the "Next Turn" button on the Svelte interface 1, the Node.js server executes a database transaction that updates the active\_turn\_id in the Combat Encounter State table, referencing the next highest initiative roll that has not yet acted.  
This state change is instantly emitted via a WebSocket payload. The HTML overlay in OBS receives the payload and visually highlights the newly active character's portrait—perhaps applying a glowing CSS border, slightly scaling up the image, or increasing the opacity of their associated graphics—while simultaneously sliding the initiative queue visualizer forward.1 If the queue reaches the end of the order, the backend automatically increments the current\_round counter and resets all has\_acted booleans to false, triggering a "Round 2" graphic on the stream.45

## **Live Stream Analytics, Telemetry, and The Roll Ledger**

Modern, highly successful TTRPG broadcasts, such as Critical Role and Dimension 20, have conditioned viewing audiences to expect deep post-game analytics, real-time statistical tracking, and engaging trivia.50 Viewers are highly engaged by running statistics that track total damage dealt, total damage taken, and, most importantly, the frequency of critical hits (a "Natural 20" on a 20-sided die) and critical failures (a "Natural 1").52  
The DADOS & RISAS architecture is uniquely positioned to capture this metadata effortlessly, precisely because all dice rolls and state changes are already routed through the centralized Node.js server to update the overlay.1 By transitioning from a system that merely broadcasts a roll and forgets it, to a system that archives every event, the production unlocks massive analytical potential.

### **The Immutable Dice Roll Ledger**

To build a comprehensive analytics engine, the database must transition from treating dice rolls as ephemeral events to recording them in an immutable, timestamped ledger. The DADOS & RISAS MVP notes the existence of a dedicated POST /api/rolls endpoint.1 Every time a player rolls a die—whether via a digital roller integrated into the application or inputted manually by the producer after observing a physical roll at the table—the precise data of that event must be archived in SQLite.

| Column Name | Data Type | Constraints | Description |
| :---- | :---- | :---- | :---- |
| roll\_id | CHAR(5) | PRIMARY KEY | Unique identifier for the recorded roll event. |
| session\_id | CHAR(5) | FOREIGN KEY | Links the roll to the current broadcast episode for post-show parsing. |
| character\_id | CHAR(5) | FOREIGN KEY | The specific entity executing the roll. |
| roll\_type | VARCHAR(50) | NOT NULL | Categorization parameter: e.g., "Attack", "Damage", "Saving Throw", "Initiative", "Skill Check". |
| dice\_expression | VARCHAR(50) | NOT NULL | The exact string representation of the roll: e.g., "1d20+5", "8d6".1 |
| natural\_value | SMALLINT | NOT NULL | The raw, unadjusted face value of the die before any modifiers are applied.53 |
| total\_result | SMALLINT | NOT NULL | The final calculated output used to determine success or failure against an AC or DC. |
| is\_nat\_20 | BOOLEAN | DEFAULT FALSE | Flag enabled for immediate querying and tracking of critical successes.53 |
| is\_nat\_1 | BOOLEAN | DEFAULT FALSE | Flag enabled for immediate querying and tracking of critical failures.53 |
| timestamp | TIMESTAMP | DEFAULT NOW() | Exact millisecond the roll occurred, utilized for stream synchronization and timeline reconstruction.1 |

### **Real-Time Overlays and Audience Engagement Metrics**

By continuously archiving this data into the Roll\_Ledger table, the OBS overlay can feature dynamic, real-time statistical lower-thirds that update automatically as the game progresses. The producer can trigger pre-built SQL queries against the database to extract compelling narratives without interrupting the flow of the game.  
For instance, an SQL query can aggregate the total\_result of all ledger records where roll\_type equals "Damage" and the character\_id matches a specific player. This allows the OBS overlay to display a running total of "Damage Dealt" by that character throughout the specific combat encounter, the single episode, or the entire campaign.52 This mimics the deep statistical analysis heavily requested by fans of prominent stream productions like Dimension 20\.52 Similarly, counting the instances where the is\_nat\_20 boolean is flagged as true provides a persistent, running "Crit Counter" on the stream overlay, which generates immense hype and is a highly popular metric in community discussions.53  
Furthermore, tracking the frequency and targets of damage allows the backend to programmatically derive an "MVP" (Most Valuable Player) metric at the conclusion of combat encounters. By linking the Roll\_Ledger with the Combat Encounter State table, the system can determine precisely which character dealt the killing blow to a boss entity, or who absorbed the highest volume of damage without their hp\_current falling to zero, adding professional-grade layers of narrative depth and post-game discussion points to the broadcast.52

### **Stream Metadata and System Performance Telemetry**

Beyond capturing in-game mechanics, maintaining a strict record of broadcast metadata ensures that the technical performance of the stream can be audited and optimized. The DADOS & RISAS MVP goals stipulate that the Node.js server must run without crashing for over 30 continuous minutes, with health updates appearing in the OBS browser source within a strict one-second threshold.1  
To monitor these goals, a Session\_Metrics table should be implemented to log the start and end times of the broadcast, continuous viewer counts pulled via webhooks from the Twitch or YouTube APIs, and internal latency metrics regarding the WebSocket transmission speeds.50 Correlating high-engagement viewer moments or rapid influxes of new followers with specific, timestamped in-game events—such as a critical hit recorded in the Roll\_Ledger or a character dropping to zero hit points—allows the production team to scientifically analyze what game states generate the most audience retention and excitement.50  
The construction of an OBS overlay for a D\&D 5e broadcast transcends simple front-end graphic design; it necessitates the development of a highly specialized, rigidly normalized relational database capable of interpreting and storing the complex, deeply interconnected rules of tabletop roleplaying. By structuring the SQLite database to seamlessly handle volatile character health states, intricate and polymorphic resource economies, multifaceted spellcasting rules, and real-time combat sequencing, a broadcast production team can entirely eliminate the friction and latency typically associated with manual stream management. Implementing the exhaustive architecture outlined above ensures that the broadcast remains highly responsive, mathematically reliable, and deeply immersive, elevating the production quality to meet the exacting standards of modern digital audiences.

#### **Fuentes citadas**

1. PROGRESS.md  
2. Designing a DB to model Dungeons and Dragons \- Any advice on schema? : r/Database, acceso: febrero 20, 2026, [https://www.reddit.com/r/Database/comments/93ru7k/designing\_a\_db\_to\_model\_dungeons\_and\_dragons\_any/](https://www.reddit.com/r/Database/comments/93ru7k/designing_a_db_to_model_dungeons_and_dragons_any/)  
3. How did you make your DnD database (from a design/technical perspective)? \- Quora, acceso: febrero 20, 2026, [https://www.quora.com/How-did-you-make-your-DnD-database-from-a-design-technical-perspective](https://www.quora.com/How-did-you-make-your-DnD-database-from-a-design-technical-perspective)  
4. D\&D 5th Edition API, acceso: febrero 20, 2026, [https://www.dnd5eapi.co/](https://www.dnd5eapi.co/)  
5. Community Forums: JSON api for 5e SRD? | Roll20: Online virtual tabletop, acceso: febrero 20, 2026, [https://app.roll20.net/forum/post/3987263/json-api-for-5e-srd](https://app.roll20.net/forum/post/3987263/json-api-for-5e-srd)  
6. GraphQL Fundamentals | D\&D 5e SRD API \- GitHub Pages, acceso: febrero 20, 2026, [https://5e-bits.github.io/docs/tutorials/beginner/graphql](https://5e-bits.github.io/docs/tutorials/beginner/graphql)  
7. chris-pikul/dndlib: TypeScript/JavaScript library and accompanying JSON Schema for Dungeons & Dragons 5th edition. \- GitHub, acceso: febrero 20, 2026, [https://github.com/chris-pikul/dndlib](https://github.com/chris-pikul/dndlib)  
8. BrianWendt/dnd5e\_json\_schema: Standardized JSON Schema for Dungeons & Dragons 5e characters \- GitHub, acceso: febrero 20, 2026, [https://github.com/BrianWendt/dnd5e\_json\_schema](https://github.com/BrianWendt/dnd5e_json_schema)  
9. DnD Character Database \- Kaggle, acceso: febrero 20, 2026, [https://www.kaggle.com/datasets/mexwell/dnd-character-database](https://www.kaggle.com/datasets/mexwell/dnd-character-database)  
10. D\&D 5e Ability Scores Guide: Optimize Your Character in 2025 \- Runic Dice, acceso: febrero 20, 2026, [https://www.runicdice.com/blogs/news/dnd-5e-ability-scores-explained](https://www.runicdice.com/blogs/news/dnd-5e-ability-scores-explained)  
11. Ability Scores and Modifiers \- DnD5e.info \- 5th Edition System Reference Document/5e SRD, acceso: febrero 20, 2026, [https://dnd5e.info/using-ability-scores/ability-scores-and-modifiers/](https://dnd5e.info/using-ability-scores/ability-scores-and-modifiers/)  
12. All D\&D 5e Races, Classes, and Subclasses in One Convenient Spread Sheet\! \- Reddit, acceso: febrero 20, 2026, [https://www.reddit.com/r/DnDBehindTheScreen/comments/j3glxw/all\_dd\_5e\_races\_classes\_and\_subclasses\_in\_one/](https://www.reddit.com/r/DnDBehindTheScreen/comments/j3glxw/all_dd_5e_races_classes_and_subclasses_in_one/)  
13. D\&D 5e Character | dnd5e\_json\_schema \- GitHub Pages, acceso: febrero 20, 2026, [https://brianwendt.github.io/dnd5e\_json\_schema/Character.schema.json.html](https://brianwendt.github.io/dnd5e_json_schema/Character.schema.json.html)  
14. \[OC\] We have our sessions over Discord. I made this neat overlay in OBS so people can remember my character details while we play. : r/DnD \- Reddit, acceso: febrero 20, 2026, [https://www.reddit.com/r/DnD/comments/wml03w/oc\_we\_have\_our\_sessions\_over\_discord\_i\_made\_this/](https://www.reddit.com/r/DnD/comments/wml03w/oc_we_have_our_sessions_over_discord_i_made_this/)  
15. Appendix A: Conditions \- Basic Rules for Dungeons and Dragons (D\&D) Fifth Edition (5e) \- D\&D Beyond, acceso: febrero 20, 2026, [https://www.dndbeyond.com/sources/dnd/basic-rules-2014/appendix-a-conditions](https://www.dndbeyond.com/sources/dnd/basic-rules-2014/appendix-a-conditions)  
16. Conditions | D\&D 5th Edition on Roll20 Compendium, acceso: febrero 20, 2026, [https://roll20.net/compendium/dnd5e/Conditions](https://roll20.net/compendium/dnd5e/Conditions)  
17. The Ultimate Guide to Tracking Conditions in D\&D 5e (Without Losing Yo \- Soar Forge, acceso: febrero 20, 2026, [https://shop.soarforge.com/blogs/game-masters-corner/mastering-condition-tracking-in-dungeons-dragons-5e-a-comprehensive-guide](https://shop.soarforge.com/blogs/game-masters-corner/mastering-condition-tracking-in-dungeons-dragons-5e-a-comprehensive-guide)  
18. D\&D 5e: Conditions Cheat Sheet\! \- Helpful NPCs, acceso: febrero 20, 2026, [https://www.helpfulnpcs.com/post/d-d-5e-conditions-cheat-sheet](https://www.helpfulnpcs.com/post/d-d-5e-conditions-cheat-sheet)  
19. D\&D 5E (2014) \- Classes \- Primary Stat Secondary Stat \- EN World, acceso: febrero 20, 2026, [https://www.enworld.org/threads/classes-primary-stat-secondary-stat.616720/](https://www.enworld.org/threads/classes-primary-stat-secondary-stat.616720/)  
20. D\&D 5E Classes Guide \- Roll20, acceso: febrero 20, 2026, [https://pages.roll20.net/dnd/classes/](https://pages.roll20.net/dnd/classes/)  
21. Class Design 101: A fundamental guide to 5th edition classes. : r/DnD \- Reddit, acceso: febrero 20, 2026, [https://www.reddit.com/r/DnD/comments/73seey/class\_design\_101\_a\_fundamental\_guide\_to\_5th/](https://www.reddit.com/r/DnD/comments/73seey/class_design_101_a_fundamental_guide_to_5th/)  
22. All DnD classes explained \- Wargamer, acceso: febrero 20, 2026, [https://www.wargamer.com/dnd/classes](https://www.wargamer.com/dnd/classes)  
23. Every single D\&D class explained \- YouTube, acceso: febrero 20, 2026, [https://www.youtube.com/watch?v=K4YtOhYzOfo](https://www.youtube.com/watch?v=K4YtOhYzOfo)  
24. Complete List of Party Resources : r/DMAcademy \- Reddit, acceso: febrero 20, 2026, [https://www.reddit.com/r/DMAcademy/comments/qfxqpp/complete\_list\_of\_party\_resources/](https://www.reddit.com/r/DMAcademy/comments/qfxqpp/complete_list_of_party_resources/)  
25. What are the character resources and how can I artificially deplete them? : r/dndnext \- Reddit, acceso: febrero 20, 2026, [https://www.reddit.com/r/dndnext/comments/17lqyw3/what\_are\_the\_character\_resources\_and\_how\_can\_i/](https://www.reddit.com/r/dndnext/comments/17lqyw3/what_are_the_character_resources_and_how_can_i/)  
26. D\&D 5E (2014) \- Classes with resources feel like usage is too restrained, acceso: febrero 20, 2026, [https://www.enworld.org/threads/classes-with-resources-feel-like-usage-is-too-restrained.501932/](https://www.enworld.org/threads/classes-with-resources-feel-like-usage-is-too-restrained.501932/)  
27. What are you're house rules for each class? : r/dndnext \- Reddit, acceso: febrero 20, 2026, [https://www.reddit.com/r/dndnext/comments/mq5y9e/what\_are\_youre\_house\_rules\_for\_each\_class/](https://www.reddit.com/r/dndnext/comments/mq5y9e/what_are_youre_house_rules_for_each_class/)  
28. Recharge via Short Rest vs Long Rest \-- Is There an Issue? \[Archive\], acceso: febrero 20, 2026, [https://forums.giantitp.com/archive/index.php/t-383078.html](https://forums.giantitp.com/archive/index.php/t-383078.html)  
29. Short Rest vs. Long Rest Classes And Why Gritty Realism Fails (To A Degree) : r/dndnext, acceso: febrero 20, 2026, [https://www.reddit.com/r/dndnext/comments/n1437f/short\_rest\_vs\_long\_rest\_classes\_and\_why\_gritty/](https://www.reddit.com/r/dndnext/comments/n1437f/short_rest_vs_long_rest_classes_and_why_gritty/)  
30. Long Rest Vs Short Rest in D\&D \- YouTube, acceso: febrero 20, 2026, [https://www.youtube.com/watch?v=RihYvwQFK3I](https://www.youtube.com/watch?v=RihYvwQFK3I)  
31. JSON file of all 5e 2024 edition spells in the v5.2 SRD : r/DnDBehindTheScreen \- Reddit, acceso: febrero 20, 2026, [https://www.reddit.com/r/DnDBehindTheScreen/comments/1lsprv1/json\_file\_of\_all\_5e\_2024\_edition\_spells\_in\_the/](https://www.reddit.com/r/DnDBehindTheScreen/comments/1lsprv1/json_file_of_all_5e_2024_edition_spells_in_the/)  
32. Dungeons & Dragons Spell Listing \- Kaggle, acceso: febrero 20, 2026, [https://www.kaggle.com/datasets/mrpantherson/dndspells/data](https://www.kaggle.com/datasets/mrpantherson/dndspells/data)  
33. DnD 5e Spells and Summons Block (Google Sheets and Excel) : r/DnD5e \- Reddit, acceso: febrero 20, 2026, [https://www.reddit.com/r/DnD5e/comments/k3zv2l/dnd\_5e\_spells\_and\_summons\_block\_google\_sheets\_and/](https://www.reddit.com/r/DnD5e/comments/k3zv2l/dnd_5e_spells_and_summons_block_google_sheets_and/)  
34. Spells | D\&D 5th Edition on Roll20 Compendium, acceso: febrero 20, 2026, [https://roll20.net/compendium/dnd5e/Spells](https://roll20.net/compendium/dnd5e/Spells)  
35. Are there ways to concentrate on more than one spell at a time? \- RPG Stack Exchange, acceso: febrero 20, 2026, [https://rpg.stackexchange.com/questions/47327/are-there-ways-to-concentrate-on-more-than-one-spell-at-a-time](https://rpg.stackexchange.com/questions/47327/are-there-ways-to-concentrate-on-more-than-one-spell-at-a-time)  
36. D\&D 5e Character Keep \- Apps on Google Play, acceso: febrero 20, 2026, [https://play.google.com/store/apps/details?id=com.putnoczki.CharacterKeep\&hl=en\_US](https://play.google.com/store/apps/details?id=com.putnoczki.CharacterKeep&hl=en_US)  
37. NEW D\&D 5e Character Sheet Walkthrough for Foundry VTT\! Everything you Need to Know, acceso: febrero 20, 2026, [https://www.youtube.com/watch?v=x16YJqrSIkg](https://www.youtube.com/watch?v=x16YJqrSIkg)  
38. D\&D 5E (2014) \- Charlaquin's revised weapon and armor tables, acceso: febrero 20, 2026, [https://www.enworld.org/threads/charlaquin%E2%80%99s-revised-weapon-and-armor-tables.669602/](https://www.enworld.org/threads/charlaquin%E2%80%99s-revised-weapon-and-armor-tables.669602/)  
39. A Modular And Upgradable Weapon and Armor System for D\&D 5e | Gnome Stew, acceso: febrero 20, 2026, [https://gnomestew.com/a-modular-and-upgradable-weapon-and-armor-system-for-dd-5e/](https://gnomestew.com/a-modular-and-upgradable-weapon-and-armor-system-for-dd-5e/)  
40. Rod's D\&D 5e Framework \- Page 6 \- RPTools.net, acceso: febrero 20, 2026, [https://forums.rptools.net/viewtopic.php?t=28435\&start=75](https://forums.rptools.net/viewtopic.php?t=28435&start=75)  
41. soryy708/dnd5-srd: 5th edition Dungeons & Dragons SRD JSON database \- GitHub, acceso: febrero 20, 2026, [https://github.com/soryy708/dnd5-srd](https://github.com/soryy708/dnd5-srd)  
42. dnd-5e-srd/json/10 magic items.json at master \- GitHub, acceso: febrero 20, 2026, [https://github.com/BTMorton/dnd-5e-srd/blob/master/json/10%20magic%20items.json](https://github.com/BTMorton/dnd-5e-srd/blob/master/json/10%20magic%20items.json)  
43. Chapter 5: Equipment \- D\&D Beyond, acceso: febrero 20, 2026, [https://www.dndbeyond.com/sources/dnd/basic-rules-2014/equipment](https://www.dndbeyond.com/sources/dnd/basic-rules-2014/equipment)  
44. TTRPG Initiative Tracker. As a relatively newly minted D\&D DM… | by shellster | Nerd For Tech | Medium, acceso: febrero 20, 2026, [https://medium.com/nerd-for-tech/ttrpg-initiative-tracker-77d1654abe01](https://medium.com/nerd-for-tech/ttrpg-initiative-tracker-77d1654abe01)  
45. Initiative Tracker | DM Tools, acceso: febrero 20, 2026, [https://dm.tools/tracker](https://dm.tools/tracker)  
46. What are the best initiative/turn-order tracking methods you've seen in a system? \- Reddit, acceso: febrero 20, 2026, [https://www.reddit.com/r/RPGdesign/comments/r5fs1m/what\_are\_the\_best\_initiativeturnorder\_tracking/](https://www.reddit.com/r/RPGdesign/comments/r5fs1m/what_are_the_best_initiativeturnorder_tracking/)  
47. Suggestion: Add a round counter to the initiative tracker | Roll20: Online virtual tabletop, acceso: febrero 20, 2026, [https://app.roll20.net/forum/post/494250/suggestion-add-a-round-counter-to-the-initiative-tracker](https://app.roll20.net/forum/post/494250/suggestion-add-a-round-counter-to-the-initiative-tracker)  
48. An Initiative Tracker I build with Saving, Round Tracking, Health Tracking, ect... : r/dndnext \- Reddit, acceso: febrero 20, 2026, [https://www.reddit.com/r/dndnext/comments/u76n35/an\_initiative\_tracker\_i\_build\_with\_saving\_round/](https://www.reddit.com/r/dndnext/comments/u76n35/an_initiative_tracker_i_build_with_saving_round/)  
49. What's on your wish list for a Twitch Extension/Overlay? (DND 5e) : r/FoundryVTT \- Reddit, acceso: febrero 20, 2026, [https://www.reddit.com/r/FoundryVTT/comments/mel4ne/whats\_on\_your\_wish\_list\_for\_a\_twitch/](https://www.reddit.com/r/FoundryVTT/comments/mel4ne/whats_on_your_wish_list_for_a_twitch/)  
50. CriticalRole \- Twitch Stats, Analytics and Channel Overview \- Streams Charts, acceso: febrero 20, 2026, [https://streamscharts.com/channels/criticalrole](https://streamscharts.com/channels/criticalrole)  
51. \[No Spoilers\] Hot Take(?) this is my favorite stream overlay to date ..., acceso: febrero 20, 2026, [https://www.reddit.com/r/criticalrole/comments/15r1nu6/no\_spoilers\_hot\_take\_this\_is\_my\_favorite\_stream/](https://www.reddit.com/r/criticalrole/comments/15r1nu6/no_spoilers_hot_take_this_is_my_favorite_stream/)  
52. Dimension 20 statistics : r/Dimension20 \- Reddit, acceso: febrero 20, 2026, [https://www.reddit.com/r/Dimension20/comments/1r911st/dimension\_20\_statistics/](https://www.reddit.com/r/Dimension20/comments/1r911st/dimension_20_statistics/)  
53. Dragonbreaker \- Core Rulebook | PDF | Tabletop Games \- Scribd, acceso: febrero 20, 2026, [https://www.scribd.com/document/870756045/Dragonbreaker-Core-Rulebook](https://www.scribd.com/document/870756045/Dragonbreaker-Core-Rulebook)  
54. Building Resilience Playing Tabletop Role-playing Games A Thesis Submitted to the College of Graduate and Postdoctoral Studies \- HARVEST (uSask), acceso: febrero 20, 2026, [https://harvest.usask.ca/bitstreams/04332073-e67c-4d01-aa4b-59b3f4107826/download](https://harvest.usask.ca/bitstreams/04332073-e67c-4d01-aa4b-59b3f4107826/download)  
55. CriticalRole \- Statistics \- TwitchTracker, acceso: febrero 20, 2026, [https://twitchtracker.com/criticalrole/statistics](https://twitchtracker.com/criticalrole/statistics)
