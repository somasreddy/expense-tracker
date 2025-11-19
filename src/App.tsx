import ThemeSwitcher from "./components/ThemeSwitcher";
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Expense, Category, Account } from './types';
import { loadData, saveData, categorizeExpense, formatToINR, loadCachedAppData } from './services/expenseService';
import ExpenseForm from './components/ExpenseForm';
import ExpenseList from './components/ExpenseList';
import Summary from './components/Summary';
import ExpenseChart from './components/ExpenseChart';
import DateFilter from './components/DateFilter';
import EditExpenseModal from './components/EditExpenseModal';
import ProfileSelector from './components/ProfileSelector';
import ProfileManagerModal from './components/ProfileManagerModal';
import Auth from './components/Auth';
import { auth, onAuthStateChanged, signOut } from './firebase';

const EXPENSES_PER_PAGE = 10;

const App: React.FC = () => {
  const [masterExpenses, setMasterExpenses] = useState<Expense[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [currentAccountId, setCurrentAccountId] = useState<string | null>('all');
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isAccountManagerOpen, setAccountManagerOpen] = useState(false);
  const [filter, setFilter] = useState<{ start: string | null; end: string | null }>({ start: null, end: null });

  const [user, setUser] = useState<typeof auth.currentUser>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(true);

  const [selectedExpenses, setSelectedExpenses] = useState<string[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<Category | null>(null);

  const [displayedExpenses, setDisplayedExpenses] = useState<Expense[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user && user.displayName) {
      document.title = `${user.displayName}'s Expense Tracker`;
    } else {
      document.title = 'React Expense Tracker';
    }
  }, [user]);

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        // 1) Try to hydrate from local cached data for instant UI
        const cached = loadCachedAppData();
        if (cached) {
          setMasterExpenses(cached.expenses || []);
          setAccounts(cached.accounts || []);
          setDataLoading(false);
        } else {
          setDataLoading(true);
        }

        // 2) Always fetch the latest from Firestore in the background
        try {
          const appData = await loadData();
          setMasterExpenses(appData.expenses || []);
          setAccounts(appData.accounts || []);
        } finally {
          setDataLoading(false);
        }
      } else {
        setMasterExpenses([]);
        setAccounts([]);
        setCurrentAccountId('all');
        setDataLoading(false);
      }
    };
    fetchData();
  }, [user]);

  useEffect(() => {
    if (!user || authLoading || dataLoading) return;
    const isInitialDefaultData =
      masterExpenses.length === 0 &&
      accounts.length === 1 &&
      accounts[0].id.startsWith('default-account');

    if (!isInitialDefaultData) {
      saveData({ expenses: masterExpenses, accounts });
    }
  }, [masterExpenses, accounts, user, authLoading, dataLoading]);

  const handleAddExpense = async (name: string, amount: number) => {
  if (currentAccountId === 'all' || !currentAccountId) {
    alert("Please select a specific profile to add an expense.");
    return;
  }

  const updated = await addExpenseToData(
    { expenses: masterExpenses, accounts },
    currentAccountId,
    name,
    amount
  );

  setMasterExpenses(updated.expenses);
  setAccounts(updated.accounts);
};

  const handleUpdateExpense = async (updatedExpense: Expense) => {
  const updated = await updateExpenseInData(
    { expenses: masterExpenses, accounts },
    updatedExpense
  );

  setMasterExpenses(updated.expenses);
  setAccounts(updated.accounts);
  setEditingExpense(null);
};

  const handleDeleteExpense = async (id: string) => {
  const updated = await deleteExpenseFromData(
    { expenses: masterExpenses, accounts },
    id
  );

  setMasterExpenses(updated.expenses);
  setAccounts(updated.accounts);
};


  const handleAddAccount = (name: string) => {
    const newAccount: Account = { id: `${Date.now()}`, name };
    setAccounts(prevAccounts => [...prevAccounts, newAccount]);
    setCurrentAccountId(newAccount.id);
  };

  const handleDeleteAccount = (accountId: string) => {
    if (accounts.length <= 1) {
      alert("Cannot delete the last profile. At least one must remain.");
      return;
    }

    const accountToDelete = accounts.find(p => p.id === accountId);
    const fallbackAccount = accounts.find(p => p.id !== accountId);

    if (!accountToDelete || !fallbackAccount) return;

    if (window.confirm(`Delete "${accountToDelete.name}" and transfer expenses to "${fallbackAccount.name}"?`)) {
      setMasterExpenses(prevExpenses =>
        prevExpenses.map(expense =>
          expense.accountId === accountId ? { ...expense, accountId: fallbackAccount.id } : expense
        )
      );
      setAccounts(prevAccounts => prevAccounts.filter(p => p.id !== accountId));
      if (currentAccountId === accountId) setCurrentAccountId(fallbackAccount.id);
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

  const handleSetCategoryFilter = (category: Category) => {
    setCategoryFilter(prev => (prev === category ? null : category));
    setSelectedExpenses([]);
  };

  const handleToggleExpenseSelection = (id: string) => {
    setSelectedExpenses(prev =>
      prev.includes(id) ? prev.filter(expId => expId !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = (filteredIds: string[]) => {
    setSelectedExpenses(
      selectedExpenses.length === filteredIds.length ? [] : filteredIds
    );
  };

  const handleDeleteSelectedExpenses = () => {
    if (selectedExpenses.length === 0) return;
    if (window.confirm(`Delete ${selectedExpenses.length} selected expense(s)?`)) {
      setMasterExpenses(prev => prev.filter(exp => !selectedExpenses.includes(exp.id)));
      setSelectedExpenses([]);
    }
  };

  const masterFilteredExpenses = useMemo(() => {
    // Always start from a copy of masterExpenses so we don't accidentally mutate source.
    let tempExpenses = [...masterExpenses];

    // Profile filter
    if (currentAccountId !== 'all') {
      tempExpenses = tempExpenses.filter(e => e.accountId === currentAccountId);
    }

    // Date filter
    if (filter.start && filter.end) {
      const startDate = new Date(filter.start);
      const endDate = new Date(filter.end);
      tempExpenses = tempExpenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate >= startDate && expenseDate <= endDate;
      });
    }

    // Category filter
    if (categoryFilter) {
      tempExpenses = tempExpenses.filter(expense => expense.category === categoryFilter);
    }

    return tempExpenses;
  }, [masterExpenses, currentAccountId, filter, categoryFilter]);

  useEffect(() => {
    setDisplayedExpenses(masterFilteredExpenses.slice(0, EXPENSES_PER_PAGE));
    setPage(1);
    setHasMore(masterFilteredExpenses.length > EXPENSES_PER_PAGE);
  }, [masterFilteredExpenses]);

  const loadMoreExpenses = useCallback(() => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    setTimeout(() => {
      const nextPage = page + 1;
      const newExpenses = masterFilteredExpenses.slice(
        page * EXPENSES_PER_PAGE,
        nextPage * EXPENSES_PER_PAGE
      );
      setDisplayedExpenses(prev => [...prev, ...newExpenses]);
      setPage(nextPage);
      setHasMore(masterFilteredExpenses.length > nextPage * EXPENSES_PER_PAGE);
      setIsLoadingMore(false);
    }, 500);
  }, [page, hasMore, isLoadingMore, masterFilteredExpenses]);

  const dateFilteredExpensesForCharts = useMemo(() => {
    let tempExpenses =
      currentAccountId === 'all'
        ? masterExpenses
        : masterExpenses.filter(e => e.accountId === currentAccountId);

    if (!filter.start || !filter.end) return tempExpenses;

    return tempExpenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return (
        expenseDate >= new Date(filter.start!) &&
        expenseDate <= new Date(filter.end!)
      );
    });
  }, [masterExpenses, currentAccountId, filter]);

  const filteredTotal = useMemo(
    () => masterFilteredExpenses.reduce((total, expense) => total + expense.amount, 0),
    [masterFilteredExpenses]
  );

  const categoryTotals = useMemo(() => {
    const totals: { [key in Category]?: number } = {};
    dateFilteredExpensesForCharts.forEach(expense => {
      totals[expense.category] = (totals[expense.category] || 0) + expense.amount;
    });
    return totals;
  }, [dateFilteredExpensesForCharts]);

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.2 } } };
  const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } };
  const currentProfileName = accounts.find(p => p.id === currentAccountId)?.name || 'All Profiles';

  if (authLoading || (user && dataLoading)) {
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
        {editingExpense && (
          <EditExpenseModal
            expense={editingExpense}
            onUpdate={handleUpdateExpense}
            onCancel={() => setEditingExpense(null)}
          />
        )}

        {isAccountManagerOpen && (
          <ProfileManagerModal
            isOpen={isAccountManagerOpen}
            onClose={() => setAccountManagerOpen(false)}
            accounts={accounts}
            onAddAccount={handleAddAccount}
            onDeleteAccount={handleDeleteAccount}
            onUpdateAccount={handleUpdateAccount}
          />
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto card-surface p-4 sm:p-6 lg:p-8">
        <header className="mb-8">
          <div className="flex flex-wrap justify-between items-baseline gap-4">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-500 tracking-tight leading-tight">
              {user.displayName ? `${user.displayName}'s` : ""} Expense Tracker
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
                className="button button-secondary"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                Sign Out
              </motion.button>
            </div>
          </div>

          {(filter.start && filter.end) || categoryFilter ? (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 text-sm text-slate-300"
            >
              Showing expenses for <strong>{currentProfileName}</strong>. Total:{" "}
              <span className="font-bold text-amber-300">{formatToINR(filteredTotal)}</span>
            </motion.div>
          ) : null}
        </header>

        <motion.main
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="lg:col-span-1 space-y-6 content-surface p-6">
            <h2 className="text-2xl font-bold text-white">Add New Expense</h2>
            <ExpenseForm onAddExpense={handleAddExpense} />
            <hr className="border-slate-700" />
            <Summary filteredTotal={filteredTotal} categoryTotals={categoryTotals} />
          </motion.div>

          <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
            <div className="content-surface p-6">
              <h2 className="text-2xl font-bold text-white mb-4">Expense Analysis</h2>
              <ExpenseChart
                categoryTotals={categoryTotals}
                onCategoryClick={handleSetCategoryFilter}
                activeCategory={categoryFilter}
              />
            </div>

            <div className="content-surface p-6">
              <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
                <h2 className="text-2xl font-bold text-white">
                  {categoryFilter ? `${categoryFilter} Expenses` : "Recent Expenses"}
                  {categoryFilter && (
                    <button
                      onClick={() => handleSetCategoryFilter(categoryFilter)}
                      className="ml-2 text-sm text-amber-400 hover:text-amber-300"
                    >
                      (Clear)
                    </button>
                  )}
                </h2>

                <DateFilter onFilter={handleSetFilter} onClear={handleClearFilter} />
              </div>

              <ExpenseList
                expenses={displayedExpenses}
                onDeleteExpense={handleDeleteExpense}
                onEditExpense={setEditingExpense}
                selectedExpenses={selectedExpenses}
                onToggleExpenseSelection={handleToggleExpenseSelection}
                onToggleSelectAll={() =>
                  handleToggleSelectAll(masterFilteredExpenses.map(e => e.id))
                }
                onDeleteSelected={handleDeleteSelectedExpenses}
                onLoadMore={loadMoreExpenses}
                hasMore={hasMore}
                isLoadingMore={isLoadingMore}
              />
            </div>
          </motion.div>
        </motion.main>
      </div>

      {/* 🌈 ADD THE THEME SWITCHER FLOATING BUTTON */}
      <ThemeSwitcher />
    </div>
  );
};

export default App;
