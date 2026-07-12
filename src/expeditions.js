// Stalker expeditions: send someone into a zone, resolve returns.
import { ZONES, STALKER_NAMES } from "./config.js";
import { pick, randInt } from "./rng.js";
import { bountyExtraDeath } from "./factions.js";

export function launchExp(state, zid) {
  const z = ZONES.find(z => z.id === zid);
  state.money -= z.fee;
  const name = pick(state.rng, STALKER_NAMES);
  state.exps.push({ zone: zid, left: z.days, name });
  state.bus.emit("expedition:launched", { zoneId: zid, name, fee: z.fee });
}

export function resolveExps(state) {
  const done = [];
  state.exps.forEach(e => { e.left--; if (e.left <= 0) done.push(e); });
  state.exps = state.exps.filter(e => e.left > 0);
  done.forEach(e => {
    const z = ZONES.find(z => z.id === e.zone);
    if (state.rng() < z.death + bountyExtraDeath(state)) {
      state.bus.emit("expedition:lost", { zoneId: z.id, name: e.name });
    } else {
      const n = randInt(state.rng, z.qty[0], z.qty[1]);
      const loot = {};
      for (let i = 0; i < n; i++) {
        const id = pick(state.rng, z.loot);
        state.inv[id]++;
        loot[id] = (loot[id] || 0) + 1;
      }
      state.bus.emit("expedition:returned", { zoneId: z.id, name: e.name, loot });
    }
  });
}
