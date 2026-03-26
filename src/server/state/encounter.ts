/**
 * In-memory encounter state.
 * Pure get/set — no Socket.io imports.
 * Mutated by: handlers/encounter.ts
 * Read by: socket/index.ts (sent as initialData on connection)
 */

export interface EncounterParticipant {
  charId: string;
  name: string;
  portrait: string | null;
  class_name: string | null;
  hp_current: number;
  hp_max: number;
  initiative: number;
}

export interface EncounterState {
  active: boolean;
  round: number;
  currentTurnIndex: number;
  participants: EncounterParticipant[];
}

let encounterState: EncounterState = {
  active: false,
  round: 0,
  currentTurnIndex: 0,
  participants: [],
};

export function getEncounterState(): EncounterState {
  return encounterState;
}

export function setEncounterState(next: EncounterState): EncounterState {
  encounterState = next;
  return encounterState;
}
