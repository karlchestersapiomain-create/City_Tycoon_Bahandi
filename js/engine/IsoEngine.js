/**
 * Project Bahandi City Tycoon - 2.5D Isometric Engine
 * Handles base map PNG image rendering, camera panning with momentum,
 * zooming, and isometric tile picking.
 */

export class IsoEngine {
  constructor(canvasId = 'city-canvas', imagePath = 'assets/images/map/base_map.png') {
    // Canvas target fallback if ID mismatches
    this.canvas = document.getElementById(canvasId) || document.getElementById('city-canvas') || document.querySelector('canvas');
    
    if (!this.canvas) {
      console.error(`IsoEngine Error: Canvas element with ID "${canvasId}" not found in DOM.`);
      return;
    }

    this.ctx = this.canvas.getContext('2d');

    // Base Map Image Properties
    this.mapImage = new Image();
    this.isImageLoaded = false;
    this.imagePath = imagePath;

    // World & Grid Specs (Standard 2:1 Isometric Ratio)
    this.gridWidth = 16;   // 16x16 Tile Base Map
    this.gridHeight = 16;
    this.tileWidth = 128;  // Base Tile Width (px)
    this.tileHeight = 64;  // Base Tile Height (px)

    // Camera Transformation & Zoom
    this.cameraOffset = { x: 0, y: 0 };
    this.zoom = 1;
    this.minZoom = 0.4;
    this.maxZoom = 2.5;

    // Pan / Drag State
    this.isDragging = false;
    this.dragStart = { x: 0, y: 0 };
    this.velocity = { x: 0, y: 0 };
    this.friction = 0.90; // Inertia damping

    // Hover / Interaction State
    this.hoveredTile = { x: -1, y: -1 };

    this.init();
  }

  init() {
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());

    // Load Base Map Image
    this.loadMapImage();

    // Center Camera Viewport
    this.centerCamera();

    // Attach User Input Controls
    this.setupControls();

    // Start Engine Render Loop
    this.renderLoop();
  }

  loadMapImage() {
    this.mapImage.src = this.imagePath;
    this.mapImage.onload = () => {
      this.isImageLoaded = true;
      console.log(`Base map successfully loaded from: ${this.imagePath}`);
    };
    this.mapImage.onerror = () => {
      console.warn(`[IsoEngine] Failed to load image at "${this.imagePath}". Showing procedural grid fallback.`);
      this.isImageLoaded = false;
    };
  }

  resizeCanvas() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  centerCamera() {
    this.cameraOffset.x = this.canvas.width / 2;
    this.cameraOffset.y = this.canvas.height / 4;
  }

  /**
   * Converts Isometric Grid Coordinates (x, y) to Screen Coordinates (px)
   */
  gridToScreen(gridX, gridY) {
    const screenX = (gridX - gridY) * (this.tileWidth / 2) * this.zoom + this.cameraOffset.x;
    const screenY = (gridX + gridY) * (this.tileHeight / 2) * this.zoom + this.cameraOffset.y;
    return { x: screenX, y: screenY };
  }

  /**
   * Converts Screen Coordinates (px) back to Isometric Grid Coordinates (x, y)
   */
  screenToGrid(screenX, screenY) {
    const adjX = (screenX - this.cameraOffset.x) / this.zoom;
    const adjY = (screenY - this.cameraOffset.y) / this.zoom;

    const gridX = Math.floor((adjX / (this.tileWidth / 2) + adjY / (this.tileHeight / 2)) / 2);
    const gridY = Math.floor((adjY / (this.tileHeight / 2) - adjX / (this.tileWidth / 2)) / 2);

    return { x: gridX, y: gridY };
  }

  setupControls() {
    this.canvas.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.dragStart.x = e.clientX - this.cameraOffset.x;
      this.dragStart.y = e.clientY - this.cameraOffset.y;
      this.velocity = { x: 0, y: 0 };
      this.canvas.style.cursor = 'grabbing';
    });

    window.addEventListener('mousemove', (e) => {
      if (this.isDragging) {
        const newX = e.clientX - this.dragStart.x;
        const newY = e.clientY - this.dragStart.y;

        this.velocity.x = newX - this.cameraOffset.x;
        this.velocity.y = newY - this.cameraOffset.y;

        this.cameraOffset.x = newX;
        this.cameraOffset.y = newY;
      }

      this.hoveredTile = this.screenToGrid(e.clientX, e.clientY);
    });

    window.addEventListener('mouseup', () => {
      if (this.isDragging) {
        this.isDragging = false;
        this.canvas.style.cursor = 'grab';
      }
    });

    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
      const newZoom = Math.min(Math.max(this.zoom * zoomFactor, this.minZoom), this.maxZoom);

      this.cameraOffset.x = e.clientX - (e.clientX - this.cameraOffset.x) * (newZoom / this.zoom);
      this.cameraOffset.y = e.clientY - (e.clientY - this.cameraOffset.y) * (newZoom / this.zoom);
      this.zoom = newZoom;
    }, { passive: false });
  }

  drawTile(gridX, gridY, fillColor, borderColor = 'rgba(255,255,255,0.2)') {
    const pos = this.gridToScreen(gridX, gridY);
    const w = this.tileWidth * this.zoom;
    const h = this.tileHeight * this.zoom;

    this.ctx.beginPath();
    this.ctx.moveTo(pos.x, pos.y);
    this.ctx.lineTo(pos.x + w / 2, pos.y + h / 2);
    this.ctx.lineTo(pos.x, pos.y + h);
    this.ctx.lineTo(pos.x - w / 2, pos.y + h / 2);
    this.ctx.closePath();

    if (fillColor) {
      this.ctx.fillStyle = fillColor;
      this.ctx.fill();
    }

    if (borderColor) {
      this.ctx.strokeStyle = borderColor;
      this.ctx.lineWidth = 1 * this.zoom;
      this.ctx.stroke();
    }
  }

  renderLoop() {
    if (!this.canvas || !this.ctx) return;

    // Apply Momentum Inertia
    if (!this.isDragging && (Math.abs(this.velocity.x) > 0.01 || Math.abs(this.velocity.y) > 0.01)) {
      this.cameraOffset.x += this.velocity.x;
      this.cameraOffset.y += this.velocity.y;
      this.velocity.x *= this.friction;
      this.velocity.y *= this.friction;
    }

    // Clear Screen
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (this.isImageLoaded) {
      // 1. Draw Base Map Image
      const imgWidth = this.mapImage.width * this.zoom;
      const imgHeight = this.mapImage.height * this.zoom;

      const drawX = this.cameraOffset.x - imgWidth / 2;
      const drawY = this.cameraOffset.y;

      this.ctx.drawImage(this.mapImage, drawX, drawY, imgWidth, imgHeight);

      // 2. Draw Hover Tile Highlight over PNG
      if (
        this.hoveredTile.x >= 0 && this.hoveredTile.x < this.gridWidth &&
        this.hoveredTile.y >= 0 && this.hoveredTile.y < this.gridHeight
      ) {
        this.drawTile(this.hoveredTile.x, this.hoveredTile.y, 'rgba(243, 156, 18, 0.45)', '#f39c12');
      }
    } else {
      // Fallback: Render Procedural Grid if Image fails to load
      for (let x = 0; x < this.gridWidth; x++) {
        for (let y = 0; y < this.gridHeight; y++) {
          let tileColor = '#4e8c46';
          if (x === 8 || y === 8) tileColor = '#555555';
          if (x === this.hoveredTile.x && y === this.hoveredTile.y) tileColor = '#f39c12';

          this.drawTile(x, y, tileColor, '#2d5a27');
        }
      }
    }

    requestAnimationFrame(() => this.renderLoop());
  }
}