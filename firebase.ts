// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// FIX: Import all required auth functions and types in this central file to be re-exported.
// The original named imports fail to resolve. Using a namespace import (`* as ...`) is a common
// workaround for module resolution issues in some bundler/TypeScript configurations.
// FIX: Switched from a namespace import to named imports for `firebase/auth`. This is the standard
// approach for the Firebase v9 modular SDK and resolves the compile-time errors where functions
// and types were not found on the imported namespace.
// FIX: Reverted to a namespace import (`* as fbAuth`) as the named imports are failing to resolve,
// likely due to a build configuration issue. This ensures all auth functions are correctly accessed.
// FIX: Switched to named imports for `firebase/auth` as per the Firebase v9 modular SDK standard. This resolves the module resolution errors.
// FIX: Reverted to a namespace import for `firebase/auth` to resolve module resolution errors.
import * as fbAuth from "firebase/auth";

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

// Initialize Firebase Authentication and get a reference to the service
// This is then exported for use in other parts of the application.
export const auth = fbAuth.getAuth(app);

// FIX: Re-export auth functions and types to centralize imports and resolve module resolution issues.
// Replaced individual constant exports with a cleaner re-export syntax using the named imports.
// Destructure and re-export from the namespace import to work around module resolution issues.
export const {
  onAuthStateChanged,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} = fbAuth;
export type User = fbAuth.User;
