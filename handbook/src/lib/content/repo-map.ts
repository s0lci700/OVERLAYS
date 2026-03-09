import type { RepoSection } from '$lib/types/content';

export const repoMap: RepoSection[] = [
	{
		id: 'backend',
		label: 'Backend',
		entries: [
			{
				path: 'server.js',
				description: 'Express + Socket.io server. All API routes and socket event handlers.',
				type: 'file'
			},
			{
				path: 'data/characters.js',
				description: 'PocketBase CRUD wrappers. Every function takes (pb, ...) and is async.',
				type: 'file'
			},
			{
				path: 'data/rolls.js',
				description: 'Roll log persistence: getAll(pb), logRoll(pb, {...}).',
				type: 'file'
			},
			{
				path: 'data/template-characters.json',
				description: 'Seed fixture data with 4 characters (stable IDs like CH101).',
				type: 'file'
			},
			{
				path: 'scripts/seed.js',
				description: 'One-shot seeder: reads template, authenticates, creates records idempotently.',
				type: 'file'
			}
		]
	},
	{
		id: 'design-tokens',
		label: 'Design System',
		entries: [
			{
				path: 'design/tokens.json',
				description: 'Canonical token source. Never edit generated CSS files directly.',
				type: 'file'
			},
			{
				path: 'scripts/generate-tokens.ts',
				description: 'Token compiler: tokens.json → generated-tokens.css + public/tokens.css.',
				type: 'file'
			},
			{
				path: 'control-panel/src/app.css',
				description: 'Global base styles, resets, shared utility classes.',
				type: 'file'
			},
			{
				path: 'control-panel/src/utilities.css',
				description: 'Semantic shared state classes: .is-critical, .is-selected, etc.',
				type: 'file'
			},
			{
				path: 'control-panel/src/generated-tokens.css',
				description: 'Generated output — do not edit. Run `bun run generate:tokens` to refresh.',
				type: 'file'
			}
		]
	},
	{
		id: 'control-panel',
		label: 'Control Panel (SvelteKit)',
		entries: [
			{
				path: 'control-panel/src/lib/stores/socket.js',
				description: 'Singleton Socket.io client. Shared `characters` and `lastRoll` stores.',
				type: 'file'
			},
			{
				path: 'control-panel/src/lib/components/ui/',
				description: 'Low-level reusable primitives and bits-ui wrappers.',
				type: 'dir'
			},
			{
				path: 'control-panel/src/lib/components/stage/',
				description: 'Stage/operator-facing feature components with write logic.',
				type: 'dir'
			},
			{
				path: 'control-panel/src/lib/components/cast/',
				description: 'Cast/DM-facing feature components.',
				type: 'dir'
			},
			{
				path: 'control-panel/src/routes/(stage)/',
				description: 'Operator routes: /live/characters, /live/dice, /setup/*',
				type: 'dir'
			},
			{
				path: 'control-panel/src/routes/(cast)/',
				description: 'Cast routes: /dm, /players/[id]',
				type: 'dir'
			},
			{
				path: 'control-panel/src/routes/(audience)/',
				description: 'Overlay routes. Passive — receive socket events only.',
				type: 'dir'
			}
		]
	},
	{
		id: 'docs',
		label: 'Documentation',
		entries: [
			{
				path: 'docs/ARCHITECTURE.md',
				description: 'Full data-flow diagrams and file map.',
				type: 'file'
			},
			{
				path: 'docs/SOCKET-EVENTS.md',
				description: 'Complete Socket.io event payloads.',
				type: 'file'
			},
			{
				path: 'docs/DESIGN-SYSTEM.md',
				description: 'CSS tokens, component states, animation reference.',
				type: 'file'
			},
			{
				path: 'CLAUDE.md',
				description: 'Agent instructions, architecture baseline, conventions.',
				type: 'file'
			}
		]
	}
];
