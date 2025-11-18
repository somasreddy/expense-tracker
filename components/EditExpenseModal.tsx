import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Expense, Category, Categories } from '../types';

interface EditExpenseModalProps {
  expense: Expense;
  onUpdate: (updatedExpense: Expense) => void;
  onCancel: () => void;
}

const EditExpenseModal: React.FC<EditExpenseModalProps> = ({ expense, onUpdate, onCancel }) => {
  const [name, setName] = useState(expense.name);
  const [amount, setAmount] = useState(expense.amount.toString());
  const [category, setCategory] = useState<Category>(expense.category);
  const [error, setError] = useState('');

  useEffect(() => {
    setName(expense.name);
    setAmount(expense.amount.toString());
    setCategory(expense.category);
    setError('');
  }, [expense]);

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

    onUpdate({ ...expense, name, amount: numericAmount, category });
  };

  return (
    <motion.div 
      className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-40 flex justify-center items-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-2xl shadow-xl w-full max-w-md m-4"
        initial={{ scale: 0.9, y: -20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 20, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <form onSubmit={handleSubmit} className="p-6">
          <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">Edit Expense</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="editExpenseName" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Expense Name
              </label>
              <input
                type="text"
                id="editExpenseName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white/50 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-500 transition-shadow duration-300 ease-in-out"
              />
            </div>
            <div>
              <label htmlFor="editAmount" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Amount (INR)
              </label>
              <input
                type="number"
                id="editAmount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white/50 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-500 transition-shadow duration-300 ease-in-out"
              />
            </div>
            <div>
              <label htmlFor="editCategory" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Category
              </label>
              <select
                id="editCategory"
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="mt-1 block w-full px-3 py-2 bg-white/50 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-md text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-sky-500 transition-shadow duration-300 ease-in-out"
              >
                {Categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
          {error && <p className="text-sm text-red-500 dark:text-red-400 mt-4">{error}</p>}
          <div className="mt-6 flex justify-end space-x-3">
            <motion.button
              type="button"
              onClick={onCancel}
              className="py-2 px-4 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-sm font-medium text-slate-700 dark:text-slate-200 bg-white/80 dark:bg-slate-700/80 hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 dark:focus:ring-offset-slate-800 transition-colors"
              whileHover={{ scale: 1.05, y: -2, boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.1)" }}
              whileTap={{ scale: 0.95 }}
            >
              Cancel
            </motion.button>
            <motion.button
              type="submit"
              className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white animated-button focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 dark:focus:ring-offset-slate-800"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              Save Changes
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default EditExpenseModal;