import React, { useState } from "react";
import { motion } from "framer-motion";
import CategorySelect from "./CategorySelect";
import VoiceInput from "./VoiceInput";
import AmountInput from "./AmountInput";
import { Category } from "../types";
import { categorizeExpense } from "../services/expenseService";

// Helper function to get today's date in YYYY-MM-DD format
const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// Update Props interface to accept a function that returns a Promise<boolean>
interface Props {
    onAddExpense: (name: string, amount: number, category?: Category, date?: string) => Promise<boolean>;
    customCategories: string[];
    onAddCategory: (name: string) => Promise<string | null>;
}

const ExpenseForm: React.FC<Props> = ({ onAddExpense, customCategories, onAddCategory }) => {
    const [name, setName] = useState("");
    const [amount, setAmount] = useState("");
    const [date, setDate] = useState(getTodayDate()); // Initialize with today's date
    const [category, setCategory] = useState<Category>("");
    const [error, setError] = useState(""); // State for form-level error messages

    // Make handleSubmit asynchronous
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        const amt = parseFloat(amount);

        // Form-level validation
        if (!name.trim() || isNaN(amt) || amt <= 0 || !date) {
            setError("Please enter a valid expense name, a positive amount, and a date.");
            return;
        }

        // Call the parent handler and wait for the success signal (true/false)
        const success = await onAddExpense(name.trim(), amt, category || undefined, date);

        // ONLY reset form state if the parent handler confirms successful addition
        // (i.e., if it didn't return false due to the 'All Profiles' check).
        if (success) {
            setName("");
            setAmount("");
            setDate(getTodayDate()); // Reset date to today's date
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
                <label htmlFor="expense-name" className="label-base">
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

            {/* Date and Amount Row */}
            <div className="flex gap-4">
                {/* Date Input */}
                <div className="flex-1">
                    <label htmlFor="expense-date" className="label-base">
                        Date
                    </label>
                    <input
                        id="expense-date"
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="input-base w-full"
                        required
                    />
                </div>

                {/* Amount Input */}
                <div className="flex-1">
                    <label htmlFor="expense-amount" className="label-base">
                        Amount
                    </label>
                    <AmountInput
                        id="expense-amount"
                        value={amount}
                        onChange={setAmount}
                        placeholder="e.g. 1200"
                        min="0.01"
                        step={0.01}
                        className="w-full"
                        required
                    />
                </div>
            </div>

            {/* Voice Input and Submit Button Row */}
            <div className="flex gap-2">
                <VoiceInput
                    onResult={(amt, nm, cat) => {
                        setAmount(amt.toString());
                        setName(nm);
                        if (cat) setCategory(cat);
                    }}
                />

                <motion.button
                    type="submit"
                    className="button button-primary flex-1"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    Add Expense
                </motion.button>
            </div>
        </motion.form>
    );
};

export default ExpenseForm;