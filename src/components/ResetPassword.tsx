import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

const ResetPassword: React.FC = () => {
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    // Check if we have a valid reset token
    useEffect(() => {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get("access_token");
        const type = hashParams.get("type");

        if (type !== "recovery" || !accessToken) {
            setError("Invalid or expired password reset link. Please request a new one.");
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (newPassword.length < 6) {
            setError("Password must be at least 6 characters long.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);

        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword,
            });

            if (error) throw error;

            setSuccess(true);

            // Redirect to login after 3 seconds
            setTimeout(() => {
                window.location.href = window.location.origin;
            }, 3000);
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Failed to reset password. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--bg-body)] transition-colors duration-500">
            <div className="card-surface p-8 max-w-md w-full shadow-2xl border border-[var(--border-subtle)]">
                <h1 className="text-3xl font-bold mb-6 text-center text-[var(--text-main)]">
                    Reset Password
                </h1>

                {error && (
                    <div className="mb-6 text-sm text-red-200 bg-red-900/50 border border-red-800 rounded-lg px-4 py-3">
                        {error}
                    </div>
                )}

                {success ? (
                    <div className="mb-6 text-sm text-green-200 bg-green-900/50 border border-green-800 rounded-lg px-4 py-3">
                        ✅ Password reset successful! Redirecting to login...
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium mb-2 text-[var(--text-muted)]">
                                New Password
                            </label>
                            <input
                                type="password"
                                className="input-base w-full"
                                placeholder="Enter new password (min 6 characters)"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                minLength={6}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2 text-[var(--text-muted)]">
                                Confirm Password
                            </label>
                            <input
                                type="password"
                                className="input-base w-full"
                                placeholder="Re-enter new password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                minLength={6}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="button button-primary w-full py-3 mt-2 font-bold text-lg shadow-lg"
                        >
                            {loading ? "Resetting..." : "Reset Password"}
                        </button>
                    </form>
                )}

                <div className="mt-6 text-center">
                    <a
                        href="/"
                        className="text-sm text-[var(--text-highlight)] hover:underline focus:outline-none transition-opacity hover:opacity-80"
                    >
                        Back to Login
                    </a>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
