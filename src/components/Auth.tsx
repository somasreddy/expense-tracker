import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  sendOtp,
  verifyOtp,
  signOut,
} from "../firebase";

const Auth = () => {
  const [mode, setMode] = useState<"login" | "signup" | "forgotPassword" | "loginWithOtp" | "verifySignup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

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

  const handleSendOtp = async () => {
    setError(null);
    setMessage(null);
    setLoading(true);

    if (!email) {
      setError("Please enter your email address.");
      setLoading(false);
      return;
    }

    try {
      await sendOtp(email);
      setMessage("✅ OTP sent! Check your email for the code.");
      setOtpSent(true);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // If mode is verifySignup, use 'signup' type, otherwise 'email' (for login)
      const type = mode === "verifySignup" ? "signup" : "email";
      await verifyOtp(email, otp, type);
      // Success - auth listener will handle redirect/state update
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Invalid code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      if (mode === "login") {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        if (!name.trim()) {
          setError("Please enter your name.");
          setLoading(false);
          return;
        }
        const { user, session } = await createUserWithEmailAndPassword(
          auth,
          email,
          password,
          name
        );

        // If no session OR user is not confirmed, enforce verification
        // We check emailConfirmedAt to catch cases where "Allow unconfirmed users to sign in" is ON
        if (!session || (user && !user.emailConfirmedAt)) {
          // If we have a session but want to enforce verification, sign out first
          if (session) {
            await signOut(auth);
          }

          setMode("verifySignup");
          setMessage("✅ Account created! Please check your email for the verification code.");
          setOtpSent(true); // Reuse this to show the input immediately
          setLoading(false);
          return;
        }

        if (auth.currentUser) {
          await updateProfile(auth.currentUser, { displayName: name });
        }
      }
    } catch (err: any) {
      console.error(err);
      let msg = "An error occurred. Please try again.";

      if (err.code === "auth/invalid-email" || err.message?.includes("Invalid email")) {
        msg = "Invalid email address.";
      } else if (err.code === "auth/user-not-found" || err.message?.includes("Invalid login")) {
        msg = "No account found with this email.";
      } else if (err.code === "auth/wrong-password" || err.message?.includes("Invalid login")) {
        msg = "Incorrect password.";
      } else if (err.code === "auth/email-already-in-use" || err.message?.includes("already registered")) {
        msg = "An account with this email already exists.";
      } else if (err.code === "auth/weak-password" || err.message?.includes("password")) {
        msg = "Password should be at least 6 characters.";
      } else if (err.message) {
        msg = err.message;
      }

      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const getHeader = () => {
    switch (mode) {
      case "login":
        return "Welcome Back";
      case "signup":
        return "Create an Account";
      case "forgotPassword":
        return "Reset Password";
      case "loginWithOtp":
        return "Login with Code";
      case "verifySignup":
        return "Verify Email";
      default:
        return "Authentication";
    }
  };

  const getFooterLink = () => {
    if (mode === "login") return "Don't have an account? Sign up";
    return "Already have an account? Login";
  };

  const handleModeSwitch = () => {
    if (mode === "forgotPassword" || mode === "loginWithOtp" || mode === "verifySignup") {
      setMode("login");
      setError(null);
      setMessage(null);
      setOtpSent(false);
      setOtp("");
      return;
    }
    setMode((m) => (m === "login" ? "signup" : "login"));
    setError(null);
    setMessage(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--bg-body)] transition-colors duration-500">
      <div className="card-surface p-8 max-w-md w-full shadow-2xl border border-[var(--border-subtle)]">
        <h1 className="text-3xl font-bold mb-6 text-center text-[var(--text-main)]">
          {getHeader()}
        </h1>

        {error && (
          <div className="mb-6 text-sm text-red-200 bg-red-900/50 border border-red-800 rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        {message && !error && (
          <div className="mb-6 text-sm text-green-200 bg-green-900/50 border border-green-800 rounded-lg px-4 py-3">
            {message}
          </div>
        )}

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

            <div className="text-center mt-4">
              <span className="text-sm text-[var(--text-muted)]">Or try </span>
              <button
                type="button"
                onClick={() => { setMode("loginWithOtp"); setError(null); setMessage(null); }}
                className="text-sm text-[var(--text-highlight)] hover:underline"
              >
                Login with Code
              </button>
            </div>
          </form>
        ) : mode === "loginWithOtp" || mode === "verifySignup" ? (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <p className="text-sm text-[var(--text-muted)]">
              {mode === "verifySignup"
                ? "We've sent a verification code to your email. Enter it below to confirm your account."
                : "Enter your email to receive a one-time login code. This bypasses password issues."}
            </p>

            {mode === "loginWithOtp" && (
              <div>
                <label className="block text-sm font-medium mb-2 text-[var(--text-muted)]">
                  Email
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    className="input-base w-full"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={otpSent}
                  />
                  {!otpSent && (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={loading || !email}
                      className="button button-secondary whitespace-nowrap"
                    >
                      {loading ? "..." : "Send Code"}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* For verifySignup, email is already set and code is sent automatically by signup process */}
            {(otpSent || mode === "verifySignup") && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
                <label className="block text-sm font-medium mb-2 text-[var(--text-muted)]">
                  Enter 6-digit Code
                </label>
                <input
                  type="text"
                  className="input-base w-full text-center text-2xl tracking-widest"
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  maxLength={6}
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="button button-primary w-full py-3 mt-4 font-bold text-lg shadow-lg"
                >
                  {loading ? "Verifying..." : "Verify & Login"}
                </button>
                {mode === "loginWithOtp" && (
                  <button
                    type="button"
                    onClick={() => setOtpSent(false)}
                    className="w-full text-center text-xs text-[var(--text-muted)] mt-4 hover:text-[var(--text-main)]"
                  >
                    Resend Code
                  </button>
                )}
              </motion.div>
            )}
            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => { setMode("login"); setError(null); setMessage(null); setOtpSent(false); setOtp(""); }}
                className="text-sm text-[var(--text-highlight)] hover:underline"
              >
                Back to Login
              </button>
            </div>
          </form>
        ) : (
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

            {mode === "login" && (
              <div className="flex justify-between items-center">
                <button
                  type="button"
                  className="text-xs text-[var(--text-muted)] hover:text-[var(--text-main)]"
                  onClick={() => {
                    setMode("loginWithOtp");
                    setError(null);
                    setMessage(null);
                  }}
                >
                  Login with Code
                </button>
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

        <div className="mt-6 text-center">
          <button
            className="text-sm text-[var(--text-highlight)] hover:underline focus:outline-none transition-opacity hover:opacity-80"
            onClick={handleModeSwitch}
          >
            {mode === "forgotPassword" || mode === "loginWithOtp" || mode === "verifySignup" ? "" : getFooterLink()}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;