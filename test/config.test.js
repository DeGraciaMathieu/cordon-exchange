import { test } from "node:test";
import assert from "node:assert/strict";
import { ITEMS, ZONES, FACTIONS, FACTION_IDS, CATEGORIES, PREF, MERCHANTS, START, ENCOUNTERS, STALKERS, TRAITS, ROSTER, itemById, stalkerById } from "../src/config.js";

test("item ids are unique", () => {
  assert.equal(new Set(ITEMS.map(i => i.id)).size, ITEMS.length);
});

test("zone loot references existing items", () => {
  ZONES.forEach(z => z.loot.forEach(id => assert.ok(itemById(id), `${z.id} loot ${id}`)));
});

test("faction allies and rivals reference existing factions", () => {
  FACTION_IDS.forEach(f => {
    [...FACTIONS[f].allies, ...FACTIONS[f].rivals].forEach(o => assert.ok(FACTIONS[o]));
  });
});

test("every faction prices every category", () => {
  FACTION_IDS.forEach(f => CATEGORIES.forEach(c => assert.equal(typeof PREF[f][c], "number")));
});

test("every category is stocked by a merchant and the starting merchant exists", () => {
  const stocked = Object.values(MERCHANTS).map(m => m.cat);
  CATEGORIES.forEach(c => assert.ok(stocked.includes(c), `category ${c} has no merchant`));
  stocked.forEach(c => assert.ok(CATEGORIES.includes(c), `merchant cat ${c} unknown`));
  assert.ok(MERCHANTS[START.buyMerchant]);
});

test("stalkers have unique ids, valid traits, and a valid starting crew", () => {
  assert.equal(new Set(STALKERS.map(s => s.id)).size, STALKERS.length);
  STALKERS.forEach(s => assert.ok(TRAITS[s.trait], `${s.id} trait ${s.trait}`));
  ROSTER.start.forEach(id => assert.ok(stalkerById(id), `start ${id}`));
  assert.ok(ROSTER.start.length <= ROSTER.maxHired);
});

test("encounters have 2-3 options referencing existing items and factions", () => {
  assert.equal(new Set(ENCOUNTERS.map(e => e.id)).size, ENCOUNTERS.length);
  ENCOUNTERS.forEach(e => {
    assert.ok(e.options.length >= 2 && e.options.length <= 3, `${e.id} options count`);
    e.options.forEach(o => {
      assert.ok(o.effects || o.risk, `${e.id}/${o.id} has consequences`);
      if (o.effects) assert.ok(o.effects.t || o.risk, `${e.id}/${o.id} has journal text`);
      if (o.risk) [o.risk.success, o.risk.failure].forEach(fx => assert.ok(fx && fx.t, `${e.id}/${o.id} risk texts`));
      [o.needs, o.effects, o.risk && o.risk.success, o.risk && o.risk.failure].filter(Boolean).forEach(fx => {
        Object.keys(fx.items || {}).forEach(id => assert.ok(itemById(id), `${e.id}/${o.id} item ${id}`));
        Object.keys(fx.rep || {}).forEach(f => assert.ok(FACTIONS[f], `${e.id}/${o.id} faction ${f}`));
      });
    });
  });
});
