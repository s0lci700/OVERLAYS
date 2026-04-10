/**
 * Express Router — mounts all REST routes.
 * Imported by: server.ts → app.use(router)
 */
import { Router } from 'express';
import * as characters from './handlers/characters';
import * as encounter from './handlers/encounter';
import * as overlay from './handlers/overlay';
import * as rolls from './handlers/rolls';
import * as misc from './handlers/misc';

const router = Router();

// ── Info & tokens ────────────────────────────────────────────────────────────
router.get('/api/info', misc.getInfo);
router.get('/api/tokens', misc.getTokens);
router.post('/api/sync-start', misc.syncStart);

// ── Scene & focus ────────────────────────────────────────────────────────────
router.get('/api/scene', misc.getScene);
router.post('/api/scene/change', misc.changeScene);
router.post('/api/character-focus', misc.focusCharacter);

// ── Characters ───────────────────────────────────────────────────────────────
router.get('/api/characters', characters.listCharacters);
router.get('/api/characters/:id', characters.getCharacter);
router.post('/api/characters', characters.createCharacter);
router.post('/api/characters/batch/hp', characters.batchUpdateHp);
router.put('/api/characters/:id/hp', characters.updateHp);
router.put('/api/characters/:id/photo', characters.updatePhoto);
router.put('/api/characters/:id', characters.updateCharacter);
router.delete('/api/characters/:id', characters.deleteCharacter);
router.post('/api/characters/:id/conditions', characters.addCondition);
router.delete('/api/characters/:id/conditions/:condId', characters.removeCondition);
router.put('/api/characters/:id/resources/:rid', characters.updateResource);
router.post('/api/characters/:id/rest', characters.restoreResources);

// ── Encounter ────────────────────────────────────────────────────────────────
router.get('/api/encounter', encounter.getEncounter);
router.post('/api/encounter/start', encounter.startEncounter);
router.post('/api/encounter/next-turn', encounter.nextTurn);
router.post('/api/encounter/end', encounter.endEncounter);

// ── Overlay events ───────────────────────────────────────────────────────────
router.post('/api/announce', overlay.announce);
router.post('/api/level-up', overlay.levelUp);
router.post('/api/player-down', overlay.playerDown);
router.post('/api/lower-third', overlay.lowerThird);

// ── Rolls ────────────────────────────────────────────────────────────────────
router.post('/api/rolls', rolls.logRoll);

export default router;
