import { test } from "node:test";
import assert from "node:assert/strict";
import { createApp } from "../src/app.js";
import { mulberry32 } from "../src/rng.js";
import { genDeliveryOffer, acceptDelivery, deliverContract, tickContracts } from "../src/contracts.js";
import { DELIVERY } from "../src/config.js";

const app = seed => createApp({ rng: mulberry32(seed) });

test("an offer can be accepted and fulfilled", () => {
  const s = app(1);
  genDeliveryOffer(s);
  assert.equal(s.deliveryOffers.length, 1);
  const o = s.deliveryOffers[0];
  assert.ok(o.qty >= DELIVERY.qty[0] && o.qty <= DELIVERY.qty[1]);
  assert.ok(o.reward > 0);
  acceptDelivery(s, o.id);
  assert.equal(s.deliveryOffers.length, 0);
  assert.equal(s.activeDeliveries.length, 1);
  s.inv[o.itemId] = o.qty;
  const money0 = s.money, rep0 = s.rep[o.fac];
  deliverContract(s, o.id);
  assert.equal(s.activeDeliveries.length, 0);
  assert.equal(s.money, money0 + o.reward);
  assert.equal(s.inv[o.itemId], 0);
  assert.ok(s.rep[o.fac] > rep0);
});

test("partial deliveries keep the contract open", () => {
  const s = app(2);
  genDeliveryOffer(s);
  const o = s.deliveryOffers[0];
  acceptDelivery(s, o.id);
  s.inv[o.itemId] = o.qty - 1;
  const money0 = s.money;
  deliverContract(s, o.id);
  assert.equal(s.activeDeliveries.length, 1);
  assert.equal(o.delivered, o.qty - 1);
  assert.equal(s.money, money0);
});

test("a missed deadline costs reputation", () => {
  const s = app(3);
  genDeliveryOffer(s);
  const o = s.deliveryOffers[0];
  acceptDelivery(s, o.id);
  o.left = 1;
  const rep0 = s.rep[o.fac];
  tickContracts(s);
  assert.equal(s.activeDeliveries.length, 0);
  assert.equal(s.rep[o.fac], rep0 + DELIVERY.failRep);
});

test("offers expire after their lifetime", () => {
  const s = app(4);
  genDeliveryOffer(s);
  for (let i = 0; i < DELIVERY.offerLifetime; i++) tickContracts(s);
  assert.equal(s.deliveryOffers.length, 0);
});
