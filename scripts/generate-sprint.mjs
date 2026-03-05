#!/usr/bin/env node
// generate-sprint.mjs
// Generates SPRINT.md from the active GitHub Milestone.
// Called by .github/workflows/sprint-file.yml
// Usage: GITHUB_TOKEN=xxx REPO=s0lci700/OVERLAYS node scripts/generate-sprint.mjs

import { execSync } from "child_process";
import { writeFileSync } from "fs";

const REPO = process.env.REPO || "s0lci700/OVERLAYS";
const TOKEN = process.env.GITHUB_TOKEN;

function gh(endpoint) {
  const result = execSync(`gh api "${endpoint}" --paginate`, {
    env: { ...process.env, GH_TOKEN: TOKEN },
    encoding: "utf8",
  });
  return JSON.parse(result);
}

// Get the earliest open milestone (= current sprint)
const milestones = gh(
  `repos/${REPO}/milestones?state=open&sort=created&direction=asc`
);
if (milestones.length === 0) {
  console.log("No open milestones found. Writing empty SPRINT.md.");
  writeFileSync("SPRINT.md", "# No active sprint\n");
  process.exit(0);
}

const milestone = milestones[0];
console.log(`Active milestone: ${milestone.title} (#${milestone.number})`);

// Get all open issues in this milestone
const openIssues = gh(
  `repos/${REPO}/issues?milestone=${milestone.number}&state=open&per_page=100`
);

// Get recently closed issues (last 7 days) for the Done section
const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
const closedIssues = gh(
  `repos/${REPO}/issues?milestone=${milestone.number}&state=closed&since=${since}&per_page=50`
);

function getLabel(issue, prefix) {
  const match = issue.labels.find((l) => l.name.startsWith(prefix));
  return match ? match.name : null;
}

function formatIssue(issue) {
  const priority = getLabel(issue, "p") ?? "?";
  const size = getLabel(issue, "size:") ?? "?";
  return `- [ ] #${issue.number} ${issue.title} [${priority}, ${size}]`;
}

function formatClosedIssue(issue) {
  const priority = getLabel(issue, "p") ?? "?";
  return `- [x] #${issue.number} ${issue.title} [${priority}]`;
}

const frontend = openIssues.filter(
  (i) => getLabel(i, "area:") === "area:frontend"
);
const backend = openIssues.filter(
  (i) => getLabel(i, "area:") === "area:backend"
);
const other = openIssues.filter((i) => !getLabel(i, "area:"));

const now =
  new Date().toISOString().replace("T", " ").slice(0, 16) + " UTC";
const openCount = openIssues.length;
const closedCount = closedIssues.length;

const lines = [
  `# Active Sprint: ${milestone.title}`,
  ``,
  `> Auto-generated from GitHub Issues. Do not edit manually.`,
  `> ${openCount} open · ${closedCount} closed this week · Last updated: ${now}`,
  ``,
];

if (frontend.length > 0) {
  lines.push(`## 🎨 Frontend`, ``);
  frontend.forEach((i) => lines.push(formatIssue(i)));
  lines.push(``);
}

if (backend.length > 0) {
  lines.push(`## ⚙️ Backend`, ``);
  backend.forEach((i) => lines.push(formatIssue(i)));
  lines.push(``);
}

if (other.length > 0) {
  lines.push(`## 📋 Other`, ``);
  other.forEach((i) => lines.push(formatIssue(i)));
  lines.push(``);
}

if (closedIssues.length > 0) {
  lines.push(`## ✅ Closed This Week`, ``);
  closedIssues.forEach((i) => lines.push(formatClosedIssue(i)));
  lines.push(``);
}

lines.push(`---`);
lines.push(
  `[Full board on Notion](https://notion.so/319b63b6f5ec81bcbe9aeb2b6815c88c) · [GitHub Issues](https://github.com/${REPO}/issues)`
);

writeFileSync("SPRINT.md", lines.join("\n"));
console.log(`SPRINT.md written (${lines.length} lines).`);
