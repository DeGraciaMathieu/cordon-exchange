import { test } from "node:test";
import assert from "node:assert/strict";
import { createApp, nextDay } from "../src/app.js";
import { mulberry32 } from "../src/rng.js";
import { radsDose } from "../src/radiation.js";
import { ITEMS, RADIATION, itemById } from "../src/config.js";

const app = seed => {
  const s = createApp({ rng: mulberry32(seed) });
  ITEMS.forEach(i => s.inv[i.id] = 0); // start clean: no baseline dose
  return s;
};

test("held artefacts irradiate the player every night", () => {
  const s = app(1);
  s.inv.crystal = 2; // rad 5 each -> dose 10
  assert.equal(radsDose(s), 2 * itemById("crystal").rad * RADIATION.perRad);
  nextDay(s);
  assert.equal(s.rads, 10);
  nextDay(s);
  assert.equal(s.rads, 20);
});

test("a clean inventory lets the body recover, down to zero", () => {
  const s = app(2);
  s.rads = 20;
  nextDay(s);
  assert.equal(s.rads, 20 - RADIATION.decay);
  s.rads = 3; // less than one night of decay
  nextDay(s);
  assert.equal(s.rads, 0);
});

test("radiation sickness bleeds money every night above the threshold", () => {
  const s = app(3);
  s.rads = RADIATION.sickAt + 10;
  let sick = null;
  s.bus.on("rads:sickened", e => sick = e);
  nextDay(s);
  // garnish halves the cash first, then the med bill lands on the decayed gauge
  const gauge = RADIATION.sickAt + 10 - RADIATION.decay;
  const bill = Math.round(gauge * RADIATION.sickCostPerRad);
  assert.equal(s.rads, gauge);
  assert.equal(sick.cost, bill);
  assert.equal(s.money, 1000 - bill);
});

test("reaching the radiation cap kills the trader", () => {
  const s = app(4);
  s.rads = RADIATION.deathAt - 4;
  s.inv.crystal = 1; // dose 5 pushes past the cap
  let ended = null;
  s.bus.on("game:ended", e => ended = e);
  nextDay(s);
  assert.equal(s.over, true);
  assert.equal(ended.win, false);
  assert.equal(ended.reason, "rads");
  assert.equal(s.rads, RADIATION.deathAt); // gauge is capped
});

test("selling the hot potato stops the bleeding", () => {
  const s = app(5);
  s.inv.soul = 1; // rad 6
  nextDay(s);
  assert.equal(s.rads, 6);
  s.inv.soul = 0; // sold during the day
  nextDay(s);
  assert.equal(s.rads, 0); // recovery beats the empty dose
});
