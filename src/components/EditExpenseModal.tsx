import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Expense, Category, Categories } from '../types';
import { categorizeExpense } from '../services/expenseService';

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
    
    // Recategorize if name changed, otherwise keep original category
    const newCategory = name !== expense.name ? categorizeExpense(name) : category;

    onUpdate({ ...expense, name, amount: numericAmount, category: newCategory });
  };

  return (
    <motion.div 
      className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-40 flex justify-center items-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className="card-surface w-full max-w-md m-4"
        initial={{ scale: 0.9, y: -20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 20, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <form onSubmit={handleSubmit} className="p-6">
          <h2 className="text-2xl font-bold mb-4 text-white">Edit Expense</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="editExpenseName" className="block text-sm font-medium text-slate-300">
                Expense Name
              </label>
              <input
                type="text"
                id="editExpenseName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 text-sm shadow-sm"
              />
            </div>
            <div>
              <label htmlFor="editAmount" className="block text-sm font-medium text-slate-300">
                Amount (INR)
              </label>
              <input
                type="number"
                id="editAmount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mt-1 block w-full px-3 py-2 text-sm shadow-sm"
              />
            </div>
            <div>
              <label htmlFor="editCategory" className="block text-sm font-medium text-slate-300">
                Category
              </label>
              <select
                id="editCategory"
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="mt-1 block w-full px-3 py-2 text-sm shadow-sm"
              >
                {Categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
          {error && <p className="text-sm text-red-400 mt-4">{error}</p>}
          <div className="mt-6 flex justify-end space-x-3">
            <motion.button
              type="button"
              onClick={onCancel}
              className="button button-secondary"
              whileHover={{ scale: 1.05, y: -2, boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.1)" }}
              whileTap={{ scale: 0.95 }}
            >
              Cancel
            </motion.button>
            <motion.button
              type="submit"
              className="button animated-button"
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