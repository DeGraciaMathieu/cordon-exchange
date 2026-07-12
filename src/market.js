// Market prices, buying, and selling to factions.
import { ITEMS, PREF, TRADE, MARKET, itemById } from "./config.js";
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
    const it = itemById(id);
    let gain = TRADE.repGainBase + Math.round(count * (it.cat === "artefact" ? TRADE.artefactRepFactor : 1));
    if (fac === "bandits") gain = Math.round(gain * TRADE.banditRepFactor);
    gain = Math.round(gain * repMult(state, fac, it.cat));
    shiftRep(state, fac, gain);
    // war support: supplying the aggressor with weapons or consumables
    state.factionEvents.forEach(e => {
      if (e.type === "war" && e.a === fac && (it.cat === "arme" || it.cat === "conso")) e.support += count;
    });
    state.bus.emit("item:sold", { id, fac, count, total, gain });
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
  });
}
