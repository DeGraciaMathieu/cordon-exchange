import { test } from "node:test";
import assert from "node:assert/strict";
import { ITEMS, ZONES, FACTIONS, FACTION_IDS, CATEGORIES, PREF, itemById } from "../src/config.js";

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
