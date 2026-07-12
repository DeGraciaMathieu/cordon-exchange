// App state factory and the day loop — the only entry point of the simulation.
import { createBus } from "./events.js";
import { pick } from "./rng.js";
import {
  ITEMS, MAX_DAY, START, DEBT, STORY_BEATS, MARKET_EVENTS,
  FACTION_EVENTS, DELIVERY, ROSTER,
} from "./config.js";
import { fluctuate } from "./market.js";
import { spawnFactionEvent, tickFactionEvents, checkBounty } from "./factions.js";
import { genDeliveryOffer, tickContracts } from "./contracts.js";
import { resolveExps } from "./expeditions.js";
import { drawEncounter } from "./encounters.js";
import { tickRadiation } from "./radiation.js";

export function createApp({ rng }) {
  const state = {
    rng,
    bus: createBus(),
    day: 1,
    money: START.money,
    debt: DEBT.start,
    rep: { ...START.rep },
    price: {},
    history: {},
    inv: {},
    exps: [],
    factionEvents: [],
    deliveryOffers: [],
    activeDeliveries: [],
    contractSeq: 0,
    sellFaction: START.sellFaction,
    milestones: {},
    over: false,
    encounter: null,
    marketTip: null,
    rads: 0,
    stalkers: ROSTER.start.map(id => ({ id, xp: 0 })),
    activeStalker: ROSTER.start[0],
    fallen: [],
    upgrades: [],
  };
  ITEMS.forEach(i => { state.price[i.id] = i.base; state.history[i.id] = [i.base]; state.inv[i.id] = 0; });
  Object.assign(state.inv, START.inv);
  drawEncounter(state); // day 1 gets its card too
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

function endGame(state, win, reason = null) {
  state.over = true;
  state.bus.emit("game:ended", { win, reason, day: state.day, money: state.money, debt: state.debt });
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
  if (state.day > MAX_DAY) return endGame(state, false, "deadline");
  state.bus.emit("day:started", { day: state.day });

  resolveExps(state);
  tickFactionEvents(state);
  tickContracts(state);
  if (tickRadiation(state)) return endGame(state, false, "rads");
  if (state.day >= FACTION_EVENTS.spawnFromDay && state.rng() < FACTION_EVENTS.spawnChance) spawnFactionEvent(state);
  if (state.day >= DELIVERY.spawnFromDay && state.rng() < DELIVERY.spawnChance) genDeliveryOffer(state);
  checkBounty(state);
  drawEncounter(state);

  // a bribed tip forces tomorrow's market event, then burns out
  const ev = state.marketTip != null ? MARKET_EVENTS[state.marketTip] : pick(state.rng, MARKET_EVENTS);
  state.marketTip = null;
  state.bus.emit("market:shifted", { ev });
  fluctuate(state, ev);
}
