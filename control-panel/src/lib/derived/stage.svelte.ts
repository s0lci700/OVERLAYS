import type { CharacterRecord, Condition, ResourceSlot, SessionRecord } from '$lib/contracts';
import {
	HP_UPDATED,
	CONDITION_ADDED,
	CONDITION_REMOVED,
	RESOURCE_UPDATED,
	type EventPayloadMap
} from '$lib/contracts/events';
import { getSocket } from '$lib/services/socket.svelte';

type mutationTypes = 'damage' | 'heal' | 'conditionAdd' | 'conditionRemove' | 'resourceChange';

interface Mutations {
	characterId: string;
	action: mutationTypes;
	delta: number;
	timestamp: string;
}

// ─────────────── STATE ───────────────────────────────────────────────────────────

let stageState = $state({
	activeRoster: [] as CharacterRecord[],

	selectedCharacterId: null as CharacterRecord['id'] | null,

	sessionContext: null as SessionRecord | null,

	recentMutations: [] as Array<Mutations>
});

// ─────────────── ACCESORS ────────────────────────────────────────────────────────

export function initializeRoster(characters: CharacterRecord[]): void {
	stageState.activeRoster = characters;
}

export function getCharacterList(): Array<CharacterRecord> {
	return stageState.activeRoster;
}

export function getSelectedCharacter(): CharacterRecord | null {
	if (!stageState.selectedCharacterId) return null;
	return stageState.activeRoster.find((c) => c.id === stageState.selectedCharacterId) ?? null;
}

export function getSessionContext() {
    if (!stageState.sessionContext) {
        console.warn('Session context is not set');
        return null;
    }
	return stageState.sessionContext;
}

// ─────────────── LOCAL HELPERS ──────────────────────────────────────────────────────

function getCharacterById(characterId: CharacterRecord['id']): CharacterRecord | undefined {
	return stageState.activeRoster.find((c) => c.id === characterId);
}

function clamp(value: number, min: number, max: number): number {
	return Math.max(min, Math.min(max, value));
}

function hPBoundsCheck(
	characterId: CharacterRecord['id'],
	delta: number
): CharacterRecord['hp_current'] {
	const char = getCharacterById(characterId);
	if (!char) throw new Error(`Character with ID ${characterId} not found in active roster.`);
	const newHp = clamp(char.hp_current + delta, 0, char.hp_max);
	return newHp;
}

function checkExistingCondition(
	character: CharacterRecord,
	condition: Condition['id'] | Condition['condition_name'] | string
): boolean {
	if (character.conditions.length === 0) return false;
	return character.conditions.some(
		(cond) => cond.condition_name.toLowerCase() === condition.toLowerCase() || cond.id === condition
	);
}

function logMutation(entry: (typeof stageState.recentMutations)[number]): void {
	stageState.recentMutations.unshift(entry);
	if (stageState.recentMutations.length > 10) stageState.recentMutations.pop();
}

// ─────────────── ACTIONS ────────────────────────────────────────────────────────

export function selectCharacter(characterId: CharacterRecord['id']): CharacterRecord | null {
	const character = getCharacterById(characterId);
	if (!character) {
		console.warn(`Character ${characterId} not found`);
		return null;
	}
	stageState.selectedCharacterId = characterId;
	return character;
}

export function mutateHp(characterId: CharacterRecord['id'], { delta }: { delta: number }): void {
	const char = getCharacterById(characterId);
	if (!char) throw new Error(`Character with ID ${characterId} not found in active roster.`);
	const newHp = hPBoundsCheck(characterId, delta);
	if (newHp === char.hp_current) return;
	const targetId = char.id;
	const previousHp = char.hp_current;
	char.hp_current = newHp;
	const timestamp = new Date().toISOString();
	logMutation({
		characterId,
		action: delta < 0 ? 'damage' : 'heal',
		delta,
		timestamp
	});
	getSocket().emit(HP_UPDATED, {
		targetID: targetId,
		previousHp: previousHp,
		newHp: newHp,
		source: 'stage',
		timestamp
	} as EventPayloadMap['hpUpdated']);
}

export function addCondition(
	characterId: CharacterRecord['id'],
	conditionName: Condition['condition_name'] | string
): void {
	const char = getCharacterById(characterId);
	if (!char) throw new Error(`Character with ID ${characterId} not found in active roster.`);
	if (checkExistingCondition(char, conditionName)) return;
	// Optimistic: push a placeholder (server will replace with real ID on next sync)
	const tempCondition: CharacterRecord['conditions'][number] = {
		id: `temp-${Date.now()}`,
		condition_name: conditionName,
		intensity_level: 1,
		applied_at: new Date().toISOString()
	};
	char.conditions.push(tempCondition);
	const timestamp = new Date().toISOString();
	logMutation({
		characterId,
		action: 'conditionAdd',
		delta: 1,
		timestamp
	});
	//  broadcast
	getSocket().emit(CONDITION_ADDED, {
		targetID: char.id,
		condition: conditionName,
		source: 'stage',
		timestamp
	} as EventPayloadMap['conditionAdded']);
}

export function removeCondition(
	characterId: CharacterRecord['id'],
	conditionId: Condition['id'] | string
): void {
	const char = getCharacterById(characterId);
	if (!char) {
		console.error(`Character with ID ${characterId} not found in active roster.`);
		return;
	}
	const idx = char.conditions.findIndex((c) => c.id === conditionId);
	if (idx === -1) return;
	const removed = char.conditions[idx];
	char.conditions.splice(idx, 1);
	const timestamp = new Date().toISOString();
	logMutation({
		characterId,
		action: 'conditionRemove',
		delta: -1,
		timestamp
	});
	getSocket().emit(CONDITION_REMOVED, {
		targetID: char.id,
		condition: removed.condition_name,
		source: 'stage',
		timestamp
	} as EventPayloadMap['conditionRemoved']);
}

export function updateResource(
	characterId: CharacterRecord['id'],
	resourceName: ResourceSlot['name'] | string,
	{ delta }: { delta: number }
): void {
	const char = getCharacterById(characterId);
	if (!char) {
		console.error(`Character with ID ${characterId} not found in active roster.`);
		return;
	}
	const resource = char.resources.find((r) => r.name === resourceName);
	if (!resource) {
		console.error(`Resource with name ${resourceName} not found for character ${char.name}.`);
		return;
	}
	const current = resource.pool_current;
	const max = resource.pool_max;
	const deltaApplied = clamp(current + delta, 0, max);
	if (deltaApplied === current) return;
	resource.pool_current = deltaApplied;
	const timestamp = new Date().toISOString();
	logMutation({
		characterId,
		action: 'resourceChange',
		delta,
		timestamp
	});
	getSocket().emit(RESOURCE_UPDATED, {
		targetID: char.id,
		resourceName: resource.name,
		previousValue: current,
		newValue: deltaApplied,
		source: 'stage',
		timestamp
	} as EventPayloadMap['resourceUpdated']);
}
