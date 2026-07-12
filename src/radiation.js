// Player radiation: artefacts held overnight are hot potatoes.
import { ITEMS, RADIATION } from "./config.js";
import { upgradeFx } from "./upgrades.js";

// tonight's dose if the inventory stays as it is (the lead-lined box halves it)
export function radsDose(state) {
  const raw = ITEMS.reduce((sum, it) => sum + (state.inv[it.id] || 0) * it.rad, 0) * RADIATION.perRad;
  return Math.round(raw * upgradeFx(state, "leadbox", 1));
}

// nightly tick; returns true when the dose is lethal
export function tickRadiation(state) {
  const dose = radsDose(state);
  if (dose > 0) {
    state.rads = Math.min(RADIATION.deathAt, state.rads + dose);
    state.bus.emit("rads:changed", { delta: dose, rads: state.rads });
  } else if (state.rads > 0) {
    const rec = Math.min(state.rads, RADIATION.decay);
    state.rads -= rec;
    state.bus.emit("rads:changed", { delta: -rec, rads: state.rads });
  }
  if (state.rads >= RADIATION.deathAt) return true;
  if (state.rads >= RADIATION.sickAt) {
    const cost = Math.min(state.money, Math.round(state.rads * RADIATION.sickCostPerRad));
    if (cost > 0) {
      state.money -= cost;
      state.bus.emit("rads:sickened", { cost, rads: state.rads });
    }
  }
  return false;
}
