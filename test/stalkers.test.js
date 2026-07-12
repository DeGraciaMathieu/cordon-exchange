import { test } from "node:test";
import assert from "node:assert/strict";
import { createApp } from "../src/app.js";
import { mulberry32 } from "../src/rng.js";
import { stalkerLevel, recruitStalker, recruitPool, selectStalker } from "../src/stalkers.js";
import { ROSTER, START } from "../src/config.js";

const app = seed => createApp({ rng: mulberry32(seed) });

test("levels grow with experience up to the cap", () => {
  assert.equal(stalkerLevel(0), 1);
  assert.equal(stalkerLevel(ROSTER.xpPerLevel), 2);
  assert.equal(stalkerLevel(ROSTER.xpPerLevel * (ROSTER.maxLevel - 1)), ROSTER.maxLevel);
  assert.equal(stalkerLevel(999), ROSTER.maxLevel);
});

test("the game starts with the configured crew", () => {
  const s = app(1);
  assert.deepEqual(s.stalkers.map(x => x.id), ROSTER.start);
  assert.equal(s.activeStalker, ROSTER.start[0]);
  assert.deepEqual(s.fallen, []);
});

test("recruiting hires from the pool for a fee", () => {
  const s = app(2);
  const def = recruitPool(s)[0];
  recruitStalker(s, def.id);
  assert.equal(s.money, START.money - ROSTER.hireCost);
  assert.ok(s.stalkers.some(x => x.id === def.id));
  assert.ok(!recruitPool(s).some(d => d.id === def.id)); // no longer hireable
});

test("recruiting respects money and the roster cap", () => {
  const s = app(3);
  s.money = ROSTER.hireCost - 1;
  recruitStalker(s, recruitPool(s)[0].id);
  assert.equal(s.stalkers.length, ROSTER.start.length); // too poor
  s.money = 100000;
  while (s.stalkers.length < ROSTER.maxHired) recruitStalker(s, recruitPool(s)[0].id);
  recruitStalker(s, recruitPool(s)[0].id); // one too many
  assert.equal(s.stalkers.length, ROSTER.maxHired);
});

test("selection only lands on hired stalkers", () => {
  const s = app(4);
  selectStalker(s, "poker");
  assert.equal(s.activeStalker, "poker");
  selectStalker(s, "vano"); // still at the camp
  assert.equal(s.activeStalker, "poker");
});
