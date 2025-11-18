import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Expense } from '../types';
import { formatToINR } from '../services/expenseService';

interface ExpenseListProps {
  expenses: Expense[];
  onDeleteExpense: (id: string) => void;
  onEditExpense: (expense: Expense) => void;
}

const categoryColors: { [key: string]: string } = {
  Grocery: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
  Fuel: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
  Bills: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
  Shopping: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
  Food: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
  Transportation: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300',
  Entertainment: 'bg-pink-100 text-pink-800 dark:bg-pink-900/50 dark:text-pink-300',
  Health: 'bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-300',
  Utilities: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/50 dark:text-cyan-300',
  Rent: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300',
  EMIs: 'bg-gray-100 text-gray-800 dark:bg-gray-700/50 dark:text-gray-300',
  Others: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300',
};

const ExpenseList: React.FC<ExpenseListProps> = ({ expenses, onDeleteExpense, onEditExpense }) => {
  if (expenses.length === 0) {
    return (
        <div className="text-center py-10">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-slate-900 dark:text-white">No expenses found</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Try adjusting your filters or adding a new expense.</p>
        </div>
    )
  }

  return (
    <ul className="space-y-3 max-h-[600px] overflow-y-auto pr-2 -mr-2">
      <AnimatePresence>
        {expenses.map((expense) => (
          <motion.li
            key={expense.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
            whileHover={{ scale: 1.03, zIndex: 1, position: 'relative', boxShadow: "0px 5px 10px rgba(0,0,0,0.1)" }}
            className="flex items-center justify-between p-4 bg-slate-50/70 dark:bg-slate-800/40 rounded-lg shadow-sm hover:bg-slate-100/80 dark:hover:bg-slate-700/60 transition-all"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{expense.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{expense.date}</p>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-2 ${categoryColors[expense.category] || categoryColors['Others']}`}>
                {expense.category}
              </span>
            </div>
            <div className="text-right ml-4 flex-shrink-0 flex items-center space-x-2">
              <p className="text-sm font-medium text-slate-900 dark:text-white">{formatToINR(expense.amount)}</p>
              <button
                onClick={() => onEditExpense(expense)}
                className="text-slate-400 hover:text-sky-500 dark:hover:text-sky-400 transition-colors"
                aria-label={`Edit expense: ${expense.name}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                  <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                </svg>
              </button>
              <button
                onClick={() => onDeleteExpense(expense.id)}
                className="text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                aria-label={`Delete expense: ${expense.name}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  );
};

export default ExpenseList;