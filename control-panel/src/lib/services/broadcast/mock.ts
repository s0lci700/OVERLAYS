import type {
	BroadcastAdapter,
	BroadcastEvent,
	BroadcastStatus,
	TallyState
} from '$lib/contracts/broadcast';

export class MockBroadcastAdapter implements BroadcastAdapter {
	private status: BroadcastStatus = 'disconnected';

	async connect(): Promise<void> {
		this.status = 'connected';
		console.log('[MockBroadcast] connected');
	}

	disconnect(): void {
		this.status = 'disconnected';
		console.log('[MockBroadcast] disconnected');
	}

	async setScene(sceneName: string): Promise<void> {
		console.log('[MockBroadcast] setScene:', sceneName);
	}

	async setSourceVisible(scene: string, sourceName: string, visible: boolean): Promise<void> {
		console.log('[MockBroadcast] setSourceVisible:', { scene, source: sourceName, visible });
	}

	async triggerOverlay(channel: 1 | 2 | 3 | 4): Promise<void> {
		console.log('[MockBroadcast] triggerOverlay channel:', channel);
	}

	async hideOverlay(channel: 1 | 2 | 3 | 4): Promise<void> {
		console.log('[MockBroadcast] hideOverlay channel:', channel);
	}

	async getTallyState(): Promise<TallyState> {
		return { programInput: 'mock-scene', previewInput: 'mock-preview' };
	}

	getStatus(): BroadcastStatus {
		return this.status;
	}

	on(_event: BroadcastEvent, _handler: (data: unknown) => void): () => void {
		return () => {}; // no-op unsubscribe
	}
}
