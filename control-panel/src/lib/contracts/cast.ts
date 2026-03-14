/*
Source Of Truth: API-backed live session state (with optional PB snapshots)
Owned by: Stage (DM only for scoped facilitation actions)
Mirrored to: Cast surfaces, Commons, Audience (overlay payload contracts)
*/
export interface CharacterLiveState {
    hp_current: number;
    hp_temp: number;
    resource_values: Record<string, number>; // e.g., { "spell_slots": 2, "rage_points": 1 }
    conditions: string[]; // e.g., ["poisoned", "stunned"]
}

/*
Source Of Truth: API live combat session state
Owned by: DM (Stage as admin fallback)
Mirrored to: Commons (full passive mirror) + Stage
*/
export interface CombatState {
    combatActive: boolean;
    roundNumber: number;
    initiativeOrder: string[]; // Array of combatant IDs in initiative order
    activeIndex: number; // Index in the initiativeOrder array indicating the active combatant
    activeCombatantId: string; // ID of the currently active combatant
}