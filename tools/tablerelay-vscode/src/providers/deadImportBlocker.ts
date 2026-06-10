/**
 * M2: Dead Import Blocker
 *
 * Error-level diagnostic on any `$server/data/*` import found inside
 * control-panel/src/. These imports pull in Node.js crypto and break
 * the browser bundle silently at runtime.
 */
import * as vscode from 'vscode';

// Matches:  from '$server/data/anything'  or  from "$server/data/anything"
const DEAD_IMPORT_RE = /from\s+(['"])\$server\/data[^'"]*\1/g;

function isFrontendFile(filePath: string): boolean {
  const p = filePath.replace(/\\/g, '/');
  return p.includes('control-panel/src/');
}

function lint(doc: vscode.TextDocument, collection: vscode.DiagnosticCollection): void {
  if (!isFrontendFile(doc.fileName)) {
    collection.delete(doc.uri);
    return;
  }

  const text = doc.getText();
  const diagnostics: vscode.Diagnostic[] = [];
  let match: RegExpExecArray | null;

  DEAD_IMPORT_RE.lastIndex = 0;
  while ((match = DEAD_IMPORT_RE.exec(text)) !== null) {
    const start = doc.positionAt(match.index);
    const end   = doc.positionAt(match.index + match[0].length);
    const diag  = new vscode.Diagnostic(
      new vscode.Range(start, end),
      `Dead server import: '$server/data/*' pulls in Node.js crypto — crashes the browser bundle. ` +
      `Use $lib/services/pocketbase.ts or $lib/services/socket.ts instead.`,
      vscode.DiagnosticSeverity.Error,
    );
    diag.code   = 'tablerelay/dead-server-import';
    diag.source = 'TableRelay';
    diagnostics.push(diag);
  }

  collection.set(doc.uri, diagnostics);
}

export function registerDeadImportBlocker(
  context: vscode.ExtensionContext,
): vscode.Disposable[] {
  const collection = vscode.languages.createDiagnosticCollection('tablerelay.deadImport');

  // Scan all currently open documents on activation
  for (const doc of vscode.workspace.textDocuments) {
    lint(doc, collection);
  }

  return [
    collection,
    vscode.workspace.onDidOpenTextDocument(doc => lint(doc, collection)),
    vscode.workspace.onDidChangeTextDocument(e => lint(e.document, collection)),
    vscode.workspace.onDidCloseTextDocument(doc => collection.delete(doc.uri)),
  ];
}
