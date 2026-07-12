import { test } from "node:test";
import assert from "node:assert/strict";
import { createApp } from "../src/app.js";
import { mulberry32 } from "../src/rng.js";
import { shiftRep } from "../src/reputation.js";
import { REP } from "../src/config.js";

test("shiftRep spills onto allies and rivals", () => {
  const s = createApp({ rng: mulberry32(1) });
  shiftRep(s, "duty", 10);
  assert.equal(s.rep.duty, 10);
  assert.equal(s.rep.loners, 14);   // ally: +40%
  assert.equal(s.rep.freedom, -6);  // rival: -60%
  assert.equal(s.rep.bandits, -16);
});

test("shiftRep clamps at both ends", () => {
  const s = createApp({ rng: mulberry32(2) });
  s.rep.duty = 95;
  shiftRep(s, "duty", 50);
  assert.equal(s.rep.duty, REP.max);
  s.rep.freedom = -98;
  shiftRep(s, "freedom", -50);
  assert.equal(s.rep.freedom, REP.min);
});
