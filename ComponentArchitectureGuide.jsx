import React, { useState } from "react";
import { ChevronDown, Copy, Check } from "lucide-react";

export default function ComponentArchitectureGuide() {
  const [activeTab, setActiveTab] = useState("guide");
  const [expandedSections, setExpandedSections] = useState({});
  const [copiedCode, setCopiedCode] = useState(null);

  const toggleSection = (id) => {
    setExpandedSections((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const CodeBlock = ({ code, language = "svelte", id }) => (
    <div className="relative bg-slate-900 rounded-lg overflow-hidden my-4">
      <button
        onClick={() => copyToClipboard(code, id)}
        className="absolute top-2 right-2 p-2 bg-slate-700 hover:bg-slate-600 rounded text-slate-200"
      >
        {copiedCode === id ? (
          <Check size={16} />
        ) : (
          <Copy size={16} />
        )}
      </button>
      <pre className="p-4 text-sm text-slate-100 overflow-x-auto">
        <code>{code}</code>
      </pre>
    </div>
  );

  const CollapsibleSection = ({ id, title, children }) => (
    <div className="border border-slate-700 rounded-lg mb-4">
      <button
        onClick={() => toggleSection(id)}
        className="w-full p-4 flex items-center justify-between hover:bg-slate-800 transition"
      >
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <ChevronDown
          size={20}
          className={`transform transition ${
            expandedSections[id] ? "rotate-180" : ""
          }`}
        />
      </button>
      {expandedSections[id] && (
        <div className="p-4 bg-slate-900 border-t border-slate-700">
          {children}
        </div>
      )}
    </div>
  );

  const GuideContent = () => (
    <div className="space-y-6">
      <CollapsibleSection
        id="overview"
        title="1. Overview"
      >
        <p className="text-slate-300 mb-4">
          TableRelay uses a modern Svelte 5 component architecture with bits-ui headless primitives and Tailwind CSS.
        </p>
        <div className="bg-slate-800 p-4 rounded border border-slate-700">
          <p className="text-sm text-slate-200"><strong>Tech Stack:</strong></p>
          <ul className="text-sm text-slate-300 mt-2 space-y-1">
            <li>✓ Svelte 5 with runes ($state, $derived, $effect)</li>
            <li>✓ SvelteKit for routing and SSR</li>
            <li>✓ bits-ui v2 headless primitives</li>
            <li>✓ tailwind-variants for type-safe styling</li>
            <li>✓ Design tokens from tokens.json</li>
          </ul>
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        id="svelte-props"
        title="2. Svelte 5 Props & State"
      >
        <p className="text-slate-300 mb-4">Declare component inputs with $props():</p>
        <CodeBlock
          id="code-props"
          code={`<script>
  let {
    character,                    // Required prop
    selected = false,             // Optional with default
    onToggleSelect = () => {},    // Callback
    ref = $bindable(null),        // Two-way binding
    children = undefined,         // Snippet prop
    ...restProps                  // Spread HTML attributes
  } = $props();
</script>`}
        />
        <div className="bg-blue-900/20 border border-blue-700 p-4 rounded text-sm text-slate-300">
          <p><strong>Key point:</strong> Props automatically become reactive. Use <code className="bg-slate-800 px-2 py-1 rounded">$bindable()</code> for two-way binding.</p>
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        id="state"
        title="3. Local State with $state"
      >
        <p className="text-slate-300 mb-4">Use $state for component-private mutable data:</p>
        <CodeBlock
          id="code-state"
          code={`<script>
  let isCollapsed = $state(false);
  let selectedItems = $state([]);
  let formData = $state({ name: "", email: "" });

  function toggle() {
    isCollapsed = !isCollapsed;  // Mutate directly
  }
</script>`}
        />
      </CollapsibleSection>

      <CollapsibleSection
        id="derived"
        title="4. Derived State ($derived)"
      >
        <p className="text-slate-300 mb-4">
          Auto-computed values that update when dependencies change:
        </p>
        <CodeBlock
          id="code-derived"
          code={`<script>
  let { character } = $props();

  // Auto-recomputes when character.hp_current changes
  const hpPercent = $derived(
    (character.hp_current / character.hp_max) * 100
  );

  // Conditional class
  const hpClass = $derived(
    hpPercent > 60
      ? "hp--healthy"
      : hpPercent > 30
        ? "hp--injured"
        : "hp--critical"
  );
</script>`}
        />
        <div className="bg-green-900/20 border border-green-700 p-4 rounded text-sm text-slate-300">
          <strong>Benefits:</strong> No manual reactivity tracking, guaranteed in-sync
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        id="effects"
        title="5. Side Effects ($effect)"
      >
        <p className="text-slate-300 mb-4">
          Run code when dependencies change (animations, API calls, DOM updates):
        </p>
        <CodeBlock
          id="code-effect"
          code={`<script>
  import { animate } from "animejs";

  let { character } = $props();
  let prevHp = 0;
  let hitFlashEl;

  // Runs whenever character.hp_current changes
  $effect(() => {
    const hp = character.hp_current;
    if (hp < prevHp && hitFlashEl) {
      hitFlashEl.style.opacity = "0.5";
      animate(hitFlashEl, {
        opacity: 0,
        duration: 900,
        ease: "outCubic"
      });
    }
    prevHp = hp;
  });
</script>`}
        />
      </CollapsibleSection>

      <CollapsibleSection
        id="composition"
        title="6. Component Composition with Snippets"
      >
        <p className="text-slate-300 mb-4">
          Pass reusable content as props using snippets:
        </p>
        <CodeBlock
          id="code-snippet"
          code={`<!-- Modal.svelte -->
<script>
  let { title, content, footer } = $props();
</script>

{#if isOpen}
  <div class="modal">
    <h2>{title}</h2>
    <div>
      {@render content?.()}
    </div>
    <footer>
      {@render footer?.()}
    </footer>
  </div>
{/if}

<!-- Usage -->
<Modal {title}>
  {#snippet content()}
    <p>Custom content</p>
  {/snippet}
  {#snippet footer()}
    <button>Close</button>
  {/snippet}
</Modal>`}
        />
      </CollapsibleSection>

      <CollapsibleSection
        id="styling"
        title="7. Styling with Design Tokens"
      >
        <p className="text-slate-300 mb-4">
          Use centralized design tokens via CSS variables:
        </p>
        <CodeBlock
          id="code-tokens"
          code={`/* Component.css */
.my-component {
  padding: var(--space-3);           /* spacing */
  color: var(--white);               /* color */
  font-family: var(--font-display);  /* typography */
  border-radius: var(--radius-lg);   /* radius */
  transition: all var(--t-fast);     /* timing */
}

.my-component.is-critical {
  border-color: var(--red);
}

.my-component.is-selected {
  box-shadow: 0 0 0 2px var(--cyan);
}`}
        />
        <div className="bg-slate-800 p-4 rounded mt-4">
          <p className="text-sm text-slate-200 mb-2"><strong>Source:</strong> design/tokens.json</p>
          <p className="text-sm text-slate-300">
            Tokens are auto-generated to generated-tokens.css as CSS variables
          </p>
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        id="variants"
        title="8. Styling with tailwind-variants"
      >
        <p className="text-slate-300 mb-4">
          Type-safe variant API for component styling:
        </p>
        <CodeBlock
          id="code-variants"
          code={`// button.svelte (module scope)
import { tv } from "tailwind-variants";

export const buttonVariants = tv({
  base: "inline-flex items-center rounded-md transition-all",

  variants: {
    variant: {
      default: "bg-primary text-white hover:bg-primary/90",
      destructive: "bg-red-600 text-white hover:bg-red-700",
      outline: "border bg-transparent hover:bg-accent",
    },

    size: {
      sm: "h-8 px-3",
      default: "h-9 px-4",
      lg: "h-10 px-6",
    },
  },

  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

// In component
<button
  class={cn(
    buttonVariants({ variant, size }),
    className  // Allow overrides
  )}
>
  Click me
</button>`}
        />
      </CollapsibleSection>

      <CollapsibleSection
        id="state-management"
        title="9. Global State Management"
      >
        <p className="text-slate-300 mb-4">
          Use Svelte writable stores for shared state across components:
        </p>
        <CodeBlock
          id="code-store"
          code={`// lib/stores/socket.js
import { writable } from "svelte/store";

export const characters = writable([]);
export const lastRoll = writable(null);
export const SERVER_URL = "http://localhost:3000";

// In components
<script>
  import { characters, lastRoll } from "$lib/stores/socket";
</script>

<!-- Auto-subscribe with $ prefix -->
{#each $characters as char (char.id)}
  <CharacterCard {char} />
{/each}

{#if $lastRoll}
  <div>Rolled: {$lastRoll.result}</div>
{/if}`}
        />
        <div className="bg-slate-800 p-4 rounded mt-4 text-sm text-slate-300">
          <p className="mb-2"><strong>Data flow:</strong></p>
          <p>User action → REST POST → Server → Socket.io broadcast → Store updates → Component re-renders</p>
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        id="animation"
        title="10. Animations"
      >
        <p className="text-slate-300 mb-4">
          Use <code className="bg-slate-800 px-2 py-1 rounded">anime.js</code> for complex animations, CSS transitions for simple ones:
        </p>
        <CodeBlock
          id="code-anime"
          code={`// anime.js for complex animations
import { animate } from "animejs";

function diceAnimation(element) {
  animate(element, {
    opacity: [0, 1],
    scale: [0.3, 1],
    duration: 450,
    ease: "outElastic",
  });
}

// CSS transitions for simple effects
.hp-fill {
  transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.hp-fill.hp--critical {
  animation: barPulse 1.5s ease-in-out infinite;
}

@keyframes barPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}`}
        />
      </CollapsibleSection>

      <CollapsibleSection
        id="a11y"
        title="11. Accessibility"
      >
        <p className="text-slate-300 mb-4">Use semantic HTML and ARIA attributes:</p>
        <CodeBlock
          id="code-a11y"
          code={`<!-- Semantic HTML -->
<article class="char-card">
  <button
    aria-expanded={!isCollapsed}
    aria-controls={id}
  >
    {isCollapsed ? "Expand" : "Collapse"}
  </button>

  <div id={id} hidden={isCollapsed}>
    {/* content */}
  </div>
</article>

<!-- Screen reader only -->
<span aria-hidden="true">→</span>
<span class="sr-only">Additional info</span>

<!-- Progress bar -->
<div
  role="progressbar"
  aria-valuenow={hp}
  aria-valuemax={maxHp}
  aria-label="Health points"
></div>`}
        />
      </CollapsibleSection>
    </div>
  );

  const CheatsheetContent = () => (
    <div className="space-y-6">
      <CollapsibleSection
        id="template"
        title="Component Template"
      >
        <CodeBlock
          id="code-template"
          code={`<!-- MyComponent.svelte -->
<script>
  import "./MyComponent.css";

  let {
    title = "",
    variant = "default",
    children = undefined,
    ...restProps
  } = $props();

  let isOpen = $state(false);

  function toggle() {
    isOpen = !isOpen;
  }
</script>

<div class="my-component">
  <h2>{title}</h2>
  <button onclick={toggle}>
    {isOpen ? "Close" : "Open"}
  </button>
  {#if isOpen}
    {@render children?.()}
  {/if}
</div>`}
        />
      </CollapsibleSection>

      <CollapsibleSection
        id="cheat-dialog"
        title="Dialog (bits-ui)"
      >
        <CodeBlock
          id="code-dialog"
          code={`<script>
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  let isOpen = $state(false);
</script>

<Dialog.Root bind:open={isOpen}>
  <Dialog.Trigger asChild let:builder>
    <button {builder}>Open Dialog</button>
  </Dialog.Trigger>

  <Dialog.Portal>
    <Dialog.Overlay />
    <Dialog.Content>
      <Dialog.Header>
        <Dialog.Title>Title</Dialog.Title>
        <Dialog.Close />
      </Dialog.Header>

      <p>Content here</p>

      <Dialog.Footer>
        <button onclick={() => isOpen = false}>Close</button>
      </Dialog.Footer>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>`}
        />
      </CollapsibleSection>

      <CollapsibleSection
        id="cheat-event-handler"
        title="REST + Socket.io Pattern"
      >
        <CodeBlock
          id="code-event"
          code={`<script>
  async function handleDamage(charId, damage) {
    // 1. Send REST request
    const res = await fetch(\`/api/damage\`, {
      method: "POST",
      body: JSON.stringify({ charId, damage })
    });

    if (!res.ok) {
      console.error("Failed to apply damage");
      return;
    }

    // 2. Server broadcasts Socket.io event
    // 3. Store updates automatically
    // 4. Component re-renders
  }
</script>

{#each $characters as char (char.id)}
  <button onclick={() => handleDamage(char.id, 5)}>
    Damage {char.name}
  </button>
{/each}`}
        />
      </CollapsibleSection>

      <CollapsibleSection
        id="cheat-css"
        title="CSS Naming (BEM)"
      >
        <CodeBlock
          id="code-bem"
          code={`/* Block: main component */
.character-card { }

/* Element: child of block */
.character-card__header { }
.character-card__body { }

/* Modifier: variation */
.character-card--expanded { }
.character-card__body--collapsed { }

/* State: dynamic condition */
.character-card.is-critical { }
.character-card.is-selected { }
.character-card.collapsed { }`}
        />
      </CollapsibleSection>

      <CollapsibleSection
        id="cheat-imports"
        title="Common Imports"
      >
        <CodeBlock
          id="code-imports"
          code={`// Components
import Button from "$lib/components/ui/button/button.svelte";
import { Button } from "$lib/components/ui/button/index.js";
import * as Dialog from "$lib/components/ui/dialog/index.js";

// Utilities
import { cn } from "$lib/utils.js";
import { get } from "svelte/store";

// Global State
import { characters, lastRoll } from "$lib/stores/socket";

// Animation
import { animate } from "animejs";

// Svelte
import { tick } from "svelte";`}
        />
      </CollapsibleSection>

      <CollapsibleSection
        id="cheat-commands"
        title="Development Commands"
      >
        <div className="space-y-3">
          <div className="bg-slate-800 p-3 rounded">
            <p className="text-sm text-slate-200"><code>bun run dev:auto</code></p>
            <p className="text-xs text-slate-400">Start dev server with auto IP setup</p>
          </div>
          <div className="bg-slate-800 p-3 rounded">
            <p className="text-sm text-slate-200"><code>bun run storybook</code></p>
            <p className="text-xs text-slate-400">Open component gallery at :6006</p>
          </div>
          <div className="bg-slate-800 p-3 rounded">
            <p className="text-sm text-slate-200"><code>bun run lint</code></p>
            <p className="text-xs text-slate-400">Check code style</p>
          </div>
          <div className="bg-slate-800 p-3 rounded">
            <p className="text-sm text-slate-200"><code>bun run build</code></p>
            <p className="text-xs text-slate-400">Production build</p>
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        id="cheat-gotchas"
        title="Common Gotchas"
      >
        <div className="space-y-4">
          <div className="border-l-4 border-red-600 pl-4">
            <p className="text-red-400 font-semibold">Don't mutate parent props</p>
            <CodeBlock
              id="code-gotcha-1"
              code={`// ✗ Wrong
character.hp = 50;

// ✓ Right - use REST API
const res = await fetch("/api/damage", {...});`}
            />
          </div>

          <div className="border-l-4 border-red-600 pl-4">
            <p className="text-red-400 font-semibold">Don't forget await on PocketBase</p>
            <CodeBlock
              id="code-gotcha-2"
              code={`// ✗ Wrong
const char = pb.collection("characters").getOne(id);

// ✓ Right
const char = await pb.collection("characters").getOne(id);`}
            />
          </div>

          <div className="border-l-4 border-red-600 pl-4">
            <p className="text-red-400 font-semibold">Don't forget keys in loops</p>
            <CodeBlock
              id="code-gotcha-3"
              code={`// ✗ Wrong - recreates DOM on reorder
{#each items as item}

// ✓ Right - stable DOM
{#each items as item (item.id)}`}
            />
          </div>
        </div>
      </CollapsibleSection>
    </div>
  );

  const DiagramContent = () => (
    <div className="space-y-6">
      <CollapsibleSection
        id="diagram-hierarchy"
        title="Component Hierarchy"
      >
        <div className="bg-slate-800 p-4 rounded text-xs text-slate-300 font-mono overflow-x-auto">
          <pre>{`Control Panel (SvelteKit)
    │
    ├── Stage Components (Operator)
    │   ├── CharacterCard
    │   ├── DiceRoller
    │   └── CharacterManagement
    │
    ├── Cast Components (DM/Players)
    │   ├── SessionCard
    │   ├── SessionBar
    │   └── InitiativeTracker
    │
    └── Overlay Components (Audience/OBS)
        ├── OverlayHP
        ├── OverlayConditions
        └── OverlayDice
            │
            ├── UI Components (bits-ui wrapped)
            │   ├── Button
            │   ├── Dialog
            │   ├── Collapsible
            │   └── Tooltip
            │
            └── Base Classes
                ├── .card-base
                ├── .btn-base
                └── .label-caps`}</pre>
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        id="diagram-dataflow"
        title="Data Flow: REST → Socket → Store → Component"
      >
        <div className="bg-slate-800 p-4 rounded text-xs text-slate-300 font-mono overflow-x-auto">
          <pre>{`Component (CharacterCard)
    │
    └─ <button onclick={() => updateHp(5)}>
         │
         ├─ 1. Fetch POST /api/damage
         │
         └─ Node.js Server (server.js)
            │
            ├─ 2. await updateHp(pb, ...)
            │
            ├─ 3. socket.emit("hp_updated", {...})
            │
            └─ 4. All clients receive broadcast
               │
               └─ Svelte Store updates
                  │
                  └─ Component re-renders
                     │
                     └─ $derived recalculates
                        │
                        └─ $effect triggers animations`}</pre>
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        id="diagram-styling"
        title="Styling Pipeline"
      >
        <div className="bg-slate-800 p-4 rounded text-xs text-slate-300 font-mono overflow-x-auto">
          <pre>{`design/tokens.json
         │ (auto-generate)
         ▼
generated-tokens.css (CSS variables)
         │
         ▼
app.css (global + base classes)
         │
    ┌────┴─────────────────┐
    │                      │
    ▼                      ▼
Component.css       tailwind-variants
    │                      │
    └────────┬─────────────┘
             │
             ▼
      Tailwind CSS 4
             │
             ▼
      Final Computed Styles`}</pre>
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        id="diagram-reactivity"
        title="Svelte 5 Reactivity"
      >
        <div className="bg-slate-800 p-4 rounded text-xs text-slate-300 font-mono overflow-x-auto">
          <pre>{`Input changes (prop)
    │
    ▼
$derived re-computes
    │
    ▼
Component markup re-renders
    │
    ▼
DOM updates
    │
    ▼
$effect runs
    │
    ├─ Animations execute
    ├─ API calls trigger
    └─ Side effects complete`}</pre>
        </div>
      </CollapsibleSection>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-900 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <h1 className="text-4xl font-bold mb-2">TableRelay Component Architecture</h1>
          <p className="text-slate-400">Svelte 5 + bits-ui + Tailwind CSS Guide</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-700 bg-slate-900 sticky top-[88px] z-9">
        <div className="max-w-6xl mx-auto px-6 flex gap-4">
          <button
            onClick={() => setActiveTab("guide")}
            className={`py-4 px-4 border-b-2 font-semibold transition ${
              activeTab === "guide"
                ? "border-cyan-500 text-cyan-400"
                : "border-transparent text-slate-400 hover:text-slate-300"
            }`}
          >
            📚 Guide
          </button>
          <button
            onClick={() => setActiveTab("cheatsheet")}
            className={`py-4 px-4 border-b-2 font-semibold transition ${
              activeTab === "cheatsheet"
                ? "border-cyan-500 text-cyan-400"
                : "border-transparent text-slate-400 hover:text-slate-300"
            }`}
          >
            ⚡ Cheatsheet
          </button>
          <button
            onClick={() => setActiveTab("diagrams")}
            className={`py-4 px-4 border-b-2 font-semibold transition ${
              activeTab === "diagrams"
                ? "border-cyan-500 text-cyan-400"
                : "border-transparent text-slate-400 hover:text-slate-300"
            }`}
          >
            📊 Diagrams
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {activeTab === "guide" && <GuideContent />}
        {activeTab === "cheatsheet" && <CheatsheetContent />}
        {activeTab === "diagrams" && <DiagramContent />}
      </div>

      {/* Footer */}
      <div className="border-t border-slate-700 bg-slate-900 mt-12 py-8">
        <div className="max-w-6xl mx-auto px-6 text-center text-slate-400 text-sm">
          <p>
            Full documentation available in COMPONENT-GUIDE.md, ARCHITECTURE-DIAGRAM.md, and COMPONENT-CHEATSHEET.md
          </p>
        </div>
      </div>
    </div>
  );
}
