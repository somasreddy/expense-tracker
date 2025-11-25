import React, { useState } from "react";
import { sendPasswordResetEmail, auth } from "../firebase";

const ResetPassword: React.FC = () => {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("sending");
        try {
            await sendPasswordResetEmail(auth, email);
            setStatus("sent");
            setMessage("Password reset email sent. Check your inbox.");
        } catch (err) {
            console.error(err);
            setStatus("error");
            setMessage("Failed to send reset email. Please try again.");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--bg-body)] transition-colors duration-500">
            <div className="card-surface p-8 max-w-md w-full shadow-2xl border border-[var(--border-subtle)]">
                <h1 className="text-3xl font-bold mb-6 text-center text-[var(--text-main)]">Reset Password</h1>
                {status === "sent" ? (
                    <p className="text-green-200 bg-green-900/50 p-4 rounded">{message}</p>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <label className="block mb-2 text-[var(--text-muted)]">Email address</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-2 border rounded mb-4"
                        />
                        <button
                            type="submit"
                            disabled={status === "sending"}
                            className="w-full bg-[var(--accent)] text-white py-2 rounded hover:opacity-90"
                        >
                            {status === "sending" ? "Sending..." : "Send Reset Email"}
                        </button>
                    </form>
                )}
                {status === "error" && (
                    <p className="mt-4 text-red-200 bg-red-900/50 p-2 rounded">{message}</p>
                )}
            </div>
        </div>
    );
};

export default ResetPassword;
