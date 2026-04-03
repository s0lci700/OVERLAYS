import { pb } from '$lib/services/pocketbase';
import { ServiceError } from '$lib/services/errors';
import type { Handle, HandleServerError } from '@sveltejs/kit';

// ─── init ────────────────────────────────────────────────────────────────────
// Runs once when the SvelteKit server process starts.
// Verifies PocketBase is reachable before the first request lands.
// Failure is non-fatal — socket.io fills character data once connected.

export async function init() {
	try {
		await pb.health.check();
		console.log('[hooks] PocketBase reachable at startup');
	} catch {
		console.warn('[hooks] PocketBase unreachable at startup — server loads will degrade gracefully');
	}
}

// ─── handle ──────────────────────────────────────────────────────────────────
// Passthrough for now — placeholder for future auth gating.

export const handle: Handle = async ({ event, resolve }) => {
	return resolve(event);
};

// ─── handleError ─────────────────────────────────────────────────────────────
// Catches unexpected errors that escape load functions without being caught.
// Does NOT fire for SvelteKit's error() helper — those are handled separately.

export const handleError: HandleServerError = ({ error, event, status, message }) => {
	if (error instanceof ServiceError) {
		console.error(
			`[server error] ServiceError(${error.code}) on ${event.url.pathname}:`,
			error.message,
			error.context ?? ''
		);
		return {
			message: publicMessage(error.code),
			code: error.code
		};
	}

	console.error(`[server error] ${status} on ${event.url.pathname}:`, error);
	return {
		message: message ?? 'Something went wrong',
		code: 'UNKNOWN'
	};
};

function publicMessage(code: ServiceError['code']): string {
	switch (code) {
		case 'NOT_FOUND':
			return 'Character not found';
		case 'NETWORK':
			return 'Could not reach the database';
		case 'UNAUTHORIZED':
			return 'Not authorized';
		case 'VALIDATION':
			return 'Invalid request';
		default:
			return 'Something went wrong';
	}
}
