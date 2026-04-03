import { io, Socket } from 'socket.io-client';
import { writable } from 'svelte/store';
import type { EventPayloadMap } from '$lib/contracts/events';
import type { CharacterRecord } from '$lib/contracts/records';
import { ServiceError } from './errors';


// Validates that the VITE_SERVER_URL environment variable is set and returns it, otherwise throws a ServiceError
function assertEnvVariable(env: string): string {
	if (!env || typeof env !== 'string' || env.trim() === '') {
		throw new ServiceError('CONFIG', 'Missing or invalid VITE_SERVER_URL environment variable');
	}
	return env;
}

// Type for Socket.io error events that we want to listen for and map to ServiceError
export type SocketErrorEvent =
	| 'connect_error'
	| 'reconnect_error'
	| 'reconnect_failed'
	| 'disconnect';
// Type for reasons provided by Socket.io on disconnect events, used for mapping to ServiceError
export type SocketDisconnectReason =
	| 'io server disconnect'
	| 'io client disconnect'
	| 'ping timeout'
	| 'transport close'
	| 'transport error';
// Type for signals emitted by Socket.io error events, used for mapping to ServiceError
type SocketErrorSignal =
	| { event: 'connect_error'; error: unknown }
	| { event: 'reconnect_error'; error: unknown }
	| { event: 'reconnect_failed' }
	| { event: 'disconnect'; reason: SocketDisconnectReason; details?: unknown };

// Maps Socket.io errors to our ServiceError format for consistent error handling across the app
function mapSocketError(
	signal: SocketErrorSignal,
	operation: string,
	extraContext?: Record<string, unknown>
): ServiceError {
	const context = { operation, ...extraContext };
	switch (signal.event) {
		case 'connect_error':
		case 'reconnect_error': {
			const message =
				signal.error instanceof Error ? signal.error.message : 'Socket connection error';
			return new ServiceError('NETWORK', message, { context, cause: signal.error });
		}
		case 'reconnect_failed':
			return new ServiceError('NETWORK', 'Socket reconnection failed after multiple attempts', {
				context
			});
		case 'disconnect': {
			switch (signal.reason) {
				case 'ping timeout':
				case 'transport close':
				case 'transport error':
					return new ServiceError('NETWORK', `Socket disconnected due to ${signal.reason}`, {
						context,
						cause: signal.details
					});
				case 'io server disconnect':
					return new ServiceError(
						'NETWORK',
						'Socket disconnected by server (possible server restart or shutdown)',
						{
							context,
							cause: signal.details
						}
					);
				case 'io client disconnect':
					return new ServiceError(
						'NETWORK',
						'Socket disconnected by client (manual disconnect or app shutdown)',
						{
							context,
							cause: signal.details
						}
					);
			}
		}
	}

	// Fallback: ensure a ServiceError is always returned for unknown signals
	// return new ServiceError('UNKNOWN', 'Unrecognized socket error signal', { context });
}

const socketURL = assertEnvVariable(import.meta.env.VITE_SERVER_URL);
export const SERVER_URL = socketURL;
// Singleton pattern to ensure only one Socket instance is created and shared across the app
export let socket: Socket | null = null;

export const socketStatus = $state({
	connected: false,
	lastSync: null as Date | null
});

//export const isConnected = $derived(socketStatus.connected);

// Use Svelte stores for cross-component singletons that are still accessed via $store syntax.
// export const characters = writable<CharacterRecord[]>([]);
export const characters = writable<CharacterRecord[]>([]);
export const lastRoll = writable<any>(null);

// Returns the singleton Socket instance — throws if connectSocket() has not been called yet
export const getSocket = (): Socket => {
	if (!socket) {
		throw new ServiceError('CONFIG', 'Socket not initialized — call connectSocket first');
	}
	return socket;
};



// Creates the socket with session/surface query params (used by the server for room joining),
// then connects. Safe to call multiple times — no-op if already connected.
export function connectSocket(sessionId: string, surface: string): void {
	if (socket?.connected) {
		console.warn('Socket is already connected, skipping connect() call', { socketId: socket.id });
		return;
	}
	if (!socket) {
		socket = io(socketURL, {
			autoConnect: false,
			query: { sessionId, surface }
		});
		bindSocketListeners();
	}
	socket.connect();
}

export function disconnectSocket(): void {
	if (!socket) {
		console.warn('Socket instance does not exist, skipping disconnect() call');
		return;
	}
	socket.disconnect();
}

function bindSocketListeners(): void {
	const s = getSocket();
	//Socket error handling: listens for connection errors and maps them to ServiceError for consistent error handling across the app
	s.on('connect_error', (error) => {
		const mapped = mapSocketError({ event: 'connect_error', error }, 'Socket Connect');
		console.error('[Socket] Connection error', mapped);
	});

	s.on('reconnect_error', (error) => {
		const mapped = mapSocketError({ event: 'reconnect_error', error }, 'Socket Reconnect');
		console.error('[Socket] Reconnect error', mapped);
	});

	s.on('reconnect_failed', () => {
		const mapped = mapSocketError({ event: 'reconnect_failed' }, 'Socket Reconnect');
		console.error('[Socket] Reconnect failed — gave up after max attempts', mapped);
	});

	s.on('disconnect', (reason, details) => {
		const mapped = mapSocketError(
			{
				event: 'disconnect',
				reason: reason as SocketDisconnectReason,
				details
			},
			'Socket Disconnect'
		);
		console.error('[Socket] Disconnected', mapped);
		socketStatus.connected = false;
	});

	// Logs successful socket connection with the socket ID for debugging purposes
	s.on('connect', () => {
		const context = { socketId: s.id };
		console.log('Socket connected successfully', context);
		socketStatus.connected = true;
		socketStatus.lastSync = new Date();
	});

	// Generic error event listener for any uncaught Socket.io errors, logs them for debugging
	s.on('error', (error) => {
		const context = { socketId: s.id };
		const mapped = new ServiceError('UNKNOWN', 'Unexpected Socket error event', {
			context,
			cause: error
		});
		console.error('[Socket] Unexpected error event', mapped);
	});

	// ── Data Sync Handlers ─────────────────────────────────────

	s.on('initialData', (data: { characters: CharacterRecord[] }) => {
		console.log('[Socket] Initial data received', { count: data.characters.length });
		characters.set(data.characters);
		socketStatus.lastSync = new Date();
	});

	s.on('characterUpdated', ({ character }: { character: CharacterRecord }) => {
		characters.update((chars) => chars.map((c) => (c.id === character.id ? character : c)));
	});

	s.on('hpUpdated', ({ character }: { character: CharacterRecord }) => {
		characters.update((chars) => chars.map((c) => (c.id === character.id ? character : c)));
	});

	s.on('characterCreated', ({ character }: { character: CharacterRecord }) => {
		characters.update((chars) => [...chars, character]);
	});

	s.on('characterDeleted', ({ charId }: { charId: string }) => {
		characters.update((chars) => chars.filter((c) => c.id !== charId));
	});

	s.on('diceRolled', (data: any) => {
		lastRoll.set(data);
	});
}

// Typed subscription function for Socket.io events,
// ensuring that handlers receive the correct payload types
// based on the EventPayloadMap interface
export function subscribe<K extends keyof EventPayloadMap>(
	event: K,
	handler: (payload: EventPayloadMap[K]) => void
): () => void {
	if (!socket) {
		throw new ServiceError('CONFIG', 'Socket instance is not initialized');
	}
	socket.on(event as string, handler as any);
	return () => socket?.off(event as string, handler as any);
}

//Typed emit
export function emit<K extends keyof EventPayloadMap>(event: K, payload: EventPayloadMap[K]): void {
	if (!socket?.connected) {
		console.warn(`[Socket] emit '${event}' dropped — not connected`);
		throw new ServiceError('CONFIG', 'Socket is not connected');
	}
	socket.emit(event as string, payload);
}
