import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";


const EmailVerification: React.FC = () => {
    const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
    const [message, setMessage] = useState("");

    useEffect(() => {
        const verifyEmail = async () => {
            // Check URL hash for verification token
            const hashParams = new URLSearchParams(window.location.hash.substring(1));
            const accessToken = hashParams.get("access_token");
            const type = hashParams.get("type");

            if (type === "signup" && accessToken) {
                // Email verification successful - Supabase handles this automatically
                setStatus("success");
                setMessage("✅ Email verified successfully! Redirecting to login...");

                // Redirect to home after 3 seconds
                setTimeout(() => {
                    window.location.href = window.location.origin;
                }, 3000);
            } else {
                // Invalid or expired verification link
                setStatus("error");
                setMessage("Invalid or expired verification link. Please request a new one.");
            }
        };

        verifyEmail();
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--bg-body)] transition-colors duration-500">
            <div className="card-surface p-8 max-w-md w-full shadow-2xl border border-[var(--border-subtle)]">
                <h1 className="text-3xl font-bold mb-6 text-center text-[var(--text-main)]">
                    Email Verification
                </h1>

                {status === "verifying" && (
                    <div className="text-center">
                        <div className="animate-spin h-12 w-12 border-t-2 border-b-2 border-amber-400 rounded-full mx-auto mb-4" />
                        <p className="text-[var(--text-muted)]">Verifying your email...</p>
                    </div>
                )}

                {status === "success" && (
                    <div className="mb-6 text-sm text-green-200 bg-green-900/50 border border-green-800 rounded-lg px-4 py-3">
                        {message}
                    </div>
                )}

                {status === "error" && (
                    <>
                        <div className="mb-6 text-sm text-red-200 bg-red-900/50 border border-red-800 rounded-lg px-4 py-3">
                            {message}
                        </div>
                        <div className="mt-6 text-center">
                            <a
                                href="/"
                                className="text-sm text-[var(--text-highlight)] hover:underline focus:outline-none transition-opacity hover:opacity-80"
                            >
                                Back to Login
                            </a>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default EmailVerification;
