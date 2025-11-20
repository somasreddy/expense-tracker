// src/firebase.ts
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
  // ✅ ADD THIS FUNCTION
  sendPasswordResetEmail,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD33zFMo1N-HyxIUF2OdFXt5vrafjzGWIU",
  authDomain: "expense-tracker-13724.firebaseapp.com",
  projectId: "expense-tracker-13724",
  storageBucket: "expense-tracker-13724.appspot.com",
  messagingSenderId: "285906425136",
  appId: "1:285906425136:web:4478db130351fd6b6f24f5",
  measurementId: "G-3HHPKLFJ62",
};

// Init Firebase
const app = initializeApp(firebaseConfig);

// Auth
export const auth = getAuth(app);

// Persist login across refresh
setPersistence(auth, browserLocalPersistence).catch((err) => {
  console.error("Failed to set auth persistence", err);
});

// Firestore
export const db = getFirestore(app);

// Re-exports for convenience
export {
  onAuthStateChanged,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  // ✅ ADD THIS EXPORT
  sendPasswordResetEmail,
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
};

export default app;