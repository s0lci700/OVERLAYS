# TableRelay Architecture Diagrams

## 1. Component Organization Hierarchy

```
┌─────────────────────────────────────────────────────────────────┐
│                      Control Panel (SvelteKit)                   │
│                         Port: 5173                               │
└────────────────────────────────────────────────────────────────┘
                                  │
                    ┌─────────────┼──────────────┐
                    │             │              │
         ┌──────────▼──────┐ ┌────▼────────┐ ┌──▼───────────────┐
         │  (stage) Routes │ │ (cast)      │ │ (audience)       │
         │  Control Panel  │ │ DM/Players  │ │ OBS Overlays     │
         └─────────────────┘ └────────────┘ └──────────────────┘
                    │             │              │
         ┌──────────▼──────┐ ┌────▼────────┐ ┌──▼───────────────┐
         │  Stage          │ │ Cast        │ │ Overlay          │
         │  Components     │ │ Components  │ │ Components       │
         ├─────────────────┤ ├────────────┤ ├──────────────────┤
         │ CharacterCard   │ │SessionCard │ │OverlayHP         │
         │ DiceRoller      │ │SessionBar  │ │OverlayConditions │
         │ CharacterMgt    │ │InitTracker │ │OverlayDice       │
         └────────┬────────┘ └────────────┘ └──────────────────┘
                  │
    ┌─────────────▼──────────────┐
    │      UI Components         │
    │    (bits-ui wrapped)       │
    ├────────────────────────────┤
    │ Button      Dialog         │
    │ Collapsible Tooltip        │
    │ Badge       Label          │
    │ Form        Modal          │
    └────────────────────────────┘
           │
    ┌──────▼────────────┐
    │  bits-ui v2       │
    │  (Headless)       │
    └───────────────────┘
           │
    ┌──────▼────────────┐
    │ tailwind-variants │
    │ (Styling API)     │
    └───────────────────┘
           │
    ┌──────▼────────────┐
    │  Tailwind CSS 4   │
    │  + Design Tokens  │
    └───────────────────┘
```

---

## 2. Data Flow: REST → Socket.io → Store → Component

```
┌──────────────────────────────────────────────────────────────────┐
│                    Component (CharacterCard)                      │
│                                                                   │
│  let { character } = $props();                                   │
│  const hpPercent = $derived(...);        (Auto-computed)        │
│                                                                   │
│  $effect(() => {                         (Side effect trigger)  │
│    if (hp < prevHp) animate(hitFlashEl);                        │
│  });                                                              │
└──────────────────┬───────────────────────────────────────────────┘
                   │
                   │ subscribe to $characters store
                   │
┌──────────────────▼───────────────────────────────────────────────┐
│         Global State (lib/stores/socket.js)                       │
│                                                                   │
│  export const characters = writable([...]);                      │
│  export const lastRoll = writable({...});                        │
└──────────────────▲───────────────────────────────────────────────┘
                   │
                   │ Socket.io listener updates store
                   │
┌──────────────────┴───────────────────────────────────────────────┐
│            Node.js Server (server.js)                             │
│                                                                   │
│  app.post("/api/damage", (req, res) => {                         │
│    updateCharacter(pb, ...);                                     │
│    socket.emit("character_updated", {...});                      │
│  });                                                              │
└──────────────────▲───────────────────────────────────────────────┘
                   │
                   │ REST POST request
                   │
┌──────────────────┴───────────────────────────────────────────────┐
│      Component Handler (CharacterCard.svelte)                     │
│                                                                   │
│  async function updateHp(damage) {                               │
│    const res = await fetch("/api/damage", {                      │
│      method: "POST",                                             │
│      body: JSON.stringify({ charId, damage })                    │
│    });                                                            │
│  }                                                                │
│                                                                   │
│  <button onclick={() => updateHp(5)}>Damage</button>             │
└──────────────────────────────────────────────────────────────────┘
```

---

## 3. Component Composition: Snippets & Nesting

```
┌─────────────────────────────────────────────────┐
│  Page (+page.svelte)                            │
│                                                 │
│  <Dialog.Root bind:open={isOpen}>               │
│    <Dialog.Trigger>                             │
│      <Button>Open</Button>                      │
│    </Dialog.Trigger>                            │
│                                                 │
│    <Dialog.Portal>                              │
│      <Dialog.Overlay />                         │
│      <Dialog.Content>                           │
│        {#snippet content()}                     │
│          <CharacterForm />                      │
│        {/snippet}                               │
│      </Dialog.Content>                          │
│    </Dialog.Portal>                             │
│  </Dialog.Root>                                 │
└─────────────────────────────────────────────────┘
           │
    ┌──────┴──────────────┬──────────────┬───────────────┐
    │                     │              │               │
┌───▼──────┐    ┌────────▼────┐   ┌────▼────┐   ┌─────▼─────┐
│ Dialog   │    │   Button    │   │  Form   │   │ Portal    │
│ (bits-ui)│    │ (ui wrapper)│   │(custom) │   │(bits-ui)  │
└──────────┘    └─────────────┘   └────────┘   └───────────┘
                        │
                   ┌────▼────┐
                   │tailwind- │
                   │variants  │
                   └──────────┘
```

---

## 4. Svelte 5 Reactivity Model

```
┌─────────────────────────────────────────────────────────────┐
│                   Svelte 5 Component                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  let { character } = $props();    ← Input from parent      │
│                                                              │
│  let isOpen = $state(false);      ← Local mutable state    │
│                                                              │
│  const hpPercent = $derived(      ← Computed automatically │
│    (character.hp / character.hp_max) * 100                 │
│  );                                                          │
│                                                              │
│  $effect(() => {                  ← Side effect (runs when │
│    if (character.hp < prevHp) {    dependencies change)    │
│      animate(el, ...);                                      │
│    }                                                         │
│    prevHp = character.hp;                                   │
│  });                                                         │
│                                                              │
│  <div>                                                       │
│    {#if isOpen}                                             │
│      <p>{hpPercent}% HP</p>                                │
│    {/if}                                                    │
│  </div>                                                      │
│                                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    Reactivity Flow                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Input changes (prop)                                       │
│         │                                                    │
│         ▼                                                    │
│  $derived re-computes                                       │
│         │                                                    │
│         ▼                                                    │
│  Component markup re-renders                                │
│         │                                                    │
│         ▼                                                    │
│  DOM updates                                                │
│         │                                                    │
│         ▼                                                    │
│  $effect runs (queued until after DOM update)               │
│         │                                                    │
│         ▼                                                    │
│  Animations/side-effects execute                            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. Styling Architecture

```
┌───────────────────────────────────────────────────────────┐
│              Design System Entry Point                     │
│                design/tokens.json                          │
│  (Source of truth: colors, spacing, typography, etc.)    │
└────────────────────┬────────────────────────────────────┘
                     │
         ┌───────────┴────────────┐
         │ (auto-generated)       │
         ▼                        │
  ┌──────────────────┐            │
  │generated-tokens  │            │
  │.css              │            │
  │(CSS variables)   │            │
  └──────┬───────────┘            │
         │                        │
         └────────┬───────────────┘
                  │
                  ▼
         ┌──────────────────┐
         │   app.css        │
         │ (global styles   │
         │  + base classes: │
         │  .card-base,     │
         │  .btn-base,      │
         │  .label-caps)    │
         └──────┬───────────┘
                │
         ┌──────┴───────────────────────┐
         │                              │
    ┌────▼──────────┐    ┌─────────────▼───┐
    │ Component.css │    │ Tailwind-variants│
    │ (scoped       │    │ (tv API for      │
    │  styles for   │    │  variants)       │
    │  specific     │    │                  │
    │  component)   │    └─────┬──────┬─────┘
    └────┬──────────┘          │      │
         │              ┌──────▼──┐   │
         │              │  cn()   │   │
         │              │utility  │   │
         │              └──┬──────┘   │
         │                 │          │
         │            ┌────▼──────────▼┐
         │            │ Tailwind CSS 4 │
         │            │ (utilities)    │
         └────────────►│                │
                       └────────────────┘
                              │
                              ▼
                      Final Computed Styles
```

### Example: Button Styling Flow

```
┌──────────────────────────────────────────────────────┐
│  Button.svelte                                       │
├──────────────────────────────────────────────────────┤
│                                                      │
│  let { variant = "default", size = "lg" } =         │
│    $props();                                         │
│                                                      │
│  <button                                             │
│    class={cn(                                        │
│      buttonVariants({ variant, size }),             │
│      className  // override                          │
│    )}                                                │
│  >                                                   │
│    {@render children?.()}                           │
│  </button>                                           │
└──────────────────────┬───────────────────────────────┘
                       │
         ┌─────────────▼────────────────┐
         │ buttonVariants TV object     │
         │ (tailwind-variants)          │
         │                              │
         │ base:                        │
         │  "inline-flex items-center  │
         │   rounded-md text-sm..."     │
         │                              │
         │ variants:                    │
         │   variant.default:           │
         │     "bg-primary text-white.."│
         │   variant.destructive:       │
         │     "bg-red-600 text-white.."│
         │   size.lg:                   │
         │     "h-10 px-6"              │
         └────────────┬─────────────────┘
                      │
         ┌────────────▼────────────┐
         │ cn() merge & dedupe     │
         │ (clsx + tailwind-merge) │
         └────────────┬────────────┘
                      │
         ┌────────────▼──────────────────────────┐
         │ Final class string:                   │
         │ "inline-flex items-center rounded-md │
         │  h-10 px-6 bg-primary text-white..." │
         └────────────┬──────────────────────────┘
                      │
         ┌────────────▼──────────────────────────┐
         │ Tailwind CSS compiles:                │
         │ .inline-flex { display: inline-flex }│
         │ .h-10 { height: 2.5rem }             │
         │ .bg-primary { background-color:      │
         │   var(--primary); }                   │
         │ ... (variables come from tokens.css)  │
         └───────────────────────────────────────┘
```

---

## 6. bits-ui Component Structure

```
┌───────────────────────────────────────────────────────┐
│  bits-ui Dialog Primitive                             │
│  (Unstyled, keyboard nav, ARIA, state sync)          │
├───────────────────────────────────────────────────────┤
│                                                       │
│  Dialog.Root (manages open/close state)              │
│    ├── Dialog.Trigger (opens dialog)                 │
│    ├── Dialog.Portal (teleports to body)             │
│    │   ├── Dialog.Overlay (scrim/backdrop)           │
│    │   └── Dialog.Content (modal container)          │
│    │       ├── Dialog.Header                         │
│    │       │   ├── Dialog.Title (semantic heading)   │
│    │       │   └── Dialog.Close (close button)       │
│    │       ├── {slot} (custom content)               │
│    │       └── Dialog.Footer                         │
│    └── ... (more triggers)                           │
│                                                       │
│  All provide:                                         │
│  • Keyboard navigation (Escape to close)             │
│  • ARIA labels (role="dialog", aria-modal="true")    │
│  • Focus trap (focus stays inside while open)        │
│  • Click-outside handling                            │
│  • Scroll lock                                       │
│                                                       │
└───────────────────────────────────────────────────────┘
         │
         │ You add styling:
         │
    ┌────▼──────────────────────────┐
    │ Component CSS                  │
    │ .modal-overlay {               │
    │   background: rgba(0,0,0,0.5);│
    │ }                              │
    │ .modal-content {               │
    │   background: white;           │
    │   padding: 24px;               │
    │ }                              │
    └────────────────────────────────┘
```

---

## 7. Socket.io Real-Time State Sync

```
┌──────────────────────────────────────────────────────┐
│  Control Panel (Port 5173)                           │
│  ┌────────────────────────────────────────────────┐  │
│  │ Component sends REST request                   │  │
│  │ fetch("/api/damage", { charId, damage })      │  │
│  └────────────┬─────────────────────────────────┘  │
├────────────────┼──────────────────────────────────────┤
│                │                                      │
│  ┌─────────────▼────────────────────────────────┐    │
│  │ Socket.io Client in socket.js              │    │
│  │ (auto-subscribes to stores)                │    │
│  └──────────────────────────────────────────────┘    │
│                                                      │
└──────────────────────────────────────────────────────┘
                  │
         HTTP POST (REST API)
         & Socket.io upgrade
                  │
         ┌────────▼─────────┐
         │  Node.js Server  │
         │   (Port 3000)    │
         ├──────────────────┤
         │                  │
         │ router.post(     │
         │  "/api/damage"   │
         │ )                │
         │  ├─ updateHp()   │
         │  ├─ logRoll()    │
         │  └─ emit event   │
         │     "hp_updated" │
         │                  │
         └────────┬─────────┘
                  │
         Socket.io broadcast
              to ALL clients
                  │
    ┌─────────────┴─────────────┐
    │                           │
┌───▼──────────────────┐ ┌─────▼────────────────┐
│  Client A            │ │ Client B             │
│ OBS Overlay PC       │ │ DM Tablet            │
├──────────────────────┤ ├──────────────────────┤
│ socket.on(           │ │ socket.on(           │
│   "hp_updated",      │ │   "hp_updated",      │
│   (char) => {        │ │   (char) => {        │
│   characters.update()│ │   characters.update()│
│   }                  │ │   }                  │
│ );                   │ │ );                   │
│                      │ │                      │
│ Component re-renders │ │ Component re-renders │
│ via store update     │ │ via store update     │
│                      │ │                      │
│ OverlayHP.svelte:    │ │ CharacterCard.svelte:│
│ <div>{$characters    │ │ <div>{$characters    │
│ [0].hp_current}</div>│ │ [0].hp_current}</div>│
└──────────────────────┘ └──────────────────────┘
```

---

## 8. Component File Structure

```
control-panel/src/lib/components/ui/button/
│
├── button.svelte             ← Component implementation
│   ├── <script module>        (buttonVariants definition)
│   ├── <script>               (props, handlers)
│   └── <button> (DOM)         (JSX-like template)
│
├── Button.stories.svelte      ← Storybook documentation
│   ├── <script module>        (defineMeta + argTypes)
│   └── <Story>                (variants + states)
│
├── index.js                   ← Re-export
│   └── export { default as Button }
│
└── (no CSS file for Button - uses tailwind-variants)

---

control-panel/src/lib/components/stage/CharacterCard/
│
├── CharacterCard.svelte       ← Component implementation
│   ├── <script>               (props, state, effects)
│   └── <article> (DOM)        (layout + conditionals)
│
├── CharacterCard.css          ← Scoped component styles
│   ├── .char-card             (block)
│   ├── .char-header           (element)
│   ├── .hp-fill               (element)
│   ├── .hp--healthy           (modifier)
│   ├── .is-critical           (state)
│   └── @media queries         (responsive)
│
├── CharacterCard.stories.svelte ← Storybook
│
└── index.js                   ← Re-export
    └── export { default as CharacterCard }
```

---

## 9. Environment: Development to Production

```
Development
┌──────────────────────────────────┐
│ npm run dev:auto                 │
├──────────────────────────────────┤
│ Runs: setup-ip + vite dev --host │
│ • Auto-detects LAN IP            │
│ • Generates .env files           │
│ • Hot module reload (HMR)        │
│ • Storybook at :6006             │
│ • Dev server at :5173            │
│ • Node server at :3000           │
│ • PocketBase at :8090            │
└──────────────────────────────────┘

Production
┌──────────────────────────────────┐
│ npm run build                    │
├──────────────────────────────────┤
│ • Svelte → JS                    │
│ • Tailwind → CSS (tree-shake)    │
│ • Minify JS/CSS                  │
│ • Code splitting                 │
│ • Build artifacts: .sveltekit/   │
└──────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│ bun run preview                  │
│ (local production test)          │
└──────────────────────────────────┘
```

---

## 10. Data Persistence: PocketBase Integration

```
┌─────────────────────────────────────┐
│  PocketBase (Port 8090)             │
│  SQLite backend                     │
├─────────────────────────────────────┤
│                                     │
│  Collections:                       │
│  • characters (roster)              │
│  • rolls (dice log)                 │
│  • conditions (status effects)      │
│  • resources (spell slots, etc.)    │
│                                     │
└────────┬────────────────────────────┘
         │
    API (authenticated)
         │
    ┌────▼──────────────────────────┐
    │  data/characters.js (CRUD)     │
    │  data/rolls.js (logging)       │
    │                                │
    │  All functions: async (pb, ..)│
    │  All take pb instance first    │
    │  All use try/catch for 404s    │
    └────┬──────────────────────────┘
         │
    ┌────▼──────────────────────────┐
    │  server.js (Express routes)    │
    │                                │
    │  POST /api/damage              │
    │  POST /api/damage              │
    │  POST /api/conditions          │
    │  GET  /api/characters          │
    └──────────────────────────────┘
```

---

## Summary

```
┌────────────────────────────────────────────────────────────┐
│             Component Architecture at a Glance             │
├────────────────────────────────────────────────────────────┤
│                                                            │
│ Props & State:                                             │
│  • $props() ← Input from parent                           │
│  • $state ← Local mutable                                 │
│  • $derived ← Auto-computed                               │
│  • $effect ← Side effects                                 │
│                                                            │
│ Styling:                                                   │
│  • design/tokens.json ← Source of truth                  │
│  • tailwind-variants ← Variant styling API               │
│  • cn() ← Class merge utility                            │
│  • Component.css ← Scoped styles                         │
│                                                            │
│ Interactivity:                                             │
│  • bits-ui ← Headless primitives (Dialog, etc.)         │
│  • Svelte Snippets ← Composable child content           │
│  • anime.js ← Complex animations                        │
│  • CSS transitions ← Simple animations                  │
│                                                            │
│ State Management:                                          │
│  • Svelte stores ← Global state (characters, lastRoll)   │
│  • Socket.io ← Real-time sync across clients            │
│  • PocketBase ← Data persistence                        │
│                                                            │
│ Documentation:                                             │
│  • Storybook ← Component gallery                         │
│  • JSDoc comments ← Code documentation                   │
│  • .css file comments ← Layout & BEM mapping             │
│                                                            │
└────────────────────────────────────────────────────────────┘
```
