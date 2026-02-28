<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";

  const { Story } = defineMeta({
    title: "Design System/Design Tokens",
    tags: ["autodocs"],
    parameters: {
      docs: {
        description: {
          component:
            "Visual catalogue of every design token in `design/tokens.json`. " +
            "Token values are driven by `generated-tokens.css` — edit `design/tokens.json` " +
            "and run `bun run generate:tokens` to update.",
        },
      },
    },
  });
</script>

<!-- ── Color Palette ─────────────────────────────────────────────── -->
<Story name="Color Palette">
  <div
    style="font-family: var(--font-mono, monospace); padding: 24px; background: var(--black, #000); color: var(--white, #fff); min-height: 100vh;"
  >
    <h2
      style="font-family: var(--font-display, sans-serif); color: var(--cyan, #00d4e8); letter-spacing: .06em; margin-bottom: 20px;"
    >
      COLOR PALETTE
    </h2>

    <section style="margin-bottom: 32px;">
      <h3
        style="font-size: 11px; letter-spacing: .1em; color: var(--grey, #888); text-transform: uppercase; margin-bottom: 12px;"
      >
        Neutrals
      </h3>
      <div style="display: flex; flex-wrap: wrap; gap: 12px;">
        {#each [["--black", "#000"], ["--black-card", "#0d0d0d"], ["--black-elevated", "#1a1a1a"], ["--white", "#fff"], ["--grey", "#888"], ["--grey-dim", "#333"]] as [name, fallback] (name)}
          <div
            style="display: flex; flex-direction: column; align-items: center; gap: 6px; width: 80px;"
          >
            <div
              style="width: 64px; height: 64px; border-radius: 8px; background: var({name}, {fallback}); border: 1px solid #333;"
            ></div>
            <span
              style="font-size: 10px; color: var(--grey, #888); text-align: center; word-break: break-all;"
              >{name}</span
            >
          </div>
        {/each}
      </div>
    </section>

    <section style="margin-bottom: 32px;">
      <h3
        style="font-size: 11px; letter-spacing: .1em; color: var(--grey, #888); text-transform: uppercase; margin-bottom: 12px;"
      >
        Brand Accents
      </h3>
      <div style="display: flex; flex-wrap: wrap; gap: 12px;">
        {#each [["--red", "#ff4d6a"], ["--red-dim", "rgba(255,77,106,0.12)"], ["--cyan", "#00d4e8"], ["--cyan-dim", "rgba(0,212,232,0.12)"], ["--purple", "#500df5"], ["--purple-dim", "rgba(80,13,245,0.12)"], ["--purple-mid", "rgba(80,13,245,0.5)"]] as [name, fallback] (name)}
          <div
            style="display: flex; flex-direction: column; align-items: center; gap: 6px; width: 80px;"
          >
            <div
              style="width: 64px; height: 64px; border-radius: 8px; background: var({name}, {fallback}); border: 1px solid #333;"
            ></div>
            <span
              style="font-size: 10px; color: var(--grey, #888); text-align: center; word-break: break-all;"
              >{name}</span
            >
          </div>
        {/each}
      </div>
    </section>

    <section style="margin-bottom: 32px;">
      <h3
        style="font-size: 11px; letter-spacing: .1em; color: var(--grey, #888); text-transform: uppercase; margin-bottom: 12px;"
      >
        HP Thresholds
      </h3>
      <div style="display: flex; flex-wrap: wrap; gap: 12px;">
        {#each [["--hp-healthy", "#22c55e"], ["--hp-injured", "#f59e0b"], ["--hp-critical", "#ff4d6a"], ["--hp-healthy-dim", "#15803d"], ["--hp-injured-dim", "#b45309"], ["--hp-critical-dim", "#991b1b"]] as [name, fallback] (name)}
          <div
            style="display: flex; flex-direction: column; align-items: center; gap: 6px; width: 88px;"
          >
            <div
              style="width: 64px; height: 64px; border-radius: 8px; background: var({name}, {fallback}); border: 1px solid #333;"
            ></div>
            <span
              style="font-size: 10px; color: var(--grey, #888); text-align: center; word-break: break-all;"
              >{name}</span
            >
          </div>
        {/each}
      </div>
    </section>
    <section style="margin-bottom: 32px;">
      <h3
        style="font-size: 11px; letter-spacing: .1em; color: var(--grey, #888); text-transform: uppercase; margin-bottom: 12px;"
      >
        Overlay Gradients
      </h3>
      <div style="display: flex; flex-wrap: wrap; gap: 12px;">
        {#each [["--gradient-healthy", "linear-gradient(90deg, #15803d, #22c55e)", "Healthy"], ["--gradient-injured", "linear-gradient(90deg, #b45309, #f59e0b)", "Injured"], ["--gradient-critical", "linear-gradient(90deg, #991b1b, #ff4d6a)", "Critical"]] as [name, fallback, label] (name)}
          <div
            style="display: flex; flex-direction: column; align-items: center; gap: 6px; width: 120px;"
          >
            <div
              style="width: 112px; height: 24px; border-radius: 4px; background: var({name}, {fallback}); border: 1px solid #333;"
            ></div>
            <span
              style="font-size: 10px; color: var(--grey, #888); text-align: center; word-break: break-all;"
              >{name}</span
            >
            <span style="font-size: 10px; color: #555;">{label}</span>
          </div>
        {/each}
      </div>
    </section>
  </div>
</Story>
<Story name="Typography">
  <div
    style="font-family: var(--font-ui, system-ui); padding: 24px; background: var(--black, #000); color: var(--white, #fff); min-height: 100vh;"
  >
    <h2
      style="font-family: var(--font-display, sans-serif); color: var(--cyan, #00d4e8); letter-spacing: .06em; margin-bottom: 24px;"
    >
      TYPOGRAPHY
    </h2>

    {#each [["--font-display", "Display / Headings", "DADOS & RISAS", "2rem"], ["--font-script", "Script / Brand", "& Risas", "2rem"], ["--font-mono", "Monospace / Numbers", "HP: 12 / 12", "1.5rem"], ["--font-ui", "UI / Body", "Character sheet body text", "1rem"]] as [token, label, sample, size] (token)}
      <div
        style="margin-bottom: 28px; padding: 16px; border: 1px solid #333; border-radius: 8px; background: #0d0d0d;"
      >
        <div
          style="font-size: 11px; color: var(--grey, #888); margin-bottom: 8px; font-family: monospace;"
        >
          {token}
        </div>
        <div
          style="font-size: 12px; color: #555; margin-bottom: 12px; font-family: monospace;"
        >
          {label}
        </div>
        <div style="font-family: var({token}); font-size: {size};">
          {sample}
        </div>
      </div>
    {/each}
  </div>
</Story>

<!-- ── Spacing & Radii ───────────────────────────────────────────── -->
<Story name="Spacing & Radii">
  <div
    style="font-family: var(--font-mono, monospace); padding: 24px; background: var(--black, #000); color: var(--white, #fff); min-height: 100vh; font-size: 12px;"
  >
    <h2
      style="font-family: var(--font-display, sans-serif); color: var(--cyan, #00d4e8); letter-spacing: .06em; margin-bottom: 24px;"
    >
      SPACING & RADII
    </h2>

    <section style="margin-bottom: 32px;">
      <h3
        style="font-size: 11px; letter-spacing: .1em; color: var(--grey, #888); text-transform: uppercase; margin-bottom: 12px;"
      >
        Spacing Scale
      </h3>
      <div style="display: flex; flex-direction: column; gap: 8px;">
        {#each [["--space-half", "2px"], ["--space-1", "4px"], ["--space-2", "8px"], ["--space-3", "12px"], ["--space-4", "16px"], ["--space-5", "20px"], ["--space-6", "24px"], ["--space-8", "32px"], ["--space-10", "40px"], ["--space-12", "48px"]] as [name, fallback] (name)}
          <div style="display: flex; align-items: center; gap: 12px;">
            <span style="width: 100px; color: var(--grey, #888);">{name}</span>
            <div
              style="height: 16px; width: var({name}, {fallback}); background: var(--cyan, #00d4e8); border-radius: 2px; min-width: 2px;"
            ></div>
            <span style="color: #555;">{fallback}</span>
          </div>
        {/each}
      </div>
    </section>

    <section>
      <h3
        style="font-size: 11px; letter-spacing: .1em; color: var(--grey, #888); text-transform: uppercase; margin-bottom: 12px;"
      >
        Border Radii
      </h3>
      <div style="display: flex; flex-wrap: wrap; gap: 16px;">
        {#each [["--radius-sm", "4px"], ["--radius-md", "8px"], ["--radius-lg", "12px"], ["--radius-pill", "999px"]] as [name, fallback] (name)}
          <div
            style="display: flex; flex-direction: column; align-items: center; gap: 8px;"
          >
            <div
              style="width: 64px; height: 64px; background: var(--purple, #500df5); border-radius: var({name}, {fallback}); opacity: 0.8;"
            ></div>
            <span style="font-size: 10px; color: var(--grey, #888);"
              >{name}</span
            >
            <span style="font-size: 10px; color: #555;">{fallback}</span>
          </div>
        {/each}
      </div>
    </section>
  </div>
</Story>

<!-- ── Shadows ───────────────────────────────────────────────────── -->
<Story name="Shadows">
  <div
    style="font-family: var(--font-mono, monospace); padding: 48px 24px; background: var(--black, #000); color: var(--white, #fff); min-height: 100vh; font-size: 12px;"
  >
    <h2
      style="font-family: var(--font-display, sans-serif); color: var(--cyan, #00d4e8); letter-spacing: .06em; margin-bottom: 32px;"
    >
      SHADOWS
    </h2>
    <div
      style="display: flex; flex-wrap: wrap; gap: 40px; align-items: flex-start;"
    >
      {#each [["--shadow-card", "4px 4px 0px rgba(255,255,255,0.05)", "Card"], ["--shadow-red", "3px 3px 0px #ff4d6a", "Red accent"], ["--shadow-cyan", "3px 3px 0px #00d4e8", "Cyan accent"], ["--shadow-purple", "4px 4px 0px #500df5", "Purple accent"]] as [name, fallback, label] (name)}
        <div
          style="display: flex; flex-direction: column; align-items: center; gap: 12px;"
        >
          <div
            style="width: 80px; height: 80px; background: var(--black-card, #0d0d0d); border: 1px solid #333; border-radius: 8px; box-shadow: var({name}, {fallback});"
          ></div>
          <span style="font-size: 10px; color: var(--grey, #888);">{name}</span>
          <span style="font-size: 10px; color: #555;">{label}</span>
        </div>
      {/each}
    </div>
  </div>
</Story>

<!-- ── Motion ────────────────────────────────────────────────────── -->
<Story name="Motion">
  <div
    style="font-family: var(--font-mono, monospace); padding: 24px; background: var(--black, #000); color: var(--white, #fff); min-height: 100vh; font-size: 12px;"
  >
    <h2
      style="font-family: var(--font-display, sans-serif); color: var(--cyan, #00d4e8); letter-spacing: .06em; margin-bottom: 24px;"
    >
      MOTION PRESETS
    </h2>

    {#each [["--t-fast", "150ms ease", "Micro-interactions, icon swaps"], ["--t-normal", "250ms ease", "Standard transitions, reveals"], ["--t-spring", "280ms cubic-bezier(0.34,1.56,0.64,1)", "Springy entrances, pop"]] as [name, fallback, desc] (name)}
      <div
        style="margin-bottom: 20px; padding: 16px; border: 1px solid #333; border-radius: 8px; background: #0d0d0d; display: flex; align-items: center; gap: 16px; justify-content: space-between;"
      >
        <div>
          <div style="color: var(--grey, #888); margin-bottom: 4px;">
            {name}
          </div>
          <div style="font-size: 10px; color: #555;">{desc}</div>
        </div>
        <div
          style="width: 48px; height: 48px; background: var(--purple, #500df5); border-radius: 8px; cursor: pointer; transition: transform var({name}, {fallback}), background var({name}, {fallback});"
          role="img"
          aria-label="Motion demo box — hover to see transition"
          onmouseenter={(e) => {
            e.currentTarget.style.transform = "scale(1.3)";
            e.currentTarget.style.background = "var(--cyan, #00d4e8)";
          }}
          onmouseleave={(e) => {
            e.currentTarget.style.transform = "";
            e.currentTarget.style.background = "var(--purple, #500df5)";
          }}
        ></div>
      </div>
    {/each}
  </div>
</Story>

<!-- ── All Tokens Reference ──────────────────────────────────────── -->
<Story name="All Tokens Reference">
  <div
    style="font-family: var(--font-mono, monospace); padding: 24px; background: var(--black, #000); color: var(--white, #fff); min-height: 100vh; font-size: 11px;"
  >
    <h2
      style="font-family: var(--font-display, sans-serif); color: var(--cyan, #00d4e8); letter-spacing: .06em; margin-bottom: 8px;"
    >
      ALL TOKENS REFERENCE
    </h2>
    <p style="color: var(--grey, #888); margin-bottom: 20px; font-size: 11px;">
      Source of truth: <code style="color: var(--cyan, #00d4e8);"
        >design/tokens.json</code
      >
      — regenerate CSS with
      <code style="color: var(--cyan, #00d4e8);">bun run generate:tokens</code>
    </p>

    {#each [["Colors", [["--black", "#000"], ["--black-card", "#0d0d0d"], ["--black-elevated", "#1a1a1a"], ["--white", "#fff"], ["--grey", "#888"], ["--grey-dim", "#333"], ["--red", "#ff4d6a"], ["--red-dim", "rgba(255,77,106,0.12)"], ["--cyan", "#00d4e8"], ["--cyan-dim", "rgba(0,212,232,0.12)"], ["--purple", "#500df5"], ["--purple-dim", "rgba(80,13,245,0.12)"], ["--purple-mid", "rgba(80,13,245,0.5)"]]], ["HP", [["--hp-healthy", "#22c55e"], ["--hp-injured", "#f59e0b"], ["--hp-critical", "#ff4d6a"], ["--hp-healthy-dim", "#15803d"], ["--hp-injured-dim", "#b45309"], ["--hp-critical-dim", "#991b1b"]]], ["Spacing", [["--space-half", "2px"], ["--space-1", "4px"], ["--space-2", "8px"], ["--space-3", "12px"], ["--space-4", "16px"], ["--space-5", "20px"], ["--space-6", "24px"], ["--space-8", "32px"], ["--space-10", "40px"], ["--space-12", "48px"]]], ["Radii", [["--radius-sm", "4px"], ["--radius-md", "8px"], ["--radius-lg", "12px"], ["--radius-pill", "999px"]]], ["Shadows", [["--shadow-card", "4px 4px 0 rgba(255,255,255,0.05)"], ["--shadow-red", "3px 3px 0 #ff4d6a"], ["--shadow-cyan", "3px 3px 0 #00d4e8"], ["--shadow-purple", "4px 4px 0 #500df5"]]], ["Motion", [["--t-fast", "150ms ease"], ["--t-normal", "250ms ease"], ["--t-spring", "280ms cubic-bezier(0.34,1.56,0.64,1)"]]], ["Alpha", [["--alpha-subtle", "0.04"], ["--alpha-dim", "0.12"], ["--alpha-medium", "0.35"], ["--alpha-overlay", "0.65"], ["--alpha-solid", "0.88"]]], ["Z-Index", [["--z-sidebar-backdrop", "30"], ["--z-sidebar", "40"], ["--z-nav", "50"], ["--z-modal-backdrop", "60"], ["--z-modal", "70"]]], ["Overlay Gradients", [["--gradient-healthy", "linear-gradient(90deg, #15803d, #22c55e)"], ["--gradient-injured", "linear-gradient(90deg, #b45309, #f59e0b)"], ["--gradient-critical", "linear-gradient(90deg, #991b1b, #ff4d6a)"]]]] as [groupName, entries]}
      <div style="margin-bottom: 20px;">
        <div
          style="font-size: 10px; letter-spacing: .1em; color: var(--grey, #888); text-transform: uppercase; border-bottom: 1px solid #222; padding-bottom: 4px; margin-bottom: 8px;"
        >
          {groupName}
        </div>
        {#each entries as [name, fallback]}
          <div
            style="display: flex; align-items: center; gap: 8px; padding: 3px 0; border-bottom: 1px solid #111;"
          >
            <code style="color: var(--cyan, #00d4e8); min-width: 220px;"
              >{name}</code
            >
            <span style="color: var(--grey, #888);">{fallback}</span>
          </div>
        {/each}
      </div>
    {/each}
  </div>
</Story>
