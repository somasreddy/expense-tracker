import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { formatToINR } from "../utils/currencyUtils";
import AmountInput from "./AmountInput";
import { Budget, Category } from "../types";
import { DEFAULT_CATEGORIES } from "../constants";
import { calculateSmartDistribution } from "../utils/budgetUtils";
import { useDialog } from "../contexts/DialogContext";

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

    // Find the global limit if it exists
    const globalLimitBudget = budgets.find(b => b.category === "_TOTAL_");
    const { showAlert, showConfirm } = useDialog();

    // State
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [amount, setAmount] = useState("");
    const [totalBudget, setTotalBudget] = useState(globalLimitBudget?.amount.toString() || "");
    const [isSaving, setIsSaving] = useState(false);

    // Derived state
    const currentAllocated = budgets
        .filter(b => b.category !== "_TOTAL_")
        .reduce((sum, b) => sum + b.amount, 0);

    const globalLimit = globalLimitBudget?.amount || 0;

    const handleEdit = (category: Category, currentAmount: number) => {
        setEditingCategory(category);
        setAmount(currentAmount > 0 ? currentAmount.toString() : "");
    };

    const handleSetTotalLimit = async () => {
        const total = parseFloat(totalBudget);
        if (isNaN(total) || total <= 0) {
            await showAlert("Please enter a valid total budget", "Invalid Input");
            return;
        }
        setIsSaving(true);
        try {
            await onSetBudget("_TOTAL_", total);
            await showAlert("Total limit updated!", "Success");
        } catch (error) {
            console.error(error);
            await showAlert("Failed to update limit", "Error");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDistribute = async () => {
        const total = parseFloat(totalBudget);
        if (isNaN(total) || total <= 0) {
            await showAlert("Please enter a valid total budget", "Invalid Input");
            return;
        }

        if (!(await showConfirm(`This will smartly distribute ${formatToINR(total)} across all categories based on priority (e.g. Rent > Food > Shopping). Continue?`, "Confirm Distribution"))) {
            return;
        }

        setIsSaving(true);
        try {
            // First save the total limit
            await onSetBudget("_TOTAL_", total);

            const distribution = calculateSmartDistribution(total, allCategories);

            // Execute all updates in parallel
            await Promise.all(
                Object.entries(distribution).map(([cat, amt]) => onSetBudget(cat, amt))
            );

            await showAlert("Budgets distributed successfully!", "Success");
        } catch (error) {
            console.error(error);
            await showAlert("Failed to distribute budgets", "Error");
        } finally {
            setIsSaving(false);
        }
    };

    const handleSave = async () => {
        if (!editingCategory) return;

        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount < 0) {
            await showAlert("Please enter a valid amount", "Invalid Input");
            return;
        }

        // Check restriction
        if (globalLimit > 0) {
            const currentCategoryAmount = budgets.find(b => b.category === editingCategory)?.amount || 0;
            const newTotalAllocated = currentAllocated - currentCategoryAmount + numAmount;

            if (newTotalAllocated > globalLimit) {
                await showAlert(`Cannot save: Total allocated (${formatToINR(newTotalAllocated)}) exceeds the limit of ${formatToINR(globalLimit)}.\nRemaining available: ${formatToINR(globalLimit - (currentAllocated - currentCategoryAmount))}`, "Budget Exceeded");
                return;
            }
        }

        setIsSaving(true);
        try {
            await onSetBudget(editingCategory, numAmount);
            setEditingCategory(null);
            setAmount("");
        } catch (error) {
            console.error(error);
            await showAlert("Failed to save budget", "Error");
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
                    role="dialog"
                    aria-labelledby="budget-modal-title"
                >
                    {/* Header */}
                    <div className="p-4 border-b border-[var(--border-subtle)] flex justify-between items-center bg-[var(--bg-surface)]">
                        <h2 id="budget-modal-title" className="text-xl font-bold text-[var(--text-main)]">
                            Monthly Budgets
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
                            aria-label="Close modal"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-4 overflow-y-auto flex-1 space-y-3">
                        {/* Total Budget Distributor */}
                        <div className="p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] mb-4 shadow-sm">
                            <label htmlFor="total-budget-input" className="block text-sm font-semibold text-[var(--text-muted)] mb-3">
                                Total Monthly Budget
                            </label>

                            <div className="flex flex-col gap-3">
                                <AmountInput
                                    id="total-budget-input"
                                    value={totalBudget}
                                    onChange={setTotalBudget}
                                    className="w-full text-lg py-2"
                                    placeholder="e.g. 50000"
                                />

                                <div className="flex justify-end gap-2">
                                    <button
                                        onClick={handleSetTotalLimit}
                                        disabled={isSaving || !totalBudget}
                                        className="button button-secondary button-sm"
                                        title="Save this as the total limit"
                                        aria-label="Set total budget limit"
                                    >
                                        Set Limit
                                    </button>
                                    <button
                                        onClick={handleDistribute}
                                        disabled={isSaving || !totalBudget}
                                        className="button button-primary button-sm flex items-center gap-1"
                                        title="Smartly distribute based on category priority"
                                        aria-label="Smartly distribute budget"
                                    >
                                        <span>✨</span> Smart Distribute
                                    </button>
                                </div>
                            </div>

                            <div className="flex justify-between text-xs text-[var(--text-muted)] mt-3 pt-3 border-t border-[var(--border-subtle)]">
                                <span>Allocated: <span className="font-medium text-[var(--text-main)]">{formatToINR(currentAllocated)}</span></span>
                                <span>Remaining: <span className={`font-medium ${parseFloat(totalBudget) - currentAllocated < 0 ? 'text-red-500' : 'text-green-500'}`}>{formatToINR(Math.max(0, (parseFloat(totalBudget) || 0) - currentAllocated))}</span></span>
                            </div>
                            <p className="text-[10px] text-[var(--text-muted)] mt-2 opacity-70 italic">
                                *Prioritizes Rent, EMI & Essentials over Discretionary spending.
                            </p>
                        </div>

                        <div className="space-y-3">
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
                                                <AmountInput
                                                    value={amount}
                                                    onChange={setAmount}
                                                    className="w-24 text-sm py-1"
                                                    placeholder="Amount"
                                                    autoFocus
                                                    aria-label={`Budget amount for ${cat}`}
                                                />
                                                <button
                                                    onClick={handleSave}
                                                    disabled={isSaving}
                                                    className="p-1 text-green-500 hover:text-green-400"
                                                    aria-label={`Save budget for ${cat}`}
                                                >
                                                    ✓
                                                </button>
                                                <button
                                                    onClick={() => setEditingCategory(null)}
                                                    className="p-1 text-red-500 hover:text-red-400"
                                                    aria-label="Cancel editing"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => handleEdit(cat, limit)}
                                                className="text-sm text-[var(--text-highlight)] hover:underline"
                                                aria-label={`Edit budget for ${cat}`}
                                            >
                                                {limit > 0 ? "Edit" : "Set Limit"}
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default BudgetManagerModal;
