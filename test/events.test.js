import { test } from "node:test";
import assert from "node:assert/strict";
import { createBus } from "../src/events.js";

test("createBus delivers payloads to subscribers in order", () => {
  const bus = createBus();
  const seen = [];
  bus.on("a:b", p => seen.push(["first", p]));
  bus.on("a:b", p => seen.push(["second", p]));
  bus.emit("a:b", 42);
  assert.deepEqual(seen, [["first", 42], ["second", 42]]);
});

test("emitting without subscribers is safe", () => {
  createBus().emit("no:one", {});
});
