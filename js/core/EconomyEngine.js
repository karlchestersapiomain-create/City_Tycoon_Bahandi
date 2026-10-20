// js/game/tycoon-engine.js
import { db } from "../firebase-config.js";
import { checkAuth, logoutUser } from "../auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

// 1. Listen for Logout Button
document.getElementById("logout-btn")?.addEventListener("click", logoutUser);

// 2. Protect route: Only run game if student is logged in
checkAuth(async (user) => {
  console.log("Loading City Tycoon for user:", user.uid);

  // Fetch student document from Firestore
  const userDocRef = doc(db, "users", user.uid);
  const userDoc = await getDoc(userDocRef);

  if (userDoc.exists()) {
    const data = userDoc.data();
    
    // Update UI HUD
    document.getElementById("cash-display").innerText = data.currencies.cash;
    document.getElementById("tokens-display").innerText = data.currencies.tokens;
    document.getElementById("tourism-display").innerText = data.economyStatus.currentTourism;

    // Start Pixi.js Engine
    initPixiGame(data.cityTycoonData);
  }
});

function initPixiGame(tycoonData) {
  // Create Pixi Application
  const app = new PIXI.Application({
    width: window.innerWidth,
    height: window.innerHeight - 60,
    backgroundColor: 0x3a7d44, // Grass green background
    resolution: window.devicePixelRatio || 1,
    autoDensity: true
  });

  document.getElementById("canvas-container").appendChild(app.view);

  // Create a container for the Isometric Grid
  const gridContainer = new PIXI.Container();
  app.stage.addChild(gridContainer);

  console.log("Pixi.js initialized successfully!");
}