// Delivery contracts: offers, acceptance, delivery, deadlines.
import { ITEMS, FACTION_IDS, DELIVERY } from "./config.js";
import { pick, randInt } from "./rng.js";
import { marketClosed } from "./factions.js";
import { shiftRep } from "./reputation.js";

export function genDeliveryOffer(state) {
  if (state.deliveryOffers.length >= DELIVERY.maxOffers) return;
  const facs = FACTION_IDS.filter(f => !marketClosed(state, f));
  if (!facs.length) return;
  const fac = pick(state.rng, facs);
  const it = pick(state.rng, ITEMS.filter(i => i.cat === "artefact"));
  const qty = randInt(state.rng, ...DELIVERY.qty);
  const days = randInt(state.rng, ...DELIVERY.days);
  const reward = Math.round(it.base * qty * DELIVERY.rewardMult * (1 + state.rep[fac] / DELIVERY.rewardRepDiv));
  const offer = { id: ++state.contractSeq, fac, itemId: it.id, qty, days, reward, expire: DELIVERY.offerLifetime };
  state.deliveryOffers.push(offer);
  state.bus.emit("contract:offered", { offer });
}

export function acceptDelivery(state, id) {
  const i = state.deliveryOffers.findIndex(o => o.id === id);
  if (i < 0) return;
  const o = state.deliveryOffers.splice(i, 1)[0];
  o.delivered = 0;
  o.left = o.days;
  state.activeDeliveries.push(o);
  state.bus.emit("contract:accepted", { contract: o });
}

export function deliverContract(state, id) {
  const o = state.activeDeliveries.find(o => o.id === id);
  if (!o) return;
  let n = 0;
  while (o.delivered < o.qty && state.inv[o.itemId] > 0) {
    state.inv[o.itemId]--;
    o.delivered++;
    n++;
  }
  if (!n) { state.bus.emit("contract:blocked", { contract: o }); return; }
  if (o.delivered >= o.qty) {
    state.money += o.reward;
    shiftRep(state, o.fac, DELIVERY.completeRep);
    state.activeDeliveries = state.activeDeliveries.filter(x => x !== o);
    state.bus.emit("contract:completed", { contract: o });
  } else {
    state.bus.emit("contract:progressed", { contract: o });
  }
}

export function tickContracts(state) {
  state.deliveryOffers.forEach(o => o.expire--);
  state.deliveryOffers = state.deliveryOffers.filter(o => o.expire > 0);
  const keep = [];
  state.activeDeliveries.forEach(o => {
    o.left--;
    if (o.left > 0) { keep.push(o); return; }
    shiftRep(state, o.fac, DELIVERY.failRep);
    state.bus.emit("contract:failed", { contract: o });
  });
  state.activeDeliveries = keep;
}
