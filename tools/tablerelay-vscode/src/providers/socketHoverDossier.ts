/**
 * V4: Socket Event Hover Dossier
 *
 * HoverProvider: when your cursor is on a socket event string literal
 * (inside an emit() or on() call), shows the full payload type from
 * @contracts/events.ts inline — no file-jumping needed.
 *
 * Source of truth: control-panel/src/lib/contracts/events.ts
 * Update EVENT_DOCS whenever EventPayloadMap grows.
 */
import * as vscode from 'vscode';

interface EventDoc {
  constant: string;
  payload:  string;
}

// Keep in sync with control-panel/src/lib/contracts/events.ts → EventPayloadMap
const EVENT_DOCS: Record<string, EventDoc> = {
  hpUpdated: {
    constant: 'HP_UPDATED',
    payload: [
      'interface HpUpdatedPayload {',
      '  targetID:   string;   // character record ID',
      '  previousHp: number;',
      '  newHp:      number;',
      '  source:     string;   // "operator" | "socket" | etc.',
      '}',
    ].join('\n'),
  },
  conditionAdded: {
    constant: 'CONDITION_ADDED',
    payload: [
      'interface ConditionAddedPayload {',
      '  targetID:  string;',
      '  condition: string;   // D&D 5e condition name',
      '  source:    string;',
      '}',
    ].join('\n'),
  },
  conditionRemoved: {
    constant: 'CONDITION_REMOVED',
    payload: [
      'interface ConditionRemovedPayload {',
      '  targetID:  string;',
      '  condition: string;',
      '  source:    string;',
      '}',
    ].join('\n'),
  },
  resourceUpdated: {
    constant: 'RESOURCE_UPDATED',
    payload: [
      'interface ResourceUpdatedPayload {',
      '  targetID:      string;',
      '  resourceName:  string;',
      '  previousValue: number;',
      '  newValue:      number;',
      '  source:        string;',
      '}',
    ].join('\n'),
  },
  combatStarted: {
    constant: 'COMBAT_STARTED',
    payload: [
      'interface CombatStartedPayload {',
      '  encounterId:     string;',
      '  round:           number;',
      '  initiativeOrder: Array<{ characterId: string; initiative: number }>;',
      '}',
    ].join('\n'),
  },
  turnAdvanced: {
    constant: 'TURN_ADVANCED',
    payload: [
      'interface TurnAdvancedPayload {',
      '  round:                   number;',
      '  currentTurnCharacterId:  string;',
      '}',
    ].join('\n'),
  },
  locationUpdated: {
    constant: 'LOCATION_UPDATED',
    payload: [
      'interface LocationUpdatedPayload {',
      '  locationId:   string;',
      '  locationName: string;',
      '  description:  string;',
      '}',
    ].join('\n'),
  },
  initialData: {
    constant: '— (server-only, emitted on connect)',
    payload: [
      'interface InitialDataPayload {',
      '  characters: Array<Record<string, unknown>>;',
      '  lastRoll:   Record<string, unknown> | null;',
      '}',
    ].join('\n'),
  },
};

// Matches a quoted identifier: 'hpUpdated' or "conditionAdded"
// No backreference — getWordRangeAtPosition handles mixed quote styles fine
const QUOTED_WORD_RE = /['"][a-zA-Z][a-zA-Z0-9_]*['"]/;

// Patterns that indicate the string is used as a socket event
const SOCKET_CALL_RE = /(?:broadcast|\.emit|\.on)\s*\(/;

export class SocketHoverDossierProvider implements vscode.HoverProvider {
  provideHover(
    document: vscode.TextDocument,
    position: vscode.Position,
  ): vscode.Hover | undefined {
    const range = document.getWordRangeAtPosition(position, QUOTED_WORD_RE);
    if (!range) return undefined;

    const raw   = document.getText(range);
    const event = raw.replace(/['"]/g, '');
    const doc   = EVENT_DOCS[event];
    if (!doc) return undefined;

    // Check surrounding context — look at the whole line plus the previous line
    // to handle multi-line calls like: broadcast(\n  'hpUpdated', ...
    const lineText = document.lineAt(position.line).text;
    const prevText = position.line > 0
      ? document.lineAt(position.line - 1).text
      : '';
    if (!SOCKET_CALL_RE.test(lineText) && !SOCKET_CALL_RE.test(prevText)) {
      return undefined;
    }

    const md = new vscode.MarkdownString('', true);
    md.isTrusted = true;
    md.appendMarkdown(`**TableRelay Socket Event** \`${event}\`\n\n`);
    md.appendMarkdown(`Constant: \`${doc.constant}\`  ·  source: \`@contracts/events\`\n\n`);
    md.appendCodeblock(doc.payload, 'typescript');

    return new vscode.Hover(md, range);
  }
}
