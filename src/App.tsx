import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { motion } from "framer-motion";

import { ThemeProvider, useTheme } from "./services/ThemeContext";

import { Expense, Category, Account } from "./types";

import {
  loadData,
  saveData,
  formatToINR,
  loadCachedAppData,
  createAndPersistExpense,
  updateExpenseInData,
  deleteExpenseFromData,
} from "./services/expenseService";

import ExpenseForm from "./components/ExpenseForm";
import ExpenseList from "./components/ExpenseList";
import Summary from "./components/Summary";
import ExpenseChart from "./components/ExpenseChart";
import DateFilter from "./components/DateFilter";
import ProfileSelector from "./components/ProfileSelector";
import ProfileManagerModal from "./components/ProfileManagerModal"; // Ensure this is imported
import Auth from "./components/Auth";
import ThemeSwitcher from "./components/ThemeSwitcher";

import { auth, onAuthStateChanged, signOut } from "./firebase";

const EXPENSES_PER_PAGE = 10;

// Inner App component that consumes the theme context
const AppContent: React.FC = () => {
  /******************************************
   * THEME CONTEXT
   ******************************************/
  const { currentTheme } = useTheme();

  /******************************************
   * STATE
   ******************************************/
  const [masterExpenses, setMasterExpenses] = useState<Expense[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [currentAccountId, setCurrentAccountId] = useState<string>("all");

  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  
  // ✅ STATE FOR MODAL VISIBILITY
  const [isAccountManagerOpen, setAccountManagerOpen] = useState(false);

  const [filter, setFilter] = useState<{ start: string | null; end: string | null }>({
    start: null,
    end: null,
  });

  const [user, setUser] = useState<typeof auth.currentUser>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(true);

  const [selectedExpenses, setSelectedExpenses] = useState<string[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<Category | null>(null);

  const [displayedExpenses, setDisplayedExpenses] = useState<Expense[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  /******************************************
   * EFFECT 1: AUTH LISTENER
   ******************************************/
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  /******************************************
   * EFFECT 2: DOCUMENT TITLE
   ******************************************/
  useEffect(() => {
    if (user?.displayName) {
      document.title = `${user.displayName}'s Expense Tracker`;
    } else {
      document.title = "Expense Tracker";
    }
  }, [user]);

  /******************************************
   * EFFECT 3: LOAD DATA (FIREBASE + CACHE)
   ******************************************/
  useEffect(() => {
    if (!user) {
      setMasterExpenses([]);
      setAccounts([]);
      setCurrentAccountId("all");
      setDataLoading(false);
      return;
    }

    // 1️⃣ Load cached data instantly
    const cached = loadCachedAppData();
    if (cached) {
      setMasterExpenses(cached.expenses);
      setAccounts(cached.accounts);
      setDataLoading(false);
    } else {
      setDataLoading(true);
    }

    // 2️⃣ Firestore sync in background (non-blocking)
    loadData().then((fresh) => {
      setMasterExpenses(fresh.expenses);
      setAccounts(fresh.accounts);
      setDataLoading(false);
    });
  }, [user]);

  /******************************************
   * EFFECT 4: AUTO SAVE WHEN DATA CHANGES
   ******************************************/
  useEffect(() => {
    if (!user || authLoading || dataLoading) return;

    const isInitialDefault =
      masterExpenses.length === 0 &&
      accounts.length === 1 &&
      accounts[0].id.startsWith("default-account");

    if (!isInitialDefault) {
      saveData({ expenses: masterExpenses, accounts });
    }
  }, [masterExpenses, accounts, user, authLoading, dataLoading]);

  /******************************************
   * MEMO 1: FILTERED EXPENSES (PROFILE + DATE + CATEGORY)
   ******************************************/
  const masterFilteredExpenses = useMemo(() => {
    let temp = [...masterExpenses];

    // Profile filter
    if (currentAccountId !== "all") {
      temp = temp.filter((e) => e.accountId === currentAccountId);
    }

    // Date range filter
    if (filter.start && filter.end) {
      const s = new Date(filter.start);
      const e = new Date(filter.end);
      temp = temp.filter((ex) => {
        const d = new Date(ex.date);
        return d >= s && d <= e;
      });
    }

    // Category filter
    if (categoryFilter) {
      temp = temp.filter((e) => e.category === categoryFilter);
    }

    return temp;
  }, [masterExpenses, currentAccountId, filter, categoryFilter]);

  /******************************************
   * EFFECT 5: RESET PAGINATION WHEN FILTERS CHANGE
   ******************************************/
  useEffect(() => {
    setDisplayedExpenses(masterFilteredExpenses.slice(0, EXPENSES_PER_PAGE));
    setPage(1);
    setHasMore(masterFilteredExpenses.length > EXPENSES_PER_PAGE);
  }, [masterFilteredExpenses]);

  /******************************************
   * CALLBACK 1: LOAD MORE
   ******************************************/
  const loadMoreExpenses = useCallback(() => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    setTimeout(() => {
      const next = page + 1;
      const more = masterFilteredExpenses.slice(
        page * EXPENSES_PER_PAGE,
        next * EXPENSES_PER_PAGE
      );

      setDisplayedExpenses((prev) => [...prev, ...more]);
      setPage(next);
      setHasMore(masterFilteredExpenses.length > next * EXPENSES_PER_PAGE);
      setIsLoadingMore(false);
    }, 350);
  }, [page, hasMore, isLoadingMore, masterFilteredExpenses]);

  /******************************************
   * MEMO 2: TOTAL & CATEGORY TOTALS
   ******************************************/
  const filteredTotal = useMemo(
    () => masterFilteredExpenses.reduce((sum, e) => sum + e.amount, 0),
    [masterFilteredExpenses]
  );

  const categoryTotals = useMemo(() => {
    const totals: Record<Category, number> = {} as any;
    masterFilteredExpenses.forEach((e) => {
      totals[e.category] = (totals[e.category] || 0) + e.amount;
    });
    return totals;
  }, [masterFilteredExpenses]);

  /******************************************
   * EXPENSE OPERATIONS
   ******************************************/
  const handleAddExpense = async (name: string, amount: number): Promise<boolean> => {
    if (!currentAccountId || currentAccountId === "all") {
      alert("Cannot add expense to 'All Profiles'. Please select a specific profile.");
      return false;
    }

    const newExpense = await createAndPersistExpense(
      { expenses: masterExpenses, accounts },
      currentAccountId,
      name,
      amount
    );
    
    setMasterExpenses(prevExpenses => [newExpense, ...prevExpenses]);
    return true;
  };

  const handleUpdateExpense = async (expense: Expense) => {
    const updated = await updateExpenseInData(
      { expenses: masterExpenses, accounts },
      expense
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

  /******************************************
   * ACCOUNT MANAGEMENT
   ******************************************/
  const handleAddAccount = (name: string) => {
    const newAccount: Account = { id: `${Date.now()}`, name };
    setAccounts((prev) => [...prev, newAccount]);
    setCurrentAccountId(newAccount.id);
  };

  const handleDeleteAccount = (accountId: string) => {
    if (accounts.length <= 1) {
      alert("Cannot delete the last profile.");
      return;
    }

    const fallback = accounts.find((a) => a.id !== accountId);
    if (!fallback) return;

    if (
      window.confirm(
        `Delete profile "${accounts.find((a) => a.id === accountId)?.name}"?`
      )
    ) {
      setMasterExpenses((prev) =>
        prev.map((exp) =>
          exp.accountId === accountId ? { ...exp, accountId: fallback.id } : exp
        )
      );
      setAccounts((prev) => prev.filter((p) => p.id !== accountId));
      if (currentAccountId === accountId) setCurrentAccountId(fallback.id);
    }
  };

  const handleUpdateAccount = (accountId: string, newName: string) => {
    setAccounts((prev) =>
      prev.map((p) => (p.id === accountId ? { ...p, name: newName } : p))
    );
  };

  /******************************************
   * FILTERS & SELECTION
   ******************************************/
  const handleSetFilter = (start: string, end: string) =>
    setFilter({ start, end });

  const handleClearFilter = () =>
    setFilter({ start: null, end: null });

  const handleSetCategoryFilter = (category: Category) =>
    setCategoryFilter((prev) => (prev === category ? null : category));

  const handleToggleExpenseSelection = (id: string) => {
    setSelectedExpenses((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = (ids: string[]) =>
    setSelectedExpenses(selectedExpenses.length === ids.length ? [] : ids);

  /******************************************
   * SIGN OUT
   ******************************************/
  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error(e);
    }
  };

  /******************************************
   * RENDER
   ******************************************/
  if (authLoading || (user && dataLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-body)]">
        <div className="animate-spin h-20 w-20 border-t-2 border-b-2 border-amber-400 rounded-full" />
      </div>
    );
  }

  if (!user) return <Auth />;

  const currentProfileName =
    accounts.find((a) => a.id === currentAccountId)?.name || "All Profiles";

  return (
    // MAIN WRAPPER DIV
    <div
      className={`min-h-screen text-[var(--text-main)] p-4 sm:p-6 lg:p-8 font-sans transition-colors duration-500 
                  ${currentTheme.gradientClass} ${currentTheme.animationClass}`}
    >
      <div className="max-w-7xl mx-auto card-surface p-4 sm:p-6 lg:p-8">
        {/* HEADER */}
        <header className="mb-8">
          <div className="flex flex-wrap justify-between items-baseline gap-4">
            {/* Updated Title Gradient with padding-bottom to avoid clipping */}
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight pb-1">
              <span 
                className={`bg-clip-text text-transparent bg-gradient-to-r ${currentTheme.accentClass}`}
                style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
              >
                {user.displayName ? `${user.displayName}'s` : "My"} Expense Tracker
              </span>
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
                whileHover={{ scale: 1.05 }}
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
              className="mt-4 text-sm opacity-80"
            >
              Showing expenses for{" "}
              <strong>{currentProfileName}</strong> — Total:{" "}
              <span className="font-bold text-[var(--text-highlight)]">
                {formatToINR(filteredTotal)}
              </span>
            </motion.div>
          ) : null}
        </header>

        {/* MAIN CONTENT GRID */}
        <motion.main
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.2 },
            },
          }}
          initial="hidden"
          animate="visible"
        >
          {/* LEFT: FORM + SUMMARY */}
          <motion.div
            variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}
            className="lg:col-span-1 space-y-6 content-surface p-6"
          >
            <h2 className="text-2xl font-bold">Add New Expense</h2>
            <ExpenseForm onAddExpense={handleAddExpense} />
            <hr className="border-[var(--border-subtle)]" />
            <Summary
              filteredTotal={filteredTotal}
              categoryTotals={categoryTotals}
            />
          </motion.div>

          {/* RIGHT: CHART + LIST */}
          <motion.div
            variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}
            className="lg:col-span-2 space-y-6"
          >
            {/* CHART */}
            <div className="content-surface p-6 min-h-[260px]">
              <h2 className="text-2xl font-bold mb-4">
                Expense Analysis
              </h2>
              {masterFilteredExpenses.length === 0 ? (
                <p className="opacity-60 text-sm">
                  No expenses to visualize yet. Add a few expenses to see charts.
                </p>
              ) : (
                <div className="w-full h-64">
                  <ExpenseChart
                    categoryTotals={categoryTotals}
                    onCategoryClick={handleSetCategoryFilter}
                    activeCategory={categoryFilter}
                  />
                </div>
              )}
            </div>

            {/* LIST */}
            <div className="content-surface p-6">
              <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
                <h2 className="text-2xl font-bold">
                  {categoryFilter ? `${categoryFilter} Expenses` : "Recent Expenses"}
                  {categoryFilter && (
                    <button
                      onClick={() => setCategoryFilter(null)}
                      className="ml-2 text-sm text-[var(--text-highlight)]"
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
                  handleToggleSelectAll(masterFilteredExpenses.map((e) => e.id))
                }
                onDeleteSelected={() => {
                  if (
                    selectedExpenses.length > 0 &&
                    window.confirm(
                      `Delete ${selectedExpenses.length} selected expenses?`
                    )
                  ) {
                    selectedExpenses.forEach((id) => {
                      handleDeleteExpense(id);
                    });
                    setSelectedExpenses([]);
                  }
                }}
                onLoadMore={loadMoreExpenses}
                hasMore={hasMore}
                isLoadingMore={isLoadingMore}
              />
            </div>
          </motion.div>
        </motion.main>
      </div>

      {/* ✅ THEME SWITCHER (Inside the main div) */}
      <ThemeSwitcher />

      {/* ✅ PROFILE MANAGER MODAL (Inside the main div) */}
      <ProfileManagerModal
        isOpen={isAccountManagerOpen}
        onClose={() => setAccountManagerOpen(false)}
        accounts={accounts}
        onAddAccount={handleAddAccount}
        onDeleteAccount={handleDeleteAccount}
        onUpdateAccount={handleUpdateAccount}
      />

    </div>
  );
};

// Removed inner ThemeProvider since main.tsx handles it
const App: React.FC = () => {
  return <AppContent />;
};

export default App;