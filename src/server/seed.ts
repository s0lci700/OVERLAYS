/**
 * Database seeding — runs once at startup if collections are empty.
 * Imported by: server.ts (called inside main())
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

  // ── Stage 2: NPC data (demo context) ───────────────────────────────────
  try {
    const npcTemplateCount = (await pb.collection('npc_templates').getList(1, 1)).totalItems;
    const npcInstanceCount = (await pb.collection('npc_instances').getList(1, 1)).totalItems;
    const conditionCount = (await pb.collection('conditions_library').getList(1, 1)).totalItems;

    if (npcTemplateCount > 0 && npcInstanceCount > 0 && conditionCount > 0) {
      console.log(
        `✅ npc data: already populated (templates: ${npcTemplateCount}, instances: ${npcInstanceCount}, conditions: ${conditionCount})`,
      );
    } else {
      const npcTemplates = [
        { name: 'Goblin', cr: '1/4', hp_max: 7, armor_class: 15, ability_scores: { str: 8, dex: 14, con: 10, int: 10, wis: 8, cha: 8 }, resistances: {} },
        { name: 'Goblin Boss', cr: '1', hp_max: 21, armor_class: 17, ability_scores: { str: 10, dex: 14, con: 10, int: 10, wis: 8, cha: 10 }, resistances: {} },
        { name: 'Giant Rat', cr: '1/8', hp_max: 7, armor_class: 12, ability_scores: { str: 7, dex: 15, con: 11, int: 2, wis: 10, cha: 4 }, resistances: {} },
      ];
      const npcInstances = [
        { display_name: 'Skarrik the Pickaxe', hp_current: 21, conditions: [] },
        { display_name: 'Gnash', hp_current: 7, conditions: [] },
        { display_name: 'Wort', hp_current: 4, conditions: ['Frightened'] },
        { display_name: 'Tunnel Crawler', hp_current: 7, conditions: [] },
      ];
      const conditions = [
        { name: 'Frightened', type: 'debuff', mech_effects: { note: 'Disadvantage on ability checks and attack rolls while source of fear is in line of sight.' }, duration_type: 'concentration', is_stackable: 'false' },
        { name: 'Poisoned', type: 'debuff', mech_effects: { note: 'Disadvantage on attack rolls and ability checks.' }, duration_type: 'timed', is_stackable: 'false' },
        { name: 'Prone', type: 'debuff', mech_effects: { note: 'Attack rolls against creature have advantage if within 5ft. Own attacks have disadvantage.' }, duration_type: 'until_action', is_stackable: 'false' },
        { name: 'Blinded', type: 'debuff', mech_effects: { note: 'Fails ability checks requiring sight. Attacks have advantage against it; its attacks have disadvantage.' }, duration_type: 'timed', is_stackable: 'false' },
        { name: 'Restrained', type: 'debuff', mech_effects: { note: 'Speed becomes 0. Attacks have advantage. Own attacks and Dex saves have disadvantage.' }, duration_type: 'until_action', is_stackable: 'false' },
        { name: 'Stunned', type: 'debuff', mech_effects: { note: 'Incapacitated. Fails Str/Dex saves. Attacks have advantage.' }, duration_type: 'timed', is_stackable: 'false' },
      ];

      if (npcTemplateCount === 0) {
        for (const t of npcTemplates) await pb.collection('npc_templates').create(t);
      }
      if (npcInstanceCount === 0) {
        for (const n of npcInstances) await pb.collection('npc_instances').create(n);
      }
      if (conditionCount === 0) {
        for (const c of conditions) await pb.collection('conditions_library').create(c);
      }
      console.log(`✅ npc data: seeded (templates: ${npcTemplates.length}, instances: ${npcInstances.length}, conditions: ${conditions.length})`);
    }
  } catch (err) {
    console.error('❌ npc data seed failed:', (err as Error).message);
  }

  // ── Stage 3: Full campaign context (optional) ───────────────────────────
  try {
    const campaignCount = (await pb.collection('campaigns').getList(1, 1)).totalItems;
    const sessionCount = (await pb.collection('sessions').getList(1, 1)).totalItems;
    const abilityCount = (await pb.collection('abilities').getList(1, 1)).totalItems;
    const partyCount = (await pb.collection('party').getList(1, 1)).totalItems;
    const encounterCount = (await pb.collection('encounters').getList(1, 1)).totalItems;

    if (campaignCount > 0 && sessionCount > 0 && abilityCount > 0) {
      console.log(
        `✅ campaign data: already populated (campaigns: ${campaignCount}, sessions: ${sessionCount}, abilities: ${abilityCount})`,
      );
    } else {
      const charIds = (await pb.collection('characters').getList(1, 500)).items.map((c) => c.id);
      if (charIds.length === 0) {
        console.log('⏭️  campaign data: skipped (no characters found, seed that first)');
      } else {
        const campaign = { name: 'La Mina del Susurro Roto', setting: 'Forgotten Realms — Sword Coast frontier', status: 'active', party_level: '1', dm_notes: 'Session 3 — Amber Cavern assault' };
        const createdCampaign = await pb.collection('campaigns').create(campaign);

        const sessions = [
          { campaign_id: createdCampaign.id, session_number: '1', date_played: '2026-02-17', session_log: 'Party met at The Stumped Ox tavern', highlights: [] },
          { campaign_id: createdCampaign.id, session_number: '2', date_played: '2026-02-24', session_log: 'Explored Eastern Tunnels', highlights: [] },
          { campaign_id: createdCampaign.id, session_number: '3', date_played: '2026-03-03', session_log: 'Amber Cavern assault in progress', highlights: [] },
        ];
        if (sessionCount === 0) {
          for (const s of sessions) await pb.collection('sessions').create(s);
        }

        if (abilityCount === 0) {
          const abilities = [
            { name: 'Sneak Attack', type: 'class_feature', action_cost: 'none', resource_cost: {}, target: 'single_enemy', effects: {}, concentration: 'false' },
            { name: 'Eldritch Blast', type: 'cantrip', action_cost: 'action', resource_cost: {}, target: 'single_enemy', effects: {}, concentration: 'false' },
            { name: 'Rage', type: 'class_feature', action_cost: 'bonus_action', resource_cost: {}, target: 'self', effects: {}, concentration: 'false' },
            { name: 'Action Surge', type: 'class_feature', action_cost: 'none', resource_cost: {}, target: 'self', effects: {}, concentration: 'false' },
            { name: 'Cure Wounds', type: 'spell_1st', action_cost: 'action', resource_cost: {}, target: 'single_ally', effects: {}, concentration: 'false' },
          ];
          for (const a of abilities) await pb.collection('abilities').create(a);
        }

        if (partyCount === 0) {
          await pb.collection('party').create({ campaign_id: createdCampaign.id, characters_ids: charIds, inspiration_pool: 1 });
        }

        if (encounterCount === 0) {
          await pb.collection('encounters').create({
            campaign_id: createdCampaign.id,
            status: 'active',
            round: 4,
            turn_index: '2',
            combat_order: [
              { name: 'Skarrik the Pickaxe', type: 'enemy', initiative: 14 },
              { name: 'HECTOR', type: 'player', initiative: 10 },
              { name: 'MARCELO', type: 'player', initiative: 8 },
            ],
          });
        }

        console.log(`✅ campaign data: seeded (campaign: 1, sessions: ${sessions.length}, abilities: ${5})`);
      }
    }
  } catch (err) {
    console.error('❌ campaign data seed failed:', (err as Error).message);
  }

  console.log('━━━ SEEDING COMPLETE ━━━\n');
}
