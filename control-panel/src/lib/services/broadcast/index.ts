import type { BroadcastAdapter, BroadcastConfig } from '$lib/contracts/broadcast';
import { MockBroadcastAdapter } from './mock';

export function getBroadcastAdapter(config: BroadcastConfig): BroadcastAdapter {
	switch (config.software) {
		case 'mock':
			return new MockBroadcastAdapter();
		case 'obs':
			throw new Error('OBS adapter not yet implemented — see TASK-5.6');
		case 'vmix':
			throw new Error('vMix adapter not yet implemented — see TASK-5.6');
		default:
			throw new Error(`Unknown broadcast software: ${(config as { software: string }).software}`);
	}
}

export type { BroadcastAdapter } from '$lib/contracts/broadcast';
