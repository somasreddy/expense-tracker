import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Expense, Category } from './types';
import { loadExpenses, saveExpenses, categorizeExpense } from './services/expenseService';
import ExpenseForm from './components/ExpenseForm';
import ExpenseList from './components/ExpenseList';
import Summary from './components/Summary';
import ExpenseChart from './components/ExpenseChart';
import DateFilter from './components/DateFilter';
import EditExpenseModal from './components/EditExpenseModal';

const App: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [filter, setFilter] = useState<{ start: string | null; end: string | null }>({ start: null, end: null });

  useEffect(() => {
    setExpenses(loadExpenses());
  }, []);

  useEffect(() => {
    saveExpenses(expenses);
  }, [expenses]);

  const handleAddExpense = (name: string, amount: number) => {
    const newExpense: Expense = {
      id: `${Date.now()}-${Math.random()}`,
      name,
      amount,
      category: categorizeExpense(name),
      date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
    };
    setExpenses(prevExpenses => [newExpense, ...prevExpenses]);
  };

  const handleUpdateExpense = (updatedExpense: Expense) => {
    setExpenses(prevExpenses =>
      prevExpenses.map(expense => (expense.id === updatedExpense.id ? updatedExpense : expense))
    );
    setEditingExpense(null);
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses(prevExpenses => prevExpenses.filter(expense => expense.id !== id));
  };

  const handleSetFilter = (start: string, end: string) => {
    setFilter({ start, end });
  };
  
  const handleClearFilter = () => {
    setFilter({ start: null, end: null });
  };

  const filteredExpenses = useMemo(() => {
    if (!filter.start || !filter.end) {
      return expenses;
    }
    return expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      // Create dates at UTC midnight to avoid timezone issues
      const startDate = new Date(filter.start!);
      const endDate = new Date(filter.end!);
      
      return expenseDate >= startDate && expenseDate <= endDate;
    });
  }, [expenses, filter]);

  const filteredTotal = useMemo(() => {
    return filteredExpenses.reduce((total, expense) => total + expense.amount, 0);
  }, [filteredExpenses]);

  const categoryTotals = useMemo(() => {
    const totals: { [key in Category]?: number } = {};
    filteredExpenses.forEach(expense => {
      totals[expense.category] = (totals[expense.category] || 0) + expense.amount;
    });
    return totals;
  }, [filteredExpenses]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };


  return (
    <div className="min-h-screen text-slate-800 dark:text-slate-200 font-sans p-4 sm:p-6 lg:p-8">
      <AnimatePresence>
        {editingExpense && (
          <EditExpenseModal
            expense={editingExpense}
            onUpdate={handleUpdateExpense}
            onCancel={() => setEditingExpense(null)}
          />
        )}
      </AnimatePresence>
      <div className="max-w-7xl mx-auto bg-slate-100/80 dark:bg-slate-900/80 backdrop-blur-xl p-4 sm:p-6 lg:p-8 rounded-3xl shadow-2xl">
        <header className="mb-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Expense Calculator
          </h1>
          <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">
            Track your spending with ease and clarity.
          </p>
        </header>

        <motion.main 
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div className="lg:col-span-1 space-y-8" variants={itemVariants}>
            <motion.div 
              className="bg-white/70 dark:bg-slate-800/60 p-6 rounded-2xl shadow-lg"
              whileHover={{ y: -5, scale: 1.02, boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">Add New Expense</h2>
              <ExpenseForm onAddExpense={handleAddExpense} />
            </motion.div>
            <motion.div 
              className="bg-white/70 dark:bg-slate-800/60 p-6 rounded-2xl shadow-lg"
              whileHover={{ y: -5, scale: 1.02, boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
                <Summary filteredTotal={filteredTotal} categoryTotals={categoryTotals} />
            </motion.div>
          </motion.div>
          
          <motion.div className="lg:col-span-2 space-y-8" variants={itemVariants}>
            <motion.div 
              className="bg-white/70 dark:bg-slate-800/60 p-6 rounded-2xl shadow-lg"
              whileHover={{ y: -5, scale: 1.02, boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">Category Distribution</h2>
              <ExpenseChart categoryTotals={categoryTotals} />
            </motion.div>
            <motion.div 
              className="bg-white/70 dark:bg-slate-800/60 p-6 rounded-2xl shadow-lg"
              whileHover={{ y: -5, scale: 1.02, boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Expense History</h2>
                <DateFilter onFilter={handleSetFilter} onClear={handleClearFilter} />
              </div>
              <ExpenseList expenses={filteredExpenses} onDeleteExpense={handleDeleteExpense} onEditExpense={setEditingExpense} />
            </motion.div>
          </motion.div>
        </motion.main>
      </div>
    </div>
  );
};

export default App;