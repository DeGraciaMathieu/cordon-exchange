// All game data and balance constants. Pure data: no logic beyond lookups, no DOM.

export const MAX_DAY = 24;

export const DEBT = { start: 26000, garnish: 0.5 }; // half the cash goes to the Fixer each night

export const START = {
  money: 1500,
  rep: { loners: 10, duty: 0, freedom: 0, bandits: -10 },
  inv: { medusa: 1, sausage: 2 },
  sellFaction: "loners",
  buyMerchant: "barman",
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

// buy-side merchants: each one only stocks the items of his trade (cat)
export const MERCHANTS = {
  scientist: { name: "Pr Sakharov",     ico: "🥼", cat: "artefact", desc: "artefacts sous scellés" },
  gunsmith:  { name: "Osip l'Armurier", ico: "🔧", cat: "arme",     desc: "armes, munitions, armures" },
  barman:    { name: "Le Cantinier",    ico: "🍶", cat: "conso",    desc: "vivres et remontants" },
};

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
  {
    id: "duty-patrol",
    ico: "🪖",
    text: "Une patrouille du Devoir frappe à ta porte : « Contrôle de routine, marchand. On cherche du matériel de contrebande. »",
    options: [
      { id: "bribe", label: "Graisser la patte (600 ₽)", needs: { money: 600 },
        effects: { money: -600, rep: { duty: 3 }, t: "Le sergent glisse les billets dans sa manche et raye ton nom de la liste." } },
      { id: "comply", label: "Laisser fouiller",
        risk: { p: 0.55,
          success: { rep: { duty: 5 }, t: "La fouille ne donne rien. Le sergent salue : le Devoir apprécie les commerçants en règle." },
          failure: { items: { rifle: -1, ammo: -1 }, t: "Ils « confisquent » ce qui dépasse de tes étagères, reçu tamponné à l'appui." } } },
      { id: "refuse", label: "Refuser l'entrée",
        effects: { rep: { duty: -6 }, t: "Le sergent note ton nom dans un carnet. Au Devoir, on n'oublie pas les portes closes." } },
    ],
  },
  {
    id: "emission-shelter",
    ico: "⛈️",
    text: "Le ciel vire au rouge — une Émission approche. Trois stalkers tambourinent à ta porte pour s'abriter.",
    options: [
      { id: "shelter", label: "Les abriter",
        risk: { p: 0.75,
          success: { rep: { loners: 6 }, t: "L'Émission passe, on partage thé et anecdotes. Ils repartent en te serrant la main." },
          failure: { items: { vodka: -1, sausage: -1 }, rep: { loners: 2 }, t: "Au matin, ils sont partis — et il manque des choses sur tes étagères." } } },
      { id: "charge", label: "Faire payer l'abri (+800 ₽)",
        effects: { money: 800, rep: { loners: -4 }, t: "Ils paient en maugréant. L'histoire du marchand qui vend son toit fera le tour des feux de camp." } },
      { id: "lock", label: "Verrouiller la porte",
        effects: { rep: { loners: -6 }, t: "Tu écoutes l'Émission gronder, seul. Dehors, personne ne criera ton nom en bien." } },
    ],
  },
  {
    id: "pda-cache",
    ico: "🪦",
    text: "Un gamin t'apporte le PDA d'un stalker mort : les coordonnées d'une planque y clignotent encore.",
    options: [
      { id: "loot", label: "Fouiller la planque toi-même",
        risk: { p: 0.6,
          success: { items: { stone: 1, ammo: 1 }, t: "Sous une dalle, le magot du défunt. La Zone hérite vite — toi, plus vite encore." },
          failure: { money: -400, t: "La planque était piégée. Tu ressors vivant, mais le toubib garde la monnaie." } } },
      { id: "sell-info", label: "Vendre l'info aux bandits (+500 ₽)",
        effects: { money: 500, rep: { bandits: 3, loners: -4 }, t: "Les bandits paient rubis sur l'ongle. Quelque part, un mort se fait détrousser deux fois." } },
      { id: "return", label: "Prévenir les Solitaires",
        effects: { rep: { loners: 5 }, t: "Les affaires du défunt reviendront à son camp. Autour des feux, on salue ton geste." } },
    ],
  },
  {
    id: "boar-hunter",
    ico: "🐗",
    text: "Un chasseur écoule sa prise du jour : « Du sanglier fumé, trois pièces pour 300 ₽. Tué de ce matin, promis. »",
    options: [
      { id: "buy", label: "Acheter le lot (300 ₽)", needs: { money: 300 },
        effects: { money: -300, items: { sausage: 3 }, t: "La viande est bonne — le sanglier ne brillait même pas dans le noir." } },
      { id: "lowball", label: "Proposer 200 ₽", needs: { money: 200 },
        risk: { p: 0.5,
          success: { money: -200, items: { sausage: 3 }, t: "Il soupire, crache, et lâche le lot. Les temps sont durs pour tout le monde." },
          failure: { t: "Vexé, il remballe sa viande et ira nourrir un autre comptoir." } } },
      { id: "decline", label: "Décliner",
        effects: { t: "Tu laisses passer le sanglier. On ne sait jamais ce qui brille la nuit." } },
    ],
  },
  {
    id: "freedom-smuggler",
    ico: "🚬",
    text: "Un contrebandier de la Liberté ouvre son manteau : « Fusil et munitions, prix d'ami. Le Devoir n'a pas besoin de le savoir. »",
    options: [
      { id: "buy", label: "Acheter la caisse (1 800 ₽)", needs: { money: 1800 },
        effects: { money: -1800, items: { rifle: 1, ammo: 2 }, rep: { duty: -3 }, t: "L'échange se fait dans l'arrière-boutique. Des oreilles du Devoir traînaient peut-être." } },
      { id: "snitch", label: "Le dénoncer au Devoir",
        effects: { rep: { duty: 6, freedom: -6 }, t: "Une patrouille l'embarque à la sortie du camp. Le Devoir te salue, la Liberté te maudit." } },
      { id: "decline", label: "Refuser poliment",
        effects: { t: "Il referme son manteau sans insister. Chacun ses risques." } },
    ],
  },
  {
    id: "hot-artefact",
    ico: "☢️",
    text: "Un stalker pressé brade un Clair de lune : « 1 500 ₽, moitié prix. Il chauffe un peu, mais il est à toi. »",
    options: [
      { id: "buy", label: "Acheter (1 500 ₽)", needs: { money: 1500 },
        effects: { money: -1500, items: { moon: 1 }, t: "L'artefact tiédit dans ta paume. Une affaire — tant que tu t'en sépares vite." } },
      { id: "haggle", label: "Offrir 1 000 ₽", needs: { money: 1000 },
        risk: { p: 0.45,
          success: { money: -1000, items: { moon: 1 }, t: "Il jure dans sa barbe et prend les billets. Il devait être vraiment pressé." },
          failure: { t: "Il ricane et disparaît dans la brume avec son trésor tiède." } } },
      { id: "decline", label: "Trop risqué",
        effects: { t: "Tu connais le prix des choses qui chauffent. Qu'il aille irradier quelqu'un d'autre." } },
    ],
  },
  {
    id: "ecologist-medkits",
    ico: "🔬",
    text: "Des écologistes du bunker font le tour des comptoirs : « Nos réserves médicales sont à sec. Deux trousses, et la science s'en souviendra. »",
    options: [
      { id: "sell", label: "Vendre 2 trousses (2 200 ₽)", needs: { items: { medkit: 2 } },
        effects: { items: { medkit: -2 }, money: 2200, rep: { freedom: 3 }, t: "Ils paient sans discuter — la science a des fonds, parfois." } },
      { id: "donate", label: "Les offrir à la science", needs: { items: { medkit: 2 } },
        effects: { items: { medkit: -2 }, rep: { freedom: 7 }, t: "Ils repartent chargés et reconnaissants. La Liberté protège ceux qui protègent la science." } },
      { id: "refuse", label: "Refuser",
        effects: { t: "Les blouses blanches iront frapper ailleurs. La Zone ne soigne pas ceux qui attendent." } },
    ],
  },
  {
    id: "protection-racket",
    ico: "🪓",
    text: "Trois bandits s'accoudent à ton comptoir : « Taxe de protection, 700 ₽. Les planques, ça brûle vite par ici. »",
    options: [
      { id: "pay", label: "Payer la taxe (700 ₽)", needs: { money: 700 },
        effects: { money: -700, rep: { bandits: 3 }, t: "Ils empochent et promettent que « personne ne t'embêtera ». Parole de bandit." } },
      { id: "negotiate", label: "Négocier à 400 ₽", needs: { money: 400 },
        risk: { p: 0.55,
          success: { money: -400, rep: { bandits: 1 }, t: "Le meneur ricane devant ton aplomb et accepte. Les rapaces respectent les rapaces." },
          failure: { money: -400, rep: { bandits: -4 }, t: "Ils prennent tes billets mais le meneur crache par terre. Le marchandage laisse des traces." } } },
      { id: "stand", label: "Tenir tête",
        risk: { p: 0.5,
          success: { rep: { loners: 5, bandits: -2 }, t: "Tu poses ton fusil sur le comptoir sans un mot. Ils rient jaune et s'éclipsent — le camp en parlera." },
          failure: { money: -1000, t: "Au matin, ta porte est fracassée et ta caisse allégée. Le message est clair." } } },
    ],
  },
  {
    id: "convoy-crash",
    ico: "🚚",
    text: "Un camion militaire s'est renversé dans le fossé près du Cordon. L'escorte a filé, la cargaison est éparpillée.",
    options: [
      { id: "loot", label: "Fouiller l'épave",
        risk: { p: 0.5,
          success: { items: { armor: 1, ammo: 1 }, t: "Tu repars ployant sous le matériel militaire. L'armée comptera ses caisses plus tard." },
          failure: { money: -600, rep: { duty: -4 }, t: "Une patrouille te cueille les bras chargés : amende, sermon, et ton nom sur une liste." } } },
      { id: "report", label: "Prévenir le Devoir",
        effects: { rep: { duty: 5 }, t: "Le Devoir sécurise l'épave dans l'heure. L'ordre a de la mémoire pour ceux qui le servent." } },
      { id: "avoid", label: "Passer au large",
        effects: { t: "Les épaves attirent les charognards — et les balles. Tu passes ton chemin." } },
    ],
  },
  {
    id: "anomaly-map",
    ico: "🧭",
    text: "Un vieux stalker déplie une carte constellée de croix : « Tout ce qui va affluer sur le marché est là-dessus. 500 ₽ et elle est à toi. »",
    options: [
      { id: "buy", label: "Acheter la carte (500 ₽)", needs: { money: 500 },
        effects: { money: -500, tip: true, t: "Les gisements frais y sont pointés d'une encre grasse. De quoi voir venir le marché." } },
      { id: "peek", label: "La mémoriser en douce",
        risk: { p: 0.35,
          success: { tip: true, t: "Tu retiens l'essentiel avant qu'il ne replie sa carte. Ni vu ni connu." },
          failure: { rep: { loners: -5 }, t: "Le vieux te surprend le nez sur son bien et ameute la moitié du camp." } } },
      { id: "decline", label: "Passer",
        effects: { t: "Les croix des autres mènent souvent à leurs tombes. Tu déclines." } },
    ],
  },
  {
    id: "night-howls",
    ico: "🐺",
    text: "Des meutes de chiens aveugles rôdent aux abords du camp. Les Solitaires organisent une battue et manquent de munitions.",
    options: [
      { id: "supply", label: "Fournir 2 munitions", needs: { items: { ammo: 2 } },
        effects: { items: { ammo: -2 }, rep: { loners: 6 }, t: "La battue fait taire les hurlements pour de bon. Le camp sait qui remercier." } },
      { id: "gouge", label: "Les vendre au prix de la peur (+900 ₽)", needs: { items: { ammo: 2 } },
        effects: { items: { ammo: -2 }, money: 900, rep: { loners: -2 }, t: "Ils paient, la mort dans l'âme. La battue réussira, mais on retiendra ton tarif." } },
      { id: "keep", label: "Garder ton stock",
        effects: { rep: { loners: -4 }, t: "Les hurlements durent toute la nuit. Au matin, les regards du camp sont lourds." } },
    ],
  },
  {
    id: "card-game",
    ico: "🃏",
    text: "Autour du feu, une partie de cartes s'échauffe. On te fait une place : « Le marchand a bien un billet à perdre ? »",
    options: [
      { id: "bet", label: "Miser 500 ₽", needs: { money: 500 },
        risk: { p: 0.45,
          success: { money: 600, t: "Tu ramasses la mise sous les jurons. La chance du marchand fait jaser." },
          failure: { money: -500, t: "Les cartes ne mentent pas : mauvaise main, mauvaise soirée." } } },
      { id: "highroll", label: "Miser gros — 1 500 ₽", needs: { money: 1500 },
        risk: { p: 0.4,
          success: { money: 2000, t: "Tu rafles le pot sous un silence de mort. Certains regards valent une prime." },
          failure: { money: -1500, t: "Le pot s'envole avec un sourire édenté. La Zone donne, la Zone reprend." } } },
      { id: "watch", label: "Regarder la partie",
        effects: { t: "Tu comptes les cartes de loin. Les poches des autres se vident très bien sans toi." } },
    ],
  },
];
export const encounterById = id => ENCOUNTERS.find(e => e.id === id);

export const TRADE = {
  buyMarkup: 1.12,      // market sells 12% above the current price
  merchantMargin: 0.82, // trader cut when selling to a faction
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
  spawnChance: 0.6,
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
  raidTheftChance: 0.45,
  raidFenceMult: 1.2, // bandits pay more for loot during a raid
};

export const BOUNTY = {
  repThreshold: -60,
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
  failRep: -22,
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
