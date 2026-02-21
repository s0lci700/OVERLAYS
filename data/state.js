/**
 * State Snapshot Aggregator
 * =========================
 * Convenience module that re-exports all data modules and provides
 * a getSnapshot() function for building the Socket.io initialData payload.
 *
 * This module is NOT currently imported by server.js (which imports
 * characters and rolls directly). It exists as a convenience for
 * future use when the server needs a single entry point for all
 * game state — e.g., for save/restore or a status dashboard endpoint.
 *
 * @module data/state
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
