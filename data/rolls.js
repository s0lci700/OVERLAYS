/**
 * Simple roll log for dice results that can be replayed on the overlays.
 */

/**
 * Return every recorded dice roll.
 * @returns {Array<Object>}
 */
async function getAll(pb) {
  return await pb.collection("rolls").getFullList({
    sort: "-created",
  });
}

/**
 * Persist a dice roll entry and return the stored record.
 * @param {{result: number, characterName: string, modifier?: number, sides: number}} payload
 * @returns {Object}
 */
async function logRoll(
  pb,
  { charId, result, characterName, modifier = 0, sides },
) {
  const rollResult = result + modifier;
  const entry = {
    charId,
    characterName,
    result,
    modifier,
    rollResult,
    sides,
  };

  return await pb.collection("rolls").create(entry);
}

module.exports = {
  getAll,
  logRoll,
};
