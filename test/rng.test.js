import { test } from "node:test";
import assert from "node:assert/strict";
import { mulberry32, pick, randInt } from "../src/rng.js";

test("mulberry32 is deterministic for a given seed", () => {
  const a = mulberry32(42), b = mulberry32(42);
  for (let i = 0; i < 100; i++) assert.equal(a(), b());
});

test("mulberry32 stays in [0, 1)", () => {
  const rng = mulberry32(7);
  for (let i = 0; i < 1000; i++) {
    const v = rng();
    assert.ok(v >= 0 && v < 1);
  }
});

test("randInt covers exactly its bounds", () => {
  const rng = mulberry32(1);
  const seen = new Set();
  for (let i = 0; i < 500; i++) seen.add(randInt(rng, 2, 4));
  assert.deepEqual([...seen].sort(), [2, 3, 4]);
});

test("pick returns an element of the array", () => {
  const rng = mulberry32(3);
  for (let i = 0; i < 50; i++) assert.ok(["a", "b", "c"].includes(pick(rng, ["a", "b", "c"])));
});
