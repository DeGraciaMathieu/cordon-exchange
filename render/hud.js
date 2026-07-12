// All DOM rendering: top bar, grids, contracts, expeditions, journal, toast, modal.
import { FACTIONS, PREF, ITEMS, ZONES, MAX_DAY, EXPEDITIONS, FACTION_EVENTS, HAGGLE, RADIATION, TRAITS, ROSTER, itemById, encounterById, stalkerById } from "../src/config.js";
import { buyPrice, sellPrice, isUndervalued } from "../src/market.js";
import { marketClosed, zoneBlocked, bountyExtraDeath } from "../src/factions.js";
import { canPick } from "../src/encounters.js";
import { radsDose } from "../src/radiation.js";
import { deathChance } from "../src/expeditions.js";
import { stalkerLevel, isBusy, recruitPool } from "../src/stalkers.js";

export const $ = s => document.querySelector(s);
export const fmt = n => Math.round(n).toLocaleString("fr-FR") + " ₽";

export function log(html, cls = "") {
  const d = document.createElement("div");
  d.className = "e" + (cls ? " " : "") + cls;
  d.innerHTML = html;
  $("#log").prepend(d);
}
export function dayLog(day) { log(`<span class="day">▶ Jour ${day}</span>`); }

export function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(t._t);
  t._t = setTimeout(() => t.classList.remove("show"), 1600);
}

export function showModal(title, html) {
  $("#mTitle").textContent = title;
  $("#mText").innerHTML = html;
  $("#modal").classList.add("show");
}

export function renderTop(state) {
  $("#money").textContent = fmt(state.money);
  $("#debt").textContent = fmt(state.debt);
  $("#day").textContent = `${state.day} / ${MAX_DAY}`;
  const dose = radsDose(state);
  const rd = $("#rads");
  rd.textContent = `${state.rads} ☢${dose > 0 ? ` +${dose}/nuit` : ""}`;
  rd.style.color = state.rads >= RADIATION.sickAt ? "var(--danger)" : state.rads >= RADIATION.sickAt / 2 ? "var(--gold)" : "var(--rad)";
  const r = $("#reps");
  r.innerHTML = "";
  for (const k in FACTIONS) {
    const f = FACTIONS[k], v = state.rep[k];
    const pct = (v + 100) / 2;
    const col = v >= 0 ? f.color : "#d6503c";
    r.innerHTML += `<div class="rep"><div class="name"><span>${f.name}</span><span>${v > 0 ? "+" : ""}${Math.round(v)}</span></div>
      <div class="bar"><i></i><div class="fill" style="width:${pct}%;background:${col}"></div></div></div>`;
  }
}

// tiny price-history chart; the dashed line marks the base (reference) price
function sparkline(history, base) {
  const w = 60, h = 18;
  const values = history.length > 1 ? history : [history[0], history[0]];
  const min = Math.min(...values, base), max = Math.max(...values, base);
  const span = max - min || 1;
  const x = i => (1 + (i / (values.length - 1)) * (w - 2)).toFixed(1);
  const y = v => (h - 2 - ((v - min) / span) * (h - 4)).toFixed(1);
  const pts = values.map((v, i) => `${x(i)},${y(v)}`).join(" ");
  const last = values[values.length - 1];
  const col = last > base ? "var(--danger)" : last < base ? "var(--rad)" : "var(--dim)";
  return `<svg class="spark" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">
    <line x1="0" y1="${y(base)}" x2="${w}" y2="${y(base)}" stroke="#3a4433" stroke-dasharray="2 2"/>
    <polyline points="${pts}" fill="none" stroke="${col}" stroke-width="1.5"/>
  </svg>`;
}

function trendMark(state, id) {
  const it = itemById(id);
  const p = Math.round((state.price[id] - it.base) / it.base * 100);
  if (p > 4) return `<span class="trend up">▲ ${p}%</span>`;
  if (p < -4) return `<span class="trend down">▼ ${p}%</span>`;
  return `<span class="trend" style="color:var(--dim)">— stable</span>`;
}

export function renderMarket(state) {
  const g = $("#marketGrid");
  g.innerHTML = "";
  ITEMS.forEach(it => {
    const bp = buyPrice(state, it.id);
    const canBuy = state.money >= bp && !state.over;
    const q = state.inv[it.id];
    const deal = isUndervalued(state, it.id);
    g.innerHTML += `<div class="card ${it.cat === "artefact" ? "" : "gear"}${deal ? " deal" : ""}">
      ${q ? `<span class="qty">×${q}</span>` : ""}
      <div class="ico">${it.ico}</div>
      <div class="nm">${it.nm}</div>
      ${it.rad ? `<div class="rad">☢ rad ${it.rad}</div>` : `<div class="rad" style="color:var(--dim)">${it.cat}</div>`}
      <div class="price">${fmt(bp)}</div>
      ${trendMark(state, it.id)}
      ${sparkline(state.history[it.id], it.base)}
      ${deal ? `<div class="deal-tag">💰 sous-évalué</div>` : ""}
      <div class="row">
        <button class="btn sm" ${canBuy ? "" : "disabled"} data-act="buy" data-id="${it.id}" data-n="1">Acheter</button>
        <button class="btn sm" ${state.money >= bp * 5 && !state.over ? "" : "disabled"} data-act="buy" data-id="${it.id}" data-n="5">×5</button>
      </div>
    </div>`;
  });
}

function renderFactionBar(state) {
  const b = $("#factionbar");
  b.innerHTML = "";
  for (const k in FACTIONS) {
    const f = FACTIONS[k], closed = marketClosed(state, k);
    const contract = state.factionEvents.find(e => e.type === "contract" && e.fac === k);
    b.innerHTML += `<button class="fbtn ${state.sellFaction === k ? "active" : ""} ${closed ? "closed" : ""}" ${closed ? "disabled" : ""} data-act="faction" data-id="${k}">
      <b style="color:${f.color}">${f.name}</b>
      <small>${closed ? "⚔ comptoir fermé" : contract ? "📜 contrat " + contract.cat : "rép " + (state.rep[k] > 0 ? "+" : "") + Math.round(state.rep[k])}</small></button>`;
  }
  const fac = state.sellFaction;
  const best = Object.entries(PREF[fac]).sort((a, b) => b[1] - a[1])[0][0];
  $("#sellNote").innerHTML = `<b style="color:${FACTIONS[fac].color}">${FACTIONS[fac].name}</b> paie le mieux la catégorie « <b>${best}</b> ». Vendre ici modifie ta réputation avec les autres. 🎲 Marchander : +${Math.round(HAGGLE.bonus * 100)}% si ça passe, réput −${HAGGLE.repPenalty} si ça vexe.`;
}

export function renderSell(state) {
  renderFactionBar(state);
  const g = $("#sellGrid");
  g.innerHTML = "";
  const fac = state.sellFaction;
  const owned = ITEMS.filter(it => state.inv[it.id] > 0);
  if (!owned.length) { g.innerHTML = `<div class="hint">Ton sac est vide. Achète au marché ou pars en expédition.</div>`; return; }
  owned.forEach(it => {
    const sp = sellPrice(state, it.id, fac);
    const profit = sp - it.base;
    g.innerHTML += `<div class="card ${it.cat === "artefact" ? "" : "gear"}">
      <span class="qty">×${state.inv[it.id]}</span>
      <div class="ico">${it.ico}</div>
      <div class="nm">${it.nm}</div>
      <div class="rad" style="color:var(--dim)">${it.cat}</div>
      <div class="price">${fmt(sp)}</div>
      <div class="trend ${profit >= 0 ? "down" : "up"}">${profit >= 0 ? "gain" : "perte"} ${fmt(Math.abs(profit))}</div>
      ${sparkline(state.history[it.id], it.base)}
      <div class="row">
        <button class="btn sm" ${state.over ? "disabled" : ""} data-act="sell" data-id="${it.id}" data-n="1">Vendre</button>
        <button class="btn sm" ${state.inv[it.id] >= 5 && !state.over ? "" : "disabled"} data-act="sell" data-id="${it.id}" data-n="999">Tout</button>
      </div>
      <button class="btn sm" ${state.over ? "disabled" : ""} data-act="haggle" data-id="${it.id}">🎲 Marchander (+${Math.round(HAGGLE.bonus * 100)}%)</button>
    </div>`;
  });
}

export function renderExp(state) {
  const a = $("#activeExps");
  a.innerHTML = "";
  const extra = bountyExtraDeath(state);
  if (extra > 0) {
    a.innerHTML += `<div class="active-exp" style="border-color:var(--danger);color:var(--danger)">☠️ Une prime pèse sur ta tête : +${Math.round(extra * 100)}% de risque de perte sur toute expédition.</div>`;
  }
  state.exps.forEach(e => {
    const z = ZONES.find(z => z.id === e.zone);
    a.innerHTML += `<div class="active-exp">🥾 <b>${stalkerById(e.stalkerId).name}</b> en mission à <b>${z.nm}</b> — retour dans ${e.left} jour(s)</div>`;
  });

  // roster: pick who goes out next
  $("#roster").innerHTML = state.stalkers.length ? state.stalkers.map(s => {
    const def = stalkerById(s.id), t = TRAITS[def.trait];
    const busy = isBusy(state, s.id);
    return `<button class="fbtn ${state.activeStalker === s.id ? "active" : ""}" ${busy || state.over ? "disabled" : ""} data-act="stalker" data-id="${s.id}">
      <b>${t.ico} ${def.name}</b>
      <small>${t.nm} · niv. ${stalkerLevel(s.xp)}${busy ? " · en mission" : ""}</small></button>`;
  }).join("") : `<div class="empty">Plus un seul stalker sous ta bannière. Recrute, ou la Zone restera muette.</div>`;

  const rec = state.stalkers.find(s => s.id === state.activeStalker);
  const idle = rec && !isBusy(state, rec.id);
  const zc = $("#zones");
  zc.innerHTML = "";
  ZONES.forEach(z => {
    const busyAll = state.exps.length >= EXPEDITIONS.maxActive;
    const blocked = zoneBlocked(state, z.id);
    const canGo = state.money >= z.fee && !busyAll && !blocked && !state.over && idle;
    const d = rec ? deathChance(state, rec.id, z) : z.death + extra;
    const rk = d < .1 ? "faible" : d < .2 ? "modéré" : d < .35 ? "élevé" : "mortel";
    const rkcol = d < .1 ? "var(--rad)" : d < .2 ? "var(--gold)" : d < .35 ? "var(--rust)" : "var(--danger)";
    const label = blocked ? "🚧 Zone sous blocus" : busyAll ? `${EXPEDITIONS.maxActive} expéditions max en cours`
      : !idle ? "Aucun stalker disponible" : `Envoyer ${stalkerById(rec.id).name}`;
    zc.innerHTML += `<div class="zone" ${blocked ? 'style="opacity:.55"' : ""}>
      <h3>${z.nm} <span style="color:var(--gold)">${fmt(z.fee)}</span></h3>
      <p>${z.desc}</p>
      <div class="risk">Risque${rec ? ` pour ${stalkerById(rec.id).name}` : ""} : <b style="color:${rkcol}">${rk}</b> (${Math.round(d * 100)}% de perte) · retour en ${z.days} j · butin possible : ${z.loot.map(l => itemById(l).ico).join(" ")}</div>
      <button class="btn" style="margin-top:8px;width:100%" ${canGo ? "" : "disabled"} data-act="expedition" data-id="${z.id}">
        ${label}</button>
    </div>`;
  });

  // recruits waiting at the camp
  const pool = recruitPool(state);
  const full = state.stalkers.length >= ROSTER.maxHired;
  $("#recruits").innerHTML = pool.length ? pool.map(def => {
    const t = TRAITS[def.trait];
    const can = state.money >= ROSTER.hireCost && !full && !state.over;
    return `<button class="fbtn" ${can ? "" : "disabled"} data-act="recruit" data-id="${def.id}">
      <b>${t.ico} ${def.name}</b>
      <small>${t.nm} (${t.desc}) · ${fmt(ROSTER.hireCost)}</small></button>`;
  }).join("") : `<div class="empty">Plus personne à recruter au campement.</div>`;
}

export function renderEncounter(state) {
  const c = $("#encounter");
  if (!state.encounter) { c.style.display = "none"; c.innerHTML = ""; return; }
  const enc = encounterById(state.encounter.id);
  c.style.display = "block";
  c.innerHTML = `<div class="enc">
    <div class="head"><span class="eico">${enc.ico}</span><b>Rencontre</b><small>— l'occasion passera demain</small></div>
    <p>${enc.text}</p>
    <div class="row">${enc.options.map(o =>
    `<button class="btn sm" ${canPick(state, o) && !state.over ? "" : "disabled"} data-act="encounter" data-id="${o.id}">${o.label}</button>`).join("")}</div>
  </div>`;
}

export function renderFacEvents(state) {
  const c = $("#facEvents");
  if (!state.factionEvents.length) { c.style.display = "none"; c.innerHTML = ""; return; }
  c.style.display = "flex";
  c.innerHTML = state.factionEvents.map(e => {
    let txt = "", col = "var(--blue)";
    if (e.type === "war") { txt = `⚔️ Guerre : ${FACTIONS[e.a].name} ▸ ${FACTIONS[e.b].name} · comptoir fermé · soutien ${e.support}/${FACTION_EVENTS.warSupportGoal}`; col = FACTIONS[e.a].color; }
    else if (e.type === "contract") { txt = `📜 Contrat ${FACTIONS[e.fac].name} : ${e.cat} +${Math.round((e.mult - 1) * 100)}%`; col = FACTIONS[e.fac].color; }
    else if (e.type === "blockade") { const z = ZONES.find(z => z.id === e.zone); txt = `🚧 Blocus : ${z ? z.nm : ""}`; col = "var(--rust)"; }
    else if (e.type === "raid") { txt = "🔪 Raid bandit"; col = FACTIONS.bandits.color; }
    else if (e.type === "bounty") { txt = `☠️ Prime sur ta tête : ${FACTIONS[e.fac].name}`; col = "var(--danger)"; }
    return `<div class="facev" style="border-left-color:${col}"><span>${txt}</span><b>${e.left}j</b></div>`;
  }).join("");
}

export function renderContracts(state) {
  const th = $("#threats");
  const bounties = state.factionEvents.filter(e => e.type === "bounty");
  if (bounties.length) {
    th.innerHTML = `<div class="sect" style="color:var(--danger)">Menaces</div>` + bounties.map(e => {
      const f = FACTIONS[e.fac];
      return `<div class="threat">
        <h4>☠️ Prime sur ta tête — ${f.name} (${e.left} j)</h4>
        <p>Leur comptoir t'est fermé, leurs tueurs t'embusquent la nuit et rendent chaque expédition plus mortelle. Paie la rançon pour tout arrêter, ou survis jusqu'à la fin du délai.</p>
        <button class="btn" ${state.money >= e.ransom && !state.over ? "" : "disabled"} data-act="ransom" data-id="${e.fac}">Payer la rançon — ${fmt(e.ransom)}</button>
      </div>`;
    }).join("");
  } else th.innerHTML = "";

  const of = $("#offers");
  if (!state.deliveryOffers.length) { of.innerHTML = `<div class="empty">Aucune commande pour l'instant. Elles apparaissent au fil des jours.</div>`; }
  else of.innerHTML = state.deliveryOffers.map(o => {
    const it = itemById(o.itemId), f = FACTIONS[o.fac];
    return `<div class="contract">
      <div class="ci">${it.ico}</div>
      <div class="cinfo"><b style="color:${f.color}">${f.name}</b> — ${o.qty}× ${it.nm}
        <small>Délai ${o.days} j · en stock : ${state.inv[o.itemId] || 0} · l'offre expire dans ${o.expire} j</small></div>
      <div class="reward">${fmt(o.reward)}<br><small style="color:var(--dim)">+réput</small></div>
      <div class="cact"><button class="btn" ${state.over ? "disabled" : ""} data-act="accept" data-id="${o.id}">Accepter</button></div>
    </div>`;
  }).join("");

  const ac = $("#activeDeliv");
  if (!state.activeDeliveries.length) { ac.innerHTML = `<div class="empty">Aucun contrat en cours.</div>`; }
  else ac.innerHTML = state.activeDeliveries.map(o => {
    const it = itemById(o.itemId), f = FACTIONS[o.fac];
    const pct = Math.round(o.delivered / o.qty * 100);
    const canDeliver = (state.inv[o.itemId] || 0) > 0 && !state.over;
    const urgent = o.left <= 1;
    return `<div class="contract" style="border-left-color:${urgent ? "var(--danger)" : f.color}">
      <div class="ci">${it.ico}</div>
      <div class="cinfo"><b style="color:${f.color}">${f.name}</b> — ${o.delivered}/${o.qty}× ${it.nm}
        <small>Reste ${o.left} j ${urgent ? "⚠️" : ""} · en stock : ${state.inv[o.itemId] || 0} · paiement ${fmt(o.reward)}</small>
        <div class="prog"><i style="width:${pct}%"></i></div></div>
      <div class="cact"><button class="btn" ${canDeliver ? "" : "disabled"} data-act="deliver" data-id="${o.id}">Livrer</button></div>
    </div>`;
  }).join("");

  const n = state.deliveryOffers.length + bounties.length;
  $("#contractBadge").innerHTML = n ? `<span class="badge">${n}</span>` : "";
}

export function renderAll(state) {
  renderTop(state);
  renderFacEvents(state);
  renderEncounter(state);
  renderMarket(state);
  renderSell(state);
  renderContracts(state);
  renderExp(state);
}
