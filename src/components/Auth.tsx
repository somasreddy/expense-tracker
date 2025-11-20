import React, { useState } from "react";
import {
  auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
} from "../firebase";

const Auth = () => {
  // Now tracks three modes: login, signup, and forgotPassword
  const [mode, setMode] = useState<"login" | "signup" | "forgotPassword">(
    "login"
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // State for success/info message (used for password reset)
  const [message, setMessage] = useState<string | null>(null);

  // --- Forgot Password Handler ---
  const handleForgotPassword = async () => {
    setError(null);
    setMessage(null);
    setLoading(true);

    if (!email) {
      setError("Please enter your email address to reset your password.");
      setLoading(false);
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage(
        "✅ Password reset email sent! Check your inbox (and spam folder) to continue."
      );
      // Switch back to login mode after success
      setMode("login"); 
    } catch (err: any) {
      console.error(err);
      let msg = "Failed to send reset email. Please try again.";
      if (err.code === "auth/invalid-email") msg = "The email address is not valid.";
      if (err.code === "auth/user-not-found") msg = "We could not find an account with that email.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // --- Login/Signup Handler ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null); 
    setLoading(true);
    
    try {
      if (mode === "signup") {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        if (name) {
          await updateProfile(cred.user, { displayName: name });
        }
      } else { // mode === 'login'
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      console.error(err);
      let msg = "Authentication failed";
      if (err.code === "auth/invalid-credential") msg = "Invalid email or password.";
      if (err.code === "auth/email-already-in-use") msg = "Email already in use.";
      if (err.code === "auth/weak-password") msg = "Password should be at least 6 characters.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Helper to determine the main header text
  const getHeader = () => {
    if (mode === "signup") return "Create Account";
    if (mode === "forgotPassword") return "Reset Password";
    return "Login";
  };
  
  // Helper to determine the footer link text
  const getFooterLink = () => {
    if (mode === "login") return "Don't have an account? Sign up";
    return "Already have an account? Login";
  }

  // Helper to handle switching back to login/signup
  const handleModeSwitch = () => {
    // If in forgotPassword mode, go back to login
    if (mode === "forgotPassword") {
        setMode("login");
        setError(null);
        setMessage(null);
        return;
    }
    // Toggle between login and signup
    setMode((m) => (m === "login" ? "signup" : "login"));
    setError(null);
    setMessage(null);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--bg-body)] transition-colors duration-500">
      <div className="card-surface p-8 max-w-md w-full shadow-2xl border border-[var(--border-subtle)]">
        
        <h1 className="text-3xl font-bold mb-6 text-center text-[var(--text-main)]">
          {getHeader()}
        </h1>

        {/* Display Error Message */}
        {error && (
          <div className="mb-6 text-sm text-red-200 bg-red-900/50 border border-red-800 rounded-lg px-4 py-3">
            {error}
          </div>
        )}
        
        {/* Display Success Message */}
        {message && !error && (
            <div className="mb-6 text-sm text-green-200 bg-green-900/50 border border-green-800 rounded-lg px-4 py-3">
                {message}
            </div>
        )}

        {/* --- FORGOT PASSWORD MODE --- */}
        {mode === "forgotPassword" ? (
          <form onSubmit={(e) => { e.preventDefault(); handleForgotPassword(); }} className="space-y-5">
            <p className="text-sm text-[var(--text-muted)]">
                Enter your email address and we'll send you a link to reset your password.
            </p>
            <div>
              <label className="block text-sm font-medium mb-2 text-[var(--text-muted)]">
                Email
              </label>
              <input
                type="email"
                className="input-base w-full"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="button button-primary w-full py-3 mt-2 font-bold text-lg shadow-lg"
            >
              {loading ? "Sending..." : "Send Reset Email"}
            </button>
          </form>
        ) : (
          /* --- LOGIN / SIGNUP MODE --- */
          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === "signup" && (
              <div>
                <label className="block text-sm font-medium mb-2 text-[var(--text-muted)]">
                  Name
                </label>
                <input
                  className="input-base w-full"
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium mb-2 text-[var(--text-muted)]">
                Email
              </label>
              <input
                type="email"
                className="input-base w-full"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2 text-[var(--text-muted)]">
                Password
              </label>
              <input
                type="password"
                className="input-base w-full"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            {/* FORGOT PASSWORD LINK - Only visible in Login Mode */}
            {mode === "login" && (
                <div className="flex justify-end">
                    <button
                        type="button"
                        className="text-xs text-[var(--text-highlight)] hover:underline focus:outline-none transition-opacity hover:opacity-80"
                        onClick={() => {
                            setMode("forgotPassword");
                            setError(null);
                            setMessage(null);
                        }}
                    >
                        Forgot Password?
                    </button>
                </div>
            )}


            <button
              type="submit"
              disabled={loading}
              className="button button-primary w-full py-3 mt-2 font-bold text-lg shadow-lg"
            >
              {loading
                ? "Please wait..."
                : mode === "login"
                ? "Login"
                : "Sign Up"}
            </button>
          </form>
        )}

        {/* Footer Link */}
        <div className="mt-6 text-center">
          <button
            className="text-sm text-[var(--text-highlight)] hover:underline focus:outline-none transition-opacity hover:opacity-80"
            onClick={handleModeSwitch}
          >
            {mode === "forgotPassword" ? "Back to Login" : getFooterLink()}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;