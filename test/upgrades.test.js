import { test } from "node:test";
import assert from "node:assert/strict";
import { createApp } from "../src/app.js";
import { mulberry32 } from "../src/rng.js";
import { buyUpgrade, hasUpgrade } from "../src/upgrades.js";
import { radsDose } from "../src/radiation.js";
import { sellPrice } from "../src/market.js";
import { tickFactionEvents } from "../src/factions.js";
import { maxExpeditions } from "../src/expeditions.js";
import { maxCrew, recruitStalker, recruitPool } from "../src/stalkers.js";
import { UPGRADES, EXPEDITIONS, ROSTER, upgradeById, START } from "../src/config.js";

const app = seed => createApp({ rng: mulberry32(seed) });

test("an upgrade is bought once and for all", () => {
  const s = app(1);
  s.money = 10000;
  buyUpgrade(s, "watchdog");
  assert.ok(hasUpgrade(s, "watchdog"));
  assert.equal(s.money, 10000 - upgradeById("watchdog").cost);
  buyUpgrade(s, "watchdog"); // already owned
  assert.equal(s.money, 10000 - upgradeById("watchdog").cost);
  s.money = 0;
  buyUpgrade(s, "leadbox"); // too poor
  assert.ok(!hasUpgrade(s, "leadbox"));
});

test("the lead-lined box halves the nightly dose", () => {
  const s = app(2);
  s.inv.medusa = 0;
  s.inv.sausage = 0;
  s.inv.crystal = 2; // rad 5 each -> dose 10
  assert.equal(radsDose(s), 10);
  s.upgrades.push("leadbox");
  assert.equal(radsDose(s), 5);
});

test("the counter contact raises every faction price", () => {
  const s = app(3);
  const before = sellPrice(s, "medusa", "loners");
  s.upgrades.push("contact");
  assert.equal(sellPrice(s, "medusa", "loners"), Math.round(before * upgradeById("contact").fx));
});

test("the Zone guide opens a third expedition slot", () => {
  const s = app(4);
  assert.equal(maxExpeditions(s), EXPEDITIONS.maxActive);
  s.upgrades.push("thirdslot");
  assert.equal(maxExpeditions(s), EXPEDITIONS.maxActive + 1);
});

test("the bigger hideout hosts one more stalker", () => {
  const s = app(5);
  s.money = 100000;
  while (s.stalkers.length < ROSTER.maxHired) recruitStalker(s, recruitPool(s)[0].id);
  recruitStalker(s, recruitPool(s)[0].id); // full house
  assert.equal(s.stalkers.length, ROSTER.maxHired);
  s.upgrades.push("hideout");
  assert.equal(maxCrew(s), ROSTER.maxHired + 1);
  recruitStalker(s, recruitPool(s)[0].id);
  assert.equal(s.stalkers.length, ROSTER.maxHired + 1);
});

test("the watchdog scares off raid thieves and bounty ambushes", () => {
  // raid theft: roll 0.2 steals without the dog (< 0.35), not with it (>= 0.175)
  const robbed = createApp({ rng: () => 0.2 });
  robbed.factionEvents.push({ type: "raid", left: 2 });
  tickFactionEvents(robbed);
  assert.equal(robbed.inv.medusa + robbed.inv.sausage, 2); // one of the 3 starting items is gone

  const guarded = createApp({ rng: () => 0.2 });
  guarded.upgrades.push("watchdog");
  guarded.factionEvents.push({ type: "raid", left: 2 });
  tickFactionEvents(guarded);
  assert.equal(guarded.inv.medusa + guarded.inv.sausage, 3);

  // bounty ambush: roll 0.3 costs money without the dog (< 0.4), not with it (>= 0.2)
  const ambushed = createApp({ rng: () => 0.3 });
  ambushed.factionEvents.push({ type: "bounty", fac: "duty", left: 2, ransom: 1 });
  tickFactionEvents(ambushed);
  assert.ok(ambushed.money < START.money);

  const safe = createApp({ rng: () => 0.3 });
  safe.upgrades.push("watchdog");
  safe.factionEvents.push({ type: "bounty", fac: "duty", left: 2, ransom: 1 });
  tickFactionEvents(safe);
  assert.equal(safe.money, START.money);
});

test("upgrade ids are unique with positive costs", () => {
  assert.equal(new Set(UPGRADES.map(u => u.id)).size, UPGRADES.length);
  UPGRADES.forEach(u => assert.ok(u.cost > 0 && typeof u.fx === "number"));
});
