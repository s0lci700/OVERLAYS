/**
 * Demo resource pool definitions for the characters used in this pitch.
 */
const resources = [
  {
    id: 'resource-action-surge',
    characterId: 'char1',
    resourceName: 'Action Surge',
    pool_max: 1,
    pool_current: 1,
    recharge_type: 'SHORT_REST',
    die_size: null
  },
  {
    id: 'resource-ki-points',
    characterId: 'char2',
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
