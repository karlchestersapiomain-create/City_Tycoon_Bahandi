import { auth, db } from "./firebase-config.js";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut 
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

// ==========================================
// 1. REGISTER NEW STUDENT
// ==========================================
export async function registerStudent(email, password, displayName) {
  try {
    // Create login in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Create student database document in Firestore
    await setDoc(doc(db, "users", user.uid), {
      studentInfo: {
        userId: user.uid,
        schoolEmail: email,
        displayName: displayName,
        avatarId: "avatar_01",
        createdAt: new Date().toISOString()
      },
      currencies: {
        cash: 1000,
        tokens: 50,
        materials: { wood: 10, stone: 10, produce: 0 }
      },
      economyStatus: {
        gdp: 500,
        healthPercentage: 100,
        currentTourism: 10
      },
      miniGamesData: {
        totalRawMaterialsCollected: 0,
        scores: {}
      },
      cityTycoonData: {
        baseMapLevel: 1,
        discoveredLandmarksCount: 1,
        cityHallLevel: 1,
        slots: {
          townHallSlot: { buildingId: "molo_mansion", currentLevel: 1 }
        }
      }
    });

    console.log("Student registered & database created for:", user.uid);
    alert("Account created successfully!");
    return user;
  } catch (error) {
    console.error("Registration Error:", error.message);
    alert("Error creating account: " + error.message);
  }
}

// ==========================================
// 2. LOGIN EXISTING STUDENT
// ==========================================
export async function loginStudent(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("Student logged in:", userCredential.user.uid);
    return userCredential.user;
  } catch (error) {
    console.error("Login Error:", error.message);
    alert("Login failed: Check your email and password.");
  }
}

// ==========================================
// 3. LOGOUT
// ==========================================
export async function logoutUser() {
  await signOut(auth);
  window.location.href = "index.html";
}