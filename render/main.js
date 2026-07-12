// Entry point: seed the rng, create the app state, wire bus events to the DOM.
import { mulberry32 } from "../src/rng.js";
import { createApp } from "../src/app.js";
import {
  FACTIONS, ZONES, MAX_DAY, DEBT, BOUNTY, DELIVERY, FACTION_EVENTS, RADIATION, itemById,
} from "../src/config.js";
import { $, fmt, log, dayLog, toast, showModal, renderAll, renderTop } from "./hud.js";
import { bindInput } from "./input.js";

const state = createApp({ rng: mulberry32(Date.now()) });
const bus = state.bus;

const facName = f => `<b style="color:${FACTIONS[f].color}">${FACTIONS[f].name}</b>`;
const zoneName = id => { const z = ZONES.find(z => z.id === id); return z ? z.nm : ""; };

/* day cycle */
bus.on("day:started", ({ day }) => dayLog(day));
bus.on("debt:paid", ({ amount, debt }) =>
  log(`🌙 Versement nocturne au Fixeur : <b class="bad">-${fmt(amount)}</b>. Dette restante : <b>${fmt(debt)}</b>.`));
bus.on("story:reached", ({ text }) => log(text, "story"));
bus.on("rads:changed", ({ delta, rads }) => {
  if (delta > 0) log(`☢ Tes artefacts t'irradient pendant la nuit : <b class="bad">+${delta} rads</b> (${rads}/${RADIATION.deathAt}).`, "bad");
  else log(`☢ Ton corps élimine les radiations : ${delta} rads (${rads}/${RADIATION.deathAt}).`);
});
bus.on("rads:sickened", ({ cost, rads }) => log(`🤢 Le mal des rads te ronge (${rads} ☢) : <b class="bad">-${fmt(cost)}</b> en anti-rad et vodka.`, "bad"));
bus.on("market:shifted", ({ ev }) => {
  if (ev.cat !== "none") log(ev.t, ev.cls);
  $("#mkt-note").innerHTML = ev.cat !== "none" ? `<span style="color:var(--blue)">Événement : ${ev.t}</span>` : "";
});

/* trade */
bus.on("item:bought", ({ id }) => toast(`Acheté ${itemById(id).nm}`));
bus.on("item:sold", ({ id, fac, count, total, gain }) => {
  log(`Vendu ${count}× ${itemById(id).nm} aux ${facName(fac)} pour <b class="good">${fmt(total)}</b>. Réput ${FACTIONS[fac].name} +${gain}.`);
  toast(`+${fmt(total)}`);
});
bus.on("trade:blocked", ({ fac }) => toast(`Comptoir ${FACTIONS[fac].name} fermé (guerre)`));
bus.on("trade:haggled", ({ id, fac, success, price, gain, penalty }) => {
  if (success) {
    log(`🎲 Tu pousses le prix et les ${facName(fac)} cèdent : ${itemById(id).nm} vendu <b class="good">${fmt(price)}</b>. Réput ${FACTIONS[fac].name} +${gain}.`, "good");
    toast(`+${fmt(price)}`);
  } else {
    log(`🎲 Les ${facName(fac)} se vexent de ton marchandage et tournent les talons. Réput ${FACTIONS[fac].name} -${penalty}.`, "bad");
    toast("Marchandage refusé");
  }
});

/* faction events */
bus.on("faction:war-started", ({ a, b }) =>
  log(`⚔️ ${facName(a)} déclarent la guerre à ${facName(b)} ! Le comptoir des ${FACTIONS[b].name} est <b class="bad">fermé</b>. Les ${FACTIONS[a].name} paient cher armes et vivres — vends-leur pour faire pencher la guerre.`, "ev"));
bus.on("faction:war-won", ({ a, b }) =>
  log(`⚔️ Grâce à ton ravitaillement, les ${facName(a)} écrasent les ${FACTIONS[b].name}. Ils te récompensent (réput +${FACTION_EVENTS.warWinRep}).`, "good"));
bus.on("faction:war-stalled", ({ a, b }) =>
  log(`⚔️ La guerre ${FACTIONS[a].name}/${FACTIONS[b].name} s'enlise. Le comptoir des ${FACTIONS[b].name} rouvre, reconnaissants (réput +${FACTION_EVENTS.warStallRep}).`, "ev"));
bus.on("faction:contract-started", ({ fac, cat }) =>
  log(`📜 Contrat : les ${facName(fac)} paient <b>+${Math.round((FACTION_EVENTS.contractMult - 1) * 100)}%</b> et double réputation pour tout <b>${cat}</b> qu'on leur vend. Durée limitée.`, "ev"));
bus.on("faction:contract-ended", ({ fac }) => log(`📜 Le contrat des ${FACTIONS[fac].name} a expiré.`));
bus.on("faction:blockade-started", ({ zoneId, fac }) =>
  log(`🚧 Les ${facName(fac)} bloquent l'accès à <b>${zoneName(zoneId)}</b>. Aucune expédition possible là-bas.`, "ev"));
bus.on("faction:blockade-ended", ({ zoneId }) => log(`🚧 Le blocus de ${zoneName(zoneId)} est levé.`));
bus.on("faction:raid-started", () =>
  log(`🔪 Raid de <b style="color:${FACTIONS.bandits.color}">Bandits</b> dans le secteur : risque de vol la nuit, mais ils rachètent le butin plus cher.`, "ev"));
bus.on("faction:raid-ended", () => log(`🔪 Les bandits ont quitté le secteur.`));
bus.on("player:robbed", ({ itemId }) => log(`🔪 Détroussé pendant la nuit : <b class="bad">-1 ${itemById(itemId).nm}</b>.`, "bad"));

/* bounties */
bus.on("bounty:placed", ({ fac, ransom }) =>
  log(`☠️ Les ${facName(fac)} mettent ta tête à prix ! Comptoir fermé, tueurs à tes trousses, expéditions plus mortelles. Paie la rançon (${fmt(ransom)}) ou tiens ${BOUNTY.days} jours. → onglet Contrats`, "bad"));
bus.on("bounty:expired", ({ fac }) =>
  log(`☠️ Les ${facName(fac)} lèvent le contrat sur ta tête… pour l'instant. Leur comptoir rouvre.`, "ev"));
bus.on("bounty:ambushed", ({ fac, loss }) =>
  log(`🗡️ Embuscade des ${FACTIONS[fac].name} dans la nuit : <b class="bad">-${fmt(loss)}</b>.`, "bad"));
bus.on("bounty:paid", ({ fac, ransom }) => {
  log(`💰 Rançon versée aux ${facName(fac)} (${fmt(ransom)}). Contrat sur ta tête levé.`);
  toast("Rançon payée");
});
bus.on("bounty:unaffordable", () => toast("Pas assez de roubles pour la rançon"));

/* delivery contracts */
bus.on("contract:offered", ({ offer }) =>
  log(`📥 Commande : les ${facName(offer.fac)} veulent <b>${offer.qty}× ${itemById(offer.itemId).nm}</b> sous ${offer.days} j contre <b>${fmt(offer.reward)}</b> + réputation. → onglet Contrats`, "ev"));
bus.on("contract:accepted", ({ contract }) => {
  log(`✍️ Contrat accepté : livrer ${contract.qty}× ${itemById(contract.itemId).nm} aux ${FACTIONS[contract.fac].name} en ${contract.left} jours.`);
  toast("Contrat accepté");
});
bus.on("contract:completed", ({ contract }) => {
  log(`✅ Contrat honoré pour les ${facName(contract.fac)} : <b class="good">+${fmt(contract.reward)}</b>, réput +${DELIVERY.completeRep}.`, "good");
  toast("Contrat honoré !");
});
bus.on("contract:progressed", ({ contract }) => toast(`${contract.delivered}/${contract.qty} livrés`));
bus.on("contract:blocked", ({ contract }) => toast(`Aucun ${itemById(contract.itemId).nm} en stock`));
bus.on("contract:failed", ({ contract }) =>
  log(`❌ Contrat échoué : les ${facName(contract.fac)} n'ont pas eu leurs ${contract.qty}× ${itemById(contract.itemId).nm} (${contract.delivered} livré(s), perdus). Réputation ${DELIVERY.failRep}.`, "bad"));

/* expeditions */
bus.on("expedition:launched", ({ zoneId, name, fee }) => {
  log(`Tu paies <b>${fmt(fee)}</b> à <b>${name}</b> pour fouiller <b>${zoneName(zoneId)}</b>.`);
  toast(`${name} part pour ${zoneName(zoneId)}`);
});
bus.on("expedition:lost", ({ zoneId, name }) =>
  log(`💀 <b>${name}</b> n'est jamais revenu de <b>${zoneName(zoneId)}</b>. Fouille perdue.`, "bad"));
bus.on("expedition:returned", ({ zoneId, name, loot }) => {
  const txt = Object.entries(loot).map(([id, c]) => `${c}× ${itemById(id).nm}`).join(", ");
  log(`🎒 <b>${name}</b> revient de <b>${zoneName(zoneId)}</b> avec : <b class="good">${txt}</b>.`, "good");
});

/* encounters */
bus.on("encounter:resolved", ({ outcome, text, applied }) => {
  const parts = [];
  if (applied.money) parts.push(`${applied.money > 0 ? "+" : "-"}${fmt(Math.abs(applied.money))}`);
  for (const id in applied.items || {}) parts.push(`${applied.items[id] > 0 ? "+" : ""}${applied.items[id]} ${itemById(id).nm}`);
  for (const fac in applied.rep || {}) parts.push(`réput ${FACTIONS[fac].name} ${applied.rep[fac] > 0 ? "+" : ""}${applied.rep[fac]}`);
  if (applied.tip) parts.push(applied.tip === "all" ? "tuyau : tout va monter demain" : `tuyau : les prix « ${applied.tip} » montent demain`);
  const cls = outcome === "failure" ? "bad" : outcome === "success" ? "good" : "";
  log(`🤝 ${text}${parts.length ? ` <b>(${parts.join(" · ")})</b>` : ""}`, cls);
  if (parts.length) toast(parts[0]);
});

/* game end */
bus.on("game:ended", ({ win, reason }) => {
  renderTop(state);
  if (win) {
    showModal("LIBRE", `Tu as soldé ta dette au Fixeur en ${state.day} jours.<br><br>Il te reste <b>${fmt(state.money)}</b> et ta peau. Peu de marchands du Cordon peuvent en dire autant.<br><br>« Marché conclu », lâche le Fixeur en raccrochant.`);
  } else if (reason === "rads") {
    showModal("FIN DE PARTIE", `Rongé par tes propres trésors, tu t'éteins au fond de ta planque, ta jauge à <b>${state.rads} ☢</b>.<br><br>Le Fixeur enverra quelqu'un ramasser les artefacts. La Zone reprend toujours son dû.`);
  } else {
    showModal("FIN DE PARTIE", `Le délai est écoulé. Il te manquait <b>${fmt(state.debt)}</b>.<br><br>Les hommes du Fixeur te retrouvent au petit matin près de l'usine. La Zone garde ses comptes.`);
  }
  const btn = $("#mBtn");
  btn.textContent = "Rejouer";
  btn.onclick = () => location.reload();
});

/* init */
bindInput(state);
log(`<span class="story">Sidorovitch te coince près de sa planque. « Tu me dois <b>${fmt(DEBT.start)}</b>, marchand. Tu as <b>${MAX_DAY} jours</b> pour rembourser le Fixeur — sinon la Zone récupère un cadavre de plus. »</span>`);
log(`Chaque nuit, une part de ton argent part rembourser la dette. Achète malin, joue les factions, envoie des stalkers au charbon.`);
dayLog(state.day);
renderAll(state);
