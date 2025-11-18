// firebase.ts
import { initializeApp } from "firebase/app";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
  onAuthStateChanged,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyD33zFMo1N-HyxIUF2OdFXt5vrafjzGWIU",
  authDomain: "expense-tracker-13724.firebaseapp.com",
  projectId: "expense-tracker-13724",
  storageBucket: "expense-tracker-13724.appspot.com",
  messagingSenderId: "285906425136",
  appId: "1:285906425136:web:4478db130351fd6b6f24f5",
  measurementId: "G-3HHPKLFJ62",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Auth
export const auth = getAuth(app);

// 🔐 Persist login across refreshes & GitHub Pages deployments
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error("Failed to set auth persistence", error);
});

// Firestore
export const db = getFirestore(app);

// Re-export frequently used Firebase & Firestore helpers
export {
  onAuthStateChanged,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
};

export default app;
