---
name: dual-brainstorm
description: Run a structured Visionary ↔ Critic multi-round brainstorm using two agents. Token-efficient — each agent receives only a compressed brief, not the full transcript.
user-invocable: true
argument-hint: /dual-brainstorm <topic or focus area>
---

# Dual Brainstorm Skill — Deep Brainstorm Engine

Runs a structured two-agent debate between a **Visionary** (bold ideas, no feasibility filter) and a **Critic** (architectural quality gate). Each round sharpens ideas. The final output is a concrete, actionable synthesis with automated follow-through.

---

## Model Assignment

**Invert the instinct.** The Visionary needs fluency and volume — use the faster/lighter model. The Critic is a quality gate — use the stronger model.

| Platform | Visionary | Critic |
|---|---|---|
| Claude | `haiku` | `sonnet` |
| Gemini | Gemini 1.5 Flash | Gemini 1.5 Pro |

When using the Agent tool on Claude, pass `model: "haiku"` for Visionary spawns and `model: "sonnet"` for Critic spawns.

---

## Pre-Session: Ancestral Wisdom

**Before Round 1**, grep `docs/brainstorm/ideas.md` for keywords matching the topic. Inject any matching prior ideas as a "Prior Art" block into both agent prompts. Format:

```
Prior Art (from past sessions — do not re-litigate these):
- [idea name] — [status: ✅ shipped / 🔧 modified / ❌ rejected] — [1-line outcome]
```

This prevents re-pitching resolved ideas and gives the Visionary a higher starting point. If `docs/brainstorm/ideas.md` has no relevant entries, skip the block entirely — don't inject an empty section.

---

## Anti-Pattern Firewall (when active)

If `docs/solutions/patterns/critical-patterns.md` exists, scan the Visionary's output against it before passing to the Critic. Flag any idea that repeats a known anti-pattern with a ⚠️ prefix so the Critic can address it first.

This file is populated by the Auto-Archivist (see Round 3). It starts empty — the firewall activates after a few sessions have run.

---

## Token Budget Rules

Each agent call is expensive. These rules are non-negotiable.

1. **Never paste the full previous agent output into the next prompt.** Use the `<context-hook>` format below.
2. **Strip preamble.** No agent names, no "here are my thoughts" intros.
3. **Only carry forward what changed.** `✅ accepted` = don't re-describe.
4. **Cap context per agent call at ~400 words.** Cut the weakest ideas if over.
5. **Stop at 3 rounds** unless the user explicitly asks to continue.
6. **Final synthesis is done by you (the orchestrator), not a third agent.**

### `<context-hook>` Format

Use this JSON structure to pass ideas between rounds instead of prose bullets. It's compact, unambiguous, and carries rationale:

```json
<context-hook>
[
  { "id": "V1", "idea": "short name", "rationale": "1-line why it matters", "status": "pending" },
  { "id": "V2", "idea": "short name", "rationale": "1-line why it matters", "status": "pending" }
]
</context-hook>
```

After the Critic responds, update `status` to `"accepted"`, `"modified: [fix]"`, `"rejected: [reason]"`, or `"failed: [error]"`.

---

## Roles

### Visionary — lighter model
- Pitches bold, forward-thinking ideas. No feasibility filter.
- 5–7 ideas per round, punchy and specific.
- Makes explicit implementability claims when relevant: **"This can be implemented as X..."** — this phrase triggers Empirical Refutation by the Critic.
- Round 2+: ideas are sparked by the Critic's output, not a fresh brainstorm.

### Critic — stronger model
- Architectural quality gate. Calls out real risks: implementation cost, UX traps, data model implications, show-floor failure modes.
- Accepts solid ideas briefly (1 sentence). Pushes back hard where it matters with a concrete fix.
- **Empirical Refutation:** when the Visionary makes an explicit implementability claim ("This can be implemented as X..."), the Critic runs a shell command or linter check to validate it. If it fails, the idea is marked `❌ [Failed Validation: <error>]`. This keeps the brainstorm grounded without turning it into a debugging session.
- Adds 2 new ideas per round that the Visionary missed.

---

## Round Structure

### Round 1

**Pre-flight:**
1. Read `docs/brainstorm/ideas.md` — grep for topic keywords, extract Prior Art block.
2. Check for `docs/solutions/patterns/critical-patterns.md` — load if it exists.
3. Gather codebase context (read relevant files, max 5).

**Visionary prompt template:**
```
You are the Visionary in a two-agent brainstorm about [TOPIC].

System context:
[2–5 bullets — current state, constraints, relevant files]

Prior Art (skip if none):
[Matching entries from docs/brainstorm/ideas.md]

Focus: [FOCUS AREA]

Pitch 5–7 bold, specific ideas. No feasibility filtering.
When you believe an idea is implementable in a specific way, say:
"This can be implemented as X..." — be specific enough for the Critic to verify.
Be punchy. Each idea should solve a real problem or create a real moment.
```

**After Visionary responds:** Compress to `<context-hook>` JSON. Do NOT paste the full response.

**Critic prompt template:**
```
You are the Critic — architectural quality gate.

The Visionary pitched:
<context-hook>[JSON]</context-hook>

System context:
[Same 2–5 bullets — copy-paste]

Anti-patterns to check (skip if file doesn't exist):
[Entries from docs/solutions/patterns/critical-patterns.md]

For each idea:
- Call out the real risk or trap, then give a concrete fix.
- If the Visionary made an implementability claim ("This can be implemented as X..."),
  run a shell command or linter check to validate it. Report the result.
  Failed validation → mark the idea ❌ [Failed Validation: <error message>].
- Accept solid ideas briefly (1 sentence).

Then add 2 ideas the Visionary missed.
```

---

### Round 2

Update `<context-hook>` statuses from Critic output:
- `"accepted"` — no changes
- `"modified: [1-line fix]"` — accepted with change
- `"rejected: [1-line reason]"` — dropped
- `"failed: [error]"` — failed empirical validation

**Visionary rebuttal prompt:**
```
You are the Visionary.

Critic's verdict on your ideas:
<context-hook>[updated JSON with statuses]</context-hook>
Critic's new ideas: [1-line each]

Accept what's right. Push back where you disagree (1–2 sentences max each).
Then synthesize: what does the ideal [THING] look like as a concrete spec?
Fields, flow, states, component changes. Make it shippable.
```

---

### Round 3 (optional — check with user first)

**Critic closes out + Spec-to-Action:**
```
You are the Critic. The Visionary proposed this spec:
[COMPRESSED SPEC — key fields and states only, ~150 words max]

1. What's missing? What's over-engineered? What's the build order?
2. Give a final prioritized list: ship now / ship later / cut.
3. For each "ship now" item, output a one-line TODO in this format:
   TODO: [action verb] [thing] — [file or component]
```

**After Round 3, orchestrator:**
1. Writes `TODO:` lines from the Critic's output to `todos/[topic]-[date].md`
2. Offers to run `gh issue create` for each "ship now" item
3. Runs the **Auto-Archivist**: appends rejected ideas to `docs/solutions/patterns/critical-patterns.md` with a one-line rationale (why it was rejected, not just that it was)

---

## Orchestration Checklist

Before each agent call:

- [ ] Prompt under ~400 words?
- [ ] Using `<context-hook>` JSON, not prose dump?
- [ ] Prior Art injected if relevant?
- [ ] Visionary → lighter model, Critic → stronger model?
- [ ] Round 3 or earlier? (check with user before continuing past 3)
- [ ] About to spawn a third agent just to summarize? (Don't — do it inline)

---

## Output Format

After each round show:
1. One-sentence "what just happened"
2. Status table: `idea | ✅/🔧/❌/⚠️ | note`
3. Any new ideas or empirical refutations from that round
4. Ask: another round, go deeper on a specific idea, or proceed to Spec-to-Action?

After Round 3 show:
- Clean table: surviving ideas, status, priority
- Concrete spec if produced
- TODOs written + offer `gh issue create`

---

## Brainstorm Archive

All ideas from past sessions: **`docs/brainstorm/ideas.md`**

Anti-patterns accumulate at: **`docs/solutions/patterns/critical-patterns.md`** (Auto-Archivist writes here after Round 3)

---

## Example Invocation

```
/dual-brainstorm dice rolling UI — intake form, rollType field, overlay presentation
```

1. Grep `docs/brainstorm/ideas.md` for "dice", "roll", "intake" → inject Prior Art
2. Visionary (haiku/Flash) round 1 → compress to `<context-hook>`
3. Critic (sonnet/Pro) round 1 with empirical checks → compress statuses
4. Visionary rebuttal + spec synthesis
5. Show table → offer Round 3 or Spec-to-Action
