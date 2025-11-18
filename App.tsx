
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Expense, Category, Account } from './types';
import { loadData, saveData } from './services/expenseService';
import ExpenseForm from './components/ExpenseForm';
import ExpenseList from './components/ExpenseList';
import Summary from './components/Summary';
import ExpenseChart from './components/ExpenseChart';
import DateFilter from './components/DateFilter';
import EditExpenseModal from './components/EditExpenseModal';
import ProfileSelector from './components/ProfileSelector';
import ProfileManagerModal from './components/ProfileManagerModal';
import Auth from './components/Auth';
// FIX: Consolidate all firebase auth imports to be from the local firebase module to fix resolution errors.
import { auth, onAuthStateChanged, signOut, type User } from './firebase';

const App: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [currentAccountId, setCurrentAccountId] = useState<string | null>('all');
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isAccountManagerOpen, setAccountManagerOpen] = useState(false);
  const [filter, setFilter] = useState<{ start: string | null; end: string | null }>({ start: null, end: null });

  // Fix: The 'User' type is now correctly imported from the local './firebase' module.
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      const { expenses: loadedExpenses, accounts: loadedAccounts } = loadData();
      setExpenses(loadedExpenses);
      setAccounts(loadedAccounts);
    }
  }, [user]);

  useEffect(() => {
    if (user && (expenses.length > 0 || accounts.length > 0)) {
      saveData({ expenses, accounts });
    }
  }, [expenses, accounts, user]);

  const handleAddExpense = (name: string, amount: number) => {
    if (currentAccountId === 'all' || !currentAccountId) {
      alert("Please select a specific account to add an expense.");
      return;
    }

    const newExpense: Expense = {
      id: `${Date.now()}-${Math.random()}`,
      accountId: currentAccountId,
      name,
      amount,
      category: 'Others',
      date: new Date().toISOString().split('T')[0],
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

  const handleAddAccount = (name: string) => {
    const newAccount: Account = { id: `${Date.now()}`, name };
    setAccounts(prevAccounts => [...prevAccounts, newAccount]);
    setCurrentAccountId(newAccount.id);
  };

  const handleDeleteAccount = (accountId: string) => {
    if (accounts.length <= 1) {
      alert("Cannot delete the last account. At least one must remain.");
      return;
    }

    const accountToDelete = accounts.find(p => p.id === accountId);
    // Find a fallback account to transfer expenses to.
    const fallbackAccount = accounts.find(p => p.id !== accountId);

    // This condition should not be met if accounts.length > 1, but it's a safeguard.
    if (!accountToDelete || !fallbackAccount) {
      alert("Error: An unexpected problem occurred. Could not find a fallback account for expense transfer.");
      return;
    }

    const confirmationMessage = `Are you sure you want to delete the "${accountToDelete.name}" account? All associated expenses will be transferred to the "${fallbackAccount.name}" account.`;

    if (window.confirm(confirmationMessage)) {
      // Re-assign expenses from the deleted account to the fallback account.
      setExpenses(prevExpenses =>
        prevExpenses.map(expense =>
          expense.accountId === accountId
            ? { ...expense, accountId: fallbackAccount.id }
            : expense
        )
      );

      // Remove the account from the list.
      setAccounts(prevAccounts => prevAccounts.filter(p => p.id !== accountId));

      // If the deleted account was the one being viewed, switch to the fallback account for a better UX.
      if (currentAccountId === accountId) {
        setCurrentAccountId(fallbackAccount.id);
      }
    }
  };


  const handleUpdateAccount = (accountId: string, newName: string) => {
    setAccounts(prevAccounts =>
      prevAccounts.map(p => (p.id === accountId ? { ...p, name: newName } : p))
    );
  };

  const handleSetFilter = (start: string, end: string) => setFilter({ start, end });
  const handleClearFilter = () => setFilter({ start: null, end: null });
  
  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const accountExpenses = useMemo(() => {
    if (currentAccountId === 'all') return expenses;
    return expenses.filter(e => e.accountId === currentAccountId);
  }, [expenses, currentAccountId]);

  const filteredExpenses = useMemo(() => {
    if (!filter.start || !filter.end) return accountExpenses;
    return accountExpenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      const startDate = new Date(filter.start!);
      const endDate = new Date(filter.end!);
      return expenseDate >= startDate && expenseDate <= endDate;
    });
  }, [accountExpenses, filter]);

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

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.2 } } };
  const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } };
  const currentAccountName = accounts.find(p => p.id === currentAccountId)?.name || 'All Accounts';

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-amber-400"></div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen text-slate-200 font-sans p-4 sm:p-6 lg:p-8">
      <AnimatePresence>
        {editingExpense && <EditExpenseModal expense={editingExpense} onUpdate={handleUpdateExpense} onCancel={() => setEditingExpense(null)} />}
        {isAccountManagerOpen && <ProfileManagerModal isOpen={isAccountManagerOpen} onClose={() => setAccountManagerOpen(false)} accounts={accounts} onAddAccount={handleAddAccount} onDeleteAccount={handleDeleteAccount} onUpdateAccount={handleUpdateAccount} />}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto bg-slate-900/50 backdrop-blur-xl p-4 sm:p-6 lg:p-8 rounded-3xl shadow-2xl border border-white/10">
        <header className="mb-8">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-500 tracking-tight">
              {user.displayName ? `${user.displayName}'s` : ''} Expense Tracker
            </h1>
            <div className="flex items-center gap-3">
              <ProfileSelector
                accounts={accounts}
                currentAccountId={currentAccountId}
                onSelectAccount={setCurrentAccountId}
                onManageAccounts={() => setAccountManagerOpen(true)}
              />
              <motion.button
                onClick={handleSignOut}
                className="inline-flex items-center justify-center py-2 px-4 border border-slate-600 shadow-sm text-sm font-medium rounded-md text-slate-200 bg-slate-700/80 hover:bg-slate-600/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                whileHover={{ scale: 1.05, y: -2, boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.1)" }}
                whileTap={{ scale: 0.95 }}
                aria-label="Sign Out"
              >
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign Out
              </motion.button>
            </div>
          </div>
          <p className="mt-2 text-lg text-slate-400">
            Currently viewing expenses for: <span className="font-bold text-amber-300">{currentAccountName}</span>
          </p>
        </header>

        <motion.main className="grid grid-cols-1 lg:grid-cols-3 gap-8" variants={containerVariants} initial="hidden" animate="visible">
          <motion.div className="lg:col-span-1 space-y-8" variants={itemVariants}>
            <motion.div className="bg-slate-800/40 backdrop-blur-2xl p-6 rounded-2xl shadow-lg border border-white/10" whileHover={{ y: -5, scale: 1.02, boxShadow: "0 20px 30px rgba(0,0,0,0.2)" }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
              <h2 className="text-2xl font-bold mb-4 text-white">Add New Expense</h2>
              {currentAccountId !== 'all' ? (
                <ExpenseForm onAddExpense={handleAddExpense} />
              ) : (
                <div className="text-center p-4 bg-slate-900/50 rounded-lg">
                  <p className="text-slate-400 text-sm">Please select a specific account to add a new expense.</p>
                </div>
              )}
            </motion.div>
            <motion.div className="bg-slate-800/40 backdrop-blur-2xl p-6 rounded-2xl shadow-lg border border-white/10" whileHover={{ y: -5, scale: 1.02, boxShadow: "0 20px 30px rgba(0,0,0,0.2)" }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
              <Summary filteredTotal={filteredTotal} categoryTotals={categoryTotals} />
            </motion.div>
          </motion.div>
          
          <motion.div className="lg:col-span-2 space-y-8" variants={itemVariants}>
            <motion.div className="bg-slate-800/40 backdrop-blur-2xl p-6 rounded-2xl shadow-lg border border-white/10" whileHover={{ y: -5, scale: 1.02, boxShadow: "0 20px 30px rgba(0,0,0,0.2)" }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
              <h2 className="text-2xl font-bold mb-4 text-white">Category Distribution</h2>
              <ExpenseChart categoryTotals={categoryTotals} />
            </motion.div>
            <motion.div className="bg-slate-800/40 backdrop-blur-2xl p-6 rounded-2xl shadow-lg border border-white/10" whileHover={{ y: -5, scale: 1.02, boxShadow: "0 20px 30px rgba(0,0,0,0.2)" }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
              <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
                <h2 className="text-2xl font-bold text-white">Expense History</h2>
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
