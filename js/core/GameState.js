// Centralized Game State Store with Persistence, Economy Tick, Crafting, Quests & Shop
export const GameState = {
  // Player Profile
  profile: {
    username: 'HeritageBuilder',
    avatar: 'assets/images/avatars/avatar_01.png'
  },

  // City Progress
  city: {
    name: 'Molo Heritage City',
    level: 1,
    xp: 250,
    maxXp: 1000,
    maxLevel: 15,
    devProgress: {
      roads: 40,
      urban: 20,
      environment: 60
    }
  },

  // Wallet Currencies
  currencies: {
    cash: 100000,
    tokens: 50,
    kits: {
      basic: 0,
      advanced: 0,
      landmark: 0
    }
  },

  // Raw Materials (stockpiled by Factories, consumed by the Production Tab)
  materials: {
    wood: 100,
    metal: 50,
    concrete: 30
  },
  materialCap: 999,

  // Tourism Rating (Hotels + restored Landmarks)
  tourism: { points: 0 },

  // Lifetime counters used by the Quest system
  stats: {
    buildingsBuilt: 0,
    kitsCrafted: 0,
    devUpgrades: 0,
    landmarksRestored: 0
  },

  // Active City Buildings (Equipped in Slots — 3 slots per category)
  buildings: {
    factory: [
      { id: 'fac_1', tier: 1, name: 'Factory 1', level: 1, activeProduction: null }
    ],
    restaurant: [null, null, null],
    motel: [null, null, null],
    market: [null, null, null]
  },

  // Inventory (Purchased but unequipped buildings)
  inventory: {
    restaurant: [],
    motel: [],
    market: []
  },

  // ==========================================
  // BUILD CATALOG (Build Tab — 4 categories x 3 tiers)
  // ==========================================
  buildCatalog: {
    factory: [
      { tier: 1, name: 'Factory 1', unlockLevel: 1,  cost: 10000, kitReq: { type: 'basic', count: 10 }, image: 'assets/images/buildings/factory_1.png', desc: 'Processes raw materials into construction kits.', prodRate: { wood: 1, concrete: 1, metal: 0 } },
      { tier: 2, name: 'Factory 2', unlockLevel: 6,  cost: 25000, kitReq: { type: 'basic', count: 15 }, image: 'assets/images/buildings/factory_2.png', desc: 'Improved production capacity and efficiency.', prodRate: { wood: 2, concrete: 1, metal: 1 } },
      { tier: 3, name: 'Factory 3', unlockLevel: 11, cost: 50000, kitReq: { type: 'basic', count: 20 }, image: 'assets/images/buildings/factory_3.png', desc: 'Advanced machinery for high-volume output.', prodRate: { wood: 3, concrete: 2, metal: 2 } }
    ],
    restaurant: [
      { tier: 1, name: 'La Paz Batchoy House', unlockLevel: 1, cost: 8000,   kitReq: { type: 'basic', count: 5 },  image: 'assets/images/buildings/rest_batchoy.png', desc: 'Early-game eatery with steady foot traffic.', incomeRate: 150 },
      { tier: 2, name: 'Pancit Molo Diner',    unlockLevel: 5, cost: 20000,  kitReq: { type: 'basic', count: 12 }, image: 'assets/images/buildings/rest_pancit.png',  desc: 'Beloved diner serving the city\'s signature noodles.', incomeRate: 350 },
      { tier: 3, name: 'Villa Seafood Grill',  unlockLevel: 9, cost: 60000,  kitReq: { type: 'advanced', count: 8 }, image: 'assets/images/buildings/rest_seafood.png', desc: 'Premium waterfront dining for tourists.', incomeRate: 750 }
    ],
    motel: [
      { tier: 1, name: 'Calle Real Heritage Inn', unlockLevel: 3,  cost: 35000,  kitReq: { type: 'basic', count: 15 },    image: 'assets/images/buildings/motel_heritage.png', desc: 'Cozy inn that attracts heritage tourists.', incomeRate: 600, tourismRate: 1 },
      { tier: 2, name: 'Plaza Hotel & Suites',    unlockLevel: 7,  cost: 120000, kitReq: { type: 'advanced', count: 10 }, image: 'assets/images/buildings/motel_plaza.png',    desc: 'Full-service hotel with conference facilities.', incomeRate: 1400, tourismRate: 2 },
      { tier: 3, name: 'Grand Bahandi Megaplex',  unlockLevel: 12, cost: 350000, kitReq: { type: 'landmark', count: 10 }, image: 'assets/images/buildings/motel_megaplex.png', desc: 'End-game landmark tower and convention center.', incomeRate: 3000, tourismRate: 4 }
    ],
    market: [
      { tier: 1, name: 'Molo Corner Market',   unlockLevel: 2,  cost: 12000,  kitReq: { type: 'basic', count: 8 },    image: 'assets/images/buildings/market_central.png', desc: 'Trades surplus goods for quick cash.', incomeRate: 280 },
      { tier: 2, name: 'Iloilo Central Market', unlockLevel: 6,  cost: 45000,  kitReq: { type: 'advanced', count: 6 }, image: 'assets/images/buildings/market_central.png', desc: 'High-volume trade hub for rare materials.', incomeRate: 900 },
      { tier: 3, name: 'Night Bazaar Complex',  unlockLevel: 10, cost: 150000, kitReq: { type: 'landmark', count: 5 }, image: 'assets/images/buildings/market_night.png',   desc: 'Round-the-clock bazaar with premium stalls.', incomeRate: 2200 }
    ]
  },

  // Build Tab sidebar metadata
  buildCategories: {
    factory:    { title: 'FACTORIES' },
    restaurant: { title: 'RESTAURANTS' },
    motel:      { title: 'MOTELS & HOTELS' },
    market:     { title: 'MARKETS' }
  },

  // ==========================================
  // CITY DEVELOPMENT (3 branches, +20 per upgrade)
  // ==========================================
  devBranches: {
    roads: {
      label: 'INFRASTRUCTURE',
      costs: { kits: { basic: 10 }, materials: { concrete: 50 } }
    },
    urban: {
      label: 'URBAN',
      costs: { kits: { basic: 10 }, materials: { wood: 50, concrete: 25, metal: 10 } }
    },
    environment: {
      label: 'ENVIRONMENTAL',
      costs: { kits: { basic: 5 }, materials: { wood: 30, metal: 30 } }
    }
  },

  // ==========================================
  // PRODUCTION RECIPES (Production Tab)
  // ==========================================
  kitRecipes: {
    basic: {
      label: 'BASIC CONSTRUCTION KIT',
      desc: 'Essential materials for constructing and upgrading Tier 1 & 2 buildings.',
      outputAmount: 10,
      baseTimeSeconds: 60,
      reqs: { wood: 15, concrete: 10, metal: 0 },
      kitReqs: { basic: 0, advanced: 0, landmark: 0 },
      tokenReqs: 0
    },
    advanced: {
      label: 'ADVANCED CONSTRUCTION KIT',
      desc: 'Used for Tier 3 structures and major city sector upgrades.',
      outputAmount: 10,
      baseTimeSeconds: 120,
      reqs: { wood: 0, concrete: 20, metal: 15 },
      kitReqs: { basic: 5, advanced: 0, landmark: 0 },
      tokenReqs: 0
    },
    landmark: {
      label: 'LANDMARK CONSTRUCTION KIT',
      desc: 'Used exclusively to discover and restore historic landmarks.',
      outputAmount: 5,
      baseTimeSeconds: 300,
      reqs: { wood: 0, concrete: 0, metal: 25 },
      kitReqs: { basic: 0, advanced: 5, landmark: 0 },
      tokenReqs: 10
    }
  },

  // ==========================================
  // HERITAGE LANDMARKS (Landmarks Tab)
  // ==========================================
  landmarks: [
    { id: 'lm_belfry',    name: 'Molo Church Belfry',       desc: 'A 19th-century bell tower that once guided travelers across Molo district.', restored: false, reqs: { kits: 5,  tokens: 10, cash: 20000 },  reward: { tourism: 60,  tokens: 15, xp: 400 },  image: 'assets/images/landmarks/lm_belfry.png' },
    { id: 'lm_watchtower', name: 'Old Molo Watchtower',     desc: 'Spanish-era coastal watchtower used to spot incoming vessels.',           restored: false, reqs: { kits: 15, tokens: 30, cash: 80000 },  reward: { tourism: 180, tokens: 45, xp: 1100 }, image: 'assets/images/landmarks/lm_watchtower.png' },
    { id: 'lm_arch',      name: 'Calle Real Heritage Arch', desc: 'Ornamental arch marking the entrance to the historic Calle Real district.', restored: false, reqs: { kits: 10, tokens: 20, cash: 50000 },  reward: { tourism: 120, tokens: 30, xp: 800 },  image: 'assets/images/landmarks/lm_arch.png' },
    { id: 'lm_museum',    name: 'Bahandi Ancestral Museum', desc: 'Restored ancestral house showcasing Iloilo\'s colonial-era artifacts.',     restored: false, reqs: { kits: 20, tokens: 40, cash: 120000 }, reward: { tourism: 250, tokens: 60, xp: 1500 }, image: 'assets/images/landmarks/lm_museum.png' }
  ],

  // ==========================================
  // MAP THEMES (Map Theme Tab)
  // ==========================================
  activeTheme: 'th_heritage',
  themes: [
    { id: 'th_heritage', name: 'Heritage Day',  desc: 'The classic bright daylight look of Molo Heritage City.',       cost: { cash: 0 },      owned: true,  filter: 'none' },
    { id: 'th_golden',   name: 'Golden Hour',   desc: 'Warm sunset tones wash over the whole district.',               cost: { cash: 25000 },  owned: false, filter: 'sepia(0.35) saturate(1.35) brightness(1.05)' },
    { id: 'th_night',    name: 'Neon Night',    desc: 'Cool midnight palette with glowing neon city lights.',          cost: { tokens: 20 },   owned: false, filter: 'hue-rotate(195deg) brightness(0.7) saturate(1.5)' },
    { id: 'th_monsoon',  name: 'Monsoon Green', desc: 'Lush overcast atmosphere right after an afternoon downpour.',   cost: { cash: 40000 },  owned: false, filter: 'hue-rotate(55deg) brightness(0.92) contrast(1.12)' }
  ],

  // ==========================================
  // CITY SHOP (Shop Tab — consumable offers)
  // ==========================================
  shopOffers: [
    { id: 'sh_mat',   name: 'Raw Material Crate', desc: '100 Wood, 80 Concrete, and 60 Metal delivered instantly.', cost: { cash: 6000 },  grant: { materials: { wood: 100, concrete: 80, metal: 60 } }, icon: 'assets/images/icons/icon_wood.png' },
    { id: 'sh_basic', name: 'Basic Kit Bundle',   desc: '25 Basic Construction Kits for fast upgrades.',           cost: { cash: 12000 }, grant: { kits: { basic: 25 } }, icon: 'assets/images/icons/icon_kit_basic.png' },
    { id: 'sh_adv',   name: 'Advanced Kit Bundle', desc: '10 Advanced Construction Kits for Tier 3 projects.',      cost: { cash: 30000 }, grant: { kits: { advanced: 10 } }, icon: 'assets/images/icons/icon_kit_advanced.png' },
    { id: 'sh_tok',   name: 'Token Pouch',        desc: '30 Premium Tokens for speed-ups and Landmark Kits.',      cost: { cash: 50000 }, grant: { tokens: 30 }, icon: 'assets/images/icons/icon_token.png' },
    { id: 'sh_xp',    name: 'Civic XP Handbook',  desc: 'Grants +500 City XP immediately.',                        cost: { cash: 25000 }, grant: { xp: 500 }, icon: 'assets/images/icons/cat_urban.png' },
    { id: 'sh_tour',  name: 'Tourism Campaign',   desc: 'National ad campaign: +80 Tourism Rating.',               cost: { tokens: 25 },  grant: { tourism: 80 }, icon: 'assets/images/icons/cat_environmental.png' }
  ],

  // ==========================================
  // QUESTS (Goals Tab)
  // ==========================================
  quests: [
    { id: 'q_build',  title: 'Growing Skyline',  desc: 'Construct 2 structures anywhere in the city.',   stat: 'buildingsBuilt',     goal: 2,   rewards: { xp: 200, cash: 5000 },  claimed: false },
    { id: 'q_kits',   title: 'Kit Production',    desc: 'Craft 25 Construction Kits in the Production tab.', stat: 'kitsCrafted',      goal: 25,  rewards: { xp: 300, tokens: 10 }, claimed: false },
    { id: 'q_dev',    title: 'Civic Works',       desc: 'Complete 3 City Development upgrades.',          stat: 'devUpgrades',        goal: 3,   rewards: { xp: 250, cash: 10000 }, claimed: false },
    { id: 'q_tour',   title: 'Tourism Drive',     desc: 'Reach a Tourism Rating of 100.',                 stat: 'tourism',            goal: 100, rewards: { xp: 400, cash: 15000 }, claimed: false },
    { id: 'q_land',   title: 'Heritage Keeper',   desc: 'Restore your first heritage landmark.',          stat: 'landmarksRestored',  goal: 1,   rewards: { xp: 600, tokens: 20 }, claimed: false },
    { id: 'q_level',  title: 'Rising Metropolis', desc: 'Advance the city to Level 3.',                   stat: 'cityLevel',          goal: 3,   rewards: { xp: 500, tokens: 25 }, claimed: false }
  ],

  listeners: [],
  toasts: [],
  _tickCount: 0,
  _tokenAccum: 0,

  // ==========================================
  // INITIALIZATION & PERSISTENCE
  // ==========================================
  init() {
    this.loadFromStorage();
  },

  subscribe(callback) {
    this.listeners.push(callback);
  },

  notify(save = true) {
    this.listeners.forEach(callback => callback(this));
    if (save) this.saveToStorage();
  },

  emitToast(message, type = 'info') {
    this.toasts.push({ id: `${Date.now()}_${Math.random()}`, message, type });
  },

  saveToStorage() {
    try {
      const dataToSave = {
        city: this.city,
        currencies: this.currencies,
        materials: this.materials,
        buildings: this.buildings,
        inventory: this.inventory,
        tourism: this.tourism,
        stats: this.stats,
        activeTheme: this.activeTheme,
        landmarks: this.landmarks.map(l => ({ id: l.id, restored: l.restored })),
        themes: this.themes.map(t => ({ id: t.id, owned: t.owned })),
        quests: this.quests.map(q => ({ id: q.id, claimed: q.claimed }))
      };
      localStorage.setItem('bahandi_game_state', JSON.stringify(dataToSave));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  },

  loadFromStorage() {
    try {
      const saved = localStorage.getItem('bahandi_game_state');
      if (!saved) return;

      const parsed = JSON.parse(saved);
      if (parsed.city) this.city = { ...this.city, ...parsed.city, devProgress: { ...this.city.devProgress, ...(parsed.city.devProgress || {}) } };
      if (parsed.currencies) this.currencies = parsed.currencies;
      if (parsed.materials) this.materials = parsed.materials;
      if (parsed.buildings) this.buildings = parsed.buildings;
      if (parsed.inventory) this.inventory = parsed.inventory;
      if (parsed.tourism) this.tourism = parsed.tourism;
      if (parsed.stats) this.stats = { ...this.stats, ...parsed.stats };
      if (parsed.activeTheme) this.activeTheme = parsed.activeTheme;

      this.mergeById(this.landmarks, parsed.landmarks);
      this.mergeById(this.themes, parsed.themes);
      this.mergeById(this.quests, parsed.quests);
    } catch (e) {
      console.warn('LocalStorage load failed:', e);
    } finally {
      this.normalizeBuildings();
    }
  },

  // Overwrite only matching ids so catalog updates never wipe fresh fields
  mergeById(currentList, savedList) {
    if (!Array.isArray(savedList)) return;
    savedList.forEach(savedItem => {
      const target = currentList.find(item => item.id === savedItem.id);
      if (target) Object.assign(target, savedItem);
    });
  },

  // Repair slot instances coming from older save formats
  normalizeBuildings() {
    Object.keys(this.buildCatalog).forEach(category => {
      const slots = this.buildings[category];
      if (!Array.isArray(slots)) {
        this.buildings[category] = [null, null, null];
        return;
      }
      while (slots.length < 3) slots.push(null);

      slots.forEach(instance => {
        if (!instance) return;
        const spec = this.buildCatalog[category].find(item => item.tier === (instance.tier || 1)) || this.buildCatalog[category][0];
        instance.tier = spec.tier;
        instance.name = instance.name || spec.name;
        instance.level = instance.level || 1;
        if (instance.incomeRate == null) instance.incomeRate = spec.incomeRate || 0;
        if (spec.tourismRate != null && instance.tourismRate == null) instance.tourismRate = spec.tourismRate;
        if (category === 'factory') {
          instance.id = instance.id || `fac_${spec.tier}`;
          instance.prodRate = instance.prodRate || { ...spec.prodRate };
          if (instance.activeProduction === undefined) instance.activeProduction = null;
        }
      });
    });
  },

  // ==========================================
  // ECONOMY HELPERS
  // ==========================================
  getSlotCount(category) {
    return (this.buildings[category] || []).filter(Boolean).length;
  },

  // ==========================================
  // COMMAND TAB (debug grants: currency, kits & materials)
  // ==========================================
  getGrantTargets() {
    return [
      { key: 'cash',          label: 'Cash',         icon: 'assets/images/icons/icon_cash.png',         read: () => this.currencies.cash },
      { key: 'tokens',        label: 'Tokens',       icon: 'assets/images/icons/icon_token.png',        read: () => this.currencies.tokens },
      { key: 'kits.basic',    label: 'Basic Kit',    icon: 'assets/images/icons/icon_kit_basic.png',    read: () => this.currencies.kits.basic },
      { key: 'kits.advanced', label: 'Adv. Kit',     icon: 'assets/images/icons/icon_kit_advanced.png', read: () => this.currencies.kits.advanced },
      { key: 'kits.landmark', label: 'Landmark Kit', icon: 'assets/images/icons/icon_kit_landmark.png', read: () => this.currencies.kits.landmark },
      { key: 'materials.wood',     label: 'Wood',      icon: 'assets/images/icons/icon_wood.png',     read: () => this.materials.wood },
      { key: 'materials.concrete', label: 'Concrete',  icon: 'assets/images/icons/icon_concrete.png', read: () => this.materials.concrete },
      { key: 'materials.metal',    label: 'Metal',     icon: 'assets/images/icons/icon_metal.png',    read: () => this.materials.metal }
    ];
  },

  getGrantValue(key) {
    const target = this.getGrantTargets().find(t => t.key === key);
    return target ? target.read() : 0;
  },

  /** Adds `amount` to a currency, kit, or material target. */
  grant(key, amount) {
    const value = Math.floor(Number(amount));
    if (!Number.isFinite(value) || value <= 0) {
      return { success: false, reason: 'Enter a positive amount' };
    }

    if (key === 'cash') {
      this.currencies.cash += value;
    } else if (key === 'tokens') {
      this.currencies.tokens += value;
    } else if (key.startsWith('kits.')) {
      const type = key.split('.')[1];
      if (!(type in this.currencies.kits)) {
        return { success: false, reason: 'Unknown kit type' };
      }
      this.currencies.kits[type] += value;
    } else if (key.startsWith('materials.')) {
      const mat = key.split('.')[1];
      if (!(mat in this.materials)) {
        return { success: false, reason: 'Unknown material' };
      }
      // Respect the factory stockpile cap, same as regular production
      this.materials[mat] = Math.min(this.materialCap, this.materials[mat] + value);
    } else {
      return { success: false, reason: 'Unknown target' };
    }

    const label = this.getGrantTargets().find(t => t.key === key)?.label || key;
    this.emitToast(`+${value.toLocaleString()} ${label}`, 'reward');
    this.notify();
    return { success: true, value };
  },

  /** Wipes the save file and restores the starting city. */
  resetProgress() {
    try {
      localStorage.removeItem('bahandi_game_state');
    } catch (e) {
      console.warn('Could not clear save:', e);
    }
    this.currencies = { cash: 100000, tokens: 50, kits: { basic: 0, advanced: 0, landmark: 0 } };
    this.materials = { wood: 100, metal: 50, concrete: 30 };
    this.tourism = { points: 0 };
    this.stats = { buildingsBuilt: 0, kitsCrafted: 0, devUpgrades: 0, landmarksRestored: 0 };
    this.activeTheme = 'th_heritage';
    this.city.level = 1;
    this.city.xp = 250;
    this.city.maxXp = 1000;
    this.city.devProgress = { roads: 40, urban: 20, environment: 60 };
    this.buildings = {
      factory: [{ id: 'fac_1', tier: 1, name: 'Factory 1', level: 1, activeProduction: null, prodRate: { wood: 1, concrete: 1, metal: 0 } }],
      restaurant: [null, null, null],
      motel: [null, null, null],
      market: [null, null, null]
    };
    this.inventory = { restaurant: [], motel: [], market: [] };
    this.landmarks.forEach(l => { l.restored = false; });
    this.themes.forEach((t, i) => { t.owned = i === 0; });
    this.quests.forEach(q => { q.claimed = false; });

    this.emitToast('Save reset — starting city restored', 'info');
    this.notify();
    return { success: true };
  },

  getCategorySlots(category) {
    if (!Array.isArray(this.buildings[category])) this.buildings[category] = [null, null, null];
    return this.buildings[category];
  },

  getPlacedBuilding(category, tier) {
    return this.getCategorySlots(category).find(b => b && b.tier === tier) || null;
  },

  // Passive Cash per second (Restaurants + Motels + Markets, scaled by City Level)
  getCashRate() {
    let sum = 0;
    ['restaurant', 'motel', 'market'].forEach(category => {
      this.getCategorySlots(category).forEach(b => { if (b) sum += b.incomeRate || 0; });
    });
    return Math.floor(sum * (1 + 0.05 * (this.city.level - 1)));
  },

  // Tourism points per second (Hotels + restored Landmarks)
  getTourismRate() {
    let rate = 0;
    this.getCategorySlots('motel').forEach(b => { if (b) rate += b.tourismRate || 0; });
    rate += this.landmarks.filter(l => l.restored).length;
    return rate;
  },

  // Raw material yield per second across all placed factories
  getMaterialRate() {
    const total = { wood: 0, concrete: 0, metal: 0 };
    this.getCategorySlots('factory').forEach(fac => {
      if (!fac || !fac.prodRate) return;
      const mult = 1 + 0.25 * ((fac.level || 1) - 1);
      total.wood += fac.prodRate.wood * mult;
      total.concrete += fac.prodRate.concrete * mult;
      total.metal += fac.prodRate.metal * mult;
    });
    return {
      wood: Math.floor(total.wood),
      concrete: Math.floor(total.concrete),
      metal: Math.floor(total.metal)
    };
  },

  // ==========================================
  // BUILD TAB ACTIONS
  // ==========================================
  purchaseBuilding(category, tier) {
    const spec = (this.buildCatalog[category] || []).find(item => item.tier === tier);
    if (!spec) return { success: false, reason: 'Unknown structure' };

    if (this.city.level < spec.unlockLevel) {
      return { success: false, reason: `Unlocks at City Level ${spec.unlockLevel}` };
    }

    const slots = this.getCategorySlots(category);
    if (slots.filter(Boolean).length >= slots.length) {
      return { success: false, reason: 'All building slots are occupied' };
    }
    if (slots.some(b => b && b.tier === tier)) {
      return { success: false, reason: `${spec.name} is already built` };
    }
    if (this.currencies.cash < spec.cost) {
      return { success: false, reason: `Requires ₱${spec.cost.toLocaleString()} Cash` };
    }
    if (this.currencies.kits[spec.kitReq.type] < spec.kitReq.count) {
      return { success: false, reason: `Requires ${spec.kitReq.count} ${spec.kitReq.type.toUpperCase()} Kits` };
    }

    // Deduct funds
    this.currencies.cash -= spec.cost;
    this.currencies.kits[spec.kitReq.type] -= spec.kitReq.count;

    // Build instance
    const instance = {
      id: category === 'factory' ? `fac_${tier}` : `${category}_${tier}`,
      tier,
      name: spec.name,
      level: 1,
      incomeRate: spec.incomeRate || 0
    };
    if (spec.tourismRate) instance.tourismRate = spec.tourismRate;
    if (category === 'factory') {
      instance.prodRate = { ...spec.prodRate };
      instance.activeProduction = null;
    }

    const freeIndex = slots.findIndex(s => !s);
    slots[freeIndex] = instance;

    this.stats.buildingsBuilt += 1;
    this.addXp(50 * tier);
    this.emitToast(`${spec.name} constructed! (+${50 * tier} XP)`, 'success');
    this.notify();
    return { success: true, building: instance };
  },

  upgradeBuilding(category, tier) {
    const spec = (this.buildCatalog[category] || []).find(item => item.tier === tier);
    const instance = this.getPlacedBuilding(category, tier);
    if (!spec || !instance) return { success: false, reason: 'Structure not built yet' };
    if (instance.level >= 5) return { success: false, reason: 'Maximum level reached (Lv. 5)' };

    const cashCost = Math.floor(spec.cost * 0.35 * instance.level);
    const kitCount = Math.max(1, Math.ceil(spec.kitReq.count * 0.5 * instance.level));

    if (this.currencies.cash < cashCost) {
      return { success: false, reason: `Requires ₱${cashCost.toLocaleString()} Cash` };
    }
    if (this.currencies.kits[spec.kitReq.type] < kitCount) {
      return { success: false, reason: `Requires ${kitCount} ${spec.kitReq.type.toUpperCase()} Kits` };
    }

    this.currencies.cash -= cashCost;
    this.currencies.kits[spec.kitReq.type] -= kitCount;

    instance.level += 1;
    instance.incomeRate = Math.round((instance.incomeRate || 0) * 1.45);
    if (instance.tourismRate) instance.tourismRate = Math.max(1, Math.round(instance.tourismRate * 1.3));
    if (instance.prodRate) {
      instance.prodRate = {
        wood: instance.prodRate.wood * 1.25,
        concrete: instance.prodRate.concrete * 1.25,
        metal: instance.prodRate.metal * 1.25
      };
    }

    this.addXp(30 * instance.level);
    this.emitToast(`${instance.name} upgraded to Lv. ${instance.level}!`, 'success');
    this.notify();
    return { success: true, building: instance };
  },

  // ==========================================
  // CITY DEVELOPMENT ACTIONS
  // ==========================================
  upgradeDevBranch(branchKey) {
    const branch = this.devBranches[branchKey];
    if (!branch) return { success: false, reason: 'Unknown development branch' };

    const progress = this.city.devProgress[branchKey];
    if (progress >= 100) return { success: false, reason: 'Branch already complete — advance the City Level' };

    const { kits = {}, materials = {} } = branch.costs;
    for (const [type, count] of Object.entries(kits)) {
      if (this.currencies.kits[type] < count) {
        return { success: false, reason: `Requires ${count} ${type.toUpperCase()} Kits` };
      }
    }
    for (const [mat, count] of Object.entries(materials)) {
      if (this.materials[mat] < count) {
        return { success: false, reason: `Requires ${count} ${mat.charAt(0).toUpperCase() + mat.slice(1)}` };
      }
    }

    for (const [type, count] of Object.entries(kits)) this.currencies.kits[type] -= count;
    for (const [mat, count] of Object.entries(materials)) this.materials[mat] -= count;

    this.city.devProgress[branchKey] = Math.min(100, progress + 20);
    this.stats.devUpgrades += 1;
    this.addXp(25);
    this.emitToast(`${branch.label} upgraded (+20 progress)`, 'success');
    this.notify();
    return { success: true };
  },

  canAdvanceCityLevel() {
    return Object.values(this.city.devProgress).every(value => value >= 100);
  },

  advanceCityLevel() {
    if (!this.canAdvanceCityLevel()) {
      return { success: false, reason: 'Complete all three development branches first' };
    }
    if (this.city.level >= this.city.maxLevel) {
      return { success: false, reason: 'City has reached the maximum level (15)' };
    }

    this.city.level += 1;
    this.city.xp = 0;
    this.city.maxXp = Math.floor(this.city.maxXp * 1.3);
    this.city.devProgress = { roads: 0, urban: 0, environment: 0 };

    const bonus = 5000 * this.city.level;
    this.currencies.cash += bonus;

    this.emitToast(`City Level ${this.city.level} reached! +₱${bonus.toLocaleString()} bonus`, 'reward');
    this.notify();
    return { success: true };
  },

  // ==========================================
  // PRODUCTION ACTIONS
  // ==========================================
  getFactory(factoryId) {
    return this.getCategorySlots('factory').find(f => f && f.id === factoryId) || null;
  },

  canStartProduction(factoryId, kitType) {
    const factory = this.getFactory(factoryId);
    const recipe = this.kitRecipes[kitType];
    if (!factory) return { ok: false, reason: 'Factory not found' };
    if (factory.activeProduction) return { ok: false, reason: 'Factory is already producing' };
    if (!recipe) return { ok: false, reason: 'Invalid recipe' };
    if (this.materials.wood < recipe.reqs.wood) return { ok: false, reason: `Requires ${recipe.reqs.wood} Wood` };
    if (this.materials.concrete < recipe.reqs.concrete) return { ok: false, reason: `Requires ${recipe.reqs.concrete} Concrete` };
    if (this.materials.metal < recipe.reqs.metal) return { ok: false, reason: `Requires ${recipe.reqs.metal} Metal` };
    if (this.currencies.kits.basic < recipe.kitReqs.basic) return { ok: false, reason: `Requires ${recipe.kitReqs.basic} Basic Kits` };
    if (this.currencies.kits.advanced < recipe.kitReqs.advanced) return { ok: false, reason: `Requires ${recipe.kitReqs.advanced} Advanced Kits` };
    if (this.currencies.tokens < recipe.tokenReqs) return { ok: false, reason: `Requires ${recipe.tokenReqs} Tokens` };
    return { ok: true };
  },

  startProduction(factoryId, kitType) {
    const check = this.canStartProduction(factoryId, kitType);
    if (!check.ok) return { success: false, reason: check.reason };

    const factory = this.getFactory(factoryId);
    const recipe = this.kitRecipes[kitType];

    this.materials.wood -= recipe.reqs.wood;
    this.materials.concrete -= recipe.reqs.concrete;
    this.materials.metal -= recipe.reqs.metal;
    this.currencies.kits.basic -= recipe.kitReqs.basic;
    this.currencies.kits.advanced -= recipe.kitReqs.advanced;
    this.currencies.tokens -= recipe.tokenReqs;

    const speedMultiplier = 1 - (factory.level - 1) * 0.1;
    const totalDuration = Math.max(10, Math.floor(recipe.baseTimeSeconds * speedMultiplier));

    factory.activeProduction = {
      kitType,
      outputAmount: recipe.outputAmount,
      totalDuration,
      elapsedSeconds: 0
    };

    this.emitToast(`Producing ${recipe.outputAmount} ${kitType.toUpperCase()} Kits...`, 'info');
    this.notify();
    return { success: true };
  },

  speedUpProduction(factoryId, tokenCost = 10) {
    const factory = this.getFactory(factoryId);
    if (!factory || !factory.activeProduction) return { success: false, reason: 'No active production to speed up' };
    if (this.currencies.tokens < tokenCost) return { success: false, reason: `Requires ${tokenCost} Tokens` };

    this.currencies.tokens -= tokenCost;
    this.completeProduction(factoryId, true);
    return { success: true };
  },

  cancelProduction(factoryId) {
    const factory = this.getFactory(factoryId);
    if (!factory || !factory.activeProduction) return { success: false, reason: 'No active production to cancel' };

    const recipe = this.kitRecipes[factory.activeProduction.kitType];
    if (recipe) {
      this.materials.wood += Math.floor(recipe.reqs.wood * 0.5);
      this.materials.concrete += Math.floor(recipe.reqs.concrete * 0.5);
      this.materials.metal += Math.floor(recipe.reqs.metal * 0.5);
      this.currencies.kits.basic += Math.floor(recipe.kitReqs.basic * 0.5);
      this.currencies.kits.advanced += Math.floor(recipe.kitReqs.advanced * 0.5);
      this.currencies.tokens += Math.floor(recipe.tokenReqs * 0.5);
    }

    factory.activeProduction = null;
    this.emitToast('Production cancelled — 50% of inputs refunded', 'info');
    this.notify();
    return { success: true };
  },

  completeProduction(factoryId, silent = false) {
    const factory = this.getFactory(factoryId);
    if (!factory || !factory.activeProduction) return;

    const prod = factory.activeProduction;
    this.currencies.kits[prod.kitType] += prod.outputAmount;
    this.stats.kitsCrafted += prod.outputAmount;
    this.addXp(15 * factory.level);

    factory.activeProduction = null;
    if (!silent) this.emitToast(`+${prod.outputAmount} ${prod.kitType.toUpperCase()} Kits crafted`, 'reward');
    this.notify();
  },

  // ==========================================
  // LANDMARKS, THEMES, SHOP & QUESTS ACTIONS
  // ==========================================
  restoreLandmark(landmarkId) {
    const landmark = this.landmarks.find(l => l.id === landmarkId);
    if (!landmark) return { success: false, reason: 'Landmark not found' };
    if (landmark.restored) return { success: false, reason: 'Already restored' };

    if (this.currencies.kits.landmark < landmark.reqs.kits) {
      return { success: false, reason: `Requires ${landmark.reqs.kits} Landmark Kits` };
    }
    if (this.currencies.tokens < landmark.reqs.tokens) {
      return { success: false, reason: `Requires ${landmark.reqs.tokens} Tokens` };
    }
    if (this.currencies.cash < landmark.reqs.cash) {
      return { success: false, reason: `Requires ₱${landmark.reqs.cash.toLocaleString()} Cash` };
    }

    this.currencies.kits.landmark -= landmark.reqs.kits;
    this.currencies.tokens -= landmark.reqs.tokens;
    this.currencies.cash -= landmark.reqs.cash;

    landmark.restored = true;
    this.tourism.points += landmark.reward.tourism;
    this.currencies.tokens += landmark.reward.tokens;
    this.stats.landmarksRestored += 1;
    this.addXp(landmark.reward.xp);

    this.emitToast(`${landmark.name} restored! +${landmark.reward.tourism} Tourism`, 'reward');
    this.notify();
    return { success: true };
  },

  unlockTheme(themeId) {
    const theme = this.themes.find(t => t.id === themeId);
    if (!theme) return { success: false, reason: 'Theme not found' };
    if (theme.owned) return { success: false, reason: 'Theme already owned' };

    if (theme.cost.cash && this.currencies.cash < theme.cost.cash) {
      return { success: false, reason: `Requires ₱${theme.cost.cash.toLocaleString()} Cash` };
    }
    if (theme.cost.tokens && this.currencies.tokens < theme.cost.tokens) {
      return { success: false, reason: `Requires ${theme.cost.tokens} Tokens` };
    }

    if (theme.cost.cash) this.currencies.cash -= theme.cost.cash;
    if (theme.cost.tokens) this.currencies.tokens -= theme.cost.tokens;

    theme.owned = true;
    this.activeTheme = theme.id;
    this.emitToast(`${theme.name} theme unlocked and applied!`, 'success');
    this.notify();
    return { success: true };
  },

  selectTheme(themeId) {
    const theme = this.themes.find(t => t.id === themeId);
    if (!theme) return { success: false, reason: 'Theme not found' };
    if (!theme.owned) return { success: false, reason: 'Theme is locked' };

    this.activeTheme = theme.id;
    this.emitToast(`${theme.name} applied`, 'info');
    this.notify();
    return { success: true };
  },

  buyOffer(offerId) {
    const offer = this.shopOffers.find(o => o.id === offerId);
    if (!offer) return { success: false, reason: 'Offer not found' };

    if (offer.cost.cash && this.currencies.cash < offer.cost.cash) {
      return { success: false, reason: `Requires ₱${offer.cost.cash.toLocaleString()} Cash` };
    }
    if (offer.cost.tokens && this.currencies.tokens < offer.cost.tokens) {
      return { success: false, reason: `Requires ${offer.cost.tokens} Tokens` };
    }

    if (offer.cost.cash) this.currencies.cash -= offer.cost.cash;
    if (offer.cost.tokens) this.currencies.tokens -= offer.cost.tokens;

    const grant = offer.grant || {};
    if (grant.materials) {
      for (const [mat, count] of Object.entries(grant.materials)) {
        this.materials[mat] = Math.min(this.materialCap, this.materials[mat] + count);
      }
    }
    if (grant.kits) {
      for (const [type, count] of Object.entries(grant.kits)) this.currencies.kits[type] += count;
    }
    if (grant.tokens) this.currencies.tokens += grant.tokens;
    if (grant.tourism) this.tourism.points += grant.tourism;
    if (grant.xp) this.addXp(grant.xp);

    this.emitToast(`${offer.name} purchased!`, 'reward');
    this.notify();
    return { success: true };
  },

  getQuestProgress(quest) {
    if (quest.stat === 'cityLevel') return this.city.level;
    if (quest.stat === 'tourism') return this.tourism.points;
    return this.stats[quest.stat] || 0;
  },

  claimQuest(questId) {
    const quest = this.quests.find(q => q.id === questId);
    if (!quest) return { success: false, reason: 'Quest not found' };
    if (quest.claimed) return { success: false, reason: 'Reward already claimed' };
    if (this.getQuestProgress(quest) < quest.goal) {
      return { success: false, reason: `In progress — ${this.getQuestProgress(quest)} / ${quest.goal}` };
    }

    quest.claimed = true;
    const rewards = quest.rewards || {};
    if (rewards.cash) this.currencies.cash += rewards.cash;
    if (rewards.tokens) this.currencies.tokens += rewards.tokens;
    if (rewards.xp) this.addXp(rewards.xp);

    const parts = [];
    if (rewards.cash) parts.push(`₱${rewards.cash.toLocaleString()}`);
    if (rewards.tokens) parts.push(`${rewards.tokens} Tokens`);
    if (rewards.xp) parts.push(`${rewards.xp} XP`);
    this.emitToast(`Quest complete: ${quest.title} — ${parts.join(', ')}`, 'reward');
    this.notify();
    return { success: true };
  },

  // ==========================================
  // MAIN GAME TICK (runs every 1 second)
  // ==========================================
  tick() {
    this._tickCount += 1;

    // 1. Factories passively generate raw materials
    const rates = this.getMaterialRate();
    this.materials.wood = Math.min(this.materialCap, this.materials.wood + rates.wood);
    this.materials.concrete = Math.min(this.materialCap, this.materials.concrete + rates.concrete);
    this.materials.metal = Math.min(this.materialCap, this.materials.metal + rates.metal);

    // 2. Passive Cash income
    const cashRate = this.getCashRate();
    this.currencies.cash += cashRate;

    // 3. Hotels generate Tokens (1 Token per 10 hotel-seconds) and Tourism
    const hotelCount = this.getSlotCount('motel');
    this._tokenAccum += hotelCount;
    if (this._tokenAccum >= 10) {
      const earned = Math.floor(this._tokenAccum / 10);
      this.currencies.tokens += earned;
      this._tokenAccum -= earned * 10;
    }
    const tourismRate = this.getTourismRate();
    this.tourism.points += tourismRate;

    // 4. Advance active factory productions
    this.getCategorySlots('factory').forEach(fac => {
      if (!fac || !fac.activeProduction) return;
      fac.activeProduction.elapsedSeconds += 1;
      if (fac.activeProduction.elapsedSeconds >= fac.activeProduction.totalDuration) {
        this.completeProduction(fac.id);
      }
    });

    // 5. Broadcast to UI (autosave throttled to every 5 seconds)
    this.notify(this._tickCount % 5 === 0);
  },

  addXp(amount) {
    if (this.city.level >= this.city.maxLevel) {
      this.city.xp = this.city.maxXp;
      return;
    }

    this.city.xp += amount;
    while (this.city.xp >= this.city.maxXp && this.city.level < this.city.maxLevel) {
      this.city.xp -= this.city.maxXp;
      this.city.level += 1;
      this.city.maxXp = Math.floor(this.city.maxXp * 1.3);
      this.emitToast(`City Level ${this.city.level} reached! New unlocks available.`, 'reward');
    }
    if (this.city.level >= this.city.maxLevel) this.city.xp = this.city.maxXp;
  }
};

// Auto-Initialize State on Load
GameState.init();
