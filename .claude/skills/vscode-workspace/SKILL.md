---
name: vscode-workspace
description: Build a VS Code workspace extension tailored to the TableRelay / Dados & Risas project. Covers the full VS Code Extension API — TreeViews, Webviews, commands, keybindings, contribution points — with the goal of reducing codebase disorientation through custom navigation tooling.
user-invocable: true
argument-hint: "[feature to build | audit | plan]"
---

# VS Code Workspace Extension Skill

This skill guides the design and implementation of a custom VS Code extension for the TableRelay project. The primary goal is **reducing codebase disorientation** through navigation tooling, quick-jump commands, surface-aware context, and visual aids built directly into the editor.

---

## Project Context (Always Load First)

Before writing any extension code, re-read:
- `CLAUDE.md` — system architecture, five surfaces, start order
- `docs/INDEX.md` — file map and entry points
- `control-panel/CLAUDE.md` — component library structure
- `.impeccable.md` — design system identity (if building any UI panels)

The extension lives in `tools/tablerelay-vscode/` (or create it if it doesn't exist yet).

---

## What a Workspace Extension Can Do

### Navigation & Orientation
- **Custom TreeView** in the sidebar: surfaces → routes → key files, giving a mental model without relying on the file explorer
- **Quick Pick palette commands**: "Go to surface…" → picks Stage/Cast/Audience → lists routes → opens file
- **Jump commands**: `TableRelay: Open CharacterCard`, `TableRelay: Open Stage Store`, etc. bound to keybindings
- **Status Bar item**: shows which surface the current open file belongs to (Stage / Cast / Audience / Backend / Shared)

### Contextual Awareness
- **File decoration**: color-code files in the explorer by surface (amber = stage, cyan = cast/overlay, green = backend)
- **CodeLens on socket events**: "This event is emitted by X handler" / "Listeners: Y, Z overlay"
- **Hover on `@contracts/*` imports**: show the type definition inline without jumping to the file

### Task Runner Integration
- **Task panel**: one-click buttons for PocketBase start, backend start, frontend dev, Storybook — eliminating the 5-tab mental overhead
- **Status bar server indicators**: green dot = running, red = stopped for each process

### Documentation Overlay
- **Webview panel**: render `docs/INDEX.md` as a navigable dashboard with clickable file links
- **Inline legacy markers**: detect `socket.js` / `.js` legacy imports and show a warning gutter icon

---

## VS Code Extension API — Key Reference

### Extension Anatomy

```
tools/tablerelay-vscode/
├── package.json          ← contribution points, activation events, metadata
├── src/
│   └── extension.ts      ← activate(context) entry point
├── media/                ← webview assets (HTML, CSS, JS, icons)
└── tsconfig.json
```

### Activation Events (package.json)

```json
{
  "activationEvents": [
    "workspaceContains:server.ts",
    "workspaceContains:control-panel/svelte.config.js"
  ]
}
```

Use `workspaceContains` to activate only in this project — not globally.

### Entry Point Pattern

```typescript
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  // Register all commands, providers, views here
  context.subscriptions.push(
    vscode.commands.registerCommand('tablerelay.jumpTo', jumpToHandler),
    vscode.window.registerTreeDataProvider('tablerelay.surfaces', new SurfacesProvider()),
    vscode.window.createStatusBarItem(...)
  );
}

export function deactivate() {}
```

---

## TreeView — Surfaces Navigator

### package.json registration

```json
{
  "contributes": {
    "viewsContainers": {
      "activitybar": [{
        "id": "tablerelay",
        "title": "TableRelay",
        "icon": "media/tablerelay-icon.svg"
      }]
    },
    "views": {
      "tablerelay": [
        { "id": "tablerelay.surfaces", "name": "Surfaces" },
        { "id": "tablerelay.backend",  "name": "Backend" }
      ]
    }
  }
}
```

### TreeDataProvider skeleton

```typescript
class SurfacesProvider implements vscode.TreeDataProvider<NavItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  getTreeItem(item: NavItem): vscode.TreeItem { return item; }

  getChildren(parent?: NavItem): NavItem[] {
    if (!parent) {
      // Root: five surfaces
      return [
        new NavItem('Stage', 'stage', vscode.TreeItemCollapsibleState.Collapsed),
        new NavItem('Cast / DM', 'cast-dm', vscode.TreeItemCollapsibleState.Collapsed),
        new NavItem('Cast / Players', 'cast-players', vscode.TreeItemCollapsibleState.Collapsed),
        new NavItem('Audience Overlays', 'audience', vscode.TreeItemCollapsibleState.Collapsed),
        new NavItem('Commons', 'commons', vscode.TreeItemCollapsibleState.Collapsed),
      ];
    }
    // Return routes + key component files per surface
    return SURFACE_MAP[parent.id] ?? [];
  }

  refresh() { this._onDidChangeTreeData.fire(); }
}

class NavItem extends vscode.TreeItem {
  constructor(
    label: string,
    public readonly id: string,
    collapsibleState: vscode.TreeItemCollapsibleState,
    filePath?: string
  ) {
    super(label, collapsibleState);
    if (filePath) {
      this.command = {
        command: 'vscode.open',
        arguments: [vscode.Uri.file(filePath)],
        title: 'Open file'
      };
      this.resourceUri = vscode.Uri.file(filePath);
    }
  }
}
```

### Inline actions (view/item/context)

```json
"menus": {
  "view/item/context": [{
    "command": "tablerelay.openStorybook",
    "when": "view == tablerelay.surfaces && viewItem == component",
    "group": "inline"
  }]
}
```

---

## Quick Pick — Jump To File

```typescript
vscode.commands.registerCommand('tablerelay.jumpTo', async () => {
  const items = [
    { label: '$(symbol-class) CharacterCard', path: 'control-panel/src/lib/components/stage/character-card/CharacterCard.svelte' },
    { label: '$(database) Stage Store', path: 'control-panel/src/lib/derived/stage.svelte.ts' },
    { label: '$(plug) Socket Events', path: 'backend/socket/events/character.ts' },
    { label: '$(file-code) Contracts / Events', path: 'control-panel/src/lib/contracts/events.ts' },
    // ... full list from docs/INDEX.md
  ];

  const selected = await vscode.window.showQuickPick(items, {
    placeHolder: 'Jump to TableRelay file…',
    matchOnDescription: true
  });

  if (selected) {
    const uri = vscode.Uri.file(
      path.join(vscode.workspace.workspaceFolders![0].uri.fsPath, selected.path)
    );
    await vscode.window.showTextDocument(uri);
  }
});
```

### Keybinding (package.json)

```json
{
  "contributes": {
    "keybindings": [{
      "command": "tablerelay.jumpTo",
      "key": "ctrl+shift+t",
      "mac": "cmd+shift+t",
      "when": "workbenchState == folder"
    }]
  }
}
```

---

## Status Bar — Surface Indicator

```typescript
function createSurfaceStatusBar(context: vscode.ExtensionContext) {
  const item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);

  const update = (editor?: vscode.TextEditor) => {
    if (!editor) { item.hide(); return; }
    const surface = detectSurface(editor.document.uri.fsPath);
    item.text = surface ? `$(layers) ${surface}` : '';
    item.tooltip = 'TableRelay surface';
    surface ? item.show() : item.hide();
  };

  context.subscriptions.push(
    item,
    vscode.window.onDidChangeActiveTextEditor(update)
  );
  update(vscode.window.activeTextEditor);
}

function detectSurface(filePath: string): string | null {
  if (filePath.includes('routes/(stage)') || filePath.includes('components/stage')) return 'Stage';
  if (filePath.includes('routes/(cast)') || filePath.includes('components/cast')) return 'Cast';
  if (filePath.includes('routes/(audience)') || filePath.includes('components/overlays')) return 'Audience';
  if (filePath.includes('backend/')) return 'Backend';
  if (filePath.includes('lib/contracts')) return 'Contracts';
  if (filePath.includes('lib/components/shared')) return 'UI Kit';
  return null;
}
```

---

## Webview — INDEX.md Dashboard

```typescript
vscode.commands.registerCommand('tablerelay.openDashboard', () => {
  const panel = vscode.window.createWebviewPanel(
    'tablerelay.dashboard',
    'TableRelay Navigator',
    vscode.ViewColumn.Beside,
    {
      enableScripts: true,
      localResourceRoots: [context.extensionUri]
    }
  );

  panel.webview.html = getDashboardHtml(panel.webview, context);

  // Extension → Webview: send file data
  panel.webview.postMessage({ type: 'surfaces', data: SURFACE_MAP });

  // Webview → Extension: handle file open requests
  panel.webview.onDidReceiveMessage(msg => {
    if (msg.type === 'openFile') {
      const uri = vscode.Uri.file(path.join(workspaceRoot, msg.path));
      vscode.window.showTextDocument(uri);
    }
  });
});
```

### Security (always include CSP)

```html
<meta http-equiv="Content-Security-Policy"
  content="default-src 'none';
           style-src ${webview.cspSource} 'unsafe-inline';
           script-src ${webview.cspSource};" />
```

### Loading local media

```typescript
const styleUri = panel.webview.asWebviewUri(
  vscode.Uri.joinPath(context.extensionUri, 'media', 'dashboard.css')
);
```

---

## Task Runner Integration

```typescript
async function runTask(name: string, command: string, cwd: string) {
  const task = new vscode.Task(
    { type: 'shell' },
    vscode.workspace.workspaceFolders![0],
    name,
    'TableRelay',
    new vscode.ShellExecution(command, { cwd })
  );
  task.presentationOptions = {
    reveal: vscode.TaskRevealKind.Always,
    panel: vscode.TaskPanelKind.Dedicated
  };
  await vscode.tasks.executeTask(task);
}

// Usage:
vscode.commands.registerCommand('tablerelay.startPocketBase', () =>
  runTask('PocketBase', '.\\pocketbase.exe serve', workspaceRoot)
);
vscode.commands.registerCommand('tablerelay.startBackend', () =>
  runTask('Backend', 'bun server.ts', workspaceRoot)
);
vscode.commands.registerCommand('tablerelay.startFrontend', () =>
  runTask('Frontend', 'bun run dev -- --host', path.join(workspaceRoot, 'control-panel'))
);
```

---

## File Decoration — Surface Color Coding

```typescript
class SurfaceDecorationProvider implements vscode.FileDecorationProvider {
  provideFileDecoration(uri: vscode.Uri): vscode.FileDecoration | undefined {
    const p = uri.fsPath;
    if (p.includes('routes/(stage)') || p.includes('components/stage'))
      return { badge: 'S', color: new vscode.ThemeColor('charts.yellow'), tooltip: 'Stage surface' };
    if (p.includes('routes/(audience)') || p.includes('components/overlays'))
      return { badge: 'A', color: new vscode.ThemeColor('charts.blue'), tooltip: 'Audience surface' };
    if (p.includes('routes/(cast)') || p.includes('components/cast'))
      return { badge: 'C', color: new vscode.ThemeColor('charts.green'), tooltip: 'Cast surface' };
    if (p.includes('src/server'))
      return { badge: 'B', color: new vscode.ThemeColor('charts.purple'), tooltip: 'Backend' };
  }
}

// Register:
context.subscriptions.push(
  vscode.window.registerFileDecorationProvider(new SurfaceDecorationProvider())
);
```

---

## Contribution Points Cheat Sheet

| What you want | Contribution point | API |
|---|---|---|
| Sidebar panel with tree | `viewsContainers` + `views` | `registerTreeDataProvider` |
| Command in palette | `commands` | `registerCommand` |
| Keyboard shortcut | `keybindings` | — |
| Right-click menu | `menus` (editor/context, view/item/context) | — |
| Status bar text | — | `createStatusBarItem` |
| Settings the user can change | `configuration` | `workspace.getConfiguration` |
| Custom editor for file type | `customEditors` | `registerCustomEditorProvider` |
| File color/badge in explorer | — | `registerFileDecorationProvider` |
| Hover tooltip over code | — | `registerHoverProvider` |
| Inline annotations | — | `createTextEditorDecorationType` |
| Run shell commands as tasks | `taskDefinitions` | `tasks.executeTask` |
| Full custom HTML panel | — | `createWebviewPanel` |
| Persist data across sessions | — | `context.workspaceState` / `globalState` |

---

## UX Rules (VS Code HIG)

- **Don't hijack the Activity Bar** — one icon max per extension; use panel tabs for secondary views
- **Status bar items**: left-aligned = workspace info, right-aligned = editor/file info
- **Quick Pick over Webview** for simple selection — faster, keyboard-driven
- **Webviews are expensive** — use `retainContextWhenHidden: false` and `getState/setState` for persistence
- **Error messages**: use `showErrorMessage` only for actionable errors; use Output Channel for logs
- **Keybindings**: always include a `when` clause; never bind global chords that conflict with defaults

---

## Development Workflow

```bash
# Install VS Code Extension CLI
bun add -D @vscode/vsce

# Scaffold (if starting fresh)
npx --yes yo code

# Compile + watch
cd tools/tablerelay-vscode && tsc -watch

# Launch extension host (F5 in VS Code opens a new window with the extension loaded)

# Package for local install
bunx vsce package
code --install-extension tablerelay-vscode-0.0.1.vsix
```

---

## Implementation Checklist

Before shipping any feature:
- [ ] `workspaceContains` activation guard set — extension only activates in this repo
- [ ] CSP header on every webview HTML
- [ ] All `context.subscriptions.push(...)` — no memory leaks
- [ ] `when` clauses on all keybindings and menu items
- [ ] Surface detection covers all five surfaces + backend + shared
- [ ] Task commands use dedicated terminal panels, not shared
- [ ] No hardcoded absolute paths — always relative to `workspaceRoot` or `context.extensionUri`
