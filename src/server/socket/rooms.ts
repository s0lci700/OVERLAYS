/**
 * Broadcast helpers + JSONL sidecar logger.
 * All io.emit() calls in the server go through broadcast() here.
 * Imported by: socket/index.ts, all handlers
 *
 * Note: currently broadcasts to ALL clients (io.emit).
 * Phase 2 will add room-scoped broadcastToRoom() once sessions are wired.
 */
import type { Server } from 'socket.io';
import fs from 'fs';
import path from 'path';

let _io: Server;
let syncStartTime: number | null = null;

const SIDECAR_PATH = path.join(process.cwd(), 'logs', 'sidecar.jsonl');
fs.mkdirSync(path.join(process.cwd(), 'logs'), { recursive: true });

export function initRooms(io: Server): void {
  _io = io;
}

export function setSyncStartTime(ts: number): void {
  syncStartTime = ts;
}

export function getSyncStartTime(): number | null {
  return syncStartTime;
}

function logEvent(event: string, summary: Record<string, unknown> = {}): void {
  const ts_abs = Date.now();
  const entry = JSON.stringify({
    event,
    ts_abs,
    ts_rel: syncStartTime != null ? ts_abs - syncStartTime : null,
    ...summary,
  });
  fs.appendFile(SIDECAR_PATH, entry + '\n', () => {});
}

export function broadcast(event: string, data: Record<string, unknown> = {}): void {
  _io.emit(event, data);
  const { character: _char, characters: _c, rolls: _r, ...rest } = data;
  logEvent(event, {
    ...(_char ? { charId: (_char as Record<string, unknown>).id, charName: (_char as Record<string, unknown>).name } : {}),
    ...rest,
  });
}
