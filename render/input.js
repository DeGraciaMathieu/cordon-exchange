// Mouse input: tab navigation and click delegation to game actions.
import { nextDay } from "../src/app.js";
import { buy, sell, haggle, selectFaction, selectMerchant } from "../src/market.js";
import { launchExp } from "../src/expeditions.js";
import { acceptDelivery, deliverContract } from "../src/contracts.js";
import { payRansom } from "../src/factions.js";
import { chooseEncounter } from "../src/encounters.js";
import { recruitStalker, selectStalker } from "../src/stalkers.js";
import { buyUpgrade } from "../src/upgrades.js";
import { $, renderAll, renderSell, renderExp, renderMarket, showNightRecap } from "./hud.js";

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
    const logBox = $("#log");
    const before = new Set(logBox.querySelectorAll(".e"));
    nextDay(state);
    // on game end, the game:ended handler renders the top bar and the modal
    if (!state.over) {
      renderAll(state);
      // chronological order: entries landed in the previous day group (the nightly debt) came first
      const added = [...logBox.querySelectorAll(".e")].filter(e => !before.has(e));
      const newGroup = logBox.querySelector(".dayg");
      showNightRecap(state.day, added.sort((a, b) =>
        (a.closest(".dayg") === newGroup) - (b.closest(".dayg") === newGroup)));
    }
  };

  $("#game").addEventListener("click", e => {
    const btn = e.target.closest("[data-act]");
    if (!btn) return;
    const { act, id, n } = btn.dataset;
    if (act === "faction") { selectFaction(state, id); renderSell(state); return; }
    if (act === "merchant") { selectMerchant(state, id); renderMarket(state); return; }
    if (act === "stalker") { selectStalker(state, id); renderExp(state); return; }
    if (act === "buy") buy(state, id, +n);
    else if (act === "sell") sell(state, id, +n);
    else if (act === "haggle") haggle(state, id);
    else if (act === "expedition") launchExp(state, id);
    else if (act === "accept") acceptDelivery(state, +id);
    else if (act === "deliver") deliverContract(state, +id);
    else if (act === "ransom") payRansom(state, id);
    else if (act === "encounter") chooseEncounter(state, id);
    else if (act === "recruit") recruitStalker(state, id);
    else if (act === "upgrade") buyUpgrade(state, id);
    else return;
    renderAll(state);
  });
}
