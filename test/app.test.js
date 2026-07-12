import { test } from "node:test";
import assert from "node:assert/strict";
import { createApp, nextDay } from "../src/app.js";
import { mulberry32 } from "../src/rng.js";
import { ITEMS, START, DEBT, MAX_DAY } from "../src/config.js";

const app = seed => createApp({ rng: mulberry32(seed) });

test("createApp seeds the initial state", () => {
  const s = app(1);
  assert.equal(s.day, 1);
  assert.equal(s.money, START.money);
  assert.equal(s.debt, DEBT.start);
  assert.equal(s.inv.medusa, 1);
  assert.equal(s.inv.sausage, 2);
  assert.equal(s.over, false);
  ITEMS.forEach(i => assert.equal(s.price[i.id], i.base));
});

test("each night garnishes half the cash toward the debt", () => {
  const s = app(2);
  nextDay(s);
  assert.equal(s.day, 2);
  assert.equal(s.money, START.money - Math.floor(START.money * DEBT.garnish));
  assert.equal(s.debt, DEBT.start - Math.floor(START.money * DEBT.garnish));
});

test("clearing the debt wins the game the same night", () => {
  const s = app(3);
  s.money = DEBT.start * 2 + 500;
  let ended = null;
  s.bus.on("game:ended", e => ended = e);
  nextDay(s);
  assert.equal(s.debt, 0);
  assert.equal(s.over, true);
  assert.equal(ended.win, true);
  assert.equal(s.day, 1); // the game ends before the day advances
  nextDay(s);
  assert.equal(s.day, 1); // and the simulation is frozen afterwards
});

test("running out of days loses the game", () => {
  const s = app(4);
  s.money = 0; // nothing to garnish, the debt never shrinks
  let ended = null;
  s.bus.on("game:ended", e => ended = e);
  for (let i = 0; i < MAX_DAY + 5 && !s.over; i++) nextDay(s);
  assert.equal(s.over, true);
  assert.equal(ended.win, false);
  assert.equal(s.day, MAX_DAY + 1);
});

test("story milestones fire once", () => {
  const s = app(5);
  s.money = 20000; // pays 10 000 the first night, crossing the 8 000 beat
  const seen = [];
  s.bus.on("story:reached", e => seen.push(e.threshold));
  nextDay(s);
  assert.deepEqual(seen, [8000]);
});
