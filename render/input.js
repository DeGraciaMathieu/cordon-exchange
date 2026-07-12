// Mouse input: tab navigation and click delegation to game actions.
import { nextDay } from "../src/app.js";
import { buy, sell, selectFaction } from "../src/market.js";
import { launchExp } from "../src/expeditions.js";
import { acceptDelivery, deliverContract } from "../src/contracts.js";
import { payRansom } from "../src/factions.js";
import { chooseEncounter } from "../src/encounters.js";
import { $, renderAll, renderSell } from "./hud.js";

export function bindInput(state) {
  document.querySelectorAll(".tab").forEach(t => {
    t.onclick = () => {
      document.querySelectorAll(".tab").forEach(x => x.classList.remove("active"));
      document.querySelectorAll(".view").forEach(x => x.classList.remove("active"));
      t.classList.add("active");
      $("#v-" + t.dataset.v).classList.add("active");
    };
  });

  $("#nextDay").onclick = () => {
    nextDay(state);
    // on game end, the game:ended handler renders the top bar and the modal
    if (!state.over) renderAll(state);
  };

  $("#game").addEventListener("click", e => {
    const btn = e.target.closest("[data-act]");
    if (!btn) return;
    const { act, id, n } = btn.dataset;
    if (act === "faction") { selectFaction(state, id); renderSell(state); return; }
    if (act === "buy") buy(state, id, +n);
    else if (act === "sell") sell(state, id, +n);
    else if (act === "expedition") launchExp(state, id);
    else if (act === "accept") acceptDelivery(state, +id);
    else if (act === "deliver") deliverContract(state, +id);
    else if (act === "ransom") payRansom(state, id);
    else if (act === "encounter") chooseEncounter(state, id);
    else return;
    renderAll(state);
  });
}
