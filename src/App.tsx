import React, { useState, useEffect } from "react";
import { auth, signOut } from "./firebase";
import Auth from "./components/Auth";
<<<<<<< Updated upstream
=======
import Dashboard from "./components/Dashboard";
import Header from "./components/Header";
import ProfileManagerModal from "./components/ProfileManagerModal";
import BudgetManagerModal from "./components/BudgetManagerModal";
import CategoryManagerModal from "./components/CategoryManagerModal";
import SettingsModal from "./components/SettingsModal";
import InstallPrompt from "./components/InstallPrompt";
import ResetPassword from "./components/ResetPassword";
import EmailVerification from "./components/EmailVerification";
import { useExpenseData } from "./hooks/useExpenseData";
import { useExpenseFilters } from "./hooks/useExpenseFilters";
import { useBudgets } from "./hooks/useBudgets";
import { useTheme } from "./services/ThemeContext";
>>>>>>> Stashed changes
import { Expense, Category } from "./types";
import { supabase } from "./supabaseClient";
import { User } from "@supabase/supabase-js";

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [currentAccountId, setCurrentAccountId] = useState<string>("all");

  useEffect(() => {
    // Auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  const {
    expenses,
    accounts,
    loading: dataLoading,
    addExpense,
    updateExpense,
    deleteExpense,
    deleteAccount,
    customCategories,
    addCategory,
    updateCategory,
    deleteCategory,
    addAccount,
    updateAccount,
  } = useExpenseData(user);

  const {
    filter,
    categoryFilter,
    setCategoryFilter,
    setDateFilter,
    clearFilter,
    filteredExpenses, // Used for totals calculation inside useExpenseFilters, but we use filteredTotal
    filteredTotal,
    categoryTotals,
    masterFilteredExpenses,
    displayedExpenses,
    loadMoreExpenses,
    hasMore,
    isLoadingMore,
  } = useExpenseFilters(expenses, currentAccountId);

  const { budgets, setBudget } = useBudgets(user);
  const { currentTheme } = useTheme();

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [selectedExpenses, setSelectedExpenses] = useState<string[]>([]);

  const handleAddExpense = async (
    name: string,
    amount: number,
    category?: Category,
    date?: string
  ) => {
    if (!currentAccountId || currentAccountId === "all") {
      alert("Cannot add expense to 'All Profiles'. Please select a specific profile.");
      return false;
    }

    try {
      // @ts-ignore
      await addExpense(name, amount, currentAccountId, category, date);
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
      await setBudget(category, amount);
    } catch (error) {
      console.error("Failed to set budget", error);
      alert("Failed to set budget. Please try again.");
    }
  };

  const handleUpdateProfile = async (name: string) => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: { full_name: name }
      });
<<<<<<< Updated upstream
=======

      if (error) throw error;

      // Update local user state to reflect changes immediately
      if (data.user) {
        setUser(data.user);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
    }
  };

  // Render
  // Check for password reset page first
  const isResetPasswordPage = window.location.hash.includes("type=recovery");
  if (isResetPasswordPage) {
    return <ResetPassword />;
  }
>>>>>>> Stashed changes

      if (error) throw error;

      // Update local user state to reflect changes immediately
      if (data.user) {
        setUser(data.user);
      }
    } catch (error) {
      </div >
    );
  }

if (!user) return <Auth />;

<<<<<<< Updated upstream
const currentProfileName =
  (accounts.find((a) => a.id === currentAccountId)?.name || "All Profiles") as string;
=======
  const currentProfileName =
    (accounts.find((a) => a.id === currentAccountId)?.name || "All Profiles") as string;
>>>>>>> Stashed changes

return (
  <div
    className={`min-h-screen text-[var(--text-main)] p-4 sm:p-6 lg:p-8 font-sans transition-colors duration-500 
                  ${currentTheme.gradientClass} ${currentTheme.animationClass}`}
<<<<<<< Updated upstream
  >
    <Header
      user={user}
      accounts={accounts}
      currentAccountId={currentAccountId}
      onSelectAccount={setCurrentAccountId}
      onManageAccounts={() => setIsProfileModalOpen(true)}
      onSignOut={handleSignOut}
      filter={filter}
      categoryFilter={categoryFilter}
      currentProfileName={currentProfileName}
      filteredTotal={filteredTotal}
      onManageCategories={() => setIsCategoryModalOpen(true)}
      onOpenSettings={() => setIsSettingsModalOpen(true)}
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
      customCategories={customCategories || []}
      onAddCategory={addCategory || (async () => null)}
    />

    <SettingsModal
      isOpen={isSettingsModalOpen}
      onClose={() => setIsSettingsModalOpen(false)}
      user={user}
      onUpdateProfile={handleUpdateProfile}
      onManageCategories={() => setIsCategoryModalOpen(true)}
      onManageProfiles={() => setIsProfileModalOpen(true)}
    />

    <ProfileManagerModal
      isOpen={isProfileModalOpen}
      onClose={() => setIsProfileModalOpen(false)}
      accounts={accounts}
      onAddAccount={addAccount}
      onDeleteAccount={handleDeleteAccount}
      onUpdateAccount={updateAccount}
    />

    <BudgetManagerModal
      isOpen={isBudgetModalOpen}
      onClose={() => setIsBudgetModalOpen(false)}
      customCategories={customCategories || []}
      budgets={budgets}
      onSetBudget={handleSetBudget}
    />

    <CategoryManagerModal
      isOpen={isCategoryModalOpen}
      onClose={() => setIsCategoryModalOpen(false)}
      customCategories={customCategories || []}
      onAddCategory={addCategory || (async () => null)}
      onUpdateCategory={updateCategory || (async () => { })}
      onDeleteCategory={deleteCategory || (async () => { })}
    />

    <InstallPrompt />
  </div>
);
};

=======
    >
      <Header
        user={user}
        accounts={accounts}
        currentAccountId={currentAccountId}
        onSelectAccount={setCurrentAccountId}
        onManageAccounts={() => setIsProfileModalOpen(true)}
        onSignOut={handleSignOut}
        filter={filter}
        categoryFilter={categoryFilter}
        currentProfileName={currentProfileName}
        filteredTotal={filteredTotal}
        onManageCategories={() => setIsCategoryModalOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
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
        customCategories={customCategories || []}
        onAddCategory={addCategory || (async () => null)}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        user={user}
        onUpdateProfile={handleUpdateProfile}
        onManageCategories={() => setIsCategoryModalOpen(true)}
        onManageProfiles={() => setIsProfileModalOpen(true)}
      />

      <ProfileManagerModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        accounts={accounts}
        onAddAccount={addAccount}
        onDeleteAccount={handleDeleteAccount}
        onUpdateAccount={updateAccount}
      />

      <BudgetManagerModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        customCategories={customCategories || []}
        budgets={budgets}
        onSetBudget={handleSetBudget}
      />

      <CategoryManagerModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        customCategories={customCategories || []}
        onAddCategory={addCategory || (async () => null)}
        onUpdateCategory={updateCategory || (async () => { })}
        onDeleteCategory={deleteCategory || (async () => { })}
      />

      <InstallPrompt />
    </div>
  );
};

>>>>>>> Stashed changes
export default App;