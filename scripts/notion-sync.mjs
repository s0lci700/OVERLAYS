#!/usr/bin/env node
// notion-sync.mjs
// Syncs GitHub Issues to the Notion Tasks database.
//
// Usage:
//   OPERATION=create ISSUE_NUMBER=12 ISSUE_TITLE="Fix x" \
//   AREA_LABEL=area:frontend PRIORITY_LABEL=p1 SIZE_LABEL=size:small \
//   MILESTONE_TITLE="Sprint 1 — Bug Fix & Stability" \
//   NOTION_API_TOKEN=secret_xxx node scripts/notion-sync.mjs
//
//   OPERATION=close ISSUE_NUMBER=12 \
//   NOTION_API_TOKEN=secret_xxx node scripts/notion-sync.mjs

const NOTION_TOKEN = process.env.NOTION_API_TOKEN;
const DATABASE_ID = "872101a9165a4c8dabc02cfe03c2614b";
const NOTION_VERSION = "2022-06-28";

if (!NOTION_TOKEN) {
  console.error("NOTION_API_TOKEN is not set.");
  process.exit(1);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function notionRequest(method, path, body) {
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

// ─── Label → Notion field maps ───────────────────────────────────────────────

const AREA_MAP = {
  "area:frontend": "🎨 Frontend",
  "area:backend": "⚙️ Backend",
};

const PRIORITY_MAP = {
  p0: "P0 — Now",
  p1: "P1 — Soon",
  p2: "P2 — Later",
  p3: "P3 — Someday",
};

const SIZE_MAP = {
  "size:quick": "Quick",
  "size:small": "Small",
  "size:medium": "Medium",
  "size:large": "Large",
};

function milestoneToStatus(milestoneTitle) {
  if (milestoneTitle?.includes("Sprint 1")) return "Sprint 1";
  if (milestoneTitle?.includes("Sprint 2")) return "Sprint 2";
  return "Backlog";
}

// ─── Operations ──────────────────────────────────────────────────────────────

async function createTask() {
  const issueNumber = parseInt(process.env.ISSUE_NUMBER);
  const issueTitle = process.env.ISSUE_TITLE;
  const areaLabel = process.env.AREA_LABEL;
  const priorityLabel = process.env.PRIORITY_LABEL;
  const sizeLabel = process.env.SIZE_LABEL;
  const milestoneTitle = process.env.MILESTONE_TITLE;

  if (!issueNumber || !issueTitle) {
    console.error("ISSUE_NUMBER and ISSUE_TITLE are required for create.");
    process.exit(1);
  }

  // Check if a task with this Issue # already exists
  const existing = await notionRequest(
    "POST",
    `/databases/${DATABASE_ID}/query`,
    { filter: { property: "Issue #", number: { equals: issueNumber } } }
  );

  if (existing.results.length > 0) {
    console.log(
      `Task for Issue #${issueNumber} already exists in Notion. Skipping.`
    );
    return;
  }

  const properties = {
    Task: { title: [{ text: { content: issueTitle } }] },
    "Issue #": { number: issueNumber },
  };

  if (areaLabel && AREA_MAP[areaLabel]) {
    properties.Area = { select: { name: AREA_MAP[areaLabel] } };
    properties.Sprint = {
      select: {
        name: milestoneTitle ?? "Sprint 1 — Bug Fix & Stability",
      },
    };
    properties.Status = {
      select: { name: milestoneToStatus(milestoneTitle) },
    };
  }
  if (priorityLabel && PRIORITY_MAP[priorityLabel]) {
    properties.Priority = { select: { name: PRIORITY_MAP[priorityLabel] } };
  }
  if (sizeLabel && SIZE_MAP[sizeLabel]) {
    properties.Size = { select: { name: SIZE_MAP[sizeLabel] } };
  }

  const page = await notionRequest("POST", "/pages", {
    parent: { database_id: DATABASE_ID },
    properties,
  });

  console.log(
    `Created Notion task: "${issueTitle}" (Issue #${issueNumber}) → ${page.url}`
  );
}

async function closeTask() {
  const issueNumber = parseInt(process.env.ISSUE_NUMBER);
  if (!issueNumber) {
    console.error("ISSUE_NUMBER is required for close.");
    process.exit(1);
  }

  const result = await notionRequest(
    "POST",
    `/databases/${DATABASE_ID}/query`,
    { filter: { property: "Issue #", number: { equals: issueNumber } } }
  );

  if (result.results.length === 0) {
    console.log(
      `No Notion task found for Issue #${issueNumber}. Nothing to close.`
    );
    return;
  }

  const pageId = result.results[0].id;
  await notionRequest("PATCH", `/pages/${pageId}`, {
    properties: { Status: { select: { name: "Done" } } },
  });

  console.log(`Notion task for Issue #${issueNumber} → Done.`);
}

// ─── Main ────────────────────────────────────────────────────────────────────

const operation = process.env.OPERATION;
if (operation === "create") {
  await createTask();
} else if (operation === "close") {
  await closeTask();
} else {
  console.error(`Unknown OPERATION: "${operation}". Use "create" or "close".`);
  process.exit(1);
}
