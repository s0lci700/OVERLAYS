/*
Source Of Truth: API live mutation events (Express + Socket.io)
Owned by: Stage (DM for scoped facilitation mutations)
Mirrored to: Stage, Cast, Commons, Audience (event-specific)
*/

/*  ### Mutation Events

Examples:

- hp_updated
- condition_added
- condition_removed
- resource_updated
- combat_started
- turn_advanced
- location_updated   */

export const HP_UPDATED = 'hpUpdated' as const;
export const CONDITION_ADDED = 'conditionAdded' as const;
export const CONDITION_REMOVED = 'conditionRemoved' as const;
export const RESOURCE_UPDATED = 'resourceUpdated' as const;
export const COMBAT_STARTED = 'combatStarted' as const;
export const TURN_ADVANCED = 'turnAdvanced' as const;
export const LOCATION_UPDATED = 'locationUpdated' as const;


export interface HpUpdatedPayload {
    targetID: string;
    previousHp: number;
    newHp: number;
    source: string;
}

export interface ConditionAddedPayload {
    targetID: string;
    condition: string;
    source: string;
}

export interface ConditionRemovedPayload {
    targetID: string;
    condition: string;
    source: string;
}

export interface ResourceUpdatedPayload {
    targetID: string;
    resourceName: string;
    previousValue: number;
    newValue: number;
    source: string;
}

export interface CombatStartedPayload {
    encounterId: string;
    round: number;
    initiativeOrder: Array<{ characterId: string; initiative: number }>;
}

export interface TurnAdvancedPayload {
    round: number;
    currentTurnCharacterId: string;
}

export interface LocationUpdatedPayload {
    locationId: string;
    locationName: string;
    description: string;
}

export interface InitialDataPayload {
    characters: Array<Record<string, unknown>>;
    lastRoll: Record<string, unknown> | null;
}

/**
 * Complete mapping of Socket.io event names to their payload types.
 * Enables strict typing in subscribe<K>(event, handler) and emit(event, payload)
 */
export interface EventPayloadMap {
    [HP_UPDATED]: HpUpdatedPayload;
    [CONDITION_ADDED]: ConditionAddedPayload;
    [CONDITION_REMOVED]: ConditionRemovedPayload;
    [RESOURCE_UPDATED]: ResourceUpdatedPayload;
    [COMBAT_STARTED]: CombatStartedPayload;
    [TURN_ADVANCED]: TurnAdvancedPayload;
    [LOCATION_UPDATED]: LocationUpdatedPayload;
    initialData: InitialDataPayload;
}