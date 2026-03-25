---
name: service-stub
description: Scaffold a new TypeScript service file in control-panel/src/lib/services/ following project conventions — ServiceError, typed contracts, PocketBase try/catch pattern, private error mapper, and validation helpers.
---

# service-stub

When the user invokes `/service-stub <name>`, scaffold a new typed service file at:
`control-panel/src/lib/services/<name>.ts`

## Step 1 — Gather context

Before writing any code, ask the user:

1. **PocketBase collection name** — what collection does this service wrap? (e.g. `characters`, `rolls`, `campaigns`)
2. **Operations needed** — which CRUD operations? (get by ID, list all, create, update, delete)
3. **Contract types** — which types from `$lib/contracts` does this service use? Check `$lib/contracts/records.ts` and any relevant domain contract file (cast.ts, stage.ts, etc.) to confirm exact type names before answering
4. **Socket events** — does this service subscribe to or emit any Socket.io events? If yes, which keys from `EventPayloadMap` in `$lib/contracts/events`?

Do NOT proceed to step 2 until the user has answered these questions.

## Step 2 — Scaffold the file

Write `control-panel/src/lib/services/<name>.ts` with this structure:

```typescript
import { ClientResponseError } from 'pocketbase';
import type { <RelevantTypes> } from '$lib/contracts/records';
// Add other contract imports as needed
import { pb } from './pocketbase';
import { ServiceError } from './errors';
// Only include if socket events are needed:
// import { subscribe, emit } from './socket';
// import type { EventPayloadMap } from '$lib/contracts/events';

// ─── Private validators ────────────────────────────────────────────────────

function assertNonEmptyString(value: string, field: string): void {
    if (!value || typeof value !== 'string' || value.trim() === '') {
        throw new ServiceError('VALIDATION', `${field} must be a non-empty string`, {
            context: { field }
        });
    }
}

function assertNonEmptyObject(value: unknown, field: string): void {
    if (
        !value ||
        typeof value !== 'object' ||
        Array.isArray(value) ||
        Object.keys(value as object).length === 0
    ) {
        throw new ServiceError('VALIDATION', `${field} must be a non-empty object`, {
            context: { field }
        });
    }
}

// ─── Private error mapper ──────────────────────────────────────────────────

function map<Name>Error(
    error: unknown,
    operation: string,
    extraContext?: Record<string, unknown>
): ServiceError {
    const context = { operation, ...extraContext };
    if (error instanceof ServiceError) return error;
    if (error instanceof ClientResponseError) {
        switch (error.status) {
            case 400:
            case 422:
                return new ServiceError('VALIDATION', 'Invalid data', { context, cause: error });
            case 404:
                return new ServiceError('NOT_FOUND', 'Record not found', { context, cause: error });
            case 401:
            case 403:
                return new ServiceError('UNAUTHORIZED', 'Authorization failed', { context, cause: error });
        }
        return new ServiceError('UNKNOWN', error.message || 'Request failed', { context, cause: error });
    }
    if (error instanceof TypeError) {
        return new ServiceError('NETWORK', 'Network error', { context, cause: error });
    }
    return new ServiceError('UNKNOWN', 'Unexpected error', { context, cause: error });
}

// ─── Exports ───────────────────────────────────────────────────────────────

/** Fetches a <Collection> record by ID. */
export async function get<Name>(id: string): Promise<<RecordType>> {
    assertNonEmptyString(id, 'ID');
    try {
        return await pb.collection('<collection>').getOne<<RecordType>>(id);
    } catch (error) {
        throw map<Name>Error(error, 'get<Name>', { id });
    }
}

/** Updates a <Collection> record (partial update). */
export async function update<Name>(id: string, data: Partial<<RecordType>>): Promise<<RecordType>> {
    assertNonEmptyString(id, 'ID');
    assertNonEmptyObject(data, 'Data');
    try {
        return await pb.collection('<collection>').update<<RecordType>>(id, data);
    } catch (error) {
        throw map<Name>Error(error, 'update<Name>', { id, dataKeys: Object.keys(data) });
    }
}
```

Replace all `<Name>`, `<name>`, `<Collection>`, `<collection>`, and `<RecordType>` placeholders with the actual values from step 1. Add or remove exported functions to match the operations the user requested.

## Step 3 — Confirm

After writing the file, tell the user:
- The file path created
- Which exports were stubbed
- Run `bunx svelte-check` from `control-panel/` to confirm no TypeScript errors
- Run the `ts-contract-reviewer` agent on the new file to verify compliance before implementing the function bodies
