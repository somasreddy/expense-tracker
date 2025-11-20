import React, { useState } from "react";
import { motion } from "framer-motion";

// Update Props interface to accept a function that returns a Promise<boolean>
interface Props {
  onAddExpense: (name: string, amount: number) => Promise<boolean>;
}

const ExpenseForm: React.FC<Props> = ({ onAddExpense }) => {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
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
    const success = await onAddExpense(name.trim(), amt);

    // ONLY reset form state if the parent handler confirms successful addition
    // (i.e., if it didn't return false due to the 'All Profiles' check).
    if (success) {
      setName("");
      setAmount("");
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
        <label htmlFor="expense-name" className="block text-sm text-gray-300 font-medium mb-1">
          Expense Name
        </label>
        <input
          id="expense-name"
          type="text"
          value={name}
          placeholder="e.g. Groceries, Fuel, EMI..."
          onChange={(e) => setName(e.target.value)}
          // Tailwind classes applied for better styling and consistency
          className="w-full p-2 border rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:ring-amber-500 focus:border-amber-500"
          required
        />
      </div>

      {/* Amount Input */}
      <div>
        <label htmlFor="expense-amount" className="block text-sm text-gray-300 font-medium mb-1">
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
          // Tailwind classes applied for better styling and consistency
          className="w-full p-2 border rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:ring-amber-500 focus:border-amber-500"
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