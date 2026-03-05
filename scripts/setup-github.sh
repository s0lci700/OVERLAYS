#!/usr/bin/env bash
# setup-github.sh
# One-time setup: creates labels, milestones, and Sprint 1 issues.
# Safe to re-run — gh label/milestone create is idempotent via --force.
#
# Usage: bash scripts/setup-github.sh

set -e

REPO="s0lci700/OVERLAYS"

echo "▶ Verifying gh authentication..."
gh auth status

echo ""
echo "▶ Creating labels..."

# Area labels
gh label create "area:frontend" --color "0075ca" --description "Svelte components, CSS, overlays" --repo "$REPO" --force
gh label create "area:backend"  --color "5319e7" --description "server.js, API routes, Socket.io, PocketBase" --repo "$REPO" --force

# Priority labels
gh label create "p0" --color "d73a4a" --description "Blocking — fix now"        --repo "$REPO" --force
gh label create "p1" --color "e4e669" --description "Important — this sprint"    --repo "$REPO" --force
gh label create "p2" --color "0e8a16" --description "Nice to have — next sprint" --repo "$REPO" --force
gh label create "p3" --color "cccccc" --description "Someday / maybe"            --repo "$REPO" --force

# Size labels
gh label create "size:quick"  --color "c2e0c6" --description "< 1 hour"   --repo "$REPO" --force
gh label create "size:small"  --color "bfd4f2" --description "1–3 hours"  --repo "$REPO" --force
gh label create "size:medium" --color "fef2c0" --description "3–8 hours"  --repo "$REPO" --force
gh label create "size:large"  --color "f9d0c4" --description "8+ hours"   --repo "$REPO" --force

echo "✓ Labels created."

echo ""
echo "▶ Creating milestones..."

gh api "repos/$REPO/milestones" -X POST \
  -f title="Sprint 1 — Bug Fix & Stability" \
  -f description="Demo-ready stability. Fix bugs, accessibility polish, E2E smoke test." \
  -f due_on="2026-03-18T23:59:59Z" 2>/dev/null || echo "  (Sprint 1 already exists)"

gh api "repos/$REPO/milestones" -X POST \
  -f title="Sprint 2 — PocketBase & Persistence" \
  -f description="Migrate from in-memory to PocketBase. Survive server restarts." 2>/dev/null || echo "  (Sprint 2 already exists)"

gh api "repos/$REPO/milestones" -X POST \
  -f title="Sprint 3 — DM Panel & Effects" \
  -f description="DM Session Panel, initiative tracker, sound effects, live theme editor." 2>/dev/null || echo "  (Sprint 3 already exists)"

echo "✓ Milestones created."

# Get Sprint 1 milestone number
MILESTONE=$(gh api "repos/$REPO/milestones" --jq '.[] | select(.title | contains("Sprint 1")) | .number')
echo "  Sprint 1 milestone number: $MILESTONE"

echo ""
echo "▶ Creating Sprint 1 issues..."

# P0 — Fix now
gh issue create --repo "$REPO" \
  --title "Fix Spanish diacriticals" \
  --body "Overlay text renders incorrectly for accented chars (ó, é, ñ, etc.). Check character name rendering across overlay components." \
  --label "area:frontend,p0,size:quick" \
  --milestone "$MILESTONE" 2>/dev/null || echo "  (already exists)"

gh issue create --repo "$REPO" \
  --title "Fix cyan mismatch in level pills" \
  --body "Level pill colour doesn't match the ESDH brand cyan (#00D4FF). Update tokens and verify in HP overlay." \
  --label "area:frontend,p0,size:quick" \
  --milestone "$MILESTONE" 2>/dev/null || echo "  (already exists)"

# P1 — This sprint
gh issue create --repo "$REPO" \
  --title "Add loading state on API calls" \
  --body "updateHp() and rollDice() don't disable buttons during fetch. Add \`let loading = \$state(false)\` and \`disabled={loading}\` in CharacterCard.svelte and DiceRoller.svelte." \
  --label "area:backend,p1,size:small" \
  --milestone "$MILESTONE" 2>/dev/null || echo "  (already exists)"

gh issue create --repo "$REPO" \
  --title "d20 button full-width fix" \
  --body "d20 button should span full width in the dice grid. Fix: \`grid-column: 1 / -1\` in .dice-grid in DiceRoller.css." \
  --label "area:frontend,p1,size:quick" \
  --milestone "$MILESTONE" 2>/dev/null || echo "  (already exists)"

gh issue create --repo "$REPO" \
  --title "Fix role=tablist in PhotoSourcePicker" \
  --body "Segment control buttons missing role=tab, aria-selected, aria-controls. Screen readers announce 0 tabs. Fix in PhotoSourcePicker.svelte." \
  --label "area:frontend,p1,size:small" \
  --milestone "$MILESTONE" 2>/dev/null || echo "  (already exists)"

gh issue create --repo "$REPO" \
  --title "Modal focus trap — replace dialog open with showModal()" \
  --body "Modals use <dialog open> which doesn't trap focus or handle Escape. Replace with showModal() for proper native dialog behaviour." \
  --label "area:frontend,p1,size:small" \
  --milestone "$MILESTONE" 2>/dev/null || echo "  (already exists)"

gh issue create --repo "$REPO" \
  --title "Sidebar navigation → SvelteKit goto()" \
  --body "window.location.pathname causes full page reload. Replace with goto() from \$app/navigation in +layout.svelte sidebar links." \
  --label "area:frontend,p1,size:small" \
  --milestone "$MILESTONE" 2>/dev/null || echo "  (already exists)"

gh issue create --repo "$REPO" \
  --title "E2E smoke test — full demo script run-through" \
  --body "Before Sprint 1 is done: open phone → update character HP → roll d20 → trigger crit → apply condition → verify OBS overlays update. Document results." \
  --label "area:backend,p1,size:small" \
  --milestone "$MILESTONE" 2>/dev/null || echo "  (already exists)"

# P2 — Next sprint
gh issue create --repo "$REPO" \
  --title "Standardize anime.js import path" \
  --body "anime.js import path is inconsistent across overlay components. Standardize to a single import in all overlay files." \
  --label "area:frontend,p2,size:quick" \
  --milestone "$MILESTONE" 2>/dev/null || echo "  (already exists)"

gh issue create --repo "$REPO" \
  --title "Rename .char-card.collapsed to .is-collapsed" \
  --body "CSS class naming convention: .char-card.collapsed should follow BEM-ish convention as .char-card.is-collapsed. Update CharacterCard.svelte and CharacterCard.css." \
  --label "area:frontend,p2,size:quick" \
  --milestone "$MILESTONE" 2>/dev/null || echo "  (already exists)"

echo ""
echo "✓ Sprint 1 issues created."
echo ""
echo "▶ Verifying..."
gh issue list --repo "$REPO" --milestone "Sprint 1 — Bug Fix & Stability"
echo ""
echo "✅ Setup complete. Notion sync will activate once NOTION_API_TOKEN secret is set."
