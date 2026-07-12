// Market prices, buying, and selling to factions.
import { ITEMS, PREF, TRADE, MARKET, HAGGLE, itemById } from "./config.js";
import { clamp } from "./util.js";
import { catDemand, repMult, marketClosed, marketCatMult } from "./factions.js";
import { shiftRep } from "./reputation.js";

export function buyPrice(state, id) {
  return Math.round(state.price[id] * TRADE.buyMarkup);
}

// price a faction pays for an item (reputation + category preference + demand)
export function sellPrice(state, id, fac) {
  const it = itemById(id);
  const repBonus = 1 + state.rep[fac] / TRADE.repPriceDiv;
  return Math.round(state.price[id] * PREF[fac][it.cat] * repBonus * TRADE.merchantMargin * catDemand(state, fac, it.cat));
}

export function buy(state, id, n) {
  const bp = buyPrice(state, id);
  let count = 0;
  for (let i = 0; i < n; i++) {
    if (state.money < bp) break;
    state.money -= bp;
    state.inv[id]++;
    count++;
  }
  state.bus.emit("item:bought", { id, count });
}

// reputation gain and war support shared by every kind of sale
function saleRepGain(state, fac, it, count) {
  let gain = TRADE.repGainBase + Math.round(count * (it.cat === "artefact" ? TRADE.artefactRepFactor : 1));
  if (fac === "bandits") gain = Math.round(gain * TRADE.banditRepFactor);
  gain = Math.round(gain * repMult(state, fac, it.cat));
  shiftRep(state, fac, gain);
  // war support: supplying the aggressor with weapons or consumables
  state.factionEvents.forEach(e => {
    if (e.type === "war" && e.a === fac && (it.cat === "arme" || it.cat === "conso")) e.support += count;
  });
  return gain;
}

export function sell(state, id, n) {
  const fac = state.sellFaction;
  if (marketClosed(state, fac)) { state.bus.emit("trade:blocked", { fac }); return; }
  let count = 0, total = 0;
  while (count < n && state.inv[id] > 0) {
    const sp = sellPrice(state, id, fac);
    state.money += sp;
    state.inv[id]--;
    total += sp;
    count++;
  }
  if (count) {
    const gain = saleRepGain(state, fac, itemById(id), count);
    state.bus.emit("item:sold", { id, fac, count, total, gain });
  }
}

// haggle: try to sell one item at +15%; on refusal the faction is vexed and keeps its money
export function haggle(state, id) {
  const fac = state.sellFaction;
  if (marketClosed(state, fac)) { state.bus.emit("trade:blocked", { fac }); return; }
  if (state.inv[id] <= 0) return;
  if (state.rng() < HAGGLE.chance) {
    const price = Math.round(sellPrice(state, id, fac) * (1 + HAGGLE.bonus));
    state.money += price;
    state.inv[id]--;
    const gain = saleRepGain(state, fac, itemById(id), 1);
    state.bus.emit("trade:haggled", { id, fac, success: true, price, gain });
  } else {
    shiftRep(state, fac, -HAGGLE.repPenalty);
    state.bus.emit("trade:haggled", { id, fac, success: false, penalty: HAGGLE.repPenalty });
  }
}

export function selectFaction(state, fac) {
  state.sellFaction = fac;
}

export function fluctuate(state, ev) {
  ITEMS.forEach(it => {
    const drift = 1 + (state.rng() * 2 - 1) * it.vol;
    const pull = 1 + (it.base - state.price[it.id]) / it.base * MARKET.meanPull;
    const evm = (ev.cat === "all" || ev.cat === it.cat) ? ev.mult : 1;
    state.price[it.id] = clamp(
      Math.round(state.price[it.id] * drift * pull * evm * marketCatMult(state, it.cat)),
      Math.round(it.base * MARKET.minMult),
      Math.round(it.base * MARKET.maxMult),
    );
    const h = state.history[it.id];
    h.push(state.price[it.id]);
    if (h.length > MARKET.historyLen) h.shift();
  });
}

// buy signal: the mean pull makes base the anchor, so buying well under it is statistically a deal
export function isUndervalued(state, id) {
  return state.price[id] <= itemById(id).base * MARKET.undervaluedAt;
}
