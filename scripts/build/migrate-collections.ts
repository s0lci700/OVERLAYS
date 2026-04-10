/**
 * migrate-collections.ts
 *
 * Applies the canonical collection schemas to PocketBase.
 * Source of truth: control-panel/src/lib/contracts/records.ts
 *
 * Usage:
 *   bun scripts/migrate-collections.ts
 *
 * Safe to run repeatedly — uses import() with deleteMissing=false,
 * so existing collections not in this file are left untouched.
 *
 * When to run:
 *   - First-time setup (before seed.js)
 *   - After adding/renaming/removing a field in records.ts
 *   - After adding a new collection interface to records.ts
 */

import PocketBase from 'pocketbase';

const pb = new PocketBase(process.env.POCKETBASE_URL ?? 'http://127.0.0.1:8090');

// ─── Auth ─────────────────────────────────────────────────────────────────────

async function connect() {
	await pb.collection('_superusers').authWithPassword(
		process.env.PB_MAIL ?? '',
		process.env.PB_PASS ?? '',
	);
	console.log('[migrate] Connected to PocketBase as admin.');
}

// ─── Collection schemas ───────────────────────────────────────────────────────
// Mirrors control-panel/src/lib/contracts/records.ts
// Field options reference: https://pocketbase.io/docs/collections/

const collections = [

	// ── CharacterRecord ─────────────────────────────────────────────────────
	// Access rules:
	//   Read  = open ("") — overlays and player sheets hit PocketBase directly via browser SDK (unauthenticated)
	//   Write = admin-only (null) — all mutations go through Express, which uses the admin pb singleton
	// Phase 2+: updateRule = "@request.auth.record.id = id" for per-player safe-field writes
	{
		name: 'characters',
		type: 'base',
		listRule:   '',    // unauthenticated list allowed
		viewRule:   '',    // unauthenticated view allowed
		createRule: null,  // admin only
		updateRule: null,  // admin only
		deleteRule: null,  // admin only
		fields: [
			// Identity
			{ type: 'text',   name: 'name',        required: true  },
			{ type: 'text',   name: 'player',      required: false },
			{ type: 'text',   name: 'species',      required: true  },
			{ type: 'text',   name: 'class_name',   required: true  },
			{ type: 'text',   name: 'subclass_name', required: false },
			{ type: 'number', name: 'level',         required: true, min: 1, max: 20 },

			// HP
			{ type: 'number', name: 'hp_current', required: true,  min: 0 },
			{ type: 'number', name: 'hp_max',     required: true,  min: 1 },
			{ type: 'number', name: 'hp_temp',    required: false, min: 0 },

			// Combat stats
			{ type: 'number', name: 'ac_base',          required: true, min: 0 },
			{ type: 'number', name: 'speed',             required: true, min: 0 },
			{ type: 'number', name: 'proficiency_bonus', required: true, min: 2 },

			// Ability scores — { str, dex, con, int, wis, cha }: number
			{ type: 'json', name: 'ability_scores', required: true },

			// Proficiency arrays — string[]
			{ type: 'json', name: 'saving_throws_proficiencies', required: false },
			{ type: 'json', name: 'skill_proficiencies',         required: false },
			{ type: 'json', name: 'expertise',                   required: false },

			// Resources — ResourceSlot[] { name, pool_max, pool_used, reset_on }
			{ type: 'json', name: 'resources', required: false },

			// Conditions — string[] of condition names
			{ type: 'json', name: 'conditions', required: false },

			// Flags
			{ type: 'bool', name: 'is_active',                  required: false },
			{ type: 'bool', name: 'is_visible_to_party_overlay', required: false },

			// Portrait — single image file
			{
				type: 'file',
				name: 'portrait',
				required: false,
				maxSelect: 1,
				maxSize: 5242880, // 5 MB
				mimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
			},

			// Notes — string[]
			{ type: 'json', name: 'notes', required: false },
		],
	},

	// ── RollRecord ───────────────────────────────────────────────────────────
	// Access rules: open read, admin-only write
	{
		name: 'rolls',
		type: 'base',
		listRule:   '',
		viewRule:   '',
		createRule: null,
		updateRule: null,
		deleteRule: null,
		fields: [
			{ type: 'text',   name: 'charId',         required: true  },
			{ type: 'text',   name: 'characterName',   required: true  },
			{ type: 'number', name: 'result',          required: true  },
			{ type: 'number', name: 'modifier',        required: false },
			{ type: 'number', name: 'rollResult',      required: true  },
			{ type: 'number', name: 'sides',           required: true  },
		],
	},

	// ── CampaignRecord ───────────────────────────────────────────────────────
	// Access rules: all admin-only — frontend has no direct campaign reads in Phase 1
	{
		name: 'campaigns',
		type: 'base',
		listRule:   null,
		viewRule:   null,
		createRule: null,
		updateRule: null,
		deleteRule: null,
		fields: [
			{ type: 'text', name: 'title',     required: true  },
			{ type: 'text', name: 'setting',   required: false },
			{ type: 'bool', name: 'is_active', required: false },
		],
	},

	// ── SessionRecord ────────────────────────────────────────────────────────
	// Access rules:
	//   Read  = open ("") — session-display wallboard will read active session (Phase 3)
	//   Write = admin-only (null)
	{
		name: 'sessions',
		type: 'base',
		listRule:   '',    // unauthenticated list allowed (for session-display)
		viewRule:   '',    // unauthenticated view allowed
		createRule: null,  // admin only
		updateRule: null,  // admin only
		deleteRule: null,  // admin only
		fields: [
			{ type: 'text',     name: 'campaign',       required: true  }, // relation ID — upgrade to relation field when campaigns is stable
			{ type: 'text',     name: 'title',          required: true  },
			{ type: 'number',   name: 'session_number', required: true, min: 1 },
			{ type: 'bool',     name: 'is_active',      required: false },
		],
	},

];

// ─── Run ──────────────────────────────────────────────────────────────────────

async function main() {
	await connect();
	console.log('[migrate] Connected. Applying collection schemas...');

	console.log(`[migrate] Applying ${collections.length} collection(s)...`);

	const deleteMissing = process.argv.includes('--delete-missing');
	if (deleteMissing) console.log('[migrate] WARNING: --delete-missing is set. Fields not in this schema will be dropped.');
	await (pb.collections as any).import(collections, deleteMissing);

	for (const col of collections) {
		console.log(`[migrate] ✓ ${col.name}`);
	}

	console.log('[migrate] Done. Run bun backend/seed.ts to populate characters.');
}

main()
	.then(() => process.exit(0))
	.catch((err) => {
		console.error('[migrate] Failed:', err?.message ?? err);
		process.exit(1);
	});
