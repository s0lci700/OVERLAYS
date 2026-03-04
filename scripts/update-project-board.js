#!/usr/bin/env node
/**
 * update-project-board.js
 * Populates the DADOS & RISAS Notion Project Board with all current tasks.
 * Usage: NOTION_TOKEN=secret_xxx bun scripts/update-project-board.js
 */

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const DB_ID = "872101a9165a4c8dabc02cfe03c2614b";
const NOTION_VERSION = "2022-06-28";

if (!NOTION_TOKEN) {
  console.error("❌  NOTION_TOKEN env var is required.");
  process.exit(1);
}

async function notion(method, path, body) {
  const res = await fetch(`https://api.notion.com/v1${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${NOTION_TOKEN}`,
      "Notion-Version": NOTION_VERSION,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Notion API ${method} ${path} → ${res.status}: ${err}`);
  }
  return res.json();
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function archivePage(id) {
  await notion("PATCH", `/pages/${id}`, { archived: true });
}

async function getAllExistingTasks() {
  const results = [];
  let cursor;
  do {
    const body = cursor ? { start_cursor: cursor } : {};
    const res = await notion("POST", `/databases/${DB_ID}/query`, body);
    results.push(...res.results);
    cursor = res.has_more ? res.next_cursor : null;
  } while (cursor);
  return results;
}

async function createTask({ task, status, priority, sprint, area, notes }) {
  const props = {
    Task: { title: [{ text: { content: task } }] },
    Status: { select: { name: status } },
    Priority: { select: { name: priority } },
    Sprint: { select: { name: sprint } },
    Area: { select: { name: area } },
  };
  if (notes) {
    props.Notes = { rich_text: [{ text: { content: notes } }] };
  }
  return notion("POST", "/pages", {
    parent: { database_id: DB_ID },
    properties: props,
  });
}

// ── Task definitions ──────────────────────────────────────────────────────────
// Status options: Backlog | Sprint 1 | Sprint 2 | In Progress | Review | Blocked | Done
// Priority:       P0 — Now | P1 — Soon | P2 — Later | P3 — Someday
// Sprint:         Sprint 1 — Bug Fix & Stability | Sprint 2 — PocketBase & Persistence
//                 Sprint 3 — DM Panel & Effects | Ongoing
// Area:           🛠 Tech | 📣 Pitch & Outreach | 🎭 Session Planning

const TASKS = [
  // ── DONE — Sprint 1 ────────────────────────────────────────────────────────
  {
    task: "HP / Conditions / Dice overlay routes (SvelteKit audience group)",
    status: "Done",
    priority: "P0 — Now",
    sprint: "Sprint 1 — Bug Fix & Stability",
    area: "🛠 Tech",
    notes: "Replaced vanilla HTML overlays with SvelteKit routes under (audience)/",
  },
  {
    task: "Condition-reactive HP bars (CSS class wiring)",
    status: "Done",
    priority: "P0 — Now",
    sprint: "Sprint 1 — Bug Fix & Stability",
    area: "🛠 Tech",
  },
  {
    task: "animejs v4 migration (ES module import fix)",
    status: "Done",
    priority: "P0 — Now",
    sprint: "Sprint 1 — Bug Fix & Stability",
    area: "🛠 Tech",
    notes: "Migrated from default import to named exports for animejs v4 compatibility",
  },
  {
    task: "Shared overlay infrastructure (conditionEffects.js, animations.js, overlaySocket composable, base CSS)",
    status: "Done",
    priority: "P0 — Now",
    sprint: "Sprint 1 — Bug Fix & Stability",
    area: "🛠 Tech",
  },
  {
    task: "Unit tests for conditionEffects and animations helpers",
    status: "Done",
    priority: "P1 — Soon",
    sprint: "Sprint 1 — Bug Fix & Stability",
    area: "🛠 Tech",
    notes: "15 tests passing in Vitest",
  },

  // ── DONE — Sprint 2 ────────────────────────────────────────────────────────
  {
    task: "PocketBase integration: character CRUD wrappers (data/characters.js)",
    status: "Done",
    priority: "P0 — Now",
    sprint: "Sprint 2 — PocketBase & Persistence",
    area: "🛠 Tech",
  },
  {
    task: "PocketBase integration: roll log (data/rolls.js)",
    status: "Done",
    priority: "P0 — Now",
    sprint: "Sprint 2 — PocketBase & Persistence",
    area: "🛠 Tech",
  },
  {
    task: "Auto-seed script with idempotent character creation (scripts/seed.js)",
    status: "Done",
    priority: "P1 — Soon",
    sprint: "Sprint 2 — PocketBase & Persistence",
    area: "🛠 Tech",
  },
  {
    task: "Railway deployment: PocketBase service + Dockerfile + auto-seed orchestration",
    status: "Done",
    priority: "P0 — Now",
    sprint: "Sprint 2 — PocketBase & Persistence",
    area: "🛠 Tech",
    notes: "PR #47 merged — includes retry logic + exponential backoff on seed",
  },
  {
    task: "Server graceful degradation when PocketBase is unavailable",
    status: "Done",
    priority: "P1 — Soon",
    sprint: "Sprint 2 — PocketBase & Persistence",
    area: "🛠 Tech",
  },
  {
    task: "All 14 Socket.io broadcast events implemented",
    status: "Done",
    priority: "P0 — Now",
    sprint: "Sprint 2 — PocketBase & Persistence",
    area: "🛠 Tech",
    notes: "hp_updated, condition_added/removed, scene_changed, character_focused, encounter_started/next_turn/ended, dice_rolled, announcement_*, level_up, player_down",
  },
  {
    task: "Storybook stories for all overlay components",
    status: "Done",
    priority: "P1 — Soon",
    sprint: "Sprint 2 — PocketBase & Persistence",
    area: "🛠 Tech",
  },
  {
    task: "Overlay Phase 4-9: Announce, Moments (LevelUp/PlayerDown), Show layer (LowerThird/Stats/Badge/Break), Scene, Focus",
    status: "Done",
    priority: "P0 — Now",
    sprint: "Sprint 2 — PocketBase & Persistence",
    area: "🛠 Tech",
  },
  {
    task: "Architecture + Socket events + Design system docs (docs/)",
    status: "Done",
    priority: "P2 — Later",
    sprint: "Sprint 2 — PocketBase & Persistence",
    area: "🛠 Tech",
  },

  // ── IN PROGRESS — Sprint 3 ─────────────────────────────────────────────────
  {
    task: "Player Character Sheet: spell slots & prepared spell list",
    status: "In Progress",
    priority: "P0 — Now",
    sprint: "Sprint 3 — DM Panel & Effects",
    area: "🛠 Tech",
    notes: "File: control-panel/src/routes/(cast)/players/[id]/+page.svelte — ~50% complete",
  },
  {
    task: "Player Character Sheet: saving throws with proficiency tracking",
    status: "In Progress",
    priority: "P0 — Now",
    sprint: "Sprint 3 — DM Panel & Effects",
    area: "🛠 Tech",
  },
  {
    task: "DM Panel: NPC stat block reference (full stat block rendering)",
    status: "In Progress",
    priority: "P0 — Now",
    sprint: "Sprint 3 — DM Panel & Effects",
    area: "🛠 Tech",
    notes: "File: control-panel/src/routes/(cast)/dm/+page.svelte — ~40% complete",
  },

  // ── BACKLOG — Sprint 3 ─────────────────────────────────────────────────────
  {
    task: "Player Character Sheet: skill proficiency visual indicators (proficient vs expertise)",
    status: "Backlog",
    priority: "P0 — Now",
    sprint: "Sprint 3 — DM Panel & Effects",
    area: "🛠 Tech",
  },
  {
    task: "Player Character Sheet: hit dice tracking + short rest interaction",
    status: "Backlog",
    priority: "P0 — Now",
    sprint: "Sprint 3 — DM Panel & Effects",
    area: "🛠 Tech",
  },
  {
    task: "Player Character Sheet: equipment detail view + weight calculation",
    status: "Backlog",
    priority: "P1 — Soon",
    sprint: "Sprint 3 — DM Panel & Effects",
    area: "🛠 Tech",
  },
  {
    task: "Player Character Sheet: unlockable info gates (progressive reveal by DM)",
    status: "Backlog",
    priority: "P1 — Soon",
    sprint: "Sprint 3 — DM Panel & Effects",
    area: "🛠 Tech",
  },
  {
    task: "Player Character Sheet: personal notes editor (mid-session updates)",
    status: "Backlog",
    priority: "P1 — Soon",
    sprint: "Sprint 3 — DM Panel & Effects",
    area: "🛠 Tech",
  },
  {
    task: "Player Character Sheet: level-up calculations (HP, modifiers, spell slots)",
    status: "Backlog",
    priority: "P2 — Later",
    sprint: "Sprint 3 — DM Panel & Effects",
    area: "🛠 Tech",
  },
  {
    task: "DM Panel: campaign world knowledge base (searchable, category-based)",
    status: "Backlog",
    priority: "P0 — Now",
    sprint: "Sprint 3 — DM Panel & Effects",
    area: "🎭 Session Planning",
  },
  {
    task: "DM Panel: NPC templates for improvised encounters",
    status: "Backlog",
    priority: "P1 — Soon",
    sprint: "Sprint 3 — DM Panel & Effects",
    area: "🎭 Session Planning",
  },
  {
    task: "DM Panel: loot tracking + XP calculations",
    status: "Backlog",
    priority: "P1 — Soon",
    sprint: "Sprint 3 — DM Panel & Effects",
    area: "🎭 Session Planning",
  },
  {
    task: "DM Panel: contextual stat tooltips",
    status: "Backlog",
    priority: "P2 — Later",
    sprint: "Sprint 3 — DM Panel & Effects",
    area: "🛠 Tech",
  },
  {
    task: "Live Theme Editor: persistent save to localStorage / PocketBase",
    status: "Backlog",
    priority: "P1 — Soon",
    sprint: "Sprint 3 — DM Panel & Effects",
    area: "🛠 Tech",
    notes: "CSS injection + color picker sync already working in Storybook",
  },
  {
    task: "Live Theme Editor: theme export / import",
    status: "Backlog",
    priority: "P2 — Later",
    sprint: "Sprint 3 — DM Panel & Effects",
    area: "🛠 Tech",
  },
  {
    task: "Live Theme Editor: preset themes (dark, light, ESDH brand, Chilean Noir)",
    status: "Backlog",
    priority: "P2 — Later",
    sprint: "Sprint 3 — DM Panel & Effects",
    area: "🛠 Tech",
  },
  {
    task: "Live Theme Editor: simultaneous live preview across all overlays",
    status: "Backlog",
    priority: "P2 — Later",
    sprint: "Sprint 3 — DM Panel & Effects",
    area: "🛠 Tech",
  },

  // ── ONGOING ────────────────────────────────────────────────────────────────
  {
    task: "Verify Railway deployment: PocketBase reliability + auto-seed on first deploy",
    status: "In Progress",
    priority: "P1 — Soon",
    sprint: "Ongoing",
    area: "🛠 Tech",
    notes: "PR #47 deployed — monitor connection logs for timeout issues",
  },
  {
    task: "Repository rename: OVERLAYS → TableRelay (GitHub + CLAUDE.md + deploy configs)",
    status: "Backlog",
    priority: "P3 — Someday",
    sprint: "Ongoing",
    area: "🛠 Tech",
    notes: "Non-blocking — update railway.toml, nixpacks.toml, GitNexus index name",
  },
  {
    task: "Session 0 LAN end-to-end test (all 3 servers + OBS overlays + mobile control)",
    status: "Backlog",
    priority: "P0 — Now",
    sprint: "Ongoing",
    area: "🎭 Session Planning",
    notes: "Run bun run setup-ip, verify all overlay URLs in OBS at 1920×1080",
  },
];

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log("🎲  DADOS & RISAS — Project Board updater\n");

  // 1. Archive existing empty/placeholder rows
  console.log("📥  Fetching existing tasks...");
  const existing = await getAllExistingTasks();
  console.log(`   Found ${existing.length} existing rows`);

  const empty = existing.filter(
    (p) => !p.properties?.Task?.title?.[0]?.plain_text
  );
  if (empty.length > 0) {
    console.log(`🗑   Archiving ${empty.length} empty placeholder rows...`);
    for (const page of empty) {
      await archivePage(page.id);
      await sleep(200);
    }
    console.log("   Done.\n");
  }

  // 2. Build a set of existing task titles for upsert logic
  const named = existing.filter((p) => p.properties?.Task?.title?.[0]?.plain_text);
  const existingTitles = new Set(
    named.map((p) => p.properties.Task.title[0].plain_text.trim())
  );
  console.log(`   ${existingTitles.size} named tasks already exist — will skip duplicates.\n`);

  // 3. Create new tasks
  console.log(`📝  Creating ${TASKS.length} tasks...\n`);
  let created = 0;
  let skipped = 0;

  for (const t of TASKS) {
    if (existingTitles.has(t.task.trim())) {
      console.log(`   ↩  Skip (exists): ${t.task.slice(0, 60)}`);
      skipped++;
    } else {
      process.stdout.write(`   ➕  ${t.task.slice(0, 70)}...`);
      await createTask(t);
      console.log(" ✓");
      created++;
    }
    await sleep(300);
  }

  console.log(`\n✅  Done — created ${created}, skipped ${skipped}.`);
}

main().catch((err) => {
  console.error("\n❌  Failed:", err.message);
  process.exit(1);
});
