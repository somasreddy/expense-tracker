import React, { useState } from "react";
import { motion } from "framer-motion";
import CategorySelect from "./CategorySelect";
import { Category } from "../types";
import { categorizeExpense } from "../services/expenseService";

// Update Props interface to accept a function that returns a Promise<boolean>
interface Props {
    onAddExpense: (name: string, amount: number, category?: Category) => Promise<boolean>;
    customCategories: string[];
    onAddCategory: (name: string) => Promise<void>;
}

const ExpenseForm: React.FC<Props> = ({ onAddExpense, customCategories, onAddCategory }) => {
    const [name, setName] = useState("");
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState<Category>("");
    const [error, setError] = useState(""); // State for form-level error messages

    // Make handleSubmit asynchronous
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        const amt = parseFloat(amount);

        // Form-level validation
        if (!name.trim() || isNaN(amt) || amt <= 0) {
            setError("Please enter a valid expense name and a positive amount.");
            return;
        }

        // Call the parent handler and wait for the success signal (true/false)
        const success = await onAddExpense(name.trim(), amt, category || undefined);

        // ONLY reset form state if the parent handler confirms successful addition
        // (i.e., if it didn't return false due to the 'All Profiles' check).
        if (success) {
            setName("");
            setAmount("");
            setCategory("");
        } else {
            // If the parent handler failed (e.g., showed an alert), the values are retained.
            // We can optionally show an in-form error message here too.
            // setError("Please select a specific profile to add the expense.");
        }
    };

    return (
        <motion.form
            onSubmit={handleSubmit}
            className="space-y-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            {error && (
                <motion.div
                    className="p-3 bg-red-800 text-white rounded-lg text-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    {error}
                </motion.div>
            )}

            {/* Expense Name Input */}
            <div>
                <label htmlFor="expense-name" className="block text-sm text-[var(--text-muted)] font-medium mb-1">
                    Expense Name
                </label>
                <input
                    id="expense-name"
                    type="text"
                    value={name}
                    placeholder="e.g. Groceries, Fuel, EMI..."
                    onChange={(e) => {
                        const newName = e.target.value;
                        setName(newName);

                        // Auto-detect category if user hasn't manually selected one (or if it's currently "Others")
                        // We only auto-set if we find a match better than "Others"
                        const detected = categorizeExpense(newName, customCategories);
                        if (detected !== "Others") {
                            setCategory(detected);
                        }
                    }}
                    className="input-base w-full"
                    required
                />
            </div>

            {/* Category Select */}
            <CategorySelect
                selectedCategory={category}
                onSelectCategory={setCategory}
                customCategories={customCategories}
                onAddCategory={onAddCategory}
            />

            {/* Amount Input */}
            <div>
                <label htmlFor="expense-amount" className="block text-sm text-[var(--text-muted)] font-medium mb-1">
                    Amount
                </label>
                <input
                    id="expense-amount"
                    type="number"
                    value={amount}
                    placeholder="e.g. 1200"
                    onChange={(e) => setAmount(e.target.value)}
                    min="0.01"
                    step="0.01"
                    className="input-base w-full"
                    required
                />
            </div>

            <motion.button
                type="submit"
                className="w-full py-2 px-4 rounded-lg font-semibold bg-amber-500 text-gray-900 hover:bg-amber-400 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
            >
                Add Expense
            </motion.button>
        </motion.form>
    );
};

export default ExpenseForm;