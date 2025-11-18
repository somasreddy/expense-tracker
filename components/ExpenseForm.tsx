import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface ExpenseFormProps {
  onAddExpense: (name: string, amount: number) => void;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ onAddExpense }) => {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseFloat(amount);

    if (!name.trim()) {
      setError('Expense name cannot be empty.');
      return;
    }
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError('Amount must be a positive number.');
      return;
    }

    onAddExpense(name, numericAmount);
    setName('');
    setAmount('');
    setError('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="expenseName" className="block text-sm font-medium text-slate-300">
          Expense Name
        </label>
        <input
          type="text"
          id="expenseName"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Coffee with friends"
          className="mt-1 block w-full px-3 py-2 text-sm shadow-sm"
        />
      </div>
      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-slate-300">
          Amount (INR)
        </label>
        <input
          type="number"
          id="amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="e.g., 250"
          className="mt-1 block w-full px-3 py-2 text-sm shadow-sm"
        />
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <motion.button
        type="submit"
        className="w-full button animated-button"
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
      >
        Add Expense
      </motion.button>
    </form>
  );
};

export default ExpenseForm;