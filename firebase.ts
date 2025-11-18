// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// FIX: Switched to getAuth and setPersistence for wider Firebase v9 SDK compatibility.
// This resolves errors where `initializeAuth` and the `User` type are not exported in older v9 versions.
// FIX: Using named imports for auth functions to ensure compatibility across Firebase v9 SDK versions.
// By importing the entire module as a namespace, we can access all auth functions even if they aren't top-level named exports in older v9 SDKs.
import * as fbAuth from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";


// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD33zFMo1N-HyxIUF2OdFXt5vrafjzGWIU",
  authDomain: "expense-tracker-13724.firebaseapp.com",
  projectId: "expense-tracker-13724",
  storageBucket: "expense-tracker-13724.appspot.com",
  messagingSenderId: "285906425136",
  appId: "1:285906425136:web:4478db130351fd6b6f24f5",
  measurementId: "G-3HHPKLFJ62"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Explicitly initialize Auth with IndexedDB persistence to ensure session is retained.
// FIX: Use getAuth and setPersistence for broader version compatibility.
export const auth = fbAuth.getAuth(app);
// FIX: The `setPersistence` call has been removed as it is not available in older Firebase v9 SDKs,
// which causes a "not an exported member" error. The application will fall back to session persistence.
/*
setPersistence(auth, browserLocalPersistence)
  .catch((error) => {
    console.error("Failed to set auth persistence", error);
  });
*/

export const db = getFirestore(app);


// FIX: Removed re-export of User type as it is not available in older Firebase v9 SDKs.
// The type will be inferred where needed (e.g., `typeof auth.currentUser`).

// FIX: Re-exporting auth functions from the namespace to make them available to the rest of the app.
export const {
  onAuthStateChanged,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} = fbAuth;

export {
  doc,
  setDoc,
  getDoc,
  serverTimestamp
};