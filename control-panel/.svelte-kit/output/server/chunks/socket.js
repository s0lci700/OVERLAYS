import { io } from "socket.io-client";
import { w as writable } from "./index.js";
const SERVER_URL = "http://192.168.1.83:3000";
const socket = io(SERVER_URL);
const characters = writable([]);
const lastRoll = writable(null);
socket.on("connect", () => {
  console.log("Connected to server");
});
socket.on("initialData", (data) => {
  console.log("Received initial data:", data);
  characters.set(data.characters);
});
socket.on("hp_updated", ({ character }) => {
  characters.update(
    (chars) => chars.map((c) => c.id === character.id ? character : c)
  );
});
socket.on("character_created", ({ character }) => {
  characters.update((chars) => [...chars, character]);
});
socket.on("character_updated", ({ character }) => {
  characters.update(
    (chars) => chars.map((c) => c.id === character.id ? character : c)
  );
});
socket.on("condition_added", ({ charId, condition }) => {
  characters.update(
    (chars) => chars.map(
      (c) => c.id === charId ? { ...c, conditions: [...c.conditions || [], condition] } : c
    )
  );
});
socket.on("condition_removed", ({ charId, conditionId }) => {
  characters.update(
    (chars) => chars.map(
      (c) => c.id === charId ? {
        ...c,
        conditions: (c.conditions || []).filter(
          (cond) => cond.id !== conditionId
        )
      } : c
    )
  );
});
socket.on("resource_updated", ({ charId, resource }) => {
  characters.update(
    (chars) => chars.map(
      (c) => c.id === charId ? {
        ...c,
        resources: (c.resources || []).map(
          (r) => r.id === resource.id ? resource : r
        )
      } : c
    )
  );
});
socket.on("rest_taken", ({ charId, character }) => {
  characters.update(
    (chars) => chars.map((c) => c.id === charId ? character : c)
  );
});
socket.on("dice_rolled", (data) => {
  lastRoll.set(data);
});
export {
  SERVER_URL as S,
  characters as c,
  lastRoll as l,
  socket as s
};
