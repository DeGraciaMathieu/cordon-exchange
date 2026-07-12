import { test } from "node:test";
import assert from "node:assert/strict";
import { createApp, nextDay } from "../src/app.js";
import { mulberry32 } from "../src/rng.js";
import { chooseEncounter } from "../src/encounters.js";
import { MARKET_EVENTS, START, encounterById } from "../src/config.js";

const app = seed => createApp({ rng: mulberry32(seed) });

test("every day offers an encounter card", () => {
  const s = app(1);
  assert.ok(encounterById(s.encounter.id)); // day 1 has its card
  const first = s.encounter.id;
  nextDay(s);
  assert.ok(encounterById(s.encounter.id));
  assert.notEqual(s.encounter.id, first); // an unanswered card is replaced by a different one
});

test("a plain option applies its trade and reputation", () => {
  const s = app(2);
  s.encounter = { id: "wounded-stalker" };
  s.inv.medkit = 1;
  const rep0 = s.rep.loners;
  let seen = null;
  s.bus.on("encounter:resolved", e => seen = e);
  chooseEncounter(s, "heal");
  assert.equal(s.inv.medkit, 0);
  assert.equal(s.inv.crystal, 1);
  assert.ok(s.rep.loners > rep0);
  assert.equal(s.encounter, null); // the card is consumed
  assert.equal(seen.outcome, null);
  assert.equal(seen.applied.items.crystal, 1);
});

test("an option whose needs are not met does nothing", () => {
  const s = app(3);
  s.encounter = { id: "wounded-stalker" };
  s.inv.medkit = 0;
  const before = JSON.stringify([s.money, s.inv, s.rep]);
  chooseEncounter(s, "heal");
  assert.ok(s.encounter); // card still on the table
  assert.equal(JSON.stringify([s.money, s.inv, s.rep]), before);
});

test("a risky option succeeds or fails depending on the roll", () => {
  const win = createApp({ rng: () => 0 }); // roll 0 < p -> success
  win.encounter = { id: "wounded-stalker" };
  chooseEncounter(win, "rob");
  assert.equal(win.inv.crystal, 1);

  const lose = createApp({ rng: () => 0.999 }); // roll above p -> failure
  lose.encounter = { id: "wounded-stalker" };
  lose.money = 300; // the fine is clamped to available cash
  chooseEncounter(lose, "rob");
  assert.equal(lose.inv.crystal, 0);
  assert.equal(lose.money, 0);
});

test("the bribed tip forces tomorrow's market event", () => {
  const s = createApp({ rng: () => 0 }); // bribe succeeds, tip picks the first rising event
  s.encounter = { id: "army-tip" };
  chooseEncounter(s, "pay");
  assert.equal(s.money, START.money - 400);
  assert.notEqual(s.marketTip, null);
  const tipped = MARKET_EVENTS[s.marketTip];
  assert.ok(tipped.mult > 1); // a tip always leaks a rising market
  let ev = null;
  s.bus.on("market:shifted", e => ev = e.ev);
  nextDay(s);
  assert.equal(ev, tipped);
  assert.equal(s.marketTip, null); // consumed
});
