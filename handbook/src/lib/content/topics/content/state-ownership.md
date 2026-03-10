## The four kinds of state

Not all state is the same. Before deciding where a value lives, ask: who needs to know about it, and for how long?

| Kind | Who needs it | Survives reload? | Example |
|------|-------------|------------------|---------|
| **Local** | This component only | No | A dropdown open/closed toggle |
| **Shared runtime** | Multiple surfaces, same session | No | Current HP in the socket store |
| **Persisted** | The system across sessions | Yes | Character HP in PocketBase |
| **Derived** | Computed from other state | No (recomputed) | Whether a character is at critical HP |

Getting the category wrong is the most common source of state bugs.

## Local state

Local state belongs inside the component. No other surface reads it, no server needs it, and it does not need to survive a reload.

```svelte
<script>
  let panelOpen = $state(false);
</script>
```

If you find yourself lifting a "local" value into the shared store so another component can read it, ask whether those two components should be merged, or whether the value was never truly local.

## Shared runtime state

Shared runtime state is needed by multiple surfaces simultaneously, but does not need to outlive the session. In OVERLAYS, this means the `characters` and `lastRoll` writable stores in `socket.js`.

These stores are **read replicas** — they hold the last value broadcast by the server. They are not the authority. Components read from them; they do not write to them directly.

```javascript
// socket.js — store is updated by socket events only
export const characters = writable([]);

socket.on('hp_updated', ({ character }) => {
  characters.update((chars) =>
    chars.map((c) => (c.id === character.id ? character : c))
  );
});
```

A value should be in shared runtime state when:

- More than one route or component needs it without prop-drilling
- It arrives via server broadcast (you are reacting to authoritative updates)
- It does not need to survive a page reload

## Persisted state

Persisted state lives in PocketBase. It is the authoritative record that survives server restarts, browser reloads, and reconnections.

Only `server.js` writes to PocketBase, via `data/characters.js`. Components trigger writes by sending REST requests to `server.js` — they never call the PocketBase SDK directly.

When to use persisted state:

- The value must survive a reload or reconnection (character HP, conditions, roll log)
- Other devices or surfaces need the same canonical value across sessions
- You need a record over time (roll history)

## Derived state

Derived state is computed from other state. It has no independent existence — recompute it from its inputs rather than storing it.

```svelte
<script>
  let { character } = $props();
  let isCritical = $derived(character.hp_current / character.hp_max < 0.25);
</script>
```

Do not store derived values in PocketBase or the shared socket store unless the computation is expensive and needed by many surfaces. Derive locally.

## How to decide

```
Does any other surface need this value?
  No  → Local component state ($state)
  Yes → Does it need to survive a page reload?
    No  → Shared runtime state (socket store, read-only)
    Yes → Persisted state (PocketBase via server.js)

Can this value be computed from other state?
  Yes → Derived ($derived) — do not store it separately
```

## How this applies in OVERLAYS today

**HP and conditions** are persisted (PocketBase) and replicated at runtime (socket store). Components read the store; writes go through REST → `server.js` → PocketBase → broadcast.

**Roll history** is persisted in PocketBase (`data/rolls.js`) and replicated to clients on connection via `initialData.rolls`.

**The selected character in a route** is local state. Other routes do not need to know which character is selected in `/live/characters`.

**Critical HP flag** is derived — `hp_current / hp_max < 0.25` — computed in the component or overlay that displays it. It is not stored anywhere.

**Form field values** (create character form) are local state. They only become persisted state when the operator submits the form.

## Common mistakes

- **Promoting local state to shared state unnecessarily** — two components that both need a "selected character" might use a store when they should share a prop, or be in the same route.
- **Storing derived values persistently** — saving `isCritical` to PocketBase when it can be recomputed from `hp_current` and `hp_max`. Stored computed values drift when inputs change.
- **Writing to the socket store from a component** — the store is a read replica. Direct writes bypass the server, will not persist, and will be overwritten by the next broadcast.
- **Using local `$state` for values that need to survive navigation** — navigating to a different route destroys the component. If the value needs to survive, it belongs in a shared store or PocketBase.
- **Duplicating shared state across multiple stores** — maintaining `currentHp` in two stores creates a synchronization problem. One authority, one store.

## Commonly confused with

**Authoritative State Flow** — that topic explains the direction state travels once you know where it lives (producer → broadcaster → consumer). This topic explains who owns a value in the first place. Both matter together: once you decide a value is shared runtime state, you also need to know that the server is the authority for it and the store is only a replica.

**Svelte stores vs Svelte 5 `$state`** — the choice between a writable store and a `$state` rune is a mechanism question, not an ownership question. The ownership question ("does this belong in a shared store or in the component?") is answered here. The mechanism follows from the answer.
