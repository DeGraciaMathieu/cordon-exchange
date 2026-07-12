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

// named stalkers: a persistent roster with traits, levels and permadeath
export const STALKERS = [
  { id: "wolf",    name: "Loup",           trait: "veteran" },
  { id: "poker",   name: "Poker",          trait: "scavenger" },
  { id: "fox",     name: "Renard",         trait: "runner" },
  { id: "check",   name: "Chèque",         trait: "scavenger" },
  { id: "sido",    name: "Sidorovitch Jr", trait: "veteran" },
  { id: "trapper", name: "Trapper",        trait: "veteran" },
  { id: "cardan",  name: "Cardan",         trait: "runner" },
  { id: "fanatic", name: "Fanatic",        trait: "scavenger" },
  { id: "pilot",   name: "Pilote",         trait: "runner" },
  { id: "vano",    name: "Vano",           trait: "veteran" },
];
export const stalkerById = id => STALKERS.find(s => s.id === id);

export const TRAITS = {
  veteran:   { nm: "Vétéran",   ico: "🛡️", desc: "risque de perte réduit" },
  scavenger: { nm: "Fouineur",  ico: "🎒", desc: "un objet de butin en plus" },
  runner:    { nm: "Éclaireur", ico: "🥾", desc: "revient un jour plus tôt" },
};

export const ROSTER = {
  start: ["wolf", "poker"], // hired from day 1
  maxHired: 4,
  hireCost: 800,
  xpPerLevel: 2,      // xp gained: 1 per surviving expedition
  maxLevel: 5,
  deathPerLevel: 0.03, // death chance shaved per level above 1
  veteranMult: 0.7,
  scavengerBonus: 1,
  runnerDaysOff: 1,
  minDeath: 0.02,      // the Zone never forgives entirely
};

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

// daily choice encounters — declarative consequences applied by src/encounters.js
// effect fields: money (±, losses clamped to available cash), items {id: ±n} (clamped to stock),
// rep {fac: ±n} (via shiftRep, spills apply), tip (leaks a rising market event for tomorrow), t (journal text)
// risk: { p: success probability, success: effects, failure: effects }
export const ENCOUNTERS = [
  {
    id: "wounded-stalker",
    ico: "🩸",
    text: "Un stalker blessé se traîne jusqu'à ton comptoir : « Une anomalie a grillé ma trousse. Soigne-moi et mon Cristal est à toi. »",
    options: [
      { id: "heal", label: "Le soigner (1 trousse méd.)", needs: { items: { medkit: 1 } },
        effects: { items: { medkit: -1, crystal: 1 }, rep: { loners: 5 }, t: "Tu le rafistoles. Il te laisse son Cristal et ton nom circule en bien autour des feux de camp." } },
      { id: "rob", label: "Le dépouiller",
        risk: { p: 0.55,
          success: { items: { crystal: 1 }, rep: { loners: -8, bandits: 3 }, t: "Tu le délestes de son Cristal sans un mot. Les feux de camp jaseront." },
          failure: { money: -500, rep: { loners: -8 }, t: "Il se débat et te taillade le bras — les soins te coûtent cher." } } },
      { id: "ignore", label: "Passer ton chemin",
        effects: { rep: { loners: -2 }, t: "Tu détournes le regard. La Zone n'oublie pas ce genre de choix." } },
    ],
  },
  {
    id: "army-tip",
    ico: "🎖️",
    text: "Un militaire véreux se penche à ta fenêtre : « 400 ₽ et je te dis ce que les convois vont s'arracher demain. »",
    options: [
      { id: "pay", label: "Payer le pot-de-vin (400 ₽)", needs: { money: 400 }, effects: { money: -400 },
        risk: { p: 0.65,
          success: { tip: true, t: "Il murmure deux mots et disparaît. Le tuyau a l'air solide." },
          failure: { t: "Il empoche, salue… et tu ne le reverras jamais." } } },
      { id: "refuse", label: "Refuser",
        effects: { t: "Tu refuses poliment. Il hausse les épaules et va tenter le comptoir voisin." } },
    ],
  },
  {
    id: "bandit-cache",
    ico: "📦",
    text: "Deux bandits posent une caisse cadenassée : « Planque ça jusqu'à demain. 900 ₽, et pose pas de questions. »",
    options: [
      { id: "hide", label: "Planquer la caisse (+900 ₽)", effects: { money: 900, rep: { bandits: 4 } },
        risk: { p: 0.75,
          success: { t: "La nuit passe sans encombre et la caisse disparaît à l'aube. Argent facile." },
          failure: { money: -1200, rep: { duty: -6 }, t: "Une patrouille du Devoir fouille ta planque : amende salée et regards mauvais." } } },
      { id: "refuse", label: "Refuser",
        effects: { rep: { bandits: -4 }, t: "Les bandits remballent la caisse en te dévisageant longuement." } },
    ],
  },
  {
    id: "scientist",
    ico: "🧪",
    text: "Un savant du bunker cherche une Méduse « encore chaude » pour ses mesures : « 2 400 ₽, prix ferme. »",
    options: [
      { id: "sell", label: "Vendre une Méduse (2 400 ₽)", needs: { items: { medusa: 1 } },
        effects: { items: { medusa: -1 }, money: 2400, rep: { freedom: 4 }, t: "Il emballe la Méduse avec des gestes de dentellière. La Liberté apprécie les amis de la science." } },
      { id: "haggle", label: "Exiger 3 200 ₽", needs: { items: { medusa: 1 } },
        risk: { p: 0.5,
          success: { items: { medusa: -1 }, money: 3200, t: "Il peste contre les rapaces du Cordon… et paie." },
          failure: { t: "Vexé, il tourne les talons. La science ira voir ailleurs." } } },
      { id: "decline", label: "Décliner",
        effects: { t: "Tu gardes tes artefacts. La science attendra." } },
    ],
  },
  {
    id: "anomaly-dive",
    ico: "🌀",
    text: "Un gamin du camp a repéré une anomalie fraîche derrière les entrepôts. Personne n'ose y toucher.",
    options: [
      { id: "dive", label: "Y aller toi-même",
        risk: { p: 0.45,
          success: { items: { flash: 1 }, t: "Tu ressors tremblant, un Éclair crépitant encore au fond du sac." },
          failure: { money: -700, t: "L'anomalie te mâche et te recrache. Les soins te coûtent cher." } } },
      { id: "send-kid", label: "Payer le gamin (200 ₽)", needs: { money: 200 }, effects: { money: -200 },
        risk: { p: 0.3,
          success: { items: { flash: 1 }, rep: { loners: 2 }, t: "Le gosse est vif : il revient avec un Éclair et un sourire jusqu'aux oreilles." },
          failure: { rep: { loners: -5 }, t: "Le gamin revient bredouille et boitant. Au camp, ça ne se pardonne pas vite." } } },
      { id: "forget", label: "Laisser tomber",
        effects: { t: "Tu laisses l'anomalie à qui voudra s'y frotter." } },
    ],
  },
  {
    id: "vodka-night",
    ico: "🍶",
    text: "Des stalkers fêtent un retour miraculeux et réclament ta vodka « au prix de l'amitié ».",
    options: [
      { id: "offer", label: "Offrir la tournée (2 vodkas)", needs: { items: { vodka: 2 } },
        effects: { items: { vodka: -2 }, rep: { loners: 6 }, t: "La tournée est pour toi. On te promet la primeur des prochaines trouvailles." } },
      { id: "gouge", label: "Vendre au triple (2 vodkas)", needs: { items: { vodka: 2 } },
        risk: { p: 0.6,
          success: { items: { vodka: -2 }, money: 1500, t: "Trop heureux d'être vivants, ils paient sans compter." },
          failure: { items: { vodka: -2 }, money: 500, rep: { loners: -4 }, t: "Ils paient de mauvaise grâce et le mot « rapace » fuse dans ton dos." } } },
      { id: "close", label: "Fermer boutique",
        effects: { rep: { loners: -2 }, t: "Tu éteins la lampe. La fête se fera sans toi — et on s'en souviendra." } },
    ],
  },
];
export const encounterById = id => ENCOUNTERS.find(e => e.id === id);

export const TRADE = {
  buyMarkup: 1.05,      // market sells 5% above the current price
  merchantMargin: 0.9,  // trader cut when selling to a faction
  repPriceDiv: 300,     // rep -100..100 -> ±33% on sell price
  repGainBase: 3,
  artefactRepFactor: 1.5,
  banditRepFactor: 0.7,
};

// haggling: a small bet on every sale — push the price or vex the faction
export const HAGGLE = {
  bonus: 0.15,   // price uplift when the haggle lands
  chance: 0.5,   // odds the faction accepts
  repPenalty: 4, // reputation lost when the faction is vexed (no sale)
};

export const MARKET = {
  meanPull: 0.15,      // daily pull back toward the base price
  minMult: 0.4,        // price floor relative to base
  maxMult: 2.2,        // price ceiling relative to base
  historyLen: 10,      // days of price history kept per item (sparkline window)
  undervaluedAt: 0.85, // price at or below base × this = "undervalued" buy signal
};

export const REP = { min: -100, max: 100, allySpill: 0.4, rivalSpill: 0.6 };

// player radiation: held artefacts irradiate you every night (their rad stat)
export const RADIATION = {
  perRad: 1,         // rads absorbed per night per rad point held
  decay: 8,          // nightly recovery when holding nothing radioactive
  sickAt: 60,        // from here on, nightly medical costs kick in
  sickCostPerRad: 5, // ₽ per rad each sick night
  deathAt: 100,      // reaching this kills the trader
};

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

// permanent hideout upgrades — fx is the effect value wired into the owning module
export const UPGRADES = [
  { id: "leadbox",   nm: "Caisse plombée",     ico: "🧰", cost: 3500, fx: 0.5,  desc: "les artefacts stockés irradient moitié moins" },   // radsDose multiplier
  { id: "thirdslot", nm: "Guide de la Zone",   ico: "🗺️", cost: 4000, fx: 1,    desc: "une expédition simultanée de plus" },              // extra expedition slot
  { id: "contact",   nm: "Contact au comptoir", ico: "🤝", cost: 3000, fx: 1.08, desc: "les factions paient 8 % de mieux" },              // sellPrice multiplier
  { id: "watchdog",  nm: "Chien de garde",     ico: "🐕", cost: 2000, fx: 0.5,  desc: "vols et embuscades deux fois plus rares" },        // night-event chance multiplier
  { id: "hideout",   nm: "Planque agrandie",   ico: "🏚️", cost: 2500, fx: 1,    desc: "une place de plus dans l'équipe" },                // extra crew slot
];
export const upgradeById = id => UPGRADES.find(u => u.id === id);

// [amount repaid, journal text]
export const STORY_BEATS = [
  [8000, "Le Fixeur t'envoie un gamin : « Le patron apprécie la régularité. Continue. »"],
  [16000, "Message crypté sur ton PDA : « Plus que la moitié. Ne me déçois pas, marchand. »"],
  [24000, "Le Fixeur en personne t'appelle : « Un dernier versement et tu es libre. Ou mort. »"],
];
