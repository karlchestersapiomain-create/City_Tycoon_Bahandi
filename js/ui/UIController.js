import { GameState } from '../core/GameState.js';

/**
 * UIController — owns every workspace panel, tab renderer, and button handler.
 * Dynamically rendered cards use delegated click handlers bound once at init.
 */
export class UIController {
  constructor() {
    this.activeTab = null;
    this.activeBuildCategory = 'factory';
    this.activeProductionFactoryId = null;
    this.selectedKitType = 'basic';

    this.materialIcons = {
      wood: 'assets/images/icons/icon_wood.png',
      concrete: 'assets/images/icons/icon_concrete.png',
      metal: 'assets/images/icons/icon_metal.png'
    };

    this.kitIcons = {
      basic: 'assets/images/icons/icon_kit_basic.png',
      advanced: 'assets/images/icons/icon_kit_advanced.png',
      landmark: 'assets/images/icons/icon_kit_landmark.png'
    };

    this.cashIcon = 'assets/images/icons/icon_cash.png';
    this.tokenIcon = 'assets/images/icons/icon_token.png';

    this.initEventListeners();
    this.subscribeToGameState();
    this.updateAll();
  }

  // ==========================================
  // 1. EVENT LISTENERS
  // ==========================================
  initEventListeners() {
    // --- Dock Tab Buttons (bottom navigation) ---
    document.querySelectorAll('.dock-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => this.toggleTabWorkspace(btn.getAttribute('data-tab'), btn));
    });

    // --- Panel Close Buttons ---
    document.querySelectorAll('.panel-close-btn').forEach(btn => {
      btn.addEventListener('click', () => this.closeWorkspace(btn.getAttribute('data-close')));
    });

    // --- Escape key closes the open workspace and the command tab ---
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      if (this.activeTab) this.closeWorkspace(this.activeTab);

      const panel = document.getElementById('devPanel');
      if (panel && !panel.classList.contains('hidden')) {
        panel.classList.add('hidden');
        document.getElementById('devToggleBtn')?.classList.remove('active');
      }
    });

    // --- Build Tab sidebar category switcher ---
    document.querySelectorAll('#tab-build .sidebar-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#tab-build .sidebar-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeBuildCategory = btn.getAttribute('data-category');
        this.renderBuildCategory();
      });
    });

    // --- Build Tab card actions (delegated: buy / upgrade / info) ---
    this.bindDelegated('build-cards-container', (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      const tier = parseInt(btn.getAttribute('data-tier'), 10);
      const action = btn.getAttribute('data-action');

      if (action === 'buy') {
        this.handleResult(GameState.purchaseBuilding(this.activeBuildCategory, tier));
      } else if (action === 'upgrade') {
        this.handleResult(GameState.upgradeBuilding(this.activeBuildCategory, tier));
      } else if (action === 'info') {
        const spec = GameState.buildCatalog[this.activeBuildCategory]?.find(i => i.tier === tier);
        if (spec) this.showToast(`${spec.name} — ${spec.desc}`, 'info');
      }
    });

    // --- Production Tab factory selection (delegated) ---
    this.bindDelegated('prod-factories-list', (e) => {
      const btn = e.target.closest('[data-factory-id]');
      if (!btn) return;

      if (btn.getAttribute('data-locked') === 'true') {
        this.showToast('Build this factory first in the Build tab', 'error');
        return;
      }
      this.activeProductionFactoryId = btn.getAttribute('data-factory-id');
      this.renderProductionDetails();
    });

    // --- Production Tab kit selection cards ---
    document.querySelectorAll('.kit-select-card').forEach(card => {
      card.addEventListener('click', (e) => {
        const kitType = card.getAttribute('data-kit-type');
        document.querySelectorAll('.kit-select-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        this.selectedKitType = kitType;
        this.renderProductionDetails();

        if (e.target.closest('.card-info-btn')) {
          const recipe = GameState.kitRecipes[kitType];
          if (recipe) this.showToast(`${recipe.label} — ${recipe.desc}`, 'info');
        }
      });
    });

    // --- Production action buttons ---
    document.getElementById('btn-start-prod')?.addEventListener('click', () => {
      this.handleResult(GameState.startProduction(this.activeProductionFactoryId, this.selectedKitType));
    });

    document.getElementById('btn-speedup-prod')?.addEventListener('click', () => {
      this.handleResult(GameState.speedUpProduction(this.activeProductionFactoryId, 10));
    });

    document.getElementById('btn-cancel-prod')?.addEventListener('click', () => {
      this.handleResult(GameState.cancelProduction(this.activeProductionFactoryId));
    });

    // --- City Development upgrade buttons ---
    document.querySelectorAll('#tab-city-dev [data-branch]').forEach(btn => {
      btn.addEventListener('click', () => this.handleResult(GameState.upgradeDevBranch(btn.getAttribute('data-branch'))));
    });

    document.getElementById('btn-advance-city')?.addEventListener('click', () => {
      this.handleResult(GameState.advanceCityLevel());
    });

    // --- Landmarks restore (delegated) ---
    this.bindDelegated('landmarks-list', (e) => {
      const btn = e.target.closest('[data-action="restore"]');
      if (btn) this.handleResult(GameState.restoreLandmark(btn.getAttribute('data-id')));
    });

    // --- Map Themes (delegated: unlock / apply) ---
    this.bindDelegated('themes-grid', (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      const id = btn.getAttribute('data-id');
      if (btn.getAttribute('data-action') === 'unlock') {
        this.handleResult(GameState.unlockTheme(id));
      } else if (btn.getAttribute('data-action') === 'apply') {
        this.handleResult(GameState.selectTheme(id));
      }
    });

    // --- Shop offers (delegated) ---
    this.bindDelegated('shop-grid', (e) => {
      const btn = e.target.closest('[data-action="buy-offer"]');
      if (btn) this.handleResult(GameState.buyOffer(btn.getAttribute('data-id')));
    });

    // --- Quest rewards (delegated) ---
    this.bindDelegated('quests-list', (e) => {
      const btn = e.target.closest('[data-action="claim"]');
      if (btn) this.handleResult(GameState.claimQuest(btn.getAttribute('data-id')));
    });

    // --- Profile dropdown toggle ---
    const profileWidget = document.getElementById('profileWidget');
    const profileDropdown = document.getElementById('profileDropdown');
    if (profileWidget && profileDropdown) {
      profileWidget.addEventListener('click', (e) => {
        e.stopPropagation();
        profileDropdown.classList.toggle('hidden');
      });

      document.addEventListener('click', (e) => {
        if (!profileWidget.contains(e.target)) profileDropdown.classList.add('hidden');
      });
    }

    // --- Floating Command Tab (adds currency & kits) ---
    this.devTarget = 'cash';
    this.initCommandTab();
  }

  // ==========================================
  // COMMAND TAB (floating add-currency panel)
  // ==========================================
  initCommandTab() {
    const toggle = document.getElementById('devToggleBtn');
    const panel = document.getElementById('devPanel');
    if (!toggle || !panel) return;

    toggle.addEventListener('click', () => {
      const willOpen = panel.classList.contains('hidden');
      panel.classList.toggle('hidden');
      toggle.classList.toggle('active', willOpen);
      if (willOpen) this.renderCommandTab();
    });

    document.getElementById('devCloseBtn')?.addEventListener('click', () => {
      panel.classList.add('hidden');
      toggle.classList.remove('active');
    });

    // Target selector (rebuilt whenever the panel opens)
    this.bindDelegated('devTargets', (e) => {
      const btn = e.target.closest('[data-target]');
      if (!btn) return;
      this.devTarget = btn.getAttribute('data-target');
      this.renderCommandTab();
    });

    // Quick amount buttons
    this.bindDelegated('devAmounts', (e) => {
      const btn = e.target.closest('[data-amount]');
      if (!btn) return;
      this.handleResult(GameState.grant(this.devTarget, btn.getAttribute('data-amount')));
      this.renderCommandTab();
    });

    // Custom amount + ADD
    const applyCustom = () => {
      const input = document.getElementById('devCustomAmount');
      if (!input) return;
      this.handleResult(GameState.grant(this.devTarget, input.value));
      input.value = '';
      this.renderCommandTab();
    };
    document.getElementById('devAddBtn')?.addEventListener('click', applyCustom);
    document.getElementById('devCustomAmount')?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') applyCustom();
    });

    // Reset save
    document.getElementById('devResetBtn')?.addEventListener('click', () => {
      this.handleResult(GameState.resetProgress());
      this.renderCommandTab();
    });
  }

  renderCommandTab() {
    const targets = GameState.getGrantTargets();
    const groups = [
      { title: 'WALLET', keys: ['cash', 'tokens'] },
      { title: 'CONSTRUCTION KITS', keys: ['kits.basic', 'kits.advanced', 'kits.landmark'] },
      { title: 'RAW MATERIALS', keys: ['materials.wood', 'materials.concrete', 'materials.metal'] }
    ];

    const html = groups.map(group => {
      const buttons = group.keys.map(key => {
        const t = targets.find(x => x.key === key);
        if (!t) return '';
        return `
          <button class="dev-target-btn ${key === this.devTarget ? 'active' : ''}" data-target="${key}" title="${t.label}">
            <img src="${t.icon}" alt="${t.label}" /> <span>${t.label}</span>
          </button>`;
      }).join('');
      return `<div class="dev-group-title">${group.title}</div>${buttons}`;
    }).join('');

    this.setHTML('devTargets', html);

    const active = targets.find(t => t.key === this.devTarget);
    const current = GameState.getGrantValue(this.devTarget);
    this.setText('devCurrentValue', active
      ? `${active.label} now: ${current.toLocaleString()}`
      : '—');
  }

  bindDelegated(elementId, handler) {
    const el = document.getElementById(elementId);
    if (el) el.addEventListener('click', handler);
  }

  /** Shows the error toast for failed actions; successes already toast from GameState. */
  handleResult(result) {
    if (!result || result.success === false) {
      this.showToast(result?.reason || 'Action failed', 'error');
    }
  }

  // ==========================================
  // 2. TAB CONTROLLER & ANIMATION
  // ==========================================
  toggleTabWorkspace(tabId, clickedBtn) {
    const overlay = document.getElementById('workspaceOverlay');
    const targetPanel = document.getElementById(tabId);

    if (this.activeTab === tabId) {
      this.closeWorkspace(tabId);
      return;
    }

    document.querySelectorAll('.dock-tab-btn').forEach(b => b.classList.remove('active'));
    if (clickedBtn) clickedBtn.classList.add('active');

    if (overlay) overlay.classList.remove('hidden');
    document.querySelectorAll('.workspace-panel').forEach(panel => panel.classList.add('hidden'));

    if (targetPanel) {
      targetPanel.classList.remove('hidden');
      this.activeTab = tabId;
      this.renderActiveTab();
    }
  }

  closeWorkspace(tabId) {
    const overlay = document.getElementById('workspaceOverlay');
    const targetPanel = document.getElementById(tabId);

    if (targetPanel) targetPanel.classList.add('hidden');
    if (overlay) overlay.classList.add('hidden');

    document.querySelectorAll('.dock-tab-btn').forEach(b => b.classList.remove('active'));
    this.activeTab = null;
  }

  renderActiveTab() {
    switch (this.activeTab) {
      case 'tab-build': this.renderBuildCategory(); break;
      case 'tab-city-dev': this.renderCityDevData(); break;
      case 'tab-production': this.renderProductionDetails(); break;
      case 'tab-landmarks': this.renderLandmarks(); break;
      case 'tab-map-theme': this.renderThemes(); break;
      case 'tab-shop': this.renderShop(); break;
      case 'tab-quests': this.renderQuests(); break;
    }
  }

  // ==========================================
  // 3. OBSERVER, HUD & TOASTS
  // ==========================================
  subscribeToGameState() {
    GameState.subscribe(() => this.updateAll());
  }

  updateAll() {
    this.updateHUD(GameState);
    this.renderActiveTab();
    this.applyTheme();
    this.drainToasts();
  }

  updateHUD(state) {
    this.setText('hud-city-level', state.city.level);
    this.setText('txt-user-level', state.city.level);
    this.setText('hud-city-name', state.city.name);
    this.setText('hud-xp-current', state.city.xp.toLocaleString());
    this.setText('hud-xp-max', state.city.maxXp.toLocaleString());
    this.setWidth('hud-xp-fill', state.city.xp / state.city.maxXp * 100);

    this.setText('val-cash', state.currencies.cash.toLocaleString());
    this.setText('rate-cash', `+${state.getCashRate().toLocaleString()}/s`);
    this.setText('val-tokens', state.currencies.tokens.toLocaleString());
    this.setText('val-kits-basic', state.currencies.kits.basic.toLocaleString());
    this.setText('val-kits-advanced', state.currencies.kits.advanced.toLocaleString());
    this.setText('val-kits-landmark', state.currencies.kits.landmark.toLocaleString());

    this.setText('txt-owned-basic-kits', state.currencies.kits.basic.toLocaleString());
    this.setText('txt-owned-adv-kits', state.currencies.kits.advanced.toLocaleString());
    this.setText('txt-owned-landmark-kits', state.currencies.kits.landmark.toLocaleString());

    this.setText('mat-wood', state.materials.wood.toLocaleString());
    this.setText('mat-concrete', state.materials.concrete.toLocaleString());
    this.setText('mat-metal', state.materials.metal.toLocaleString());
    this.setText('mat-cap-note', `Stockpile Cap: ${state.materialCap}`);
  }

  drainToasts() {
    if (!GameState.toasts.length) return;
    const pending = GameState.toasts.splice(0, GameState.toasts.length);
    pending.forEach(t => this.showToast(t.message, t.type));
  }

  showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('toast-hide');
      setTimeout(() => toast.remove(), 350);
    }, 2600);

    while (container.children.length > 5) container.firstChild.remove();
  }

  applyTheme() {
    const canvas = document.getElementById('city-canvas');
    if (!canvas) return;
    const theme = GameState.themes.find(t => t.id === GameState.activeTheme) || GameState.themes[0];
    canvas.style.filter = theme.filter || 'none';
  }

  // Small DOM helpers
  setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  setWidth(id, pct) {
    const el = document.getElementById(id);
    if (el) el.style.width = `${Math.max(0, Math.min(100, pct))}%`;
  }

  setHTML(id, html) {
    const el = document.getElementById(id);
    if (!el) return;
    const scrollTop = el.scrollTop;
    el.innerHTML = html;
    el.scrollTop = scrollTop;
  }

  // ==========================================
  // 4. BUILD TAB RENDERER
  // ==========================================
  renderBuildCategory() {
    const category = this.activeBuildCategory;
    const meta = GameState.buildCategories[category] || { title: 'STRUCTURES' };
    const catalog = GameState.buildCatalog[category] || [];
    const slots = GameState.getCategorySlots(category);
    const used = slots.filter(Boolean).length;

    this.setText('txt-build-category-title', meta.title);
    this.setText('txt-build-slot-counter', `(${used} / ${slots.length} SLOTS USED)`);

    const locked = catalog.filter(s => GameState.city.level < s.unlockLevel);
    this.setText('txt-build-hint', locked.length
      ? `${locked.length} card(s) locked — reach City Level ${locked[0].unlockLevel}`
      : 'Select a structure card to construct or upgrade');

    const cards = catalog.map(spec => {
      const instance = slots.find(b => b && b.tier === spec.tier);
      const lockedCard = GameState.city.level < spec.unlockLevel;

      if (lockedCard) {
        return `
          <div class="building-card card-locked">
            <div class="lock-overlay-content">
              <i class="fa-solid fa-lock lock-icon"></i>
              <span class="lock-title">UNLOCKS AT CITY LEVEL ${spec.unlockLevel}</span>
            </div>
          </div>`;
      }

      if (instance) {
        const maxed = instance.level >= 5;
        const cashCost = Math.floor(spec.cost * 0.35 * instance.level);
        const kitCount = Math.max(1, Math.ceil(spec.kitReq.count * 0.5 * instance.level));
        const output = category === 'factory'
          ? `+${(instance.prodRate?.wood || 0).toFixed(1)} Wood/s · +${(instance.prodRate?.concrete || 0).toFixed(1)} Concrete/s${instance.prodRate?.metal ? ` · +${instance.prodRate.metal.toFixed(1)} Metal/s` : ''}`
          : `+₱${instance.incomeRate.toLocaleString()}/s${instance.tourismRate ? ` · +${instance.tourismRate} Tourism/s` : ''}`;

        return `
          <div class="building-card">
            <button class="card-info-btn" data-action="info" data-tier="${spec.tier}" title="Details"><i class="fa-solid fa-circle-info" style="font-size:0.6rem;"></i></button>
            <h4 class="card-title">${spec.name.toUpperCase()}</h4>
            <img src="${spec.image}" class="card-preview-img" alt="${spec.name}" />
            <div class="card-level-badge">Lv. ${instance.level} / 5</div>
            <p class="card-desc">${spec.desc}</p>
            <div class="card-cost-requirements">
              <span class="req-label">CURRENT OUTPUT</span>
              <div class="req-items"><span class="req-item">${output}</span></div>
            </div>
            ${maxed
              ? `<button class="btn-action-green" disabled>MAX LEVEL REACHED</button>`
              : `<button class="btn-action-green" data-action="upgrade" data-tier="${spec.tier}">
                   UPGRADE — <img src="${this.cashIcon}" alt="Cash" /> ${cashCost.toLocaleString()} + ${kitCount} ${spec.kitReq.type.toUpperCase()}
                 </button>`}
          </div>`;
      }

      const cashOk = GameState.currencies.cash >= spec.cost;
      const kitOk = GameState.currencies.kits[spec.kitReq.type] >= spec.kitReq.count;

      return `
        <div class="building-card">
          <button class="card-info-btn" data-action="info" data-tier="${spec.tier}" title="Details"><i class="fa-solid fa-circle-info" style="font-size:0.6rem;"></i></button>
          <h4 class="card-title">${spec.name.toUpperCase()}</h4>
          <img src="${spec.image}" class="card-preview-img" alt="${spec.name}" />
          <div class="card-level-badge">Tier ${spec.tier}</div>
          <p class="card-desc">${spec.desc}</p>
          <div class="card-cost-requirements">
            <span class="req-label">REQUIRES</span>
            <div class="req-items">
              <span class="cost-item ${cashOk ? 'ok' : 'missing'}"><img src="${this.cashIcon}" alt="Cash" /> ${spec.cost.toLocaleString()}</span>
              <span class="cost-item ${kitOk ? 'ok' : 'missing'}"><img src="${this.kitIcons[spec.kitReq.type]}" alt="Kits" /> ${spec.kitReq.count}</span>
            </div>
          </div>
          <button class="btn-action-primary btn-purchase" data-action="buy" data-tier="${spec.tier}">
            <img src="${this.cashIcon}" alt="Cash" /> ${spec.cost.toLocaleString()} — BUILD
          </button>
        </div>`;
    }).join('');

    this.setHTML('build-cards-container', cards);
  }

  // ==========================================
  // 5. PRODUCTION TAB RENDERER
  // ==========================================
  effectiveDuration(recipe, level) {
    const mult = 1 - ((level || 1) - 1) * 0.1;
    return Math.max(10, Math.floor(recipe.baseTimeSeconds * mult));
  }

  kitsPerMin(recipe, level) {
    return Math.max(1, Math.round(recipe.outputAmount * 60 / this.effectiveDuration(recipe, level)));
  }

  ensureActiveFactory() {
    const factories = GameState.getCategorySlots('factory').filter(Boolean);
    const stillValid = factories.some(f => f.id === this.activeProductionFactoryId);
    if (!stillValid) this.activeProductionFactoryId = factories[0]?.id || null;
    return GameState.getFactory(this.activeProductionFactoryId);
  }

  renderProductionDetails() {
    const recipe = GameState.kitRecipes[this.selectedKitType];
    const factory = this.ensureActiveFactory();

    // --- Sidebar factory list (placed + locked entries) ---
    const totalRate = GameState.getCategorySlots('factory').filter(Boolean)
      .reduce((sum, fac) => sum + this.kitsPerMin(recipe, fac.level), 0);
    this.setText('txt-prod-total-rate', `TOTAL: +${totalRate} Kits/min`);

    const factoryList = GameState.buildCatalog.factory.map(spec => {
      const instance = GameState.getPlacedBuilding('factory', spec.tier);
      const locked = GameState.city.level < spec.unlockLevel;
      const isActive = instance && instance.id === this.activeProductionFactoryId;

      let statusClass = 'status-idle';
      let statusLabel = 'Not Built';
      if (locked) { statusClass = 'status-locked'; statusLabel = `Lv. ${spec.unlockLevel}`; }
      else if (instance) {
        statusClass = instance.activeProduction ? 'status-active' : 'status-idle';
        statusLabel = instance.activeProduction ? 'Producing' : 'Idle';
      }

      return `
        <button class="sidebar-btn ${isActive ? 'active' : ''}"
                data-factory-id="${instance ? instance.id : ''}"
                ${instance ? '' : 'data-locked="true"'}>
          <img src="${spec.image}" alt="${spec.name}" />
          <div class="sidebar-btn-meta">
            <span class="btn-title">${spec.name.toUpperCase()}</span>
            <span class="status-tag ${statusClass}">${statusLabel}</span>
          </div>
          <span class="rate-badge">${instance ? `+${this.kitsPerMin(recipe, instance.level)} Kits/min` : `Tier ${spec.tier}`}</span>
        </button>`;
    }).join('');
    this.setHTML('prod-factories-list', factoryList);

    if (!factory) {
      this.setText('txt-prod-fac-name', 'NO FACTORY');
      this.setHTML('container-kit-materials', '<div class="mat-item">Build a factory in the Build tab first.</div>');
      return;
    }

    // --- Factory details header ---
    const spec = GameState.buildCatalog.factory.find(s => s.tier === factory.tier);
    this.setText('txt-prod-fac-name', factory.name.toUpperCase());
    this.setText('txt-prod-fac-level', `Level ${factory.level}`);
    this.setText('txt-prod-fac-rate', `+${this.kitsPerMin(recipe, factory.level)} Kits/min`);
    this.setText('txt-prod-fac-time', this.formatTime(this.effectiveDuration(recipe, factory.level)));
    const facImg = document.getElementById('img-prod-fac-display');
    if (facImg && spec) facImg.src = spec.image;

    // --- Recipe requirement list (materials + kits + tokens) ---
    const reqs = [];
    const pushReq = (icon, label, need, have) => {
      if (need > 0) {
        reqs.push(`<div class="mat-item ${have >= need ? '' : 'missing'}" style="${have >= need ? '' : 'color:#ff7b7b;'}">
          <img src="${icon}" alt="${label}" /> ${label} (${have}/${need})
        </div>`);
      }
    };
    Object.entries(recipe.reqs).forEach(([mat, need]) =>
      pushReq(this.materialIcons[mat], mat.charAt(0).toUpperCase() + mat.slice(1), need, GameState.materials[mat]));
    Object.entries(recipe.kitReqs).forEach(([type, need]) =>
      pushReq(this.kitIcons[type], `${type.charAt(0).toUpperCase() + type.slice(1)} Kits`, need, GameState.currencies.kits[type]));
    if (recipe.tokenReqs > 0) {
      pushReq(this.tokenIcon, 'Tokens', recipe.tokenReqs, GameState.currencies.tokens);
    }
    this.setHTML('container-kit-materials', reqs.join('') || '<div class="mat-item">No requirements</div>');

    // --- Progress bar & actions ---
    const startBtn = document.getElementById('btn-start-prod');
    if (factory.activeProduction) {
      const prod = factory.activeProduction;
      const pct = Math.min(100, prod.elapsedSeconds / prod.totalDuration * 100);
      const remaining = Math.max(0, prod.totalDuration - prod.elapsedSeconds);

      this.setWidth('fill-prod-timer', pct);
      this.setText('txt-prod-timer-readout', `${this.formatTime(prod.elapsedSeconds)} / ${this.formatTime(prod.totalDuration)}`);
      this.setText('txt-current-output-count', `${prod.outputAmount} ${prod.kitType.toUpperCase()} Kits — ${remaining}s left`);

      if (startBtn) {
        startBtn.textContent = `PRODUCING... (${remaining}s)`;
        startBtn.disabled = true;
      }
    } else {
      const check = GameState.canStartProduction(factory.id, this.selectedKitType);
      this.setWidth('fill-prod-timer', 0);
      this.setText('txt-prod-timer-readout', 'Idle — ready');
      this.setText('txt-current-output-count', `0 / ${recipe.outputAmount} ${recipe.label}`);

      if (startBtn) {
        startBtn.textContent = check.ok ? `START ${recipe.label}` : `START — ${check.reason}`;
        startBtn.disabled = false;
      }
    }
  }

  formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = Math.max(0, seconds % 60);
    return `${m}m ${s < 10 ? '0' : ''}${s}s`;
  }

  // ==========================================
  // 6. CITY DEV RENDERER
  // ==========================================
  renderCityDevData() {
    const dev = GameState.city.devProgress;

    const branchUi = {
      roads: { fill: 'fill-dev-infra', text: 'txt-dev-infra', req: 'req-dev-infra', btn: 'btn-upgrade-dev-infra' },
      urban: { fill: 'fill-dev-urban', text: 'txt-dev-urban', req: 'req-dev-urban', btn: 'btn-upgrade-dev-urban' },
      environment: { fill: 'fill-dev-env', text: 'txt-dev-env', req: 'req-dev-env', btn: 'btn-upgrade-dev-env' }
    };

    Object.entries(branchUi).forEach(([key, ui]) => {
      const value = dev[key];
      this.setWidth(ui.fill, value);
      this.setText(ui.text, `${value} / 100`);

      const branch = GameState.devBranches[key];
      const { kits = {}, materials = {} } = branch.costs;
      const parts = [];

      Object.entries(kits).forEach(([type, count]) => {
        const enough = GameState.currencies.kits[type] >= count;
        parts.push(`<span class="cost-item ${enough ? 'ok' : 'missing'}"><img src="${this.kitIcons[type]}" alt="${type}" /> ${count} ${type.toUpperCase()}</span>`);
      });
      Object.entries(materials).forEach(([mat, count]) => {
        const enough = GameState.materials[mat] >= count;
        parts.push(`<span class="cost-item ${enough ? 'ok' : 'missing'}"><img src="${this.materialIcons[mat]}" alt="${mat}" /> ${count} ${mat.charAt(0).toUpperCase() + mat.slice(1)}</span>`);
      });

      this.setHTML(ui.req, parts.join(''));

      const btn = document.getElementById(ui.btn);
      if (btn) {
        if (value >= 100) {
          btn.textContent = 'BRANCH COMPLETE';
          btn.disabled = true;
        } else {
          btn.textContent = 'UPGRADE';
          btn.disabled = false;
        }
      }
    });

    // Header badge & XP bar
    this.setText('dev-header-city-level', GameState.city.level);
    this.setText('dev-xp-current', GameState.city.xp.toLocaleString());
    this.setText('dev-xp-max', GameState.city.maxXp.toLocaleString());
    this.setWidth('dev-xp-fill', GameState.city.xp / GameState.city.maxXp * 100);

    // Advance button + reward badge
    const canAdvance = GameState.canAdvanceCityLevel();
    const advanceBtn = document.getElementById('btn-advance-city');
    const rewardBadge = document.getElementById('dev-reward-badge');

    if (advanceBtn) advanceBtn.classList.toggle('hidden', !canAdvance);
    if (rewardBadge) rewardBadge.classList.toggle('unlocked', canAdvance);
  }

  // ==========================================
  // 7. LANDMARKS RENDERER
  // ==========================================
  renderLandmarks() {
    this.setText('txt-tourism-points', GameState.tourism.points.toLocaleString());
    this.setText('txt-tourism-rate', `+${GameState.getTourismRate()}/s`);

    const cards = GameState.landmarks.map(lm => {
      const rewardRow = `<div class="reward-row">
          <span><i class="fa-solid fa-camera"></i> +${lm.reward.tourism} Tourism</span>
          <span><i class="fa-solid fa-ticket"></i> +${lm.reward.tokens} Tokens</span>
          <span><i class="fa-solid fa-star"></i> +${lm.reward.xp} XP</span>
        </div>`;

      if (lm.restored) {
        return `
          <div class="info-card is-done">
            <div class="info-card-head">
              <span class="info-card-title">${lm.name}</span>
              <span class="chip chip-green">RESTORED</span>
            </div>
            <p class="info-card-desc">${lm.desc}</p>
            ${rewardRow}
          </div>`;
      }

      const kitOk = GameState.currencies.kits.landmark >= lm.reqs.kits;
      const tokenOk = GameState.currencies.tokens >= lm.reqs.tokens;
      const cashOk = GameState.currencies.cash >= lm.reqs.cash;

      return `
        <div class="info-card">
          <div class="info-card-head">
            <span class="info-card-title">${lm.name}</span>
            <span class="chip chip-cyan">DISCOVERED</span>
          </div>
          <p class="info-card-desc">${lm.desc}</p>
          <div class="cost-row">
            <span class="cost-item ${kitOk ? 'ok' : 'missing'}"><img src="${this.kitIcons.landmark}" alt="Kits" /> ${lm.reqs.kits} Landmark Kits</span>
            <span class="cost-item ${tokenOk ? 'ok' : 'missing'}"><img src="${this.tokenIcon}" alt="Tokens" /> ${lm.reqs.tokens} Tokens</span>
            <span class="cost-item ${cashOk ? 'ok' : 'missing'}"><img src="${this.cashIcon}" alt="Cash" /> ${lm.reqs.cash.toLocaleString()}</span>
          </div>
          ${rewardRow}
          <button class="btn-action-primary btn-purchase" data-action="restore" data-id="${lm.id}">RESTORE LANDMARK</button>
        </div>`;
    }).join('');

    this.setHTML('landmarks-list', cards);
  }

  // ==========================================
  // 8. MAP THEMES RENDERER
  // ==========================================
  renderThemes() {
    const cards = GameState.themes.map(theme => {
      const isActive = GameState.activeTheme === theme.id;
      const costParts = [];
      if (theme.cost.cash) costParts.push(`<span class="cost-item ${GameState.currencies.cash >= theme.cost.cash ? 'ok' : 'missing'}"><img src="${this.cashIcon}" alt="Cash" /> ${theme.cost.cash.toLocaleString()}</span>`);
      if (theme.cost.tokens) costParts.push(`<span class="cost-item ${GameState.currencies.tokens >= theme.cost.tokens ? 'ok' : 'missing'}"><img src="${this.tokenIcon}" alt="Tokens" /> ${theme.cost.tokens} Tokens</span>`);

      let chip = '<span class="chip chip-red">LOCKED</span>';
      let button = `<button class="btn-action-primary btn-purchase" data-action="unlock" data-id="${theme.id}">UNLOCK THEME</button>`;
      if (theme.owned) {
        chip = isActive ? '<span class="chip chip-green">ACTIVE</span>' : '<span class="chip chip-cyan">OWNED</span>';
        button = isActive
          ? `<button class="btn-action-green" disabled>APPLIED</button>`
          : `<button class="btn-action-green" data-action="apply" data-id="${theme.id}">APPLY THEME</button>`;
      }

      return `
        <div class="info-card ${theme.owned ? 'is-done' : 'is-locked'}">
          <div class="info-card-head">
            <span class="info-card-title">${theme.name}</span>
            ${chip}
          </div>
          <p class="info-card-desc">${theme.desc}</p>
          ${theme.owned ? '' : `<div class="cost-row">${costParts.join('')}</div>`}
          ${button}
        </div>`;
    }).join('');

    this.setHTML('themes-grid', cards);
  }

  // ==========================================
  // 9. SHOP RENDERER
  // ==========================================
  renderShop() {
    const cards = GameState.shopOffers.map(offer => {
      const costParts = [];
      if (offer.cost.cash) costParts.push(`<span class="cost-item ${GameState.currencies.cash >= offer.cost.cash ? 'ok' : 'missing'}"><img src="${this.cashIcon}" alt="Cash" /> ${offer.cost.cash.toLocaleString()}</span>`);
      if (offer.cost.tokens) costParts.push(`<span class="cost-item ${GameState.currencies.tokens >= offer.cost.tokens ? 'ok' : 'missing'}"><img src="${this.tokenIcon}" alt="Tokens" /> ${offer.cost.tokens} Tokens</span>`);

      return `
        <div class="info-card">
          <div class="info-card-head">
            <span class="info-card-title">${offer.name}</span>
            <span class="chip chip-gold">OFFER</span>
          </div>
          <img src="${offer.icon}" alt="${offer.name}" style="width:44px;height:44px;object-fit:contain;" />
          <p class="info-card-desc">${offer.desc}</p>
          <div class="cost-row">${costParts.join('')}</div>
          <button class="btn-action-primary btn-purchase" data-action="buy-offer" data-id="${offer.id}">PURCHASE</button>
        </div>`;
    }).join('');

    this.setHTML('shop-grid', cards);
  }

  // ==========================================
  // 10. QUESTS RENDERER
  // ==========================================
  renderQuests() {
    const cards = GameState.quests.map(quest => {
      const progress = Math.min(quest.goal, GameState.getQuestProgress(quest));
      const pct = progress / quest.goal * 100;
      const ready = progress >= quest.goal;
      const rewards = quest.rewards || {};
      const rewardParts = [];
      if (rewards.cash) rewardParts.push(`<span><i class="fa-solid fa-coins"></i> ₱${rewards.cash.toLocaleString()}</span>`);
      if (rewards.tokens) rewardParts.push(`<span><i class="fa-solid fa-ticket"></i> ${rewards.tokens} Tokens</span>`);
      if (rewards.xp) rewardParts.push(`<span><i class="fa-solid fa-star"></i> ${rewards.xp} XP</span>`);

      return `
        <div class="info-card ${quest.claimed ? 'is-done' : ''}">
          <div class="info-card-head">
            <span class="info-card-title">${quest.title}</span>
            <span class="chip ${quest.claimed ? 'chip-green' : ready ? 'chip-gold' : 'chip-cyan'}">${quest.claimed ? 'DONE' : ready ? 'READY' : 'IN PROGRESS'}</span>
          </div>
          <p class="info-card-desc">${quest.desc}</p>
          <div class="dev-progress-bar-wrap">
            <div class="dev-progress-fill" style="width: ${pct}%;"></div>
          </div>
          <div class="quest-progress-meta">
            <span>PROGRESS</span>
            <span>${progress} / ${quest.goal}</span>
          </div>
          <div class="reward-row">${rewardParts.join('')}</div>
          ${quest.claimed
            ? `<div class="claimed-tag"><i class="fa-solid fa-check"></i> REWARD CLAIMED</div>`
            : `<button class="btn-action-primary btn-purchase" data-action="claim" data-id="${quest.id}">${ready ? 'CLAIM REWARD' : 'IN PROGRESS'}</button>`}
        </div>`;
    }).join('');

    this.setHTML('quests-list', cards);
  }
}
