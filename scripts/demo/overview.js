#!/usr/bin/env bun
/*
 * overview.js — live status dashboard for the TableRelay stack.
 * Usage:
 *   bun scripts/demo/overview.js          # live TUI, refreshes every 2s
 *   bun scripts/demo/overview.js --once   # print one snapshot and exit
 *
 * Answers "what is missing before this will run?" on a fresh machine:
 * prerequisites, .env config, running services, and database schema.
 * Read-only — it never starts, stops, or writes anything.
 */

import { existsSync, readFileSync } from 'fs';
import { resolve, join } from 'path';

const ROOT = resolve(import.meta.dir, '../..');
const ONCE = process.argv.includes('--once');
const REFRESH_MS = 2000;

// ─── Terminal helpers ─────────────────────────────────────────────────────────

const useColor = process.stdout.isTTY && !process.env.NO_COLOR;
const c = (code, s) => (useColor ? `\x1b[${code}m${s}\x1b[0m` : s);
const dim = (s) => c('2', s);
const bold = (s) => c('1', s);
const green = (s) => c('32', s);
const red = (s) => c('31', s);
const yellow = (s) => c('33', s);
const cyan = (s) => c('36', s);

const OK = () => green('OK   ');
const BAD = () => red('FAIL ');
const WARN = () => yellow('WARN ');
const WIDTH = 64;

/** Visible length, ignoring ANSI escapes — needed to pad coloured cells. */
function visLen(s) {
	return s.replace(/\x1b\[[0-9;]*m/g, '').length;
}

function pad(s, n) {
	const len = visLen(s);
	return len >= n ? s : s + ' '.repeat(n - len);
}

function header(title) {
	return `${dim('┌─')} ${bold(title)} ${dim('─'.repeat(Math.max(0, WIDTH - visLen(title) - 4)))}`;
}

function row(status, label, detail) {
	return `${dim('│')} ${status} ${pad(label, 22)} ${dim(detail || '')}`;
}

// ─── Probes ───────────────────────────────────────────────────────────────────

/** GET with a hard timeout — a dead port must not stall the whole render. */
async function probe(url, ms = 3000) {
	try {
		const res = await fetch(url, { signal: AbortSignal.timeout(ms) });
		return { up: true, status: res.status, res };
	} catch {
		return { up: false };
	}
}

/** Minimal .env reader — enough to check which keys are set, not a parser. */
function readEnv(path) {
	if (!existsSync(path)) return null;
	const out = {};
	for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
		const t = line.trim();
		if (!t || t.startsWith('#')) continue;
		const i = t.indexOf('=');
		if (i > 0) out[t.slice(0, i).trim()] = t.slice(i + 1).trim();
	}
	return out;
}

const REQUIRED_ENV = ['POCKETBASE_URL', 'PB_MAIL', 'PB_PASS', 'PORT', 'CONTROL_PANEL_ORIGIN'];

/** One entry point per product surface. Paths verified against src/routes. */
const SURFACES = [
	['stage (operators)', '/live/characters'],
	['stage overview', '/overview'],
	['cast — DM', '/dm'],
	['cast — players', '/players'],
	['commons wallboard', '/session-display'],
	['audience — OBS', '/scene']
];

/** First non-internal IPv4 — the address a phone on the same wifi would use. */
function lanAddress() {
	try {
		const nets = require('os').networkInterfaces();
		for (const name of Object.keys(nets)) {
			for (const n of nets[name] || []) {
				if (n.family === 'IPv4' && !n.internal) return n.address;
			}
		}
	} catch {
		/* nothing usable — the row is simply omitted */
	}
	return null;
}

async function collect() {
	const rootEnv = readEnv(join(ROOT, '.env'));
	const panelEnv = readEnv(join(ROOT, 'control-panel', '.env'));
	const pbUrl = rootEnv?.POCKETBASE_URL || 'http://127.0.0.1:8090';
	const port = rootEnv?.PORT || '3000';

	const [pb, api, vite, sb] = await Promise.all([
		probe(`${pbUrl.replace(/\/$/, '')}/api/health`),
		probe(`http://localhost:${port}/api/characters`),
		probe('http://localhost:5173/'),
		probe('http://localhost:6006/')
	]);

	// The characters collection has an open read rule, so this needs no auth.
	// A 404 here means the schema was never applied (migrate-collections).
	let schema = { state: 'unknown', count: null };
	if (pb.up) {
		const r = await probe(
			`${pbUrl.replace(/\/$/, '')}/api/collections/characters/records?perPage=1`
		);
		if (!r.up) schema = { state: 'unreachable', count: null };
		else if (r.status === 404) schema = { state: 'missing', count: null };
		else if (r.status >= 400) schema = { state: 'locked', count: null };
		else {
			try {
				const j = await r.res.json();
				schema = { state: 'ready', count: j.totalItems ?? 0 };
			} catch {
				schema = { state: 'ready', count: null };
			}
		}
	}

	return { rootEnv, panelEnv, pb, api, vite, sb, schema, pbUrl, port, lanIP: lanAddress() };
}

// ─── Render ───────────────────────────────────────────────────────────────────

function render(s) {
	const L = [];
	const missingEnv = s.rootEnv ? REQUIRED_ENV.filter((k) => !s.rootEnv[k]) : REQUIRED_ENV;
	const todo = [];

	L.push('');
	L.push(
		`  ${bold('DADOS & RISAS')} ${dim('— stack overview')}   ${dim(new Date().toLocaleTimeString())}`
	);
	L.push('');

	// Prerequisites
	L.push(header('Prerequisites'));
	const bunV = process.versions.bun;
	L.push(row(bunV ? OK() : BAD(), 'Bun runtime', bunV ? `v${bunV}` : 'not running under Bun'));
	const pbExe = join(ROOT, 'pocketbase.exe');
	const hasPbExe = existsSync(pbExe);
	L.push(
		row(
			hasPbExe ? OK() : BAD(),
			'pocketbase.exe',
			hasPbExe ? 'in repo root' : 'missing from repo root'
		)
	);
	const rootMods = existsSync(join(ROOT, 'node_modules'));
	const panelMods = existsSync(join(ROOT, 'control-panel', 'node_modules'));
	L.push(
		row(
			rootMods ? OK() : BAD(),
			'root deps',
			rootMods ? 'node_modules present' : 'run: bun install'
		)
	);
	L.push(
		row(
			panelMods ? OK() : BAD(),
			'control-panel deps',
			panelMods ? 'node_modules present' : 'run: cd control-panel && bun install'
		)
	);
	if (!rootMods || !panelMods) todo.push('bun install  (root and control-panel)');
	L.push('');

	// Configuration
	L.push(header('Configuration'));
	if (!s.rootEnv) {
		L.push(row(BAD(), '.env (root)', 'missing — cp .env.example .env'));
		todo.push('cp .env.example .env, then set PB_MAIL / PB_PASS');
	} else if (missingEnv.length) {
		L.push(row(WARN(), '.env (root)', `missing keys: ${missingEnv.join(', ')}`));
		todo.push(`set in .env: ${missingEnv.join(', ')}`);
	} else {
		L.push(row(OK(), '.env (root)', 'all required keys set'));
	}
	L.push(
		row(
			s.panelEnv ? OK() : WARN(),
			'.env (control-panel)',
			s.panelEnv ? 'present' : 'cp control-panel/.env.example control-panel/.env'
		)
	);
	if (!s.panelEnv) todo.push('cp control-panel/.env.example control-panel/.env');
	L.push('');

	// Services
	L.push(header('Services'));
	L.push(
		row(
			s.pb.up ? OK() : BAD(),
			'PocketBase :8090',
			s.pb.up ? 'healthy' : 'down — bun run start-demo'
		)
	);
	L.push(
		row(
			s.api.up ? OK() : BAD(),
			`backend :${s.port}`,
			s.api.up ? '/api/characters responding' : 'down — bun run start-demo'
		)
	);
	L.push(
		row(
			s.vite.up ? OK() : WARN(),
			'control panel :5173',
			s.vite.up ? 'serving' : 'not running — cd control-panel && bun run dev'
		)
	);
	L.push(
		row(
			s.sb.up ? OK() : dim('--   '),
			'storybook :6006',
			s.sb.up ? 'serving' : 'not running (optional)'
		)
	);
	if (!s.pb.up || !s.api.up) todo.push('bun run start-demo');
	else if (!s.vite.up) todo.push('cd control-panel && bun run dev');
	L.push('');

	// Database
	L.push(header('Database'));
	const sc = s.schema;
	if (!s.pb.up) {
		L.push(row(dim('--   '), 'schema', 'PocketBase not reachable'));
	} else if (sc.state === 'missing') {
		L.push(row(BAD(), 'schema', 'characters collection absent'));
		L.push(row(dim('     '), '', 'run: bun run migrate-collections'));
		todo.push('bun run migrate-collections');
	} else if (sc.state === 'locked') {
		L.push(row(WARN(), 'schema', 'collection exists but read is denied'));
	} else if (sc.state === 'ready') {
		L.push(row(OK(), 'schema', 'characters collection present'));
		L.push(
			row(
				sc.count ? OK() : WARN(),
				'roster',
				sc.count ? `${sc.count} character(s)` : 'empty — seeds on first backend boot'
			)
		);
	} else {
		L.push(row(WARN(), 'schema', 'could not determine'));
	}
	L.push('');

	// Where things live. Route groups — (stage), (cast), (audience), (commons) —
	// are organisational only and never appear in the URL.
	L.push(header('Surfaces'));
	const panel = `http://localhost:5173`;
	const reach = s.vite.up ? (t) => t : dim;
	for (const [label, path] of SURFACES) {
		L.push(row(dim('     '), label, reach(`${panel}${path}`)));
	}
	L.push(
		row(
			dim('     '),
			'PocketBase admin',
			s.pb.up ? `${s.pbUrl.replace(/\/$/, '')}/_/` : dim(`${s.pbUrl.replace(/\/$/, '')}/_/`)
		)
	);
	if (s.lanIP) {
		L.push(
			row(dim('     '), 'phones / tablets', `http://${s.lanIP}:5173  ${dim('(needs --host)')}`)
		);
	}
	L.push('');

	// Next steps
	L.push(header('Next'));
	if (!todo.length) {
		L.push(row(OK(), 'ready', 'open http://localhost:5173/'));
	} else {
		for (const t of todo) L.push(`${dim('│')} ${cyan('->')}   ${t}`);
	}
	L.push('');
	if (!ONCE) L.push(dim(`  refreshing every ${REFRESH_MS / 1000}s — press q or Ctrl+C to quit`));
	L.push('');

	return L.join('\n');
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function draw() {
	const snapshot = await collect();
	if (!ONCE) process.stdout.write('\x1b[2J\x1b[H'); // clear + home
	process.stdout.write(render(snapshot) + '\n');
}

async function main() {
	await draw();
	if (ONCE) return;

	if (process.stdin.isTTY) {
		process.stdin.setRawMode(true);
		process.stdin.resume();
		process.stdin.on('data', (buf) => {
			const k = buf.toString();
			if (k === 'q' || k === '') {
				process.stdout.write('\x1b[?25h\n');
				process.exit(0);
			}
			if (k === 'r') draw();
		});
	}

	process.stdout.write('\x1b[?25l'); // hide cursor
	const timer = setInterval(draw, REFRESH_MS);
	process.on('SIGINT', () => {
		clearInterval(timer);
		process.stdout.write('\x1b[?25h\n');
		process.exit(0);
	});
}

main();
