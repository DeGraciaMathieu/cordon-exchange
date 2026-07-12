// Stalker expeditions: send a hired stalker into a zone, resolve returns.
import { ZONES, ROSTER, stalkerById } from "./config.js";
import { pick, randInt } from "./rng.js";
import { bountyExtraDeath } from "./factions.js";
import { stalkerLevel, isBusy } from "./stalkers.js";

// personal odds: zone danger, bounty, trait and experience all weigh in
export function deathChance(state, stalkerId, z) {
  const rec = state.stalkers.find(s => s.id === stalkerId);
  let d = z.death + bountyExtraDeath(state);
  if (stalkerById(stalkerId).trait === "veteran") d *= ROSTER.veteranMult;
  d -= (stalkerLevel(rec ? rec.xp : 0) - 1) * ROSTER.deathPerLevel;
  return Math.max(ROSTER.minDeath, d);
}

export function launchExp(state, zid) {
  const z = ZONES.find(z => z.id === zid);
  const rec = state.stalkers.find(s => s.id === state.activeStalker);
  if (!rec || isBusy(state, rec.id)) return;
  state.money -= z.fee;
  const days = Math.max(1, z.days - (stalkerById(rec.id).trait === "runner" ? ROSTER.runnerDaysOff : 0));
  state.exps.push({ zone: zid, left: days, stalkerId: rec.id });
  state.bus.emit("expedition:launched", { zoneId: zid, stalkerId: rec.id, fee: z.fee });
}

export function resolveExps(state) {
  const done = [];
  state.exps.forEach(e => { e.left--; if (e.left <= 0) done.push(e); });
  state.exps = state.exps.filter(e => e.left > 0);
  done.forEach(e => {
    const z = ZONES.find(z => z.id === e.zone);
    const rec = state.stalkers.find(s => s.id === e.stalkerId);
    if (state.rng() < deathChance(state, e.stalkerId, z)) {
      // permadeath: gone from the roster and from the recruit pool
      state.stalkers = state.stalkers.filter(s => s.id !== e.stalkerId);
      state.fallen.push(e.stalkerId);
      if (state.activeStalker === e.stalkerId) state.activeStalker = state.stalkers.length ? state.stalkers[0].id : null;
      state.bus.emit("expedition:lost", { zoneId: z.id, stalkerId: e.stalkerId, level: stalkerLevel(rec.xp) });
    } else {
      const bonus = stalkerById(e.stalkerId).trait === "scavenger" ? ROSTER.scavengerBonus : 0;
      const n = randInt(state.rng, z.qty[0], z.qty[1]) + bonus;
      const loot = {};
      for (let i = 0; i < n; i++) {
        const id = pick(state.rng, z.loot);
        state.inv[id]++;
        loot[id] = (loot[id] || 0) + 1;
      }
      const before = stalkerLevel(rec.xp);
      rec.xp++;
      state.bus.emit("expedition:returned", { zoneId: z.id, stalkerId: e.stalkerId, loot });
      const after = stalkerLevel(rec.xp);
      if (after > before) state.bus.emit("stalker:promoted", { stalkerId: rec.id, level: after });
    }
  });
}
