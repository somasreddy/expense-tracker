import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Category, Budget } from "../types";
import { CATEGORY_KEYWORDS, DEFAULT_CATEGORIES } from "../constants";
import { formatToINR } from "../services/expenseService";

interface BudgetManagerModalProps {
    isOpen: boolean;
    onClose: () => void;
    budgets: Budget[];
    onSetBudget: (category: Category, amount: number) => Promise<void>;
    customCategories: string[];
}

const BudgetManagerModal: React.FC<BudgetManagerModalProps> = ({
    isOpen,
    onClose,
    budgets,
    onSetBudget,
    customCategories = [],
}) => {
    // Combine default and custom categories, removing duplicates if any
    const allCategories = Array.from(new Set([...DEFAULT_CATEGORIES, ...(customCategories || [])]));
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [amount, setAmount] = useState<string>("");
    const [isSaving, setIsSaving] = useState(false);

    const handleEdit = (category: Category, currentAmount: number) => {
        setEditingCategory(category);
        setAmount(currentAmount > 0 ? currentAmount.toString() : "");
    };

    const handleSave = async () => {
        if (!editingCategory) return;

        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount < 0) {
            alert("Please enter a valid amount");
            return;
        }

        setIsSaving(true);
        try {
            await onSetBudget(editingCategory, numAmount);
            setEditingCategory(null);
            setAmount("");
        } catch (error) {
            console.error(error);
            alert("Failed to save budget");
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-[var(--bg-card)] w-full max-w-md rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
                >
                    {/* Header */}
                    <div className="p-4 border-b border-[var(--border-subtle)] flex justify-between items-center bg-[var(--bg-surface)]">
                        <h2 className="text-xl font-bold text-[var(--text-main)]">
                            Monthly Budgets
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-4 overflow-y-auto flex-1 space-y-3">
                        {allCategories.map((cat) => {
                            const budget = budgets.find((b) => b.category === cat);
                            const limit = budget?.amount || 0;
                            const isEditing = editingCategory === cat;

                            return (
                                <div
                                    key={cat}
                                    className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-body)] border border-[var(--border-subtle)]"
                                >
                                    <div className="flex-1">
                                        <div className="font-medium text-[var(--text-main)]">{cat}</div>
                                        {!isEditing && (
                                            <div className="text-sm text-[var(--text-muted)]">
                                                {limit > 0 ? `Limit: ${formatToINR(limit)}` : "No limit set"}
                                            </div>
                                        )}
                                    </div>

                                    {isEditing ? (
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="number"
                                                value={amount}
                                                onChange={(e) => setAmount(e.target.value)}
                                                className="input-base w-24 text-sm py-1"
                                                placeholder="Amount"
                                                autoFocus
                                            />
                                            <button
                                                onClick={handleSave}
                                                disabled={isSaving}
                                                className="p-1 text-green-500 hover:text-green-400"
                                            >
                                                ✓
                                            </button>
                                            <button
                                                onClick={() => setEditingCategory(null)}
                                                className="p-1 text-red-500 hover:text-red-400"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => handleEdit(cat, limit)}
                                            className="text-sm text-[var(--text-highlight)] hover:underline"
                                        >
                                            {limit > 0 ? "Edit" : "Set Limit"}
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default BudgetManagerModal;
