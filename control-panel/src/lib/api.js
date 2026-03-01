/**
 * Thin HTTP client for the DADOS & RISAS backend API.
 *
 * Every function returns the raw Response so callers can inspect `.ok` and
 * parse the body themselves — the same pattern the rest of the app uses.
 * Centralising the calls here means:
 *   - endpoint URLs live in one place
 *   - the JSON headers are not repeated in every component
 *   - retries or auth tokens can be added without touching components
 */

const SERVER_URL =
  import.meta.env.VITE_SERVER_URL || "http://localhost:3000";

const JSON_HEADERS = { "Content-Type": "application/json" };

function post(url, body) {
  return fetch(url, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify(body),
  });
}

function put(url, body) {
  return fetch(url, {
    method: "PUT",
    headers: JSON_HEADERS,
    body: JSON.stringify(body),
  });
}

function del(url) {
  return fetch(url, { method: "DELETE" });
}

// ── Characters ──────────────────────────────────────────────────────────────

export const createCharacter = (payload) =>
  post(`${SERVER_URL}/api/characters`, payload);

export const updateCharacter = (charId, updates) =>
  put(`${SERVER_URL}/api/characters/${charId}`, updates);

export const deleteCharacter = (charId) =>
  del(`${SERVER_URL}/api/characters/${charId}`);

export const updatePhoto = (charId, photo) =>
  put(`${SERVER_URL}/api/characters/${charId}/photo`, { photo });

// ── HP ──────────────────────────────────────────────────────────────────────

export const updateHp = (charId, hp_current) =>
  put(`${SERVER_URL}/api/characters/${charId}/hp`, { hp_current });

// ── Conditions ──────────────────────────────────────────────────────────────

export const addCondition = (charId, payload) =>
  post(`${SERVER_URL}/api/characters/${charId}/conditions`, payload);

export const removeCondition = (charId, condId) =>
  del(`${SERVER_URL}/api/characters/${charId}/conditions/${condId}`);

// ── Resources ───────────────────────────────────────────────────────────────

export const updateResource = (charId, rid, pool_current) =>
  put(`${SERVER_URL}/api/characters/${charId}/resources/${rid}`, {
    pool_current,
  });

// ── Rest ────────────────────────────────────────────────────────────────────

export const takeRest = (charId, type) =>
  post(`${SERVER_URL}/api/characters/${charId}/rest`, { type });

// ── Rolls ───────────────────────────────────────────────────────────────────

export const logRoll = (payload) =>
  post(`${SERVER_URL}/api/rolls`, payload);
