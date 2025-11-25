// src/firebase.ts
// ⚠️ This is now a *compatibility layer* that exposes a Firebase-like API
// but internally uses Supabase for authentication only.
// Firestore-related exports (db, doc, getDoc, setDoc, serverTimestamp, etc.)
// have been removed. All data persistence is now handled via Supabase in
// src/services/expenseService.ts.

import { supabase } from "./supabaseClient";

// Minimal user type our app cares about
export interface AuthUser {
  uid: string;
  email?: string;
  displayName?: string | null;
  emailConfirmedAt?: string | null;
}

// Internal state
let currentUser: AuthUser | null = null;
type AuthListener = (user: AuthUser | null) => void;
const listeners: AuthListener[] = [];

// Simple auth object with currentUser getter
export const auth = {
  get currentUser() {
    return currentUser;
  },
};

// Map Supabase user → our AuthUser
const mapSupabaseUser = (user: any | null): AuthUser | null => {
  if (!user) return null;
  return {
    uid: user.id,
    email: user.email ?? undefined,
    displayName:
      user.user_metadata?.display_name ??
      user.user_metadata?.full_name ??
      null,
    emailConfirmedAt: user.email_confirmed_at ?? null,
  };
};

const notifyListeners = () => {
  for (const cb of listeners) {
    try {
      cb(currentUser);
    } catch (e) {
      console.error("[Auth] listener error", e);
    }
  }
};

// Initialize from existing session
supabase.auth.getUser().then(({ data }) => {
  currentUser = mapSupabaseUser(data?.user ?? null);
  notifyListeners();
});

// Subscribe to Supabase auth state changes
supabase.auth.onAuthStateChange((_event, session) => {
  currentUser = mapSupabaseUser(session?.user ?? null);
  notifyListeners();
});

// Firebase-style onAuthStateChanged(auth, callback)
export const onAuthStateChanged = (
  _auth: typeof auth,
  callback: (user: AuthUser | null) => void
) => {
  listeners.push(callback);
  // immediate call
  callback(currentUser);

  // Return unsubscribe
  return () => {
    const idx = listeners.indexOf(callback);
    if (idx >= 0) listeners.splice(idx, 1);
  };
};

// ---- Auth operations ----

// sign up with email & password
export const createUserWithEmailAndPassword = async (
  _auth: typeof auth,
  email: string,
  password: string,
  displayName?: string
) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: displayName,
        full_name: displayName, // Some apps use full_name
      },
    },
  });

  if (error) {
    throw error;
  }

  // If email confirmation is enabled, data.user might be returned but session might be null
  // We still return the user so the UI can decide what to show
  currentUser = mapSupabaseUser(data.user ?? null);
  notifyListeners();

  return { user: currentUser, session: data.session };
};

// login with email & password
export const signInWithEmailAndPassword = async (
  _auth: typeof auth,
  email: string,
  password: string
) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  currentUser = mapSupabaseUser(data.user ?? null);
  notifyListeners();

  return { user: currentUser };
};

// update profile (displayName)
export const updateProfile = async (
  _user: AuthUser,
  updates: { displayName?: string }
) => {
  const { displayName } = updates;

  const { data, error } = await supabase.auth.updateUser({
    data: {
      display_name: displayName,
    },
  });

  if (error) throw error;

  currentUser = mapSupabaseUser(data.user ?? null);
  notifyListeners();
};

// send password reset email
export const sendPasswordResetEmail = async (
  _auth: typeof auth,
  email: string
) => {
  const redirectUrl = window.location.origin + window.location.pathname + "#type=recovery";
  console.log("🔗 Password Reset Redirect URL:", redirectUrl);
  console.log("   - Origin:", window.location.origin);
  console.log("   - Pathname:", window.location.pathname);

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin + window.location.pathname + "#type=recovery",
  });

  if (error) {
    throw error;
  }
};

// sign out
export const signOut = async (_auth?: typeof auth) => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw error;
  }
  currentUser = null;
  notifyListeners();
};

// OTP Login Support
export const sendOtp = async (email: string) => {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: false, // Only allow existing users to login via OTP
    },
  });
  if (error) throw error;
};

export const verifyOtp = async (email: string, token: string, type: "email" | "signup" | "recovery" | "magiclink" = "email") => {
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type,
  });

  if (error) throw error;

  currentUser = mapSupabaseUser(data.user ?? null);
  notifyListeners();
  return { user: currentUser, session: data.session };
};
