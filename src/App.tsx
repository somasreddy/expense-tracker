import React, {
  useState,
  useEffect,
  useCallback,
} from "react";

import { useTheme } from "./services/ThemeContext";
import { Expense, Budget, Category } from "./types";

import ProfileSelector from "./components/ProfileSelector";
import ProfileManagerModal from "./components/ProfileManagerModal";
import EditExpenseModal from "./components/EditExpenseModal";
import Auth from "./components/Auth";
import EmailVerification from "./components/EmailVerification";
import ResetPassword from "./components/ResetPassword";
import ThemeSwitcher from "./components/ThemeSwitcher";
import Header from "./components/Header";
import Dashboard from "./components/Dashboard";

import { auth, onAuthStateChanged, signOut } from "./firebase";
import { useExpenseData } from "./hooks/useExpenseData";
import { useExpenseFilters } from "./hooks/useExpenseFilters";
import {
  loadBudgets,
  loadCategories,
  addCategory,
  createAndPersistExpense,
  upsertBudget
} from "./services/expenseService";

const EXPENSES_PER_PAGE = 10;

const AppContent: React.FC = () => {
  const { currentTheme } = useTheme();

  // Auth State
  const [user, setUser] = useState<typeof auth.currentUser>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user?.displayName) {
      document.title = `${user.displayName}'s Expense Tracker`;
    } else {
      document.title = "Expense Tracker";
    }
  }, [user]);

  // Data Hooks
  const {
    expenses: masterExpenses,
    accounts,
    loading: dataLoading,
    addExpense,
    updateExpense,
    deleteExpense,
    addAccount,
    updateAccount,
    deleteAccount,
  } = useExpenseData(user);

  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [isAccountManagerOpen, setAccountManagerOpen] = useState(false);

  // Load initial data (budgets, categories)
  useEffect(() => {
    if (user) {
      const init = async () => {
        try {
          const loadedBudgets = await loadBudgets();
          setBudgets(loadedBudgets);

          const loadedCategories = await loadCategories();
          setCustomCategories(loadedCategories);
        } catch (error) {
          console.error("Failed to load initial data", error);
        }
      };
      init();
    }
  }, [user]);

  // UI State
  const [currentAccountId, setCurrentAccountId] = useState<string>("all");
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [selectedExpenses, setSelectedExpenses] = useState<string[]>([]);

  // Filter Hook
  const {
    filter,
    setDateFilter,
    clearFilter,
    categoryFilter,
    setCategoryFilter,
    filteredExpenses: masterFilteredExpenses,
    filteredTotal,
    categoryTotals,
  } = useExpenseFilters(masterExpenses, currentAccountId);

  // Pagination State
  const [displayedExpenses, setDisplayedExpenses] = useState<Expense[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Reset pagination when filters change
  useEffect(() => {
    setDisplayedExpenses(masterFilteredExpenses.slice(0, EXPENSES_PER_PAGE));
    setPage(1);
    setHasMore(masterFilteredExpenses.length > EXPENSES_PER_PAGE);
  }, [masterFilteredExpenses]);

  // Load More Callback
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

  // Handlers
  const handleAddCategory = async (name: string) => {
    try {
      const newCat = await addCategory(name);
      if (newCat) {
        setCustomCategories(prev => [...prev, newCat]);
      }
    } catch (error) {
      console.error("Failed to add category", error);
      alert("Failed to add category. Please try again.");
    }
  };

  const handleAddExpense = async (name: string, amount: number, category?: Category): Promise<boolean> => {
    if (!user) {
      alert("Please sign in to add expenses.");
      return false;
    }

    if (!currentAccountId || currentAccountId === "all") {
      alert("Cannot add expense to 'All Profiles'. Please select a specific profile.");
      return false;
    }

    try {
      // @ts-ignore
      await addExpense(name, amount, currentAccountId, category);
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const handleUpdateExpense = async (expense: Expense) => {
    await updateExpense({ ...expense, amount: Number(expense.amount) });
    setEditingExpense(null);
  };

  const handleDeleteExpenseClick = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this expense?")) {
      await deleteExpense(id);
    }
  };

  const handleDeleteAccount = (accountId: string) => {
    if (accounts.length <= 1) {
      alert("Cannot delete the last profile.");
      return;
    }
    const fallback = accounts.find((a) => a.id !== accountId);
    if (!fallback) return;

    if (window.confirm(`Delete profile "${accounts.find((a) => a.id === accountId)?.name}"?`)) {
      deleteAccount(accountId, fallback.id);
      if (currentAccountId === accountId) setCurrentAccountId(fallback.id);
    }
  };

  const handleToggleExpenseSelection = (id: string) => {
    setSelectedExpenses((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = (ids: string[]) =>
    setSelectedExpenses(selectedExpenses.length === ids.length ? [] : ids);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSetBudget = async (category: Category, amount: number) => {
    try {
      const updatedBudget = await upsertBudget(category, amount);
      if (updatedBudget) {
        setBudgets(prev => {
          const exists = prev.find(b => b.id === updatedBudget.id);
          if (exists) {
            return prev.map(b => b.id === updatedBudget.id ? updatedBudget : b);
          }
          return [...prev, updatedBudget];
        });
      }
    } catch (error) {
      console.error("Failed to set budget", error);
      alert("Failed to set budget. Please try again.");
    }
  };

  // // Render
  // if (authLoading || (user && dataLoading)) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center bg-[var(--bg-body)]">
  //       <div className="animate-spin h-20 w-20 border-t-2 border-b-2 border-amber-400 rounded-full" />
  //     </div>
  //   );
  // }
  // Render
  // Check for password reset page first
  const isResetPasswordPage = window.location.hash.includes("type=recovery");
  if (isResetPasswordPage) {
    return <ResetPassword />;
  }

  // Check for email verification page
  const isEmailVerificationPage = window.location.hash.includes("type=signup");
  if (isEmailVerificationPage) {
    return <EmailVerification />;
  }

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
    <div
      className={`min-h-screen text-[var(--text-main)] p-4 sm:p-6 lg:p-8 font-sans transition-colors duration-500 
                  ${currentTheme.gradientClass} ${currentTheme.animationClass}`}
    >
      <div className="max-w-7xl mx-auto card-surface p-4 sm:p-6 lg:p-8">
        <Header
          user={user as any}
          accounts={accounts}
          currentAccountId={currentAccountId}
          onSelectAccount={setCurrentAccountId}
          onManageAccounts={() => setAccountManagerOpen(true)}
          onSignOut={handleSignOut}
          filter={filter}
          categoryFilter={categoryFilter}
          currentProfileName={currentProfileName}
          filteredTotal={filteredTotal}
        />

        <Dashboard
          onAddExpense={handleAddExpense}
          filteredTotal={filteredTotal}
          categoryTotals={categoryTotals}
          masterFilteredExpenses={masterFilteredExpenses}
          onSetCategoryFilter={setCategoryFilter}
          categoryFilter={categoryFilter}
          onSetFilter={setDateFilter}
          onClearFilter={clearFilter}
          displayedExpenses={displayedExpenses}
          onDeleteExpense={handleDeleteExpenseClick}
          onEditExpense={setEditingExpense}
          selectedExpenses={selectedExpenses}
          onToggleExpenseSelection={handleToggleExpenseSelection}
          onToggleSelectAll={handleToggleSelectAll}
          onDeleteSelected={() => {
            if (
              selectedExpenses.length > 0 &&
              window.confirm(`Delete ${selectedExpenses.length} selected expenses?`)
            ) {
              selectedExpenses.forEach((id) => deleteExpense(id));
              setSelectedExpenses([]);
            }
          }}
          onLoadMore={loadMoreExpenses}
          hasMore={hasMore}
          isLoadingMore={isLoadingMore}
          budgets={budgets}
          onSetBudget={handleSetBudget}
          customCategories={customCategories}
          onAddCategory={handleAddCategory}
        />
      </div>

      <ThemeSwitcher />

      <ProfileManagerModal
        isOpen={isAccountManagerOpen}
        onClose={() => setAccountManagerOpen(false)}
        accounts={accounts}
        onAddAccount={addAccount}
        onDeleteAccount={handleDeleteAccount}
        onUpdateAccount={updateAccount}
      />

      {editingExpense && (
        <EditExpenseModal
          expense={editingExpense}
          onUpdate={handleUpdateExpense}
          onCancel={() => setEditingExpense(null)}
          customCategories={customCategories}
          onAddCategory={handleAddCategory}
        />
      )}
    </div>
  );
};

const App: React.FC = () => {
  return <AppContent />;
};

export default App;