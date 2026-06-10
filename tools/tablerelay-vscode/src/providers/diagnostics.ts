/**
 * Broadcast Linter + Audience Socket Guard
 *
 * M1 — Untyped Broadcast String Literal Linter
 *   Flags any broadcast('stringLiteral', ...) call in backend/ where the event
 *   name is not registered in EventPayloadMap (contracts/events.ts).
 *   Drives developers to add missing events to the typed contract.
 *
 * M2 — socket.js Legacy Import Guard (Audience Routes)
 *   Flags imports of socket.js inside (audience)/ route files.
 *   Audience routes must use overlaySocket.svelte.ts, not the legacy singleton.
 */
import * as vscode from 'vscode';

// ── M1: Known typed events ────────────────────────────────────────────────────
// Mirrors EventPayloadMap keys in control-panel/src/lib/contracts/events.ts.
// Update here whenever EventPayloadMap grows.
const TYPED_EVENTS = new Set([
	'hpUpdated',
	'conditionAdded',
	'conditionRemoved',
	'resourceUpdated',
	'combatStarted',
	'turnAdvanced',
	'locationUpdated',
	'initialData'
]);

// Matches: broadcast('event'), this.broadcast('event'), socket.emit('event'), io.emit('event')
const BROADCAST_STR_RE = /(?:(?:this\.)?broadcast|socket\.emit|io\.emit)\s*\(\s*(['"])([^'"]+)\1/g;

// M2: Matches: import ... from '...socket.js' or '...socket' (no .ts suffix)
// Intentionally broad — catches both explicit .js and bare module specifiers
// that resolve to socket.js in Vite.
const SOCKET_JS_IMPORT_RE = /from\s*(['"])([^'"]*\/socket(?:\.js)?)\1/g;

// ── M1 lint ───────────────────────────────────────────────────────────────────
function lintBroadcastCalls(
	doc: vscode.TextDocument,
	collection: vscode.DiagnosticCollection
): void {
	const filePath = doc.uri.fsPath;

	// Only run on backend TypeScript files
	if (!filePath.includes('backend') || !filePath.endsWith('.ts')) {
		// Clear any stale diagnostics if the file no longer qualifies
		collection.delete(doc.uri);
		return;
	}

	const text = doc.getText();
	const diagnostics: vscode.Diagnostic[] = [];

	BROADCAST_STR_RE.lastIndex = 0;
	let m: RegExpExecArray | null;
	while ((m = BROADCAST_STR_RE.exec(text)) !== null) {
		const event = m[2];
		if (TYPED_EVENTS.has(event)) continue;

		const start = doc.positionAt(m.index);
		const end = doc.positionAt(m.index + m[0].length);

		const diag = new vscode.Diagnostic(
			new vscode.Range(start, end),
			`Event '${event}' is not registered in EventPayloadMap — add it to control-panel/src/lib/contracts/events.ts`,
			vscode.DiagnosticSeverity.Warning
		);
		diag.code = 'tablerelay/untyped-broadcast';
		diag.source = 'TableRelay';
		diagnostics.push(diag);
	}

	collection.set(doc.uri, diagnostics);
}

// ── M2 lint ───────────────────────────────────────────────────────────────────
function lintAudienceSocketImports(
	doc: vscode.TextDocument,
	collection: vscode.DiagnosticCollection
): void {
	const filePath = doc.uri.fsPath;

	// Only run on files inside (audience)/ route group
	if (
		!filePath.includes('(audience)') &&
		!filePath.includes('%28audience%29') // URL-encoded variant
	) {
		collection.delete(doc.uri);
		return;
	}

	const text = doc.getText();
	const diagnostics: vscode.Diagnostic[] = [];

	SOCKET_JS_IMPORT_RE.lastIndex = 0;
	let m: RegExpExecArray | null;
	while ((m = SOCKET_JS_IMPORT_RE.exec(text)) !== null) {
		const importPath = m[2];

		// Allow overlaySocket.svelte.ts imports — they're the correct choice
		if (importPath.includes('overlaySocket')) continue;

		// Flag anything that resolves to the legacy socket.js singleton
		const start = doc.positionAt(m.index);
		const end = doc.positionAt(m.index + m[0].length);

		const diag = new vscode.Diagnostic(
			new vscode.Range(start, end),
			`Audience routes must use overlaySocket.svelte.ts, not '${importPath}'. Replace this import.`,
			vscode.DiagnosticSeverity.Error
		);
		diag.code = 'tablerelay/audience-socket-import';
		diag.source = 'TableRelay';
		diagnostics.push(diag);
	}

	collection.set(doc.uri, diagnostics);
}

// ── Registration ──────────────────────────────────────────────────────────────
export function registerBroadcastLinter(_context: vscode.ExtensionContext): vscode.Disposable[] {
	const broadcastCollection = vscode.languages.createDiagnosticCollection('tablerelay.broadcast');
	const audienceCollection = vscode.languages.createDiagnosticCollection(
		'tablerelay.audienceSocket'
	);

	// Scan already-open documents on activation
	for (const doc of vscode.workspace.textDocuments) {
		lintBroadcastCalls(doc, broadcastCollection);
		lintAudienceSocketImports(doc, audienceCollection);
	}

	return [
		broadcastCollection,
		audienceCollection,

		vscode.workspace.onDidOpenTextDocument((doc) => {
			lintBroadcastCalls(doc, broadcastCollection);
			lintAudienceSocketImports(doc, audienceCollection);
		}),

		vscode.workspace.onDidChangeTextDocument((e) => {
			lintBroadcastCalls(e.document, broadcastCollection);
			lintAudienceSocketImports(e.document, audienceCollection);
		}),

		vscode.workspace.onDidCloseTextDocument((doc) => {
			broadcastCollection.delete(doc.uri);
			audienceCollection.delete(doc.uri);
		})
	];
}
