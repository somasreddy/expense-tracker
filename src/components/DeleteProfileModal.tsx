import React, { useState } from "react";
import { Account } from "../types";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, ArrowRight, Trash2, UserMinus, X } from "lucide-react";

interface Props {
    profileToDelete: Account;
    availableProfiles: Account[];
    expenseCount: number;
    onConfirm: (deleteExpenses: boolean, targetProfileId?: string) => void;
    onCancel: () => void;
}

const DeleteProfileModal: React.FC<Props> = ({
    profileToDelete,
    availableProfiles,
    expenseCount,
    onConfirm,
    onCancel,
}) => {
    const [deleteExpenses, setDeleteExpenses] = useState(false);
    const [targetProfileId, setTargetProfileId] = useState(availableProfiles[0]?.id || "");

    const handleConfirm = () => {
        onConfirm(deleteExpenses, deleteExpenses ? undefined : targetProfileId);
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fadeIn">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="content-surface max-w-lg w-full p-0 overflow-hidden shadow-2xl rounded-2xl border border-[var(--border-subtle)]"
                >
                    {/* Header */}
                    <div className="p-6 border-b border-[var(--border-subtle)] flex justify-between items-start bg-[var(--bg-surface)]">
                        <div>
                            <h2 className="text-xl font-bold text-[var(--text-main)] flex items-center gap-2">
                                <UserMinus className="text-red-500" size={24} />
                                Delete Profile
                            </h2>
                            <p className="text-[var(--text-muted)] mt-1">
                                You are about to delete <span className="font-semibold text-[var(--text-main)]">"{profileToDelete.name}"</span>
                            </p>
                        </div>
                        <button
                            onClick={onCancel}
                            className="text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors p-1 rounded-lg hover:bg-[var(--card-hover)]"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="p-6 space-y-6">
                        {expenseCount > 0 ? (
                            <>
                                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex gap-3 items-start">
                                    <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={20} />
                                    <div>
                                        <p className="text-amber-600 dark:text-amber-400 font-medium">
                                            This profile has {expenseCount} associated expense{expenseCount !== 1 ? "s" : ""}
                                        </p>
                                        <p className="text-sm text-[var(--text-muted)] mt-1 opacity-90">
                                            Please choose how you would like to handle these records before proceeding.
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {availableProfiles.length > 0 && (
                                        <label
                                            className={`relative flex items-start gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer group ${!deleteExpenses
                                                ? "border-[var(--text-highlight)] bg-[var(--bg-elevated)]"
                                                : "border-[var(--border-subtle)] hover:border-[var(--text-muted)] hover:bg-[var(--card-hover)]"
                                                }`}
                                        >
                                            <div className="mt-1">
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${!deleteExpenses ? "border-[var(--text-highlight)]" : "border-[var(--text-muted)]"
                                                    }`}>
                                                    {!deleteExpenses && <div className="w-2.5 h-2.5 rounded-full bg-[var(--text-highlight)]" />}
                                                </div>
                                            </div>
                                            <input
                                                type="radio"
                                                name="deleteOption"
                                                checked={!deleteExpenses}
                                                onChange={() => setDeleteExpenses(false)}
                                                className="hidden"
                                            />
                                            <div className="flex-1">
                                                <div className="font-semibold text-[var(--text-main)] flex items-center gap-2">
                                                    Transfer Expenses
                                                    <ArrowRight size={16} className="text-[var(--text-muted)]" />
                                                </div>
                                                <p className="text-sm text-[var(--text-muted)] mt-1">
                                                    Move all {expenseCount} record{expenseCount !== 1 ? "s" : ""} to another profile safely.
                                                </p>
                                                <AnimatePresence>
                                                    {!deleteExpenses && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0, marginTop: 0 }}
                                                            animate={{ height: "auto", opacity: 1, marginTop: 12 }}
                                                            exit={{ height: 0, opacity: 0, marginTop: 0 }}
                                                            className="overflow-hidden"
                                                        >
                                                            <select
                                                                value={targetProfileId}
                                                                onChange={(e) => setTargetProfileId(e.target.value)}
                                                                className="input-base w-full bg-[var(--bg-body)]"
                                                            >
                                                                {availableProfiles.map((profile) => (
                                                                    <option key={profile.id} value={profile.id}>
                                                                        Transfer to: {profile.name}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </label>
                                    )}

                                    <label
                                        className={`relative flex items-start gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer group ${deleteExpenses
                                            ? "border-red-500/50 bg-red-500/5"
                                            : "border-[var(--border-subtle)] hover:border-[var(--border)] hover:bg-[var(--card-hover)]"
                                            }`}
                                    >
                                        <div className="mt-1">
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${deleteExpenses ? "border-red-500" : "border-[var(--text-muted)]"
                                                }`}>
                                                {deleteExpenses && <div className="w-2.5 h-2.5 rounded-full bg-red-500" />}
                                            </div>
                                        </div>
                                        <input
                                            type="radio"
                                            name="deleteOption"
                                            checked={deleteExpenses}
                                            onChange={() => setDeleteExpenses(true)}
                                            className="hidden"
                                        />
                                        <div className="flex-1">
                                            <div className={`font-semibold flex items-center gap-2 ${deleteExpenses ? "text-red-500" : "text-[var(--text-main)]"}`}>
                                                Delete Everything
                                                <Trash2 size={16} className={deleteExpenses ? "text-red-500" : "text-[var(--text-muted)]"} />
                                            </div>
                                            <p className="text-sm text-[var(--text-muted)] mt-1">
                                                Permanently remove the profile and all its {expenseCount} expense{expenseCount !== 1 ? "s" : ""}.
                                            </p>
                                            {deleteExpenses && (
                                                <p className="text-xs text-red-500 mt-2 font-medium">
                                                    ⚠️ This action cannot be undone.
                                                </p>
                                            )}
                                        </div>
                                    </label>
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-4 text-[var(--text-muted)]">
                                <p>This profile has no expenses recorded.</p>
                                <p className="text-sm mt-1">It is safe to delete immediately.</p>
                            </div>
                        )}
                    </div>

                    <div className="p-6 pt-0 flex justify-end gap-3">
                        <button
                            onClick={onCancel}
                            className="button button-secondary"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleConfirm}
                            className={`button text-white shadow-lg shadow-red-500/20 transition-all hover:shadow-red-500/40 ${deleteExpenses || expenseCount === 0
                                ? "bg-red-500 hover:bg-red-600"
                                : "bg-[var(--text-highlight)] hover:opacity-90"
                                }`}
                        >
                            {deleteExpenses || expenseCount === 0 ? "Delete Profile" : "Transfer & Delete"}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default DeleteProfileModal;
