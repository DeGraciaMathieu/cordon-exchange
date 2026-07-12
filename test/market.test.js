import { test } from "node:test";
import assert from "node:assert/strict";
import { createApp } from "../src/app.js";
import { mulberry32, pick } from "../src/rng.js";
import { buyPrice, sellPrice, buy, sell, fluctuate } from "../src/market.js";
import { ITEMS, START, MARKET, MARKET_EVENTS } from "../src/config.js";

const app = seed => createApp({ rng: mulberry32(seed) });

test("buy moves money into inventory at the displayed price", () => {
  const s = app(1);
  const bp = buyPrice(s, "vodka");
  buy(s, "vodka", 1);
  assert.equal(s.money, START.money - bp);
  assert.equal(s.inv.vodka, 1);
});

test("buy stops when the money runs out", () => {
  const s = app(2);
  s.money = buyPrice(s, "rifle") + 10; // can afford exactly one
  buy(s, "rifle", 5);
  assert.equal(s.inv.rifle, 1);
  assert.ok(s.money < buyPrice(s, "rifle"));
});

test("sell pays the faction price and shifts reputations", () => {
  const s = app(3);
  s.inv.medusa = 3;
  const sp = sellPrice(s, "medusa", "loners");
  const rep0 = s.rep.loners, band0 = s.rep.bandits;
  sell(s, "medusa", 1);
  assert.equal(s.inv.medusa, 2);
  assert.equal(s.money, START.money + sp);
  assert.ok(s.rep.loners > rep0);
  assert.ok(s.rep.bandits < band0); // bandits rival the loners
});

test("selling to a faction whose counter is closed is blocked", () => {
  const s = app(4);
  s.factionEvents.push({ type: "war", a: "duty", b: "loners", left: 2, support: 0 });
  s.inv.medusa = 1;
  let blocked = false;
  s.bus.on("trade:blocked", () => blocked = true);
  sell(s, "medusa", 1);
  assert.equal(blocked, true);
  assert.equal(s.inv.medusa, 1);
  assert.equal(s.money, START.money);
});

test("supplying the aggressor with weapons raises war support", () => {
  const s = app(5);
  const war = { type: "war", a: "duty", b: "freedom", left: 3, support: 0 };
  s.factionEvents.push(war);
  s.sellFaction = "duty";
  s.inv.ammo = 3;
  sell(s, "ammo", 3);
  assert.equal(war.support, 3);
});

test("prices stay within their clamps over many days", () => {
  const s = app(6);
  for (let i = 0; i < 300; i++) fluctuate(s, pick(s.rng, MARKET_EVENTS));
  ITEMS.forEach(it => {
    assert.ok(s.price[it.id] >= Math.round(it.base * MARKET.minMult));
    assert.ok(s.price[it.id] <= Math.round(it.base * MARKET.maxMult));
  });
});
