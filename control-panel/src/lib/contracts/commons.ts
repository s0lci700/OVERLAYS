import type { CombatState, CharacterLiveState } from "./cast";
import type { SceneState, TerrainState } from "./stage";

/*
Source Of Truth: Transformed API state from Stage and DM-owned domains
Owned by: No direct writers in Commons (passive mirror)
Mirrored to: n/a
*/

// based on ./docs/contracts/*.md documentation and 
// transformed as needed for shared consumption 
// across Cast/Audience
export interface CommonsPartyStatus {
    activeCharacterIDs: string[]; // IDs of characters currently active in the session
    characterLiveStates: Record<string, CharacterLiveState>; // Mapping of character ID to their live state
}

export interface CommonsCombatState {
    combatState: CombatState;
}

export interface CommonsLocationContext {
    sceneState: SceneState;
    terrainState: TerrainState;
}
