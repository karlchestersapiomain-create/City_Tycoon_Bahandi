import { GameState } from './core/GameState.js';
import { UIController } from './ui/UIController.js';
import { IsoEngine } from './engine/IsoEngine.js';

/**
 * TycoonApp — composition root.
 * Wires the isometric map engine, the UI controller, and the 1s economy tick.
 */
class TycoonApp {
  constructor() {
    console.log('Initializing Project Bahandi — City Tycoon Engine...');

    // 1. Game data state (loads any previous save from localStorage)
    this.state = GameState;

    // 2. 2.5D isometric map renderer (buildings on the map canvas come later)
    this.isoEngine = new IsoEngine('city-canvas', 'assets/images/map/base_map.png');

    // 3. UI controller — binds every dock tab, panel button, and card action
    this.ui = new UIController();

    // 4. Economy loop: material generation, income, tourism, production timers
    this.startEngineLoop();

    // 5. Hide broken image assets gracefully (several icons are still pending)
    this.watchBrokenImages();

    window.app = this;
  }

  startEngineLoop() {
    if (this._loopHandle) clearInterval(this._loopHandle);
    this._loopHandle = setInterval(() => {
      this.state.tick();
    }, 1000);
  }

  watchBrokenImages() {
    document.addEventListener('error', (e) => {
      const target = e.target;
      if (target && target.tagName === 'IMG') target.classList.add('img-missing');
    }, true);
  }
}

// Instantiate App once the DOM is ready (module scripts run before DOMContentLoaded)
document.addEventListener('DOMContentLoaded', () => {
  window.app = new TycoonApp();
});
