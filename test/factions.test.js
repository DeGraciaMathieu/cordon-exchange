import { test } from "node:test";
import assert from "node:assert/strict";
import { createApp } from "../src/app.js";
import { mulberry32 } from "../src/rng.js";
import {
  spawnFactionEvent, tickFactionEvents, checkBounty, payRansom,
  marketClosed, hasBounty, bountyExtraDeath, zoneBlocked, catDemand,
} from "../src/factions.js";
import { FACTION_EVENTS, BOUNTY } from "../src/config.js";

const app = seed => createApp({ rng: mulberry32(seed) });

test("a supported war ends with a reward from the aggressor", () => {
  const s = app(1);
  s.factionEvents.push({ type: "war", a: "duty", b: "freedom", left: 1, support: FACTION_EVENTS.warSupportGoal });
  const rep0 = s.rep.duty;
  tickFactionEvents(s);
  assert.equal(s.factionEvents.length, 0);
  assert.equal(s.rep.duty, rep0 + FACTION_EVENTS.warWinRep);
});

test("a stalled war thanks the besieged faction", () => {
  const s = app(2);
  s.factionEvents.push({ type: "war", a: "duty", b: "freedom", left: 1, support: 0 });
  const rep0 = s.rep.freedom;
  tickFactionEvents(s);
  assert.equal(s.rep.freedom, rep0 + FACTION_EVENTS.warStallRep);
});

test("a collapsed reputation puts a bounty on your head", () => {
  const s = app(3);
  s.rep.bandits = -80;
  checkBounty(s);
  assert.ok(hasBounty(s, "bandits"));
  assert.ok(marketClosed(s, "bandits"));
  assert.equal(bountyExtraDeath(s), BOUNTY.extraDeath);
  assert.equal(s.factionEvents[0].ransom, Math.round(BOUNTY.ransomBase + 80 * BOUNTY.ransomPerRep));
});

test("paying the ransom lifts the bounty", () => {
  const s = app(4);
  s.rep.bandits = -80;
  checkBounty(s);
  const ransom = s.factionEvents[0].ransom;
  s.money = ransom + 100;
  payRansom(s, "bandits");
  assert.ok(!hasBounty(s, "bandits"));
  assert.equal(s.money, 100);
  assert.equal(s.rep.bandits, BOUNTY.repAfterRansom);
});

test("an unaffordable ransom changes nothing", () => {
  const s = app(5);
  s.rep.bandits = -80;
  checkBounty(s);
  s.money = 10;
  let refused = false;
  s.bus.on("bounty:unaffordable", () => refused = true);
  payRansom(s, "bandits");
  assert.equal(refused, true);
  assert.ok(hasBounty(s, "bandits"));
  assert.equal(s.money, 10);
});

test("spawnFactionEvent respects the active-event cap", () => {
  const s = app(6);
  for (let i = 0; i < 50; i++) spawnFactionEvent(s);
  const active = s.factionEvents.filter(e => e.type !== "bounty").length;
  assert.ok(active >= 1 && active <= FACTION_EVENTS.maxActive);
});

test("blockades close their zone and contracts raise demand", () => {
  const s = app(7);
  s.factionEvents.push({ type: "blockade", zone: "yantar", fac: "duty", left: 2 });
  assert.ok(zoneBlocked(s, "yantar"));
  assert.ok(!zoneBlocked(s, "cordon"));
  s.factionEvents.push({ type: "contract", fac: "duty", cat: "arme", left: 2, mult: FACTION_EVENTS.contractMult });
  assert.equal(catDemand(s, "duty", "arme"), FACTION_EVENTS.contractMult);
  assert.equal(catDemand(s, "duty", "conso"), 1);
});
