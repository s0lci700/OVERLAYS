/**
 * TableRelay VS Code Extension
 *
 * Activated only when the workspace contains server.ts AND
 * control-panel/svelte.config.js (i.e. this exact repo).
 *
 * Features:
 *  M1  Dead Import Blocker    — error squiggle on $server/data/* in frontend
 *  V1  Surface Badge          — letter badge + color per surface in file explorer
 *  CLJ Cross-Layer Jump       — CodeLens linking emit() ↔ on() across layers
 *  V4  Socket Hover Dossier   — inline payload type on socket event strings
 *  +   Status bar surface indicator
 *  +   Ctrl+Shift+T quick jump to key files
 *
 * v0.2.0 additions:
 *  BL  Broadcast Linter       — warns on untyped broadcast('string') in backend/
 *  AG  Audience Socket Guard  — errors on socket.js imports in (audience)/ routes
 *  V5  Handler Broadcasts     — CodeLens summary of events fired per handler fn
 */
import * as vscode from 'vscode';
import * as path from 'path';
import { registerDeadImportBlocker } from './providers/deadImportBlocker.js';
import { SurfaceBadgeProvider } from './providers/surfaceBadge.js';
import { registerCrossLayerJump } from './providers/crossLayerJump.js';
import { SocketHoverDossierProvider } from './providers/socketHoverDossier.js';
import { registerBroadcastLinter } from './providers/diagnostics.js';
import { detectSurface } from './utils/surfaceDetect.js';

// Key files available from the Quick Jump palette (Ctrl+Shift+T)
const JUMP_ITEMS = [
	// Backend
	{ label: '$(server-process) server.ts', description: 'Backend · entry', path: 'server.ts' },
	{
		label: '$(server-process) router.ts',
		description: 'Backend · routes',
		path: 'backend/router.ts'
	},
	{
		label: '$(symbol-method) CharacterActions',
		description: 'Backend · mutations',
		path: 'backend/actions/characters.ts'
	},
	{
		label: '$(plug) socket/events/character.ts',
		description: 'Backend · socket',
		path: 'backend/socket/events/character.ts'
	},
	{
		label: '$(plug) socket/events/combat.ts',
		description: 'Backend · socket',
		path: 'backend/socket/events/combat.ts'
	},
	{
		label: '$(database) data/characters.ts',
		description: 'Backend · PocketBase',
		path: 'backend/data/characters.ts'
	},
	// Contracts
	{
		label: '$(file-code) contracts/events.ts',
		description: 'Contracts',
		path: 'control-panel/src/lib/contracts/events.ts'
	},
	{
		label: '$(file-code) contracts/records.ts',
		description: 'Contracts',
		path: 'control-panel/src/lib/contracts/records.ts'
	},
	{
		label: '$(file-code) contracts/cast.ts',
		description: 'Contracts',
		path: 'control-panel/src/lib/contracts/cast.ts'
	},
	// Stage
	{
		label: '$(symbol-class) CharacterCard.svelte',
		description: 'Stage',
		path: 'control-panel/src/lib/components/stage/character-card/CharacterCard.svelte'
	},
	{
		label: '$(database) stage.svelte.ts',
		description: 'Stage · store',
		path: 'control-panel/src/lib/derived/stage.svelte.ts'
	},
	// Cast
	{
		label: '$(symbol-class) SessionCard.svelte',
		description: 'Cast/DM',
		path: 'control-panel/src/lib/components/cast/dm/SessionCard.svelte'
	},
	{
		label: '$(symbol-class) InitiativeStrip.svelte',
		description: 'Cast/DM',
		path: 'control-panel/src/lib/components/cast/dm/InitiativeStrip.svelte'
	},
	// Audience
	{
		label: '$(symbol-class) OverlayHP.svelte',
		description: 'Audience',
		path: 'control-panel/src/lib/components/overlays/OverlayHP.svelte'
	},
	{
		label: '$(symbol-class) OverlayDice.svelte',
		description: 'Audience',
		path: 'control-panel/src/lib/components/overlays/OverlayDice.svelte'
	},
	// Services
	{
		label: '$(terminal) services/socket.ts',
		description: 'Services',
		path: 'control-panel/src/lib/services/socket.ts'
	},
	{
		label: '$(terminal) services/pocketbase.ts',
		description: 'Services',
		path: 'control-panel/src/lib/services/pocketbase.ts'
	},
	// Docs
	{ label: '$(book) docs/INDEX.md', description: 'Docs', path: 'docs/INDEX.md' },
	{ label: '$(book) docs/SOCKET-EVENTS.md', description: 'Docs', path: 'docs/SOCKET-EVENTS.md' }
] as const;

export function activate(context: vscode.ExtensionContext): void {
	const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath ?? '';

	// ── M2: Dead Import Blocker ──────────────────────────────────────────────
	context.subscriptions.push(...registerDeadImportBlocker(context));

	// ── V1: Surface Badge ────────────────────────────────────────────────────
	context.subscriptions.push(
		vscode.window.registerFileDecorationProvider(new SurfaceBadgeProvider())
	);

	// ── Cross-Layer Jump (CodeLens) ──────────────────────────────────────────
	context.subscriptions.push(...registerCrossLayerJump(context));

	// ── BL/AG: Broadcast Linter + Audience Socket Guard ─────────────────────
	context.subscriptions.push(...registerBroadcastLinter(context));

	// ── V4: Socket Hover Dossier ─────────────────────────────────────────────
	context.subscriptions.push(
		vscode.languages.registerHoverProvider(
			[{ language: 'typescript' }, { language: 'svelte' }],
			new SocketHoverDossierProvider()
		)
	);

	// ── Status bar — surface indicator ───────────────────────────────────────
	const statusItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
	context.subscriptions.push(statusItem);

	const updateStatus = (editor?: vscode.TextEditor): void => {
		if (!editor) {
			statusItem.hide();
			return;
		}
		const surface = detectSurface(editor.document.uri.fsPath);
		if (surface) {
			statusItem.text = `$(layers) ${surface}`;
			statusItem.tooltip = 'TableRelay surface';
			statusItem.show();
		} else {
			statusItem.hide();
		}
	};

	context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(updateStatus));
	updateStatus(vscode.window.activeTextEditor);

	// ── Ctrl+Shift+T Quick Jump ───────────────────────────────────────────────
	context.subscriptions.push(
		vscode.commands.registerCommand('tablerelay.jumpTo', async () => {
			const selected = await vscode.window.showQuickPick(
				JUMP_ITEMS.map((item) => ({ ...item })),
				{ placeHolder: 'Jump to TableRelay file…', matchOnDescription: true }
			);
			if (!selected) return;

			const uri = vscode.Uri.file(path.join(workspaceRoot, selected.path));
			try {
				await vscode.window.showTextDocument(uri);
			} catch {
				vscode.window.showErrorMessage(`TableRelay: file not found — ${selected.path}`);
			}
		})
	);

	console.log('TableRelay VS Code extension activated.');
}

export function deactivate(): void {}
