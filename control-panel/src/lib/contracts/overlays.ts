/*
Source Of Truth: API-built display payload contracts
Owned by: Stage
Mirrored to: Audience directly; Commons for selected shared-display payloads
*/

export type OverlayKind = 'dice_result'
| 'success_failure' | 'character_intro' | 'info_block' 
//| 'combat_update' | 'location_reveal'
;

export interface OverlayPayload {
    id: string; // Unique identifier for the overlay instance
    kind: OverlayKind;
    payload: unknown; // The actual content to be displayed, structure depends on the kind
    ttlMs: number; // Time-to-live in * milliseconds * for how long the overlay should be displayed
}