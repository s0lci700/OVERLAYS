const { createShortId } = require("./id");

/**
 * Simple roll log for dice results that can be replayed on the overlays.
 */
const rolls = [];

/**
 * Return every recorded dice roll.
 * @returns {Array<Object>}
 */
function getAll() {
  return rolls;
}

/**
 * Persist a dice roll entry and return the stored record.
 * @param {{charId: string, result: number, characterName: string, modifier?: number, sides: number}} payload
 * @returns {Object}
 */
function logRoll({ charId, result, characterName, modifier = 0, sides }) {
  const rollResult = result + modifier;
  const entry = {
    id: createShortId(),
    charId,
    characterName,
    result,
    modifier,
    rollResult,
    sides,
    timestamp: new Date().toISOString(),
  };
  rolls.push(entry);
  return entry;
}

module.exports = {
  getAll,
  logRoll,
};
