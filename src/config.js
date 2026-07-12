// All game data and balance constants. Pure data: no logic beyond lookups, no DOM.

export const MAX_DAY = 24;

export const DEBT = { start: 22000, garnish: 0.5 }; // half the cash goes to the Fixer each night

export const START = {
  money: 2000,
  rep: { loners: 10, duty: 0, freedom: 0, bandits: -10 },
  inv: { medusa: 1, sausage: 2 },
  sellFaction: "loners",
};

export const FACTIONS = {
  loners:  { name: "Solitaires", color: "#c9c07a", allies: [], rivals: ["bandits"] },
  duty:    { name: "Devoir",     color: "#c56b3a", allies: ["loners"], rivals: ["freedom", "bandits"] },
  freedom: { name: "Liberté",    color: "#6fbf5a", allies: ["loners"], rivals: ["duty"] },
  bandits: { name: "Bandits",    color: "#b05a8f", allies: [], rivals: ["duty", "loners"] },
};
export const FACTION_IDS = Object.keys(FACTIONS);
export const BLOCKADE_FACTIONS = ["duty", "freedom", "bandits"];
export const CATEGORIES = ["artefact", "arme", "conso"];

// preference: multiplier a faction pays for a category
export const PREF = {
  loners:  { artefact: 1.0,  arme: 1.0,  conso: 1.0 },
  duty:    { artefact: 0.85, arme: 1.35, conso: 1.1 },
  freedom: { artefact: 1.35, arme: 0.8,  conso: 1.0 },
  bandits: { artefact: 1.15, arme: 1.15, conso: 0.9 },
};

// base = market reference price
export const ITEMS = [
  { id: "medusa",  nm: "Méduse",          ico: "🪼", cat: "artefact", base: 1400, rad: 2, vol: .25 },
  { id: "flash",   nm: "Éclair",          ico: "⚡", cat: "artefact", base: 2600, rad: 3, vol: .30 },
  { id: "stone",   nm: "Fleur de pierre", ico: "🌺", cat: "artefact", base: 2200, rad: 2, vol: .28 },
  { id: "moon",    nm: "Clair de lune",   ico: "🌙", cat: "artefact", base: 3400, rad: 4, vol: .34 },
  { id: "crystal", nm: "Cristal",         ico: "💎", cat: "artefact", base: 4200, rad: 5, vol: .38 },
  { id: "soul",    nm: "Âme",             ico: "🔮", cat: "artefact", base: 5600, rad: 6, vol: .42 },
  { id: "ammo",    nm: "Munitions",       ico: "📦", cat: "arme",     base: 600,  rad: 0, vol: .18 },
  { id: "rifle",   nm: "Fusil AK",        ico: "🔫", cat: "arme",     base: 2400, rad: 0, vol: .22 },
  { id: "armor",   nm: "Armure",          ico: "🦺", cat: "arme",     base: 3200, rad: 0, vol: .20 },
  { id: "medkit",  nm: "Trousse méd.",    ico: "🩹", cat: "conso",    base: 900,  rad: 0, vol: .16 },
  { id: "vodka",   nm: "Vodka",           ico: "🍶", cat: "conso",    base: 250,  rad: 0, vol: .14 },
  { id: "sausage", nm: "Saucisson",       ico: "🥓", cat: "conso",    base: 180,  rad: 0, vol: .12 },
];
export const itemById = id => ITEMS.find(i => i.id === id);

export const ZONES = [
  { id: "cordon",  nm: "Le Cordon",   desc: "Marais tranquilles. Peu d'artefacts, mais on en revient.", fee: 500,  days: 1, death: .06, loot: ["medusa", "sausage", "vodka"], qty: [1, 2] },
  { id: "garbage", nm: "La Décharge", desc: "Ferrailles et chiens sauvages. Rendement correct.",        fee: 900,  days: 2, death: .13, loot: ["flash", "stone", "ammo", "medkit"], qty: [1, 3] },
  { id: "yantar",  nm: "Yantar",      desc: "Brouillard psi près du lac mort. Dangereux.",              fee: 1600, days: 2, death: .24, loot: ["moon", "crystal", "stone"], qty: [1, 2] },
  { id: "pripyat", nm: "Pripiat",     desc: "Le cœur de la Zone. Fortune ou linceul.",                  fee: 2800, days: 3, death: .40, loot: ["soul", "crystal", "moon"], qty: [1, 3] },
];
export const EXPEDITIONS = { maxActive: 2 };
export const STALKER_NAMES = ["Loup", "Chèque", "Renard", "Sidorovitch Jr", "Trapper", "Cardan", "Fanatic", "Pilote", "Vano", "Poker"];

// daily market events (t = journal text shown to the player)
export const MARKET_EVENTS = [
  { t: "Une Émission balaie la Zone. Les artefacts frais affluent : leur prix chute.", cat: "artefact", mult: .72, cls: "ev" },
  { t: "Escarmouche Devoir/Liberté : la demande d'armes explose.", cat: "arme", mult: 1.4, cls: "ev" },
  { t: "Un convoi de ravitaillement est passé : les consommables sont bon marché.", cat: "conso", mult: .7, cls: "ev" },
  { t: "Un savant du Yantar paie cher les anomalies : les artefacts flambent.", cat: "artefact", mult: 1.45, cls: "ev" },
  { t: "Blocus militaire au Cordon : tout se raréfie, les prix montent.", cat: "all", mult: 1.2, cls: "ev" },
  { t: "Nuit calme sur la Zone. Rien à signaler.", cat: "none", mult: 1, cls: "ev" },
  { t: "Rumeur d'un gisement d'artefacts : le marché anticipe une baisse.", cat: "artefact", mult: .82, cls: "ev" },
];

export const TRADE = {
  buyMarkup: 1.05,      // market sells 5% above the current price
  merchantMargin: 0.9,  // trader cut when selling to a faction
  repPriceDiv: 300,     // rep -100..100 -> ±33% on sell price
  repGainBase: 3,
  artefactRepFactor: 1.5,
  banditRepFactor: 0.7,
};

export const MARKET = {
  meanPull: 0.15, // daily pull back toward the base price
  minMult: 0.4,   // price floor relative to base
  maxMult: 2.2,   // price ceiling relative to base
};

export const REP = { min: -100, max: 100, allySpill: 0.4, rivalSpill: 0.6 };

export const FACTION_EVENTS = {
  maxActive: 2, // bounties excluded
  spawnFromDay: 3,
  spawnChance: 0.45,
  warDays: [3, 4],
  warSupportGoal: 4,
  warWinRep: 18,
  warStallRep: 6,
  warDemandMult: 1.35,
  warRepMult: 1.6,
  warMarketDrift: 1.04, // weapons drift up on the market during a war
  contractDays: [2, 3],
  contractMult: 1.5,
  contractRepMult: 2,
  blockadeDays: [2, 3],
  raidDays: [1, 2],
  raidTheftChance: 0.35,
  raidFenceMult: 1.2, // bandits pay more for loot during a raid
};

export const BOUNTY = {
  repThreshold: -70,
  days: 6,
  ransomBase: 2500,
  ransomPerRep: 45,
  extraDeath: 0.10, // added to every expedition death chance
  ambushChance: 0.4,
  ambushLossBase: 400,
  ambushLossSpan: 900,
  repAfterExpire: -35,
  repAfterRansom: -30,
};

export const DELIVERY = {
  maxOffers: 3,
  spawnFromDay: 2,
  spawnChance: 0.5,
  qty: [2, 4],
  days: [3, 4],
  offerLifetime: 3,
  rewardMult: 1.4,
  rewardRepDiv: 400,
  completeRep: 14,
  failRep: -18,
};

// [amount repaid, journal text]
export const STORY_BEATS = [
  [8000, "Le Fixeur t'envoie un gamin : « Le patron apprécie la régularité. Continue. »"],
  [16000, "Message crypté sur ton PDA : « Plus que la moitié. Ne me déçois pas, marchand. »"],
  [24000, "Le Fixeur en personne t'appelle : « Un dernier versement et tu es libre. Ou mort. »"],
];
