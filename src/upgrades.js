// Permanent hideout upgrades: bought once, owned for the whole run.
import { upgradeById } from "./config.js";

export const hasUpgrade = (state, id) => state.upgrades.includes(id);

// effect value when owned, neutral fallback otherwise (1 for multipliers, 0 for additive slots)
export const upgradeFx = (state, id, neutral) => hasUpgrade(state, id) ? upgradeById(id).fx : neutral;

export function buyUpgrade(state, id) {
  const u = upgradeById(id);
  if (!u || hasUpgrade(state, id) || state.money < u.cost) return;
  state.money -= u.cost;
  state.upgrades.push(id);
  state.bus.emit("upgrade:bought", { upgradeId: id });
}
