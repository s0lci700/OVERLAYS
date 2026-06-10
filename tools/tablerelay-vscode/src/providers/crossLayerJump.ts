/**
 * Cross-Layer Jump
 *
 * CodeLens provider that surfaces navigation links directly above every
 * broadcast() / this.broadcast() / socket.emit() / socket.on() call.
 *
 * Emit site  →  "⟶ Find listeners for 'hpUpdated'"
 * Handler    →  "⟵ Find emitters for 'hpUpdated'"
 *
 * Handles two calling conventions used in this codebase:
 *   String literal:  broadcast('encounter_started', ...)
 *   Constant:        this.broadcast(HP_UPDATED, ...)  ← resolved via import map
 */
import * as vscode from 'vscode';

// broadcast('stringLiteral') or socket.emit('stringLiteral')
const EMIT_STR_RE = /(?:(?:this\.)?broadcast|socket\.emit|io\.emit)\s*\(\s*(['"])([^'"]+)\1/g;
// this.broadcast(CONSTANT) or broadcast(CONSTANT) — ALL_CAPS identifier
const EMIT_CONST_RE = /(?:(?:this\.)?broadcast|socket\.emit|io\.emit)\s*\(\s*([A-Z][A-Z_0-9]+)/g;
// socket.on('x') — skip framework-level events
const ON_RE = /\.on\s*\(\s*(['"])([^'"]+)\1/g;

const SKIP_EVENTS = new Set(['connect', 'disconnect', 'connection', 'error', 'reconnect']);

/**
 * Builds a constant→value map by scanning `export const FOO = 'bar'` lines.
 * Covers both the contracts file and any re-exports in the same document.
 */
function buildConstantMap(text: string): Map<string, string> {
	const map = new Map<string, string>();
	// export const HP_UPDATED = 'hpUpdated' as const;
	const re = /(?:export\s+)?const\s+([A-Z][A-Z_0-9]+)\s*=\s*(['"])([^'"]+)\2/g;
	let m: RegExpExecArray | null;
	while ((m = re.exec(text)) !== null) {
		map.set(m[1], m[3]);
	}
	return map;
}

// Matches exported async/sync route handler functions in backend/handlers/*.ts
const HANDLER_FN_RE = /^(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\(/gm;

/**
 * Extracts the body of a function starting at `openBraceIndex` using a
 * simple brace-depth counter. Returns the text between the outer braces
 * (exclusive), or empty string if not found.
 */
function extractFunctionBody(text: string, openBraceIndex: number): string {
	let depth = 0;
	let i = openBraceIndex;
	while (i < text.length) {
		if (text[i] === '{') depth++;
		else if (text[i] === '}') {
			depth--;
			if (depth === 0) return text.slice(openBraceIndex + 1, i);
		}
		i++;
	}
	return '';
}

/**
 * Collects all broadcast event names fired within a function body.
 * Uses the same EMIT_STR_RE / EMIT_CONST_RE patterns as the main lenses,
 * plus a local constant map built from the full document text.
 */
function collectBroadcastsInBody(body: string, consts: Map<string, string>): string[] {
	const events: string[] = [];
	let m: RegExpExecArray | null;

	// Clone patterns so lastIndex resets are local
	const strRe = new RegExp(EMIT_STR_RE.source, 'g');
	const constRe = new RegExp(EMIT_CONST_RE.source, 'g');

	while ((m = strRe.exec(body)) !== null) {
		events.push(m[2]);
	}
	while ((m = constRe.exec(body)) !== null) {
		const resolved = consts.get(m[1]) ?? CONTRACTS_CONST_MAP[m[1]];
		if (resolved) events.push(resolved);
	}

	return [...new Set(events)]; // deduplicate
}

class CrossLayerJumpProvider implements vscode.CodeLensProvider {
	provideCodeLenses(document: vscode.TextDocument): vscode.CodeLens[] {
		const lenses: vscode.CodeLens[] = [];
		const text = document.getText();
		const consts = buildConstantMap(text);

		let m: RegExpExecArray | null;

		// ── V5: Handler-broadcast summary (backend/handlers/*.ts only) ───────────
		if (document.uri.fsPath.replace(/\\/g, '/').includes('backend/handlers/')) {
			HANDLER_FN_RE.lastIndex = 0;
			while ((m = HANDLER_FN_RE.exec(text)) !== null) {
				const openBrace = text.indexOf('{', m.index + m[0].length);
				if (openBrace === -1) continue;
				const body = extractFunctionBody(text, openBrace);
				const events = collectBroadcastsInBody(body, consts);
				if (events.length === 0) continue;

				const pos = document.positionAt(m.index);
				const label = events.map((e) => `'${e}'`).join(', ');
				lenses.push(
					new vscode.CodeLens(new vscode.Range(pos, pos), {
						title: `⟶ broadcasts: ${label}`,
						command: '', // informational only — jump is on the broadcast() line itself
						tooltip: `This handler fires socket event(s): ${label}`
					})
				);
			}
		}

		// String-literal broadcast calls
		EMIT_STR_RE.lastIndex = 0;
		while ((m = EMIT_STR_RE.exec(text)) !== null) {
			const event = m[2];
			const pos = document.positionAt(m.index);
			lenses.push(
				new vscode.CodeLens(new vscode.Range(pos, pos), {
					title: `⟶ listeners: '${event}'`,
					command: 'tablerelay.findSocketListeners',
					arguments: [event],
					tooltip: `Search for .on('${event}') across the workspace`
				})
			);
		}

		// Constant-based broadcast calls — resolve via in-file map first,
		// then fall back to the global contracts map.
		EMIT_CONST_RE.lastIndex = 0;
		while ((m = EMIT_CONST_RE.exec(text)) !== null) {
			const constName = m[1];
			const event = consts.get(constName) ?? CONTRACTS_CONST_MAP[constName];
			if (!event) continue;
			const pos = document.positionAt(m.index);
			lenses.push(
				new vscode.CodeLens(new vscode.Range(pos, pos), {
					title: `⟶ listeners: '${event}'  (${constName})`,
					command: 'tablerelay.findSocketListeners',
					arguments: [event],
					tooltip: `Search for .on('${event}') across the workspace`
				})
			);
		}

		// Listener sites
		ON_RE.lastIndex = 0;
		while ((m = ON_RE.exec(text)) !== null) {
			const event = m[2];
			if (SKIP_EVENTS.has(event)) continue;
			const pos = document.positionAt(m.index);
			lenses.push(
				new vscode.CodeLens(new vscode.Range(pos, pos), {
					title: `⟵ emitters: '${event}'`,
					command: 'tablerelay.findSocketEmitters',
					arguments: [event],
					tooltip: `Search for broadcast('${event}') across the workspace`
				})
			);
		}

		return lenses;
	}
}

/**
 * Fallback constant map — mirrors @contracts/events.ts.
 * Update whenever EventPayloadMap grows.
 */
const CONTRACTS_CONST_MAP: Record<string, string> = {
	HP_UPDATED: 'hpUpdated',
	CONDITION_ADDED: 'conditionAdded',
	CONDITION_REMOVED: 'conditionRemoved',
	RESOURCE_UPDATED: 'resourceUpdated',
	COMBAT_STARTED: 'combatStarted',
	TURN_ADVANCED: 'turnAdvanced',
	LOCATION_UPDATED: 'locationUpdated'
};

export function registerCrossLayerJump(context: vscode.ExtensionContext): vscode.Disposable[] {
	return [
		vscode.languages.registerCodeLensProvider(
			[{ language: 'typescript' }, { language: 'svelte' }],
			new CrossLayerJumpProvider()
		),

		vscode.commands.registerCommand('tablerelay.findSocketListeners', (event: string) =>
			vscode.commands.executeCommand('workbench.action.findInFiles', {
				query: `.on('${event}'`,
				triggerSearch: true,
				isRegex: false
			})
		),

		vscode.commands.registerCommand('tablerelay.findSocketEmitters', (event: string) =>
			// Search for both broadcast('event') and broadcast(CONSTANT)
			vscode.commands.executeCommand('workbench.action.findInFiles', {
				query: `broadcast('${event}'`,
				triggerSearch: true,
				isRegex: false
			})
		)
	];
}
