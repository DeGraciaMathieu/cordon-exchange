// App state factory and the day loop — the only entry point of the simulation.
import { createBus } from "./events.js";
import { pick } from "./rng.js";
import {
  ITEMS, MAX_DAY, START, DEBT, STORY_BEATS, MARKET_EVENTS,
  FACTION_EVENTS, DELIVERY,
} from "./config.js";
import { fluctuate } from "./market.js";
import { spawnFactionEvent, tickFactionEvents, checkBounty } from "./factions.js";
import { genDeliveryOffer, tickContracts } from "./contracts.js";
import { resolveExps } from "./expeditions.js";

export function createApp({ rng }) {
  const state = {
    rng,
    bus: createBus(),
    day: 1,
    money: START.money,
    debt: DEBT.start,
    rep: { ...START.rep },
    price: {},
    inv: {},
    exps: [],
    factionEvents: [],
    deliveryOffers: [],
    activeDeliveries: [],
    contractSeq: 0,
    sellFaction: START.sellFaction,
    milestones: {},
    over: false,
  };
  ITEMS.forEach(i => { state.price[i.id] = i.base; state.inv[i.id] = 0; });
  Object.assign(state.inv, START.inv);
  return state;
}

function checkStory(state) {
  const paid = DEBT.start - state.debt;
  STORY_BEATS.forEach(([threshold, text]) => {
    if (paid >= threshold && !state.milestones[threshold]) {
      state.milestones[threshold] = 1;
      state.bus.emit("story:reached", { threshold, text });
    }
  });
}

function endGame(state, win) {
  state.over = true;
  state.bus.emit("game:ended", { win, day: state.day, money: state.money, debt: state.debt });
}

export function nextDay(state) {
  if (state.over) return;
  // each night the Fixer garnishes part of the cash; the rest stays for trading
  if (state.debt > 0) {
    const payment = Math.min(state.debt, Math.floor(state.money * DEBT.garnish));
    if (payment > 0) {
      state.money -= payment;
      state.debt -= payment;
      state.bus.emit("debt:paid", { amount: payment, debt: state.debt });
    }
  }
  checkStory(state);
  if (state.debt <= 0) return endGame(state, true);

  state.day++;
  if (state.day > MAX_DAY) return endGame(state, false);
  state.bus.emit("day:started", { day: state.day });

  resolveExps(state);
  tickFactionEvents(state);
  tickContracts(state);
  if (state.day >= FACTION_EVENTS.spawnFromDay && state.rng() < FACTION_EVENTS.spawnChance) spawnFactionEvent(state);
  if (state.day >= DELIVERY.spawnFromDay && state.rng() < DELIVERY.spawnChance) genDeliveryOffer(state);
  checkBounty(state);

  const ev = pick(state.rng, MARKET_EVENTS);
  state.bus.emit("market:shifted", { ev });
  fluctuate(state, ev);
}
