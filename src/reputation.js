import { FACTIONS, REP } from "./config.js";
import { clamp } from "./util.js";

// Shift a faction's reputation; part of it spills onto allies and rivals.
export function shiftRep(state, fac, delta) {
  state.rep[fac] = clamp(state.rep[fac] + delta, REP.min, REP.max);
  const f = FACTIONS[fac];
  f.allies.forEach(a => state.rep[a] = clamp(state.rep[a] + delta * REP.allySpill, REP.min, REP.max));
  f.rivals.forEach(r => state.rep[r] = clamp(state.rep[r] - delta * REP.rivalSpill, REP.min, REP.max));
}
