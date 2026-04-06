---
name: pocketbase-explorer
description: Inspect and query the PocketBase database. Use this skill to explore collection schemas, list records (characters, rolls, sessions), and debug data-related issues in the TableRelay system.
---

# PocketBase Explorer

This skill provides tools to interact directly with the PocketBase instance running at `http://127.0.0.1:8090`. It allows for schema inspection and data querying across all layers of the TableRelay project.

## Core Capabilities

### 1. List Collections
Identify all available collections in the database.
```bash
bun pocketbase-explorer/scripts/pb_explorer.ts list
```

### 2. Inspect Collection Schema
Get the detailed field definitions for a specific collection.
```bash
bun pocketbase-explorer/scripts/pb_explorer.ts schema <collection_name>
```

### 3. Query Records
Retrieve records from a collection with optional filters.
```bash
# Get all characters
bun pocketbase-explorer/scripts/pb_explorer.ts query characters

# Filter by player name
bun pocketbase-explorer/scripts/pb_explorer.ts query characters "player = 'Sol'"

# Get last 5 rolls
bun pocketbase-explorer/scripts/pb_explorer.ts query rolls "" "-created" 5
```

## Authentication
- **Public Reads:** Collections with `listRule: ""` (like `characters` and `rolls`) can be queried without credentials.
- **Admin Operations:** For schema inspection or private collections (like `campaigns`), ensure `PB_MAIL` and `PB_PASS` environment variables are set.

## Common Workflows

### Debugging Character State
If a character's HP or conditions aren't updating in the UI, use the `query` command to check the source of truth in PocketBase:
```bash
bun pocketbase-explorer/scripts/pb_explorer.ts query characters "name ~ 'Grog'"
```

### Verifying Roll History
To see the raw data for recent dice rolls:
```bash
bun pocketbase-explorer/scripts/pb_explorer.ts query rolls "" "-created" 10
```
