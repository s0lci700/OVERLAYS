/**
 * Standalone Resource Pool Definitions
 * =====================================
 * Alternative resource store that maps resources by characterId.
 *
 * NOTE: This module is NOT currently used by the server or control panel.
 * The active resource system is embedded directly in each character object
 * inside data/characters.js (character.resources[]).
 *
 * This file was an early design experiment with a flat resource table.
 * It can be removed or repurposed if the project moves to a relational
 * database where resources live in their own table.
 *
 * @typedef {Object} StandaloneResource
 * @property {string} id             - Unique resource identifier
 * @property {string} characterId    - Owner character ID (e.g. "CH001")
 * @property {string} resourceName   - Display name (e.g. "Action Surge")
 * @property {number} pool_max       - Maximum uses per recharge cycle
 * @property {number} pool_current   - Remaining uses
 * @property {"SHORT_REST"|"LONG_REST"} recharge_type - When this resource refills
 * @property {number|null} die_size  - Die rolled on use (null if not applicable)
 */
const resources = [
  {
    id: 'resource-action-surge',
    characterId: 'CH001',
    resourceName: 'Action Surge',
    pool_max: 1,
    pool_current: 1,
    recharge_type: 'SHORT_REST',
    die_size: null
  },
  {
    id: 'resource-ki-points',
    characterId: 'CH002',
    resourceName: 'Ki Points',
    pool_max: 3,
    pool_current: 3,
    recharge_type: 'SHORT_REST',
    die_size: null
  }
];

/**
 * Return every configured resource entry.
 * @returns {Array<Object>}
 */
function getActive() {
  return resources;
}

/**
 * Filter resource entries by the owning character.
 * @param {string} characterId
 * @returns {Array<Object>}
 */
function forCharacter(characterId) {
  return resources.filter((r) => r.characterId === characterId);
}

module.exports = {
  resources,
  getActive,
  forCharacter
};



