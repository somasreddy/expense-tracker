import ThemeSwitcher from "./components/ThemeSwitcher";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { Expense, Category, Account } from "./types";
import {
  loadData,
  saveData,
  categorizeExpense,
  formatToINR,
  loadCachedAppData,
  addExpenseToData,
  updateExpenseInData,
  deleteExpenseFromData,
} from "./services/expenseService";

import ExpenseForm from "./components/ExpenseForm";
import ExpenseList from "./components/ExpenseList";
import Summary from "./components/Summary";
import ExpenseChart from "./components/ExpenseChart";
import DateFilter from "./components/DateFilter";
import EditExpenseModal from "./components/EditExpenseModal";
import ProfileSelector from "./components/ProfileSelector";
import ProfileManagerModal from "./components/ProfileManagerModal";
import Auth from "./components/Auth";

import { auth, onAuthStateChanged, signOut } from "./firebase";

const EXPENSES_PER_PAGE = 10;

const App: React.FC = () => {
  const [masterExpenses, setMasterExpenses] = useState<Expense[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [currentAccountId, setCurrentAccountId] = useState<string>("all");

  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
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
   * AUTH LISTENER
   ******************************************/
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  /******************************************
   * PAGE TITLE
   ******************************************/
  useEffect(() => {
    if (user?.displayName) {
      document.title = `${user.displayName}'s Expense Tracker`;
    } else {
      document.title = "Expense Tracker";
    }
  }, [user]);

  /******************************************
   * LOAD DATA (FIRESTORE + CACHE)
   ******************************************/
  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        const cached = loadCachedAppData();
        if (cached) {
          setMasterExpenses(cached.expenses || []);
          setAccounts(cached.accounts || []);
          setDataLoading(false);
        } else {
          setDataLoading(true);
        }

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
        setCurrentAccountId("all");
        setDataLoading(false);
      }
    };

    fetchData();
  }, [user]);

  /******************************************
   * AUTO SAVE TO FIRESTORE
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
   * EXPENSE OPERATIONS
   ******************************************/
  const handleAddExpense = async (name: string, amount: number) => {
    if (!currentAccountId || currentAccountId === "all") {
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

    if (window.confirm(`Delete profile and move expenses to ${fallback.name}?`)) {
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
   * FILTERING
   ******************************************/
  const handleSetFilter = (start: string, end: string) =>
    setFilter({ start, end });

  const handleClearFilter = () =>
    setFilter({ start: null, end: null });

  const handleSetCategoryFilter = (category: Category) =>
    setCategoryFilter((prev) => (prev === category ? null : category));

  /******************************************
   * SELECTION
   ******************************************/
  const handleToggleExpenseSelection = (id: string) => {
    setSelectedExpenses((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = (ids: string[]) =>
    setSelectedExpenses(selectedExpenses.length === ids.length ? [] : ids);

  /******************************************
   * FILTER + PAGINATION
   ******************************************/
  const masterFilteredExpenses = useMemo(() => {
    let temp = [...masterExpenses];

    if (currentAccountId !== "all") {
      temp = temp.filter((e) => e.accountId === currentAccountId);
    }

    if (filter.start && filter.end) {
      const s = new Date(filter.start);
      const e = new Date(filter.end);
      temp = temp.filter((ex) => {
        const d = new Date(ex.date);
        return d >= s && d <= e;
      });
    }

    if (categoryFilter) {
      temp = temp.filter((e) => e.category === categoryFilter);
    }

    return temp;
  }, [masterExpenses, currentAccountId, filter, categoryFilter]);

  // Reset pagination when filters change
  useEffect(() => {
    setDisplayedExpenses(masterFilteredExpenses.slice(0, EXPENSES_PER_PAGE));
    setPage(1);
    setHasMore(masterFilteredExpenses.length > EXPENSES_PER_PAGE);
  }, [masterFilteredExpenses]);

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
    }, 400);
  }, [page, hasMore, isLoadingMore, masterFilteredExpenses]);

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
   * LOADING UI
   ******************************************/
  if (authLoading || (user && dataLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-20 w-20 border-t-2 border-b-2 border-amber-400 rounded-full"></div>
      </div>
    );
  }

  if (!user) return <Auth />;

  const filteredTotal = masterFilteredExpenses.reduce(
    (sum, e) => sum + e.amount,
    0
  );

  const categoryTotals = useMemo(() => {
    const totals: Record<Category, number> = {} as any;
    masterFilteredExpenses.forEach((e) => {
      totals[e.category] = (totals[e.category] || 0) + e.amount;
    });
    return totals;
  }, [masterFilteredExpenses]);

  /******************************************
   * UI
   ******************************************/
  return (
    <div className="min-h-screen text-slate-200 p-4 sm:p-6 lg:p-8 font-sans">
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
            <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-500">
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
              className="mt-4 text-sm text-slate-300"
            >
              Showing expenses for{" "}
              <strong>
                {accounts.find((a) => a.id === currentAccountId)?.name ||
                  "All Profiles"}
              </strong>{" "}
              — Total:{" "}
              <span className="font-bold text-amber-300">
                {formatToINR(filteredTotal)}
              </span>
            </motion.div>
          ) : null}
        </header>

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
          {/* LEFT */}
          <motion.div
            variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}
            className="lg:col-span-1 space-y-6 content-surface p-6"
          >
            <h2 className="text-2xl font-bold text-white">Add New Expense</h2>
            <ExpenseForm onAddExpense={handleAddExpense} />
            <hr className="border-slate-700" />
            <Summary
              filteredTotal={filteredTotal}
              categoryTotals={categoryTotals}
            />
          </motion.div>

          {/* RIGHT */}
          <motion.div
            variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}
            className="lg:col-span-2 space-y-6"
          >
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
                      onClick={() => setCategoryFilter(null)}
                      className="ml-2 text-sm text-amber-400"
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
                    window.confirm(`Delete ${selectedExpenses.length} selected expenses?`)
                  ) {
                    selectedExpenses.forEach((id) => handleDeleteExpense(id));
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

      <ThemeSwitcher />
    </div>
  );
};

export default App;
