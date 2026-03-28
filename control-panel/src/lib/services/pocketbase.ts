import PocketBase, { ClientResponseError } from 'pocketbase';

//Imports record shape types from $lib/contracts/records.ts
import type { CharacterRecord, Condition, ResourceSlot } from '$lib/contracts/records';

//Imports the ServiceError class for consistent error handling across service functions
import { ServiceError } from './errors';

//Checks if the PocketBase URL is configured properly in environment variables, throws a ServiceError if not
function getPocketBaseURL(): string {
	// In SSR, always use localhost — VITE_POCKETBASE_URL is the LAN IP for
	// client browsers and is unreachable from the Node.js server process.
	if (import.meta.env.SSR) {
		return 'http://127.0.0.1:8090';
	}

	const url = import.meta.env.VITE_POCKETBASE_URL;

	// If the browser is running on localhost, prefer talking to local PocketBase
	// directly to avoid needing the --http=0.0.0.0 binding flag or hitting CORS.
	if (
		typeof window !== 'undefined' &&
		(window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
	) {
		// Only override if the configured URL is pointing to a different IP (LAN mode)
		if (url && !url.includes('localhost') && !url.includes('127.0.0.1')) {
			return 'http://127.0.0.1:8090';
		}
	}

	if (!url || typeof url !== 'string' || url.trim() === '') {
		return 'http://127.0.0.1:8090';
	}
	return url;
}
//Initializes and exports a singleton PocketBase client instance
export const pb = new PocketBase(getPocketBaseURL());

//Maps PocketBase errors to our ServiceError format for consistent error handling across the app
function mapPocketBaseError(
	error: unknown,
	operation: string,
	extraContext?: Record<string, unknown>
): ServiceError {
	const context = { operation, ...extraContext };
	//Already a ServiceError, pass through
	if (error instanceof ServiceError) return error;
	//PocketBase client errors with status codes
	if (error instanceof ClientResponseError) {
		switch (error.status) {
			case 400:
			case 422:
				return new ServiceError('VALIDATION', 'Invalid data for PocketBase operation', {
					context,
					cause: error
				});
			case 404:
				return new ServiceError('NOT_FOUND', 'Record not found', { context, cause: error });
			case 401:
			case 403:
				return new ServiceError('UNAUTHORIZED', 'PocketBase authorization failed', {
					context,
					cause: error
				});
		}
		// Unknown PocketBase error with status code
		return new ServiceError('UNKNOWN', error.message || 'PocketBase request failed', {
			context,
			cause: error
		});
	}
	//Network errors or other unexpected errors (e.g. TypeError from fetch)
	if (error instanceof TypeError) {
		return new ServiceError('NETWORK', 'Network error while contacting PocketBase', {
			context,
			cause: error
		});
	}
	//Unexpected error type, wrap in UNKNOWN
	return new ServiceError('UNKNOWN', 'Unexpected PocketBase service error', {
		context,
		cause: error
	});
}

//Utility function to validate that a string field is non-empty, throws a ServiceError if validation fails
function assertNonEmptyString(value: string, field: string): void {
	if (!value || typeof value !== 'string' || value.trim() === '') {
		throw new ServiceError('VALIDATION', `${field} must be a non-empty string`, {
			context: { field }
		});
	}
}

//Utility function to validate that an object is non-empty, throws a ServiceError if validation fails
function assertNonEmptyObject(value: unknown, field: string): void {
	if (
		!value ||
		typeof value !== 'object' ||
		Array.isArray(value) ||
		Object.keys(value).length === 0
	) {
		throw new ServiceError('VALIDATION', `${field} must be a non-empty object`, {
			context: { field }
		});
	}
}

//Exports a typed helper for fetching a character record by ID
//Asserts that the ID is a non-empty string before making the request, and maps any errors to ServiceError format
export async function getCharacterRecord(id: string): Promise<CharacterRecord> {
	assertNonEmptyString(id, 'ID');
	try {
		return await pb.collection('characters').getOne<CharacterRecord>(id);
	} catch (error) {
		throw mapPocketBaseError(error, 'getCharacterRecord', { id });
	}
}

//Exports a typed helper for updating a character record (partial update)
//Asserts that the ID is a non-empty string and that the data object is non-empty before making the request, and maps any errors to ServiceError format
export async function updateCharacterRecord(
	id: string,
	data: Partial<CharacterRecord>
): Promise<CharacterRecord> {
	assertNonEmptyString(id, 'ID');
	assertNonEmptyObject(data, 'Data');
	try {
		return await pb.collection('characters').update<CharacterRecord>(id, data);
	} catch (error) {
		throw mapPocketBaseError(error, 'updateCharacterRecord', { id, dataKeys: Object.keys(data) });
	}
}

// ─── Phase 1: List / Query ───────────────────────────────────────────────────

export async function listCharacterRecords(): Promise<CharacterRecord[]> {
	try {
		return await pb.collection('characters').getFullList<CharacterRecord>({ sort: 'name' });
	} catch (error) {
		throw mapPocketBaseError(error, 'listCharacterRecords');
	}
}

export async function listActiveCharacters(): Promise<CharacterRecord[]> {
	try {
		return await pb.collection('characters').getFullList<CharacterRecord>({
			filter: 'is_active = true',
			sort: 'name'
		});
	} catch (error) {
		throw mapPocketBaseError(error, 'listActiveCharacters');
	}
}

// ─── Phase 1: Conditions ─────────────────────────────────────────────────────

export async function addCondition(
	characterId: string,
	condition: Condition
): Promise<CharacterRecord> {
	assertNonEmptyString(characterId, 'Character ID');
	try {
		const char = await pb.collection('characters').getOne<CharacterRecord>(characterId);
		const conditions = [...(char.conditions ?? []), condition];
		return await pb
			.collection('characters')
			.update<CharacterRecord>(characterId, { conditions });
	} catch (error) {
		throw mapPocketBaseError(error, 'addCondition', { characterId, condition });
	}
}

export async function removeCondition(
	characterId: string,
	conditionId: string
): Promise<CharacterRecord> {
	assertNonEmptyString(characterId, 'Character ID');
	assertNonEmptyString(conditionId, 'Condition ID');
	try {
		const char = await pb.collection('characters').getOne<CharacterRecord>(characterId);
		const conditions = (char.conditions ?? []).filter((c) => c.id !== conditionId);
		return await pb
			.collection('characters')
			.update<CharacterRecord>(characterId, { conditions });
	} catch (error) {
		throw mapPocketBaseError(error, 'removeCondition', { characterId, conditionId });
	}
}

// ─── Phase 1: Resources ──────────────────────────────────────────────────────

export async function updateResource(
	characterId: string,
	resourceId: string,
	poolCurrent: number
): Promise<CharacterRecord> {
	assertNonEmptyString(characterId, 'Character ID');
	assertNonEmptyString(resourceId, 'Resource ID');
	try {
		const char = await pb.collection('characters').getOne<CharacterRecord>(characterId);
		const resources = (char.resources ?? []).map((r) => {
			if (r.id !== resourceId) return r;
			return { ...r, pool_current: Math.max(0, Math.min(poolCurrent, r.pool_max)) };
		});
		return await pb
			.collection('characters')
			.update<CharacterRecord>(characterId, { resources });
	} catch (error) {
		throw mapPocketBaseError(error, 'updateResource', { characterId, resourceId });
	}
}

export async function restoreResources(
	characterId: string,
	restType: 'short' | 'long'
): Promise<{ character: CharacterRecord; restored: string[] }> {
	assertNonEmptyString(characterId, 'Character ID');
	try {
		const char = await pb.collection('characters').getOne<CharacterRecord>(characterId);
		const restored: string[] = [];
		const resources = (char.resources ?? []).map((r) => {
			const shouldRestore =
				r.reset_on === 'short_rest' || (restType === 'long' && r.reset_on === 'long_rest');
			if (shouldRestore) {
				restored.push(r.name);
				return { ...r, pool_current: r.pool_max };
			}
			return r;
		});
		const character = await pb
			.collection('characters')
			.update<CharacterRecord>(characterId, { resources });
		return { character, restored };
	} catch (error) {
		throw mapPocketBaseError(error, 'restoreResources', { characterId, restType });
	}
}

// ─── Phase 1: Portrait ───────────────────────────────────────────────────────

export function getPortraitUrl(record: CharacterRecord): string | null {
	if (!record.portrait) return null;
	return pb.files.getUrl(record, record.portrait);
}

export function getPortraitThumbUrl(
	record: CharacterRecord,
	size: string = '100x100'
): string | null {
	if (!record.portrait) return null;
	return pb.files.getUrl(record, record.portrait, { thumb: size });
}
