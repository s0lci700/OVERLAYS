/**
 * Database seeding — runs once at startup if collections are empty.
 * Imported by: server.ts (called inside main())
 *
 * Only seeds collections defined in scripts/migrate-collections.ts:
 *   characters, campaigns, sessions
 *
 * Run `bun scripts/migrate-collections.ts` first to create the schema.
 */
import { pb } from './pb';

export async function seedIfEmpty(): Promise<void> {
  if (!pb.authStore.isValid) {
    console.warn('⚠️  Cannot seed: PocketBase not connected. Skipping seed stage.');
    return;
  }

  console.log('\n━━━ SEEDING DATABASE ━━━');

  // ── Stage 1: Characters (core bootstrap) ───────────────────────────────
  try {
    const charCount = (await pb.collection('characters').getList(1, 1)).totalItems;
    if (charCount > 0) {
      console.log('✅ characters: already populated (' + charCount + ' records)');
    } else {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const templates: Record<string, unknown>[] = require('../../data/template-characters.json');
      for (const char of templates) {
        await pb.collection('characters').create(char);
      }
      console.log(`✅ characters: seeded ${templates.length} records`);
    }
  } catch (err) {
    console.error('❌ characters seed failed:', (err as Error).message);
  }

  // ── Stage 2: Campaign + sessions (demo context) ────────────────────────
  try {
    const campaignCount = (await pb.collection('campaigns').getList(1, 1)).totalItems;
    const sessionCount = (await pb.collection('sessions').getList(1, 1)).totalItems;

    if (campaignCount > 0 && sessionCount > 0) {
      console.log(
        `✅ campaign data: already populated (campaigns: ${campaignCount}, sessions: ${sessionCount})`,
      );
    } else {
      if (campaignCount === 0) {
        await pb.collection('campaigns').create({
          title: 'La Mina del Susurro Roto',
          setting: 'Forgotten Realms — Sword Coast frontier',
          is_active: true,
        });
        console.log('✅ campaigns: seeded 1 record');
      }

      if (sessionCount === 0) {
        // Get the campaign we just created (or that already exists)
        const campaigns = await pb.collection('campaigns').getList(1, 1);
        const campaignId = campaigns.items[0]?.id ?? '';

        const sessions = [
          { campaign: campaignId, title: 'The Stumped Ox', session_number: 1, is_active: false },
          { campaign: campaignId, title: 'Eastern Tunnels', session_number: 2, is_active: false },
          { campaign: campaignId, title: 'Amber Cavern Assault', session_number: 3, is_active: true },
        ];
        for (const s of sessions) {
          await pb.collection('sessions').create(s);
        }
        console.log(`✅ sessions: seeded ${sessions.length} records`);
      }
    }
  } catch (err) {
    console.error('❌ campaign data seed failed:', (err as Error).message);
  }

  console.log('━━━ SEEDING COMPLETE ━━━\n');
}
