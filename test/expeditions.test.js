import { test } from "node:test";
import assert from "node:assert/strict";
import { createApp } from "../src/app.js";
import { mulberry32 } from "../src/rng.js";
import { launchExp, resolveExps, deathChance } from "../src/expeditions.js";
import { stalkerLevel, recruitPool } from "../src/stalkers.js";
import { ZONES, START, ROSTER } from "../src/config.js";

const zone = id => ZONES.find(z => z.id === id);

test("launching an expedition costs the fee and sends the active stalker", () => {
  const s = createApp({ rng: mulberry32(1) });
  launchExp(s, "cordon");
  assert.equal(s.money, START.money - zone("cordon").fee);
  assert.equal(s.exps.length, 1);
  assert.equal(s.exps[0].stalkerId, ROSTER.start[0]); // Loup by default
  assert.equal(s.exps[0].left, zone("cordon").days);
});

test("a busy stalker cannot be sent out twice", () => {
  const s = createApp({ rng: mulberry32(2) });
  launchExp(s, "cordon");
  const money = s.money;
  launchExp(s, "garbage"); // Loup is already in the field
  assert.equal(s.exps.length, 1);
  assert.equal(s.money, money);
});

test("a runner comes home one day early", () => {
  const s = createApp({ rng: mulberry32(3) });
  s.stalkers.push({ id: "fox", xp: 0 }); // Renard, runner
  s.activeStalker = "fox";
  launchExp(s, "garbage");
  assert.equal(s.exps[0].left, zone("garbage").days - ROSTER.runnerDaysOff);
});

test("traits and experience lower the personal death chance", () => {
  const s = createApp({ rng: mulberry32(4) });
  const z = zone("pripyat");
  assert.equal(deathChance(s, "poker", z), z.death); // no trait bonus, level 1
  assert.equal(deathChance(s, "wolf", z), z.death * ROSTER.veteranMult); // veteran
  s.stalkers.find(x => x.id === "wolf").xp = ROSTER.xpPerLevel * (ROSTER.maxLevel - 1);
  assert.equal(deathChance(s, "wolf", z), z.death * ROSTER.veteranMult - (ROSTER.maxLevel - 1) * ROSTER.deathPerLevel);
  assert.equal(deathChance(s, "wolf", zone("cordon")), ROSTER.minDeath); // never below the floor
});

test("a surviving scavenger brings extra loot home", () => {
  const s = createApp({ rng: () => 0.999 }); // survives, max loot roll
  s.activeStalker = "poker"; // scavenger
  launchExp(s, "cordon");
  s.exps[0].left = 1;
  let ret = null;
  s.bus.on("expedition:returned", e => ret = e);
  resolveExps(s);
  const gained = Object.values(ret.loot).reduce((a, b) => a + b, 0);
  assert.equal(gained, zone("cordon").qty[1] + ROSTER.scavengerBonus);
});

test("death is permanent: roster, pool and selection move on", () => {
  const s = createApp({ rng: () => 0 }); // the roll always kills
  launchExp(s, "pripyat");
  s.exps[0].left = 1;
  let lost = null;
  s.bus.on("expedition:lost", e => lost = e);
  resolveExps(s);
  assert.equal(lost.stalkerId, "wolf");
  assert.ok(!s.stalkers.some(x => x.id === "wolf"));
  assert.ok(s.fallen.includes("wolf"));
  assert.equal(s.activeStalker, "poker"); // falls back on the next hired
  assert.ok(!recruitPool(s).some(d => d.id === "wolf")); // gone for good
});

test("surviving expeditions grant xp and promotions", () => {
  const s = createApp({ rng: () => 0.999 });
  let promoted = null;
  s.bus.on("stalker:promoted", e => promoted = e);
  for (let i = 0; i < ROSTER.xpPerLevel; i++) {
    launchExp(s, "cordon");
    s.exps[0].left = 1;
    resolveExps(s);
  }
  const wolf = s.stalkers.find(x => x.id === "wolf");
  assert.equal(wolf.xp, ROSTER.xpPerLevel);
  assert.equal(stalkerLevel(wolf.xp), 2);
  assert.deepEqual(promoted, { stalkerId: "wolf", level: 2 });
});
