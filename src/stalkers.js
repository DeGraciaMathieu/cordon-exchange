// Stalker roster: recruitment, levels, availability. Death is handled in expeditions.js.
import { STALKERS, ROSTER } from "./config.js";

export const stalkerLevel = xp => Math.min(ROSTER.maxLevel, 1 + Math.floor(xp / ROSTER.xpPerLevel));
export const isBusy = (state, id) => state.exps.some(e => e.stalkerId === id);

// hireable stalkers: not hired, not dead
export const recruitPool = state =>
  STALKERS.filter(def => !state.stalkers.some(s => s.id === def.id) && !state.fallen.includes(def.id));

export function recruitStalker(state, id) {
  if (state.stalkers.length >= ROSTER.maxHired) return;
  if (state.money < ROSTER.hireCost) return;
  const def = recruitPool(state).find(d => d.id === id);
  if (!def) return;
  state.money -= ROSTER.hireCost;
  state.stalkers.push({ id, xp: 0 });
  if (!state.activeStalker) state.activeStalker = id;
  state.bus.emit("stalker:recruited", { stalkerId: id });
}

export function selectStalker(state, id) {
  if (state.stalkers.some(s => s.id === id)) state.activeStalker = id;
}
