import { test } from "node:test";
import assert from "node:assert/strict";
import { createApp } from "../src/app.js";
import { mulberry32 } from "../src/rng.js";
import { launchExp, resolveExps } from "../src/expeditions.js";
import { ZONES, START } from "../src/config.js";

test("launching an expedition costs the fee", () => {
  const s = createApp({ rng: mulberry32(1) });
  launchExp(s, "cordon");
  const z = ZONES.find(z => z.id === "cordon");
  assert.equal(s.money, START.money - z.fee);
  assert.equal(s.exps.length, 1);
  assert.equal(s.exps[0].left, z.days);
});

test("a surviving stalker brings loot home", () => {
  const s = createApp({ rng: () => 0.999 }); // never dies, deterministic loot
  launchExp(s, "cordon");
  s.exps[0].left = 1;
  const inv0 = { ...s.inv };
  let ret = null;
  s.bus.on("expedition:returned", e => ret = e);
  resolveExps(s);
  assert.equal(s.exps.length, 0);
  assert.ok(ret);
  const z = ZONES.find(z => z.id === "cordon");
  const gained = Object.values(ret.loot).reduce((a, b) => a + b, 0);
  assert.ok(gained >= z.qty[0] && gained <= z.qty[1]);
  Object.entries(ret.loot).forEach(([id, n]) => assert.equal(s.inv[id], (inv0[id] || 0) + n));
});

test("a doomed expedition yields nothing", () => {
  const s = createApp({ rng: () => 0 }); // always below the death chance
  launchExp(s, "pripyat");
  s.exps[0].left = 1;
  const inv0 = JSON.stringify(s.inv);
  let lost = false;
  s.bus.on("expedition:lost", () => lost = true);
  resolveExps(s);
  assert.equal(lost, true);
  assert.equal(JSON.stringify(s.inv), inv0);
});
