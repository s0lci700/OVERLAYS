/**
 * In-memory scene state and focused character.
 * Pure get/set — no Socket.io imports.
 * Mutated by: handlers/misc.ts
 * Read by: socket/index.ts (sent as initialData on connection)
 */

export interface SceneState {
  title: string;
  subtitle: string;
  visible: boolean;
}

let sceneState: SceneState = { title: '', subtitle: '', visible: false };
let focusedChar: Record<string, unknown> | null = null;

export function getSceneState(): SceneState {
  return sceneState;
}

export function setSceneState(next: SceneState): SceneState {
  sceneState = next;
  return sceneState;
}

export function getFocusedChar(): Record<string, unknown> | null {
  return focusedChar;
}

export function setFocusedChar(char: Record<string, unknown> | null): void {
  focusedChar = char;
}
