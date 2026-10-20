// js/firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCipipR2Acy-jpCNCohhZAtltP6zP8F4As",
  authDomain: "project-bahandi-tycoon.firebaseapp.com",
  projectId: "project-bahandi-tycoon",
  storageBucket: "project-bahandi-tycoon.firebasestorage.app",
  messagingSenderId: "632012716563",
  appId: "1:632012716563:web:85040b22ac5183bd795de6"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);