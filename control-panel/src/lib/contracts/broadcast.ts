/**
 * BroadcastAdapter contract — abstracts OBS and vMix behind a single interface.
 * Real implementations live in services/broadcast/. Mock for dev/Storybook.
 * Phase 5 (TASK-5.6) adds OBSAdapter and vMixAdapter.
 */

export type BroadcastStatus = 'disconnected' | 'connecting' | 'connected' | 'error';
export type BroadcastEvent = 'scene_changed' | 'tally_update' | 'connection_changed';

export interface BroadcastConfig {
	software: 'obs' | 'vmix' | 'mock';
	host: string;
	port: number;
	password?: string;
	/** Maps logical overlay channels to software-specific sources/inputs */
	overlayMap?: {
		[channel: number]: {
			obsScene?: string;
			obsSource?: string;
			vmixInput?: number;
		};
	};
}

export interface TallyState {
	programInput: string | null; // what's currently live on air
	previewInput: string | null; // what's in preview
}

export interface BroadcastAdapter {
	connect(): Promise<void>;
	disconnect(): void;
	setScene(sceneName: string): Promise<void>;
	setSourceVisible(scene: string, sourceName: string, visible: boolean): Promise<void>;
	triggerOverlay(channel: 1 | 2 | 3 | 4): Promise<void>;
	hideOverlay(channel: 1 | 2 | 3 | 4): Promise<void>;
	getTallyState(): Promise<TallyState>;
	getStatus(): BroadcastStatus;
	/** Subscribe to broadcast events. Returns an unsubscribe function. */
	on(event: BroadcastEvent, handler: (data: unknown) => void): () => void;
}
