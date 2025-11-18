

import React, { useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Expense } from '../types';
import { formatToINR } from '../services/expenseService';

interface ExpenseListProps {
  expenses: Expense[];
  onDeleteExpense: (id: string) => void;
  onEditExpense: (expense: Expense) => void;
  selectedExpenses: string[];
  onToggleExpenseSelection: (id: string) => void;
  onToggleSelectAll: () => void;
  onDeleteSelected: () => void;
  onLoadMore: () => void;
  hasMore: boolean;
  isLoadingMore: boolean;
}

const categoryStyles: { [key: string]: { border: string; text: string; bg: string; shadow: string; } } = {
  Grocery: { border: 'border-green-500', text: 'text-green-300', bg: 'bg-green-900/30', shadow: 'rgba(74, 222, 128, 0.3)' },
  Fuel: { border: 'border-red-500', text: 'text-red-300', bg: 'bg-red-900/30', shadow: 'rgba(248, 113, 113, 0.3)' },
  Bills: { border: 'border-blue-500', text: 'text-blue-300', bg: 'bg-blue-900/30', shadow: 'rgba(96, 165, 250, 0.3)' },
  Shopping: { border: 'border-purple-500', text: 'text-purple-300', bg: 'bg-purple-900/30', shadow: 'rgba(192, 132, 252, 0.3)' },
  Food: { border: 'border-yellow-500', text: 'text-yellow-300', bg: 'bg-yellow-900/30', shadow: 'rgba(250, 204, 21, 0.3)' },
  Transportation: { border: 'border-indigo-500', text: 'text-indigo-300', bg: 'bg-indigo-900/30', shadow: 'rgba(129, 140, 248, 0.3)' },
  Entertainment: { border: 'border-pink-500', text: 'text-pink-300', bg: 'bg-pink-900/30', shadow: 'rgba(244, 114, 182, 0.3)' },
  Health: { border: 'border-teal-500', text: 'text-teal-300', bg: 'bg-teal-900/30', shadow: 'rgba(45, 212, 191, 0.3)' },
  Utilities: { border: 'border-cyan-500', text: 'text-cyan-300', bg: 'bg-cyan-900/30', shadow: 'rgba(34, 211, 238, 0.3)' },
  Rent: { border: 'border-orange-500', text: 'text-orange-300', bg: 'bg-orange-900/30', shadow: 'rgba(251, 146, 60, 0.3)' },
  EMIs: { border: 'border-gray-500', text: 'text-gray-300', bg: 'bg-gray-800/30', shadow: 'rgba(156, 163, 175, 0.3)' },
  Others: { border: 'border-slate-500', text: 'text-slate-300', bg: 'bg-slate-800/30', shadow: 'rgba(100, 116, 139, 0.3)' },
};


const ExpenseList: React.FC<ExpenseListProps> = ({ 
  expenses, 
  onDeleteExpense, 
  onEditExpense,
  selectedExpenses,
  onToggleExpenseSelection,
  onToggleSelectAll,
  onDeleteSelected,
  onLoadMore,
  hasMore,
  isLoadingMore
}) => {
  const observer = useRef<IntersectionObserver>();
  const lastExpenseElementRef = useCallback(node => {
    if (isLoadingMore) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        onLoadMore();
      }
    });
    
    if (node) observer.current.observe(node);
  }, [isLoadingMore, hasMore, onLoadMore]);

  const isAllSelected = expenses.length > 0 && selectedExpenses.length === expenses.length;

  if (expenses.length === 0 && !isLoadingMore) {
    return (
        <div className="text-center py-10">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-white">No expenses found</h3>
            <p className="mt-1 text-sm text-slate-400">Try adjusting your filters or adding a new expense.</p>
        </div>
    )
  }

  return (
    <div>
      <AnimatePresence>
        {selectedExpenses.length > 0 && (
          <motion.div 
            className="flex items-center justify-between p-2 mb-3 bg-slate-900/50 rounded-lg"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <span className="text-sm text-slate-300">{selectedExpenses.length} selected</span>
            <motion.button
              onClick={onDeleteSelected}
              className="py-1 px-3 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Delete Selected
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center p-2 mb-2 border-b border-slate-700">
        <input
          type="checkbox"
          checked={isAllSelected}
          // FIX: Wrap onToggleSelectAll in an arrow function to prevent passing the event object, matching the prop's expected signature.
          onChange={() => onToggleSelectAll()}
          aria-label="Select all expenses"
          className="h-4 w-4 rounded bg-slate-700 border-slate-500 text-amber-400 focus:ring-amber-500"
        />
        <div className="flex-1 min-w-0 ml-10">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Description</p>
        </div>
        <div className="flex items-center ml-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider w-24 text-right mr-12">Amount</p>
        </div>
      </div>
      <ul className="space-y-3 h-[520px] overflow-y-auto pr-2 -mr-2">
        <AnimatePresence>
          {expenses.map((expense, index) => {
            const style = categoryStyles[expense.category] || categoryStyles['Others'];
            const isLastElement = index === expenses.length - 1;
            return (
            <motion.li
              ref={isLastElement ? lastExpenseElementRef : null}
              key={expense.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
              whileHover={{ 
                scale: 1.03, 
                y: -5,
                zIndex: 1, 
                position: 'relative', 
                boxShadow: `0px 10px 20px rgba(0,0,0,0.25), 0 0 20px ${style.shadow}` 
              }}
              transition={{ type: 'spring', stiffness: 350, damping: 20 }}
              className={`flex items-center justify-between p-4 bg-slate-800/50 backdrop-blur-sm rounded-lg shadow-md hover:bg-slate-800/80 border border-white/10 border-l-4 ${style.border} transition-colors duration-200`}
            >
              <input
                type="checkbox"
                checked={selectedExpenses.includes(expense.id)}
                onChange={() => onToggleExpenseSelection(expense.id)}
                aria-label={`Select expense: ${expense.name}`}
                className="h-4 w-4 rounded bg-slate-700 border-slate-500 text-amber-400 focus:ring-amber-500"
              />
              <div className="flex-1 min-w-0 ml-4">
                <p className="text-sm font-semibold text-white truncate">{expense.name}</p>
                <p className="text-xs text-slate-400">{new Date(expense.date).toLocaleDateString()}</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-2 ${style.bg} ${style.text}`}>
                  {expense.category}
                </span>
              </div>
              <div className="flex items-center ml-4">
                 <p className="text-sm font-medium text-white mr-4 w-24 text-right">{formatToINR(expense.amount)}</p>
                  <div className="flex items-center space-x-2">
                      <motion.button
                          onClick={() => onEditExpense(expense)}
                          className="text-slate-400 hover:text-amber-300 p-1 rounded-full transition-colors duration-200"
                          aria-label={`Edit expense: ${expense.name}`}
                          whileHover={{ scale: 1.1, backgroundColor: 'rgba(251, 191, 36, 0.1)' }}
                          whileTap={{ scale: 0.9 }}
                      >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z" />
                          </svg>
                      </motion.button>
                      <motion.button
                          onClick={() => onDeleteExpense(expense.id)}
                          className="text-slate-400 hover:text-red-400 p-1 rounded-full transition-colors duration-200"
                          aria-label={`Delete expense: ${expense.name}`}
                          whileHover={{ scale: 1.1, backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                          whileTap={{ scale: 0.9 }}
                      >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                      </motion.button>
                  </div>
              </div>
            </motion.li>
          )})}
        </AnimatePresence>
      </ul>
      {isLoadingMore && (
        <div className="text-center py-4 text-slate-400">Loading more expenses...</div>
      )}
      {!hasMore && !isLoadingMore && expenses.length > 0 && (
         <div className="text-center py-4 text-slate-500 text-sm">No more expenses found.</div>
      )}
    </div>
  );
};

export default ExpenseList;