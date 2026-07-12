// Daily choice encounters: one card per day, risky options, declarative consequences.
import { ENCOUNTERS, MARKET_EVENTS, encounterById } from "./config.js";
import { pick } from "./rng.js";
import { shiftRep } from "./reputation.js";

// draw today's card; an unanswered card from yesterday is replaced (the opportunity passes)
export function drawEncounter(state) {
  const pool = state.encounter ? ENCOUNTERS.filter(e => e.id !== state.encounter.id) : ENCOUNTERS;
  state.encounter = { id: pick(state.rng, pool).id };
}

export function canPick(state, opt) {
  if (!opt.needs) return true;
  if (opt.needs.money && state.money < opt.needs.money) return false;
  for (const id in opt.needs.items || {}) {
    if ((state.inv[id] || 0) < opt.needs.items[id]) return false;
  }
  return true;
}

// apply one effects block, accumulating what actually happened into `applied`
function applyEffects(state, fx, applied) {
  if (fx.money) {
    const delta = fx.money < 0 ? -Math.min(state.money, -fx.money) : fx.money;
    state.money += delta;
    applied.money = (applied.money || 0) + delta;
  }
  for (const id in fx.items || {}) {
    const delta = fx.items[id] < 0 ? -Math.min(state.inv[id] || 0, -fx.items[id]) : fx.items[id];
    state.inv[id] += delta;
    applied.items = applied.items || {};
    applied.items[id] = (applied.items[id] || 0) + delta;
  }
  for (const fac in fx.rep || {}) {
    shiftRep(state, fac, fx.rep[fac]);
    applied.rep = applied.rep || {};
    applied.rep[fac] = (applied.rep[fac] || 0) + fx.rep[fac];
  }
  if (fx.tip) {
    const ev = pick(state.rng, MARKET_EVENTS.filter(e => e.mult > 1));
    state.marketTip = MARKET_EVENTS.indexOf(ev);
    applied.tip = ev.cat;
  }
}

export function chooseEncounter(state, optionId) {
  if (!state.encounter) return;
  const enc = encounterById(state.encounter.id);
  const opt = enc.options.find(o => o.id === optionId);
  if (!opt || !canPick(state, opt)) return;
  state.encounter = null;
  const applied = {};
  let outcome = null;
  let text = opt.effects && opt.effects.t;
  if (opt.effects) applyEffects(state, opt.effects, applied);
  if (opt.risk) {
    outcome = state.rng() < opt.risk.p ? "success" : "failure";
    const fx = opt.risk[outcome];
    applyEffects(state, fx, applied);
    text = fx.t;
  }
  state.bus.emit("encounter:resolved", { encounterId: enc.id, optionId: opt.id, outcome, text, applied });
}
