// Import and configure Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCt6CP-X7ds3fh8XK72fDx-4sMk1LFcOZk",
  authDomain: "shipping-wars.firebaseapp.com",
  projectId: "shipping-wars",
  storageBucket: "shipping-wars.firebasestorage.app",
  messagingSenderId: "513999333956",
  appId: "1:513999333956:web:8327a647aa8f3efa15ea11",
  measurementId: "G-JPYNN55M3X"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
