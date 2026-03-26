---
name: pocketbase-sdk
description: PocketBase JS SDK reference for TableRelay — CRUD patterns, filtering, auth, file uploads, realtime, and error mapping. Use when writing or reviewing any code that touches PocketBase collections.
argument-hint: /pocketbase-sdk [topic] — topic is crud | filter | auth | files | realtime | errors | schema | all. Defaults to "all".
user-invocable: true
---

# PocketBase SDK — TableRelay Reference

Project-specific guide for the PocketBase JavaScript SDK (`pocketbase` npm package).
SDK docs: https://github.com/pocketbase/js-sdk

**Hard rules:**
- Never import PocketBase directly in components — always go through `$lib/services/pocketbase.ts` (frontend) or `src/server/pb.ts` (backend).
- Never call `pb.collection().getOne()` without a try/catch — it **throws** `ClientResponseError` on 404, not returns null.
- Never hardcode PocketBase URLs — use `VITE_POCKETBASE_URL` (frontend) or `POCKETBASE_URL` (backend).
- All service functions must map errors to `ServiceError` via the private error mapper pattern.

---

## Where PocketBase Lives in This Project

| Layer | File | Instance | Used for |
|-------|------|----------|----------|
| Backend | `src/server/pb.ts` | `pb` singleton | All REST handler CRUD, seeding |
| Frontend | `control-panel/src/lib/services/pocketbase.ts` | `pb` singleton | `getCharacterRecord`, `updateCharacterRecord` |
| Data modules | `data/characters.js`, `data/rolls.js` | `pb` passed as arg | Legacy CRUD wrappers (JS, not TS) |

**Backend init pattern** (`src/server/pb.ts`):
```typescript
import PocketBase from 'pocketbase';
export const pb = new PocketBase(process.env.POCKETBASE_URL);

export async function connectToPocketBase(): Promise<void> {
  await pb.admins.authWithPassword(process.env.PB_MAIL!, process.env.PB_PASS!);
}
```

**Frontend init pattern** (`control-panel/src/lib/services/pocketbase.ts`):
```typescript
import PocketBase from 'pocketbase';
export const pb = new PocketBase(import.meta.env.VITE_POCKETBASE_URL);
```

---

## CRUD Operations

All methods are typed via TypeScript generics. Always pass your record type:

```typescript
import type { CharacterRecord } from '$lib/contracts/records';

// Get one by ID — throws ClientResponseError(404) if not found
const char = await pb.collection('characters').getOne<CharacterRecord>(id);

// List with pagination
const page = await pb.collection('characters').getList<CharacterRecord>(1, 20, {
  filter: 'hp_current > 0',
  sort: '-created',
});
// page.items: CharacterRecord[]
// page.totalItems: number
// page.totalPages: number

// Get ALL records (no pagination) — use carefully on large collections
const all = await pb.collection('characters').getFullList<CharacterRecord>({
  sort: 'name',
});

// Get first match (throws 404 if none found)
const first = await pb.collection('characters').getFirstListItem<CharacterRecord>(
  'name = "Vex"'
);

// Create
const created = await pb.collection('characters').create<CharacterRecord>({
  name: 'Vex',
  player: 'Lucas',
  hp_max: 45,
  hp_current: 45,
});

// Update (partial — only send changed fields)
const updated = await pb.collection('characters').update<CharacterRecord>(id, {
  hp_current: 30,
});

// Delete
await pb.collection('characters').delete(id);
```

---

## Filtering & Query Options

### `pb.filter()` — always use for user-supplied values

```typescript
// Safe parameterized filter — handles escaping automatically
const records = await pb.collection('characters').getList(1, 50, {
  filter: pb.filter('name = {:name} && hp_current > {:hp}', {
    name: "Vex'aroth",  // special chars auto-escaped
    hp: 0,
  }),
});
```

### Filter syntax

| Operator | Meaning | Example |
|----------|---------|---------|
| `=` | equal | `status = "active"` |
| `!=` | not equal | `hp_current != hp_max` |
| `>` `>=` `<` `<=` | comparison | `hp_current < 10` |
| `~` | contains / like | `name ~ "vex"` |
| `!~` | not contains | `name !~ "test"` |
| `&&` | AND | `a = 1 && b = 2` |
| `\|\|` | OR | `a = 1 \|\| b = 2` |
| `?=` | any in array equals | `conditions:each.condition_name ?= "Poisoned"` |

### Sort syntax

```typescript
sort: '-created'      // descending by created
sort: 'name,-created' // name ASC, then created DESC
```

### Expand relations

```typescript
const char = await pb.collection('characters').getOne(id, {
  expand: 'campaign,resources',
});
// char.expand.campaign: CampaignRecord
```

### Select specific fields (reduces payload)

```typescript
const chars = await pb.collection('characters').getFullList({
  fields: 'id,name,hp_current,hp_max',
});
```

---

## Error Handling

`ClientResponseError` is thrown by every failed SDK call. **Never** let it propagate — map it to `ServiceError`.

### `ClientResponseError` shape

```typescript
error.status          // HTTP status code: 400, 401, 403, 404, 422, 500
error.response        // { code, message, data: { field: { code, message } } }
error.isAbort         // true if request was cancelled
error.originalError   // underlying fetch/network error
```

### Canonical error mapper pattern (copy into every new service)

```typescript
import { ClientResponseError } from 'pocketbase';
import { ServiceError } from './errors';

function mapPbError(
  error: unknown,
  operation: string,
  extraContext?: Record<string, unknown>
): ServiceError {
  const context = { operation, ...extraContext };
  if (error instanceof ServiceError) return error;
  if (error instanceof ClientResponseError) {
    if (error.isAbort) return new ServiceError('NETWORK', 'Request cancelled', { context });
    switch (error.status) {
      case 400:
      case 422: return new ServiceError('VALIDATION', 'Invalid data', { context, cause: error });
      case 404: return new ServiceError('NOT_FOUND', 'Record not found', { context, cause: error });
      case 401:
      case 403: return new ServiceError('UNAUTHORIZED', 'Auth failed', { context, cause: error });
    }
    return new ServiceError('UNKNOWN', error.message || 'PocketBase error', { context, cause: error });
  }
  if (error instanceof TypeError) {
    return new ServiceError('NETWORK', 'Network error', { context, cause: error });
  }
  return new ServiceError('UNKNOWN', 'Unexpected error', { context, cause: error });
}
```

### Usage

```typescript
export async function getCharacter(id: string): Promise<CharacterRecord> {
  assertNonEmptyString(id, 'ID');
  try {
    return await pb.collection('characters').getOne<CharacterRecord>(id);
  } catch (error) {
    throw mapPbError(error, 'getCharacter', { id });
  }
}
```

### Catching in components

```typescript
try {
  const char = await getCharacter(id);
} catch (err) {
  if (err instanceof ServiceError) {
    if (err.code === 'NOT_FOUND') goto('/characters');
    if (err.code === 'NETWORK') showOfflineBanner();
    if (err.code === 'UNAUTHORIZED') goto('/login');
  }
}
```

---

## Auth

### Backend — admin auth (used in `src/server/pb.ts`)

```typescript
// Auth as admin — gives full access to all collections
await pb.admins.authWithPassword(email, password);

// Refresh if token is expiring
await pb.admins.authRefresh();

// Check if still authenticated
pb.authStore.isValid  // boolean
pb.authStore.token    // JWT string
```

### Frontend — user auth (if adding per-player auth in Phase 1+)

```typescript
// Login
const authData = await pb.collection('users').authWithPassword(email, password);
authData.record  // user record
authData.token   // JWT

// Check auth state
pb.authStore.isValid   // true if token is present and not expired
pb.authStore.record    // current user record
pb.authStore.token     // JWT string

// Logout
pb.authStore.clear();

// Listen for auth state changes
pb.authStore.onChange((token, record) => {
  // fires whenever auth state changes
});

// Refresh token
await pb.collection('users').authRefresh();
```

**Current state:** TableRelay uses admin auth only (backend singleton). No per-user auth yet — planned for Phase 2+ when player login is scoped.

---

## File Uploads

PocketBase accepts `File`, `Blob`, or `FormData`. The SDK handles multipart serialization automatically.

```typescript
// Upload a photo when creating a character
const char = await pb.collection('characters').create({
  name: 'Vex',
  photo: new File([blob], 'vex.jpg', { type: 'image/jpeg' }),
});

// Update photo on an existing record
await pb.collection('characters').update(id, {
  photo: new File([blob], 'vex-new.jpg', { type: 'image/jpeg' }),
});

// Delete a file field — set to empty string
await pb.collection('characters').update(id, { photo: '' });

// Get file URL
const url = pb.files.getUrl(record, record.photo);
// Returns: http://127.0.0.1:8090/api/files/{collectionId}/{recordId}/{filename}

// With thumbnail (if configured in PocketBase admin)
const thumb = pb.files.getUrl(record, record.photo, { thumb: '100x100' });
```

**Project context:** Photo uploads go through `PUT /api/characters/:id/photo` on the backend, which calls `updatePhoto` in `data/characters.js`. The backend stores the file in PocketBase and emits `character_updated`.

---

## Realtime Subscriptions

> **Note:** TableRelay uses Socket.io for realtime — not PocketBase realtime. These patterns are documented for completeness and future use (e.g., admin tooling or Phase 3+ features where PocketBase realtime may complement Socket.io).

```typescript
// Subscribe to all events on a collection
const unsub = await pb.collection('characters').subscribe('*', (e) => {
  console.log(e.action); // 'create' | 'update' | 'delete'
  console.log(e.record); // the affected record
});

// Subscribe to a specific record
const unsub = await pb.collection('characters').subscribe(recordId, (e) => {
  if (e.action === 'update') updateUI(e.record);
});

// Unsubscribe
await unsub();
// or unsubscribe all
await pb.collection('characters').unsubscribe();
```

**When to use PocketBase realtime vs Socket.io:**
- Socket.io: Stage → all clients (HP, conditions, dice, encounters) — use this
- PocketBase realtime: admin tooling, background sync tasks, future webhook-style logic

---

## Schema Design (TASK-1.1)

When defining new PocketBase collections in the admin UI (`:8090/_/`):

### Field types quick reference

| PocketBase type | Use for |
|-----------------|---------|
| `text` | names, labels, short strings |
| `number` | HP, AC, scores, levels |
| `bool` | flags (active, visible) |
| `select` | enum values (recharge type, rest type) |
| `json` | nested objects (ability_scores, resources array) |
| `file` | photo/avatar uploads |
| `relation` | foreign key to another collection |
| `date` | timestamps |
| `autodate` | `created`, `updated` (auto-managed) |

### API Rules

Set in the collection's API Rules tab. Protect collections from unauthenticated access:

```
// Allow only admin (empty rule = admin-only)
List/Search:  (leave empty)
View:         (leave empty)
Create:       (leave empty)
Update:       (leave empty)
Delete:       (leave empty)
```

For player-read access (Phase 1 — players reading their own character):
```
View rule: id = @request.auth.record.characterId
```

### `characters` collection — current field map

Based on existing `data/characters.js` and `$lib/contracts/records.ts`:

| Field | Type | Notes |
|-------|------|-------|
| `id` | auto | 5-char ID via seed script |
| `name` | text | required |
| `player` | text | real name |
| `hp_current` | number | 0 – hp_max |
| `hp_max` | number | required |
| `hp_temp` | number | default 0 |
| `armor_class` | number | |
| `speed_walk` | number | feet |
| `ability_scores` | json | `{ str, dex, con, int, wis, cha }` |
| `conditions` | json | `Condition[]` — id, condition_name, intensity_level, applied_at |
| `resources` | json | `Resource[]` — id, name, pool_max, pool_current, recharge |
| `photo` | file | avatar image |
| `class_primary` | json | class object |
| `character_options` | json | race, background, skills, languages, etc. |

---

## Auto-Cancellation

Duplicate in-flight requests with the same key are auto-cancelled. Control with `requestKey`:

```typescript
// Disable auto-cancel (e.g., polling)
await pb.collection('characters').getList(1, 10, { requestKey: null });

// Custom key (cancels previous with same key)
await pb.collection('characters').getList(1, 10, { requestKey: 'char-list' });
```

---

## Adding a New Service

When adding a new collection and service (e.g. for TASK-1.1):

1. Define the collection in PocketBase admin (`:8090/_/`)
2. Add the record type to `control-panel/src/lib/contracts/records.ts`
3. Run `/service-stub <name>` to scaffold `control-panel/src/lib/services/<name>.ts`
4. Run the `ts-contract-reviewer` agent to verify compliance
5. Run `bunx svelte-check` from `control-panel/` to confirm no TypeScript errors
6. Update `docs/API.md` via `/doc-steward api`
