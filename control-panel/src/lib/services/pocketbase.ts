import PocketBase, { ClientResponseError } from 'pocketbase';

//Imports record shape types from $lib/contracts/records.ts
import type { CharacterRecord } from '$lib/contracts/records';

//Imports the ServiceError class for consistent error handling across service functions
import { ServiceError } from './errors';

//Checks if the PocketBase URL is configured properly in environment variables, throws a ServiceError if not
function getPocketBaseURL(): string {
	const url = import.meta.env.VITE_POCKETBASE_URL;
	if (!url || typeof url !== 'string' || url.trim() === '') {
		throw new ServiceError('CONFIG', 'Missing or invalid VITE_POCKETBASE_URL environment variable');
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
