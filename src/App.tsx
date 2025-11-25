import React, { useState, useEffect } from "react";
import { auth, signOut } from "./firebase";
import Auth from "./components/Auth";
import EmailVerification from "./components/EmailVerification";
import ResetPassword from "./components/ResetPassword";
import Header from "./components/Header";
import Dashboard from "./components/Dashboard";
import ProfileManagerModal from "./components/ProfileManagerModal";
import BudgetManagerModal from "./components/BudgetManagerModal";
import CategoryManagerModal from "./components/CategoryManagerModal";
import SettingsModal from "./components/SettingsModal";
import InstallPrompt from "./components/InstallPrompt";
import EditExpenseModal from "./components/EditExpenseModal";
import DeleteProfileModal from "./components/DeleteProfileModal";

import { useExpenseData } from "./hooks/useExpenseData";
import { useExpenseFilters } from "./hooks/useExpenseFilters";
import { useBudgets } from "./hooks/useBudgets";
import { useTheme } from "./services/ThemeContext";
import { useDialog } from "./contexts/DialogContext";

import { Expense, Category } from "./types";
import { supabase } from "./supabaseClient";
import { User } from "@supabase/supabase-js";
import { Capacitor } from "@capacitor/core";
import { App as CapacitorApp } from "@capacitor/app";
import { startSMSListener, checkRecentSMS } from "./services/smsService";

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [currentAccountId, setCurrentAccountId] = useState<string>("all");

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    // Initialize SMS Listener (Android Only)
    if (Capacitor.isNativePlatform()) {
      startSMSListener((msg) => console.log("SMS Detected:", msg));

      // Check on Resume
      CapacitorApp.addListener("resume", async () => {
        console.log("App Resumed. Checking for recent SMS...");
        const count = await checkRecentSMS();
        if (count > 0) {
          // We could show a toast here, but for now just log
          console.log(`Auto-captured ${count} expenses from SMS.`);
        }
      });
    }

    return () => subscription.unsubscribe();
  }, []);

  // Data hooks
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
    filteredExpenses,
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
  const { showAlert, showConfirm } = useDialog();

  // UI state
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [selectedExpenses, setSelectedExpenses] = useState<string[]>([]);
  const [deletingProfile, setDeletingProfile] = useState<string | null>(null);

  // Handlers
  const handleAddExpense = async (
    name: string,
    amount: number,
    category?: Category,
    date?: string
  ): Promise<boolean> => {
    if (!currentAccountId || currentAccountId === "all") {
      await showAlert("Cannot add expense to 'All Profiles'. Please select a specific profile.", "Action Required");
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
    if (await showConfirm("Are you sure you want to delete this expense?", "Delete Expense")) {
      await deleteExpense(id);
    }
  };

  const handleDeleteAccount = async (accountId: string) => {
    if (accounts.length <= 1) {
      await showAlert("Cannot delete the last profile.", "Action Denied");
      return;
    }
    setDeletingProfile(accountId);
  };

  const handleConfirmDeleteProfile = (deleteExpenses: boolean, targetProfileId?: string) => {
    if (!deletingProfile) return;

    if (deleteExpenses) {
      deleteAccount(deletingProfile);
    } else {
      deleteAccount(deletingProfile, targetProfileId);
    }

    if (currentAccountId === deletingProfile) {
      const remaining = accounts.filter(a => a.id !== deletingProfile);
      if (remaining.length > 0) {
        setCurrentAccountId(remaining[0].id);
      }
    }

    setDeletingProfile(null);
  };

  const handleToggleExpenseSelection = (id: string) => {
    setSelectedExpenses((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = (ids: string[]) => {
    setSelectedExpenses(selectedExpenses.length === ids.length ? [] : ids);
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateProfile = async (name: string) => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: { full_name: name },
      });
      if (error) throw error;
      if (data?.user) {
        setUser(data.user);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      await showAlert("Failed to update profile. Please try again.", "Error");
    }
  };

  const handleSetBudget = async (category: Category, amount: number) => {
    try {
      await setBudget(category, amount);
    } catch (error) {
      console.error("Failed to set budget", error);
      await showAlert("Failed to set budget. Please try again.", "Error");
    }
  };

  const isResetPasswordPage = window.location.hash.includes("type=recovery");
  if (isResetPasswordPage) {
    return <ResetPassword />;
  }

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
    (accounts.find((a) => a.id === currentAccountId)?.name || "All Profiles") as string;

  return (
    <div
      className={`min-h-screen text-[var(--text-main)] p-4 sm:p-6 lg:p-8 font-sans transition-colors duration-500 ${currentTheme.gradientClass} ${currentTheme.animationClass}`}
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
        onDeleteSelected={async () => {
          if (
            selectedExpenses.length > 0 &&
            await showConfirm(`Delete ${selectedExpenses.length} selected expenses?`, "Delete Multiple")
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
        onAddCategory={async (name) => { await addCategory?.(name); }}
        onUpdateCategory={updateCategory || (async () => { })}
        onDeleteCategory={deleteCategory || (async () => { })}
      />

      <InstallPrompt />

      {editingExpense && (
        <EditExpenseModal
          expense={editingExpense}
          onUpdate={handleUpdateExpense}
          onCancel={() => setEditingExpense(null)}
          customCategories={customCategories || []}
          onAddCategory={addCategory || (async () => null)}
        />
      )}

      {deletingProfile && (
        <DeleteProfileModal
          profileToDelete={accounts.find(a => a.id === deletingProfile)!}
          availableProfiles={accounts.filter(a => a.id !== deletingProfile)}
          expenseCount={expenses.filter(e => e.accountId === deletingProfile).length}
          onConfirm={handleConfirmDeleteProfile}
          onCancel={() => setDeletingProfile(null)}
        />
      )}
    </div>
  );
};

export default App;