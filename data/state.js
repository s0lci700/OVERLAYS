/**
 * Convenience accessor for the current snapshot of characters, rolls, and resource pools.
 */
const characters = require('./characters');
const rolls = require('./rolls');
const resources = require('./resources');

/**
 * Build a single object that mirrors the payload sent on Socket.io connection.
 * @returns {{characters: *, rolls: *, resources: *}}
 */
function getSnapshot() {
  return {
    characters: characters.getAll(),
    rolls: rolls.getAll(),
    resources: resources.getActive()
  };
}

module.exports = {
  characters,
  rolls,
  resources,
  getSnapshot
};
