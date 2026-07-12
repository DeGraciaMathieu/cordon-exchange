// Faction events: wars, category contracts, blockades, raids, bounties.
import {
  FACTIONS, FACTION_IDS, BLOCKADE_FACTIONS, CATEGORIES, ZONES, ITEMS,
  FACTION_EVENTS as FE, BOUNTY,
} from "./config.js";
import { pick, randInt } from "./rng.js";
import { shiftRep } from "./reputation.js";
import { upgradeFx } from "./upgrades.js";

export const marketClosed = (state, fac) =>
  state.factionEvents.some(e => (e.type === "war" && e.b === fac) || (e.type === "bounty" && e.fac === fac));
export const hasBounty = (state, fac) =>
  state.factionEvents.some(e => e.type === "bounty" && e.fac === fac);
export const bountyExtraDeath = state =>
  state.factionEvents.some(e => e.type === "bounty") ? BOUNTY.extraDeath : 0;
export const zoneBlocked = (state, zid) =>
  state.factionEvents.some(e => e.type === "blockade" && e.zone === zid);

// price bonus a faction pays for a category (contracts + war effort + bandit fencing)
export function catDemand(state, fac, cat) {
  let m = 1;
  state.factionEvents.forEach(e => {
    if (e.type === "contract" && e.fac === fac && e.cat === cat) m *= e.mult;
    if (e.type === "war" && e.a === fac && (cat === "arme" || cat === "conso")) m *= FE.warDemandMult;
    if (e.type === "raid" && fac === "bandits") m *= FE.raidFenceMult;
  });
  return m;
}

// reputation bonus when selling a category to a faction
export function repMult(state, fac, cat) {
  let m = 1;
  state.factionEvents.forEach(e => {
    if (e.type === "contract" && e.fac === fac && e.cat === cat) m *= FE.contractRepMult;
    if (e.type === "war" && e.a === fac && (cat === "arme" || cat === "conso")) m *= FE.warRepMult;
  });
  return m;
}

// daily market price bias per category
export function marketCatMult(state, cat) {
  let m = 1;
  state.factionEvents.forEach(e => { if (e.type === "war" && cat === "arme") m *= FE.warMarketDrift; });
  return m;
}

export function spawnFactionEvent(state) {
  if (state.factionEvents.filter(e => e.type !== "bounty").length >= FE.maxActive) return;
  const hasWar = state.factionEvents.some(e => e.type === "war");
  const pool = ["contract", "contract", "blockade", "raid"];
  if (!hasWar) pool.push("war", "war");
  const type = pick(state.rng, pool);
  if (type === "war") {
    const a = pick(state.rng, FACTION_IDS);
    const rivals = FACTIONS[a].rivals;
    if (!rivals.length) return;
    const b = pick(state.rng, rivals);
    state.factionEvents.push({ type: "war", a, b, left: randInt(state.rng, ...FE.warDays), support: 0 });
    state.bus.emit("faction:war-started", { a, b });
  } else if (type === "contract") {
    const fac = pick(state.rng, FACTION_IDS);
    const cat = pick(state.rng, CATEGORIES);
    state.factionEvents.push({ type: "contract", fac, cat, left: randInt(state.rng, ...FE.contractDays), mult: FE.contractMult });
    state.bus.emit("faction:contract-started", { fac, cat });
  } else if (type === "blockade") {
    const zone = pick(state.rng, ZONES.slice(1));
    if (zoneBlocked(state, zone.id)) return;
    const fac = pick(state.rng, BLOCKADE_FACTIONS);
    state.factionEvents.push({ type: "blockade", zone: zone.id, fac, left: randInt(state.rng, ...FE.blockadeDays) });
    state.bus.emit("faction:blockade-started", { zoneId: zone.id, fac });
  } else {
    state.factionEvents.push({ type: "raid", left: randInt(state.rng, ...FE.raidDays) });
    state.bus.emit("faction:raid-started", {});
  }
}

function nightRaid(state) {
  if (state.rng() < FE.raidTheftChance * upgradeFx(state, "watchdog", 1)) {
    const owned = ITEMS.filter(it => state.inv[it.id] > 0);
    if (owned.length) {
      const it = pick(state.rng, owned);
      state.inv[it.id]--;
      state.bus.emit("player:robbed", { itemId: it.id });
    }
  }
}

function bountyNight(state, e) {
  if (state.rng() < BOUNTY.ambushChance * upgradeFx(state, "watchdog", 1)) {
    const loss = Math.min(state.money, Math.round(BOUNTY.ambushLossBase + state.rng() * BOUNTY.ambushLossSpan));
    if (loss > 0) {
      state.money -= loss;
      state.bus.emit("bounty:ambushed", { fac: e.fac, loss });
    }
  }
}

export function tickFactionEvents(state) {
  const still = [];
  state.factionEvents.forEach(e => {
    e.left--;
    if (e.left > 0) {
      if (e.type === "raid") nightRaid(state);
      if (e.type === "bounty") bountyNight(state, e);
      still.push(e);
      return;
    }
    if (e.type === "bounty") {
      state.rep[e.fac] = Math.max(state.rep[e.fac], BOUNTY.repAfterExpire);
      state.bus.emit("bounty:expired", { fac: e.fac });
    } else if (e.type === "war") {
      if (e.support >= FE.warSupportGoal) {
        state.bus.emit("faction:war-won", { a: e.a, b: e.b });
        shiftRep(state, e.a, FE.warWinRep);
      } else {
        state.bus.emit("faction:war-stalled", { a: e.a, b: e.b });
        shiftRep(state, e.b, FE.warStallRep);
      }
    } else if (e.type === "contract") state.bus.emit("faction:contract-ended", { fac: e.fac });
    else if (e.type === "blockade") state.bus.emit("faction:blockade-ended", { zoneId: e.zone });
    else if (e.type === "raid") state.bus.emit("faction:raid-ended", {});
  });
  state.factionEvents = still;
}

export function checkBounty(state) {
  for (const fac of FACTION_IDS) {
    if (state.rep[fac] <= BOUNTY.repThreshold && !hasBounty(state, fac)) {
      const ransom = Math.round(BOUNTY.ransomBase + Math.abs(state.rep[fac]) * BOUNTY.ransomPerRep);
      state.factionEvents.push({ type: "bounty", fac, left: BOUNTY.days, ransom });
      state.bus.emit("bounty:placed", { fac, ransom });
    }
  }
}

export function payRansom(state, fac) {
  const e = state.factionEvents.find(x => x.type === "bounty" && x.fac === fac);
  if (!e) return;
  if (state.money < e.ransom) { state.bus.emit("bounty:unaffordable", { fac }); return; }
  state.money -= e.ransom;
  state.factionEvents = state.factionEvents.filter(x => x !== e);
  state.rep[fac] = Math.max(state.rep[fac], BOUNTY.repAfterRansom);
  state.bus.emit("bounty:paid", { fac, ransom: e.ransom });
}
