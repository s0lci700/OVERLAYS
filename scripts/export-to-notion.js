#!/usr/bin/env node
"use strict";
/**
 * @module export-to-notion
 * @group Scripts
 * @description Exports core DADOS & RISAS documentation and the live OpenAPI spec to Notion.
 *
 * Creates (or reuses) a root "DADOS & RISAS Docs" page under your chosen parent,
 * then creates or updates a sub-page for each doc file with all content converted
 * to Notion blocks. Existing pages are reused and their content is replaced rather
 * than duplicated.
 *
 * If the server is running, it also exports the full OpenAPI spec (from `/api-docs.json`)
 * as an "API Reference (OpenAPI)" page in Notion.
 *
 * ## Usage
 * ```bash
 * NOTION_TOKEN=secret_xxx NOTION_PARENT_PAGE_ID=<page-id> bun scripts/export-to-notion.js
 * ```
 *
 * ## Setup (one-time)
 * 1. Go to https://www.notion.so/my-integrations → New integration
 * 2. Copy the "Internal Integration Secret" → use as `NOTION_TOKEN`
 * 3. Open the Notion page where docs should live
 * 4. Click `···` (top-right) → Connections → add your integration
 * 5. Copy the page ID from the URL:
 *    `https://www.notion.so/My-Page-<PAGE_ID_HERE>`
 *    (the 32-char hex string, with or without dashes)
 *    → use as `NOTION_PARENT_PAGE_ID`
 *
 * ## Environment variables
 * | Variable | Description |
 * |----------|-------------|
 * | `NOTION_TOKEN` | Notion integration secret |
 * | `NOTION_PARENT_PAGE_ID` | Target Notion page ID |
 * | `SERVER_URL` | API server URL (default: `http://localhost:3000`) |
 */

const fs = require("fs");
const http = require("http");
const https = require("https");
const path = require("path");

const TOKEN = process.env.NOTION_TOKEN;
const PARENT_ID = (process.env.NOTION_PARENT_PAGE_ID || "").replace(/-/g, "");
const SERVER_URL = process.env.SERVER_URL || "http://localhost:3000";

if (!TOKEN || !PARENT_ID) {
  console.error("Error: both NOTION_TOKEN and NOTION_PARENT_PAGE_ID are required.");
  console.error(
    "Usage: NOTION_TOKEN=secret_xxx NOTION_PARENT_PAGE_ID=<id> bun scripts/export-to-notion.js",
  );
  process.exit(1);
}

const ROOT = path.resolve(__dirname, "..");
const NOTION_VERSION = "2022-06-28";
const API_BASE = "https://api.notion.com/v1";

// Core docs to export, in display order.
const DOCS = [
  { file: "docs/index.md",          title: "Getting Started",         emoji: "🚀" },
  { file: "README.md",              title: "Project Overview",        emoji: "📖" },
  { file: "docs/INDEX.md",          title: "Quick Reference",         emoji: "📑" },
  { file: "docs/ARCHITECTURE.md",   title: "Architecture",            emoji: "🏗️" },
  { file: "docs/API-STRUCTURE.md",  title: "API Structure",           emoji: "🔗" },
  { file: "docs/SOCKET-EVENTS.md",  title: "Socket.io Events",        emoji: "🔌" },
  { file: "docs/DESIGN-SYSTEM.md",  title: "Design System",           emoji: "🎨" },
  { file: "docs/THEMING.md",        title: "Theming & Tokens",        emoji: "🖌️" },
  { file: "docs/ENVIRONMENT.md",    title: "Environment & Networking", emoji: "⚙️" },
  { file: "docs/testing.md",        title: "Testing Guide",           emoji: "🧪" },
];

// ── Notion API ────────────────────────────────────────────────

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function notionFetch(method, endpoint, body) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Notion-Version": NOTION_VERSION,
      "Content-Type": "application/json",
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Notion ${method} ${endpoint} → HTTP ${res.status}: ${text}`);
  }
  return res.json();
}

async function createPage(parentId, title, emoji) {
  const page = await notionFetch("POST", "/pages", {
    parent: { page_id: parentId },
    icon: { type: "emoji", emoji },
    properties: {
      title: { title: [{ type: "text", text: { content: title } }] },
    },
    children: [],
  });
  return page.id;
}

// Notion allows up to 100 blocks per append request.
const BATCH_SIZE = 100;

async function appendBlocks(pageId, blocks) {
  for (let i = 0; i < blocks.length; i += BATCH_SIZE) {
    const batch = blocks.slice(i, i + BATCH_SIZE);
    await notionFetch("PATCH", `/blocks/${pageId}/children`, { children: batch });
    if (i + BATCH_SIZE < blocks.length) {
      await sleep(400); // stay well under the 3 req/s rate limit
    }
  }
}

// ── Search / upsert helpers ──────────────────────────────────

/** POST /search with a text query; returns an array of page results. */
async function searchPagesByQuery(query) {
  const res = await notionFetch("POST", "/search", {
    query,
    filter: { property: "object", value: "page" },
    page_size: 100,
  });
  return res.results || [];
}

/** Extract the plain-text title string from a Notion page object. */
function getPageTitle(page) {
  const props = page.properties || {};
  const titleProp = Object.values(props).find((p) => Array.isArray(p.title));
  if (!titleProp) return "";
  const titleArr = titleProp.title || [];
  return (
    (titleArr[0] &&
      (titleArr[0].plain_text ||
        (titleArr[0].text && titleArr[0].text.content))) ||
    ""
  );
}

/**
 * Search for a page whose parent is parentId and whose title matches title.
 * Returns the full page object if found, or null.
 */
async function findPageUnderParentByTitle(parentId, title) {
  const results = await searchPagesByQuery(title);
  for (const p of results) {
    const parent = p.parent || {};
    if (parent.type === "page_id" && parent.page_id === parentId) {
      if (getPageTitle(p).trim() === title.trim()) return p;
    }
  }
  return null;
}

/**
 * Archive all direct child blocks of a page so it can be refilled without
 * creating duplicate content.  Paginates through all children and archives
 * each one individually.
 *
 * Fallback strategy: if archiving a block fails (e.g. unsupported type or
 * permissions), the error is logged as a warning and the loop continues.
 * If the whole operation needs to be abandoned the caller can fall back to
 * archiving the page itself (PATCH /pages/{pageId} { archived: true }) and
 * creating a fresh replacement page.
 */
async function archiveAllChildrenOfPage(pageId) {
  let cursor = undefined;
  do {
    const qs = `?page_size=100${cursor ? `&start_cursor=${cursor}` : ""}`;
    const res = await notionFetch("GET", `/blocks/${pageId}/children${qs}`);
    const children = res.results || [];
    for (const c of children) {
      try {
        await notionFetch("PATCH", `/blocks/${c.id}`, { archived: true });
      } catch (err) {
        console.warn(`  Warning: could not archive block ${c.id}: ${err.message}`);
      }
    }
    cursor = res.has_more ? res.next_cursor : undefined;
  } while (cursor);
  await sleep(300);
}

// ── Markdown → Notion blocks ─────────────────────────────────

/**
 * Convert inline markdown to a Notion rich_text array.
 * Handles: **bold**, *italic*, `code`, [link](url)
 */
function richText(text) {
  if (!text || text.trim() === "") return [{ type: "text", text: { content: "" } }];

  // Notion hard-limits rich_text content to 2000 chars each
  const safeText = text.length > 2000 ? text.slice(0, 1997) + "…" : text;
  const result = [];
  const re = /(\*\*(.+?)\*\*)|(\*(.+?)\*)|(`([^`]+)`)|\[([^\]]+)\]\(([^)]+)\)/g;
  let last = 0;
  let m;

  while ((m = re.exec(safeText)) !== null) {
    if (m.index > last) {
      result.push({ type: "text", text: { content: safeText.slice(last, m.index) } });
    }
    if (m[2]) {
      // **bold**
      result.push({ type: "text", text: { content: m[2] }, annotations: { bold: true } });
    } else if (m[4]) {
      // *italic*
      result.push({ type: "text", text: { content: m[4] }, annotations: { italic: true } });
    } else if (m[6]) {
      // `code`
      result.push({ type: "text", text: { content: m[6] }, annotations: { code: true } });
    } else if (m[7]) {
      // [link](url) — only attach a link when the URL is absolute; otherwise render as plain text
      const url = m[8];
      const isAbsolute = /^https?:\/\//i.test(url);
      if (isAbsolute) {
        result.push({ type: "text", text: { content: m[7], link: { url } } });
      } else {
        result.push({ type: "text", text: { content: m[7] } });
      }
    }
    last = m.index + m[0].length;
  }

  if (last < safeText.length) {
    result.push({ type: "text", text: { content: safeText.slice(last) } });
  }
  return result.length > 0 ? result : [{ type: "text", text: { content: safeText } }];
}

const LANG_MAP = {
  js: "javascript", javascript: "javascript",
  ts: "typescript", typescript: "typescript",
  sh: "shell", bash: "shell", shell: "shell", zsh: "shell",
  json: "json", css: "css", html: "html",
  svelte: "javascript",
  md: "markdown", markdown: "markdown",
  sql: "sql", yaml: "yaml", yml: "yaml",
  txt: "plain text", "plain text": "plain text",
  "": "plain text",
};

function mapLang(raw) {
  return LANG_MAP[(raw || "").toLowerCase()] || "plain text";
}

/**
 * Convert a markdown string to an array of Notion block objects.
 * Supports: headings (H1–H3), fenced code blocks, bullet + numbered lists,
 * blockquotes, horizontal rules, tables, and paragraphs.
 */
function parseMarkdown(md) {
  const lines = md.split("\n");
  const blocks = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // ── Fenced code block ──────────────────────────────────
    if (line.startsWith("```")) {
      const lang = line.slice(3).trim();
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing ```

      const code = codeLines.join("\n");
      // Split large blocks so each chunk is under Notion's 2000-char limit
      const CHUNK = 1990;
      for (let c = 0; c < code.length || (code.length === 0 && c === 0); c += CHUNK) {
        const chunk = code.slice(c, c + CHUNK);
        blocks.push({
          type: "code",
          code: {
            rich_text: [{ type: "text", text: { content: chunk } }],
            language: mapLang(lang),
          },
        });
        if (c + CHUNK >= code.length) break;
      }
      continue;
    }

    // ── Headings ───────────────────────────────────────────
    const h3 = line.match(/^###\s+(.+)/);
    if (h3) {
      blocks.push({ type: "heading_3", heading_3: { rich_text: richText(h3[1]) } });
      i++;
      continue;
    }
    const h2 = line.match(/^##\s+(.+)/);
    if (h2) {
      blocks.push({ type: "heading_2", heading_2: { rich_text: richText(h2[1]) } });
      i++;
      continue;
    }
    const h1 = line.match(/^#\s+(.+)/);
    if (h1) {
      blocks.push({ type: "heading_1", heading_1: { rich_text: richText(h1[1]) } });
      i++;
      continue;
    }

    // ── Horizontal rule ────────────────────────────────────
    if (/^[-*_]{3,}$/.test(line.trim())) {
      blocks.push({ type: "divider", divider: {} });
      i++;
      continue;
    }

    // ── Markdown table ─────────────────────────────────────
    // Detected when the current line starts with | and the next is a separator row
    if (
      line.startsWith("|") &&
      i + 1 < lines.length &&
      /^\|[\s\-|:]+\|/.test(lines[i + 1])
    ) {
      const parseRow = (row) =>
        row
          .split("|")
          .slice(1, -1)
          .map((c) => c.trim());

      const headerCells = parseRow(line);
      const tableWidth = headerCells.length;
      const rows = [headerCells];

      i += 2; // skip header + separator
      while (i < lines.length && lines[i].startsWith("|")) {
        const cells = parseRow(lines[i]);
        // Pad or truncate to match table width
        while (cells.length < tableWidth) cells.push("");
        rows.push(cells.slice(0, tableWidth));
        i++;
      }

      blocks.push({
        type: "table",
        table: {
          table_width: tableWidth,
          has_column_header: true,
          has_row_header: false,
          children: rows.map((row) => ({
            type: "table_row",
            table_row: { cells: row.map((cell) => richText(cell)) },
          })),
        },
      });
      continue;
    }

    // ── Bulleted list ──────────────────────────────────────
    const bullet = line.match(/^[-*+]\s+(.+)/);
    if (bullet) {
      blocks.push({
        type: "bulleted_list_item",
        bulleted_list_item: { rich_text: richText(bullet[1]) },
      });
      i++;
      continue;
    }

    // ── Numbered list ──────────────────────────────────────
    const numbered = line.match(/^\d+\.\s+(.+)/);
    if (numbered) {
      blocks.push({
        type: "numbered_list_item",
        numbered_list_item: { rich_text: richText(numbered[1]) },
      });
      i++;
      continue;
    }

    // ── Blockquote ─────────────────────────────────────────
    const quote = line.match(/^>\s*(.*)/);
    if (quote) {
      blocks.push({
        type: "quote",
        quote: { rich_text: richText(quote[1]) },
      });
      i++;
      continue;
    }

    // ── Empty line (skip) ──────────────────────────────────
    if (line.trim() === "") {
      i++;
      continue;
    }

    // ── Paragraph ──────────────────────────────────────────
    blocks.push({
      type: "paragraph",
      paragraph: { rich_text: richText(line.trim()) },
    });
    i++;
  }

  return blocks;
}

// ── OpenAPI spec export ───────────────────────────────────────

/**
 * Fetch the OpenAPI JSON spec from the running server.
 * Returns null (without throwing) if the server is not reachable.
 * @returns {Promise<Object|null>}
 */
async function fetchOpenApiSpec() {
  const url = `${SERVER_URL}/api-docs.json`;
  return new Promise((resolve) => {
    const client = url.startsWith("https") ? https : http;
    const req = client.get(url, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          resolve(JSON.parse(data));
        } catch {
          resolve(null);
        }
      });
    });
    req.on("error", () => resolve(null));
    req.setTimeout(3000, () => { req.destroy(); resolve(null); });
  });
}

/**
 * Convert an OpenAPI spec object into Notion blocks grouped by tag.
 * @param {Object} spec - Parsed OpenAPI 3.0 spec
 * @returns {Object[]} Notion blocks
 */
function openApiToBlocks(spec) {
  const blocks = [];

  blocks.push({
    type: "callout",
    callout: {
      icon: { type: "emoji", emoji: "💡" },
      rich_text: richText(
        `Interactive Swagger UI: ${SERVER_URL}/api-docs | Raw spec: ${SERVER_URL}/api-docs.json`
      ),
    },
  });

  // Group paths by their first tag
  const groups = new Map();
  for (const [routePath, pathItem] of Object.entries(spec.paths || {})) {
    for (const [method, op] of Object.entries(pathItem)) {
      if (typeof op !== "object" || !op.tags?.length) continue;
      const tag = op.tags[0];
      if (!groups.has(tag)) groups.set(tag, []);
      groups.get(tag).push({ routePath, method, op });
    }
  }

  for (const [tag, operations] of groups) {
    blocks.push({ type: "heading_2", heading_2: { rich_text: richText(tag) } });
    for (const { routePath, method, op } of operations) {
      const title = `${method.toUpperCase()} ${routePath}`;
      blocks.push({ type: "heading_3", heading_3: { rich_text: richText(title) } });
      if (op.summary) {
        blocks.push({ type: "paragraph", paragraph: { rich_text: richText(`📌 ${op.summary}`) } });
      }
      if (op.description) {
        const desc = op.description.replace(/[*_`#]/g, "").slice(0, 1500);
        blocks.push({ type: "paragraph", paragraph: { rich_text: richText(desc) } });
      }
      // Request body schema
      const schema = op.requestBody?.content?.["application/json"]?.schema;
      if (schema) {
        const schemaStr = JSON.stringify(schema, null, 2).slice(0, 1990);
        blocks.push({ type: "code", code: { rich_text: [{ type: "text", text: { content: schemaStr } }], language: "json" } });
      }
      // Response codes
      const responses = Object.entries(op.responses || {})
        .map(([code, r]) => `${code}: ${r.description || ""}`)
        .join("  |  ");
      if (responses) {
        blocks.push({ type: "paragraph", paragraph: { rich_text: richText(`↩ ${responses}`) } });
      }
    }
  }

  return blocks;
}

// ── Main ──────────────────────────────────────────────────────

async function main() {
  console.log("🎲  DADOS & RISAS → Notion export\n");

  // Find or create the root page
  let rootPage = await findPageUnderParentByTitle(PARENT_ID, "DADOS & RISAS Docs");
  let rootId;
  if (rootPage) {
    rootId = rootPage.id;
    console.log(`✓  Reusing root page "DADOS & RISAS Docs" (id: ${rootId})\n`);
  } else {
    process.stdout.write('Creating root page "DADOS & RISAS Docs"... ');
    rootId = await createPage(PARENT_ID, "DADOS & RISAS Docs", "🎲");
    console.log(`✓  (id: ${rootId})\n`);
  }
  await sleep(400);

  for (const doc of DOCS) {
    const existing = await findPageUnderParentByTitle(rootId, doc.title);
    let pageId;
    if (existing) {
      pageId = existing.id;
      process.stdout.write(`  Updating "${doc.title}" (reusing page ${pageId})... `);
      await archiveAllChildrenOfPage(pageId);
    } else {
      process.stdout.write(`  Creating "${doc.title}" from ${doc.file}... `);
      pageId = await createPage(rootId, doc.title, doc.emoji);
    }
    await sleep(400);
    const content = fs.readFileSync(path.join(ROOT, doc.file), "utf-8");
    const blocks = parseMarkdown(content);
    await appendBlocks(pageId, blocks);
    console.log(`✓  ${blocks.length} blocks appended`);
    await sleep(400);
  }

  // ── Optional: export live OpenAPI spec ──
  console.log("\n  Checking for live OpenAPI spec at", `${SERVER_URL}/api-docs.json...`);
  const spec = await fetchOpenApiSpec();
  if (spec) {
    const specTitle = "API Reference (OpenAPI)";
    const existingSpec = await findPageUnderParentByTitle(rootId, specTitle);
    let specPageId;
    if (existingSpec) {
      specPageId = existingSpec.id;
      process.stdout.write(`  Updating "${specTitle}"... `);
      await archiveAllChildrenOfPage(specPageId);
    } else {
      process.stdout.write(`  Creating "${specTitle}"... `);
      specPageId = await createPage(rootId, specTitle, "🔗");
    }
    await sleep(400);
    const specBlocks = openApiToBlocks(spec);
    await appendBlocks(specPageId, specBlocks);
    console.log(`✓  ${specBlocks.length} blocks appended`);
  } else {
    console.log("  ⚠️  Server not reachable — skipping OpenAPI spec export.");
    console.log("     Start the server with `bun server.js` and re-run to include it.");
  }

  console.log("\n✅  Export complete.");
}

main().catch((err) => {
  console.error("\n❌  Export failed:", err.message);
  process.exit(1);
});
