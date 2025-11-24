// src/services/expenseService.ts
// Supabase-backed implementation of all data operations for the app.

import { Expense, Account, AppData, Category, Budget } from "../types";
import { CATEGORY_KEYWORDS, DEFAULT_CATEGORIES } from "../constants";
import { supabase } from "../supabaseClient";
import { auth } from "../firebase";

/* -----------------------------------------------------
   LOCAL CACHE KEY
----------------------------------------------------- */
const LOCAL_STORAGE_KEY = "expenseCalculator_appData_supabase";

/* -----------------------------------------------------
   HELPERS
----------------------------------------------------- */
const getCurrentUserId = async (): Promise<string | null> => {
  const current = auth.currentUser;
  if (current?.uid) return current.uid;

  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
};

const ensureDefaultAccount = (accounts: Account[]): Account[] => {
  if (accounts.length === 0) {
    return [{ id: "default-account-1", name: "Personal" }];
  }
  return accounts;
};

/* -----------------------------------------------------
   SORT EXPENSES (NON-MUTATING)
----------------------------------------------------- */
const sortExpenses = (data: AppData): AppData => {
  return {
    ...data,
    expenses: [...(data.expenses || [])].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    ),
  };
};

/* -----------------------------------------------------
   SAVE FULL SNAPSHOT TO SUPABASE (UP-SERT)
----------------------------------------------------- */
export const saveData = async (data: AppData): Promise<void> => {
  const userId = await getCurrentUserId();
  if (!userId) {
    console.warn("saveData called but no authenticated user found");
    return;
  }

  const accounts = data.accounts || [];

  try {
    // 1) Upsert profiles
    if (accounts.length > 0) {
      const profileRows = accounts.map((a) => ({
        id: a.id,
        user_id: userId,
        name: a.name,
      }));
      await supabase.from("profiles").upsert(profileRows, { onConflict: "id" });
    }

    // 2) Update local cache
    const sorted = sortExpenses(data);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(sorted));
  } catch (error) {
    console.error("[saveData] Failed to persist data to Supabase", error);
  }
};

/* -----------------------------------------------------
   LOAD FROM LOCAL CACHE & DEFAULT STRUCTURE
----------------------------------------------------- */
export const loadCachedAppData = (): AppData | null => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AppData;
    if (!parsed.accounts || !parsed.expenses) return null;
    return sortExpenses(parsed);
  } catch (error) {
    console.warn("[loadCachedAppData] Failed to parse cached data", error);
    return null;
  }
};

const getDefaultData = (): AppData => ({
  accounts: [{ id: "default-account-1", name: "Personal" }],
  expenses: [],
});

/* -----------------------------------------------------
   MAIN LOAD: SUPABASE
----------------------------------------------------- */
export const loadData = async (): Promise<AppData> => {
  const userId = await getCurrentUserId();

  if (!userId) {
    const cached = loadCachedAppData();
    return sortExpenses(cached ?? getDefaultData());
  }

  try {
    // 1) Load profiles
    const { data: profileRows, error: profileError } = await supabase
      .from("profiles")
      .select("id, name")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });

    if (profileError) throw profileError;

    let accounts: Account[] =
      (profileRows || []).map((p: any) => ({
        id: p.id,
        name: p.name,
      })) ?? [];

    accounts = ensureDefaultAccount(accounts);

    // 2) Load expenses
    const { data: expenseRows, error: expenseError } = await supabase
      .from("expenses")
      .select("id, profile_id, name, amount, date, category")
      .eq("user_id", userId)
      .order("date", { ascending: false });

    if (expenseError) throw expenseError;

    const expenses: Expense[] =
      (expenseRows || []).map((e: any) => ({
        id: e.id,
        name: e.name,
        amount: Number(e.amount),
        date: new Date(e.date).toISOString(),
        accountId: e.profile_id,
        category: e.category as Category,
      })) ?? [];

    const result: AppData = sortExpenses({ accounts, expenses });

    // 3) Refresh local cache
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(result));
    return result;
  } catch (error) {
    console.error("[loadData] Failed to load from Supabase, falling back to cache", error);
    const cached = loadCachedAppData();
    if (cached) return cached;
    throw error;
  }
};

/* -----------------------------------------------------
   CATEGORY DETECTION & INR FORMATTER
----------------------------------------------------- */
export const categorizeExpense = (expenseName: string, customCategories: string[] = []): Category => {
  const lower = expenseName.toLowerCase();

  // Combine defaults with custom categories (custom ones don't have keywords yet, so we just check exact match or skip)
  // For now, we only use keywords for default categories.
  const priority: Category[] = [
    ...DEFAULT_CATEGORIES,
    ...customCategories
  ];

  for (const category of priority) {
    const keywords = CATEGORY_KEYWORDS[category] || [];
    if (keywords.some((kw) => lower.includes(kw))) {
      return category;
    }
  }

  return "Others";
};

export const formatToINR = (value: number): string => {
  if (isNaN(value)) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
};

/* -----------------------------------------------------
   CREATE + PERSIST SINGLE EXPENSE
----------------------------------------------------- */
export const createAndPersistExpense = async (
  currentData: AppData,
  name: string,
  amount: number,
  date: string | Date,
  accountId: string,
  category?: Category
): Promise<Expense> => {
  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error("User must be logged in to create expenses.");
  }

  const id = crypto.randomUUID();

  const newExpense: Expense = {
    id,
    name,
    amount,
    accountId,
    category: category || categorizeExpense(name),
    date: date instanceof Date ? date.toISOString() : date,
  };

  // Fire single INSERT into Supabase (triggers Realtime)
  try {
    const { error } = await supabase.from("expenses").insert({
      id,
      user_id: userId,
      profile_id: accountId,
      name,
      amount,
      date: date instanceof Date ? date.toISOString() : date,
      category: newExpense.category,
    });

    if (error) {
      console.error("Supabase Insert Error:", error);
      throw new Error(`Failed to insert expense: ${error.message}`);
    }

  } catch (error) {
    console.error("[createAndPersistExpense] Failed to insert expense into Supabase", error);
    throw error;
  }

  return newExpense;
};

/* -----------------------------------------------------
   DELETE EXPENSE
----------------------------------------------------- */
export const deleteExpenseFromData = async (
  currentData: AppData,
  expenseId: string
): Promise<AppData> => {
  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error("User must be logged in to delete expenses.");
  }

  const updated: AppData = {
    ...currentData,
    expenses: (currentData.expenses || []).filter((e) => e.id !== expenseId),
  };

  try {
    // NOTE: Supabase Delete only needs matching user_id and id for RLS compliance
    await supabase
      .from("expenses")
      .delete()
      .eq("user_id", userId)
      .eq("id", expenseId);
  } catch (error) {
    console.error("[deleteExpenseFromData] Failed to delete expense from Supabase", error);
  }

  await saveData(updated);
  return sortExpenses(updated);
};

/* -----------------------------------------------------
   UPDATE EXPENSE
----------------------------------------------------- */
export const updateExpenseInData = async (
  currentData: AppData,
  updatedExpense: Expense
): Promise<AppData> => {
  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error("User must be logged in to update expenses.");
  }

  const updated: AppData = {
    ...currentData,
    expenses: (currentData.expenses || []).map((e) =>
      e.id === updatedExpense.id ? updatedExpense : e
    ),
  };

  // Persist update to Supabase
  try {
    // NOTE: The calling component (App.tsx) ensures updatedExpense.amount is a Number.
    await supabase
      .from("expenses")
      .update({
        name: updatedExpense.name,
        amount: updatedExpense.amount,
        date: updatedExpense.date,
        category: updatedExpense.category,
        profile_id: updatedExpense.accountId,
      })
      .eq("user_id", userId)
      .eq("id", updatedExpense.id);
  } catch (error) {
    console.error("[updateExpenseInData] Failed to update expense in Supabase", error);
  }

  await saveData(updated);
  return sortExpenses(updated);
};

/* -----------------------------------------------------
   BUDGET OPERATIONS
----------------------------------------------------- */
export const loadBudgets = async (): Promise<Budget[]> => {
  const userId = await getCurrentUserId();
  if (!userId) return [];

  const { data, error } = await supabase
    .from("budgets")
    .select("id, category, amount")
    .eq("user_id", userId);

  if (error) {
    console.error("Error loading budgets:", error);
    return [];
  }

  return (data || []).map((b: any) => ({
    id: b.id,
    category: b.category as Category,
    amount: Number(b.amount),
  }));
};

export const upsertBudget = async (category: Category, amount: number): Promise<Budget | null> => {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("User must be logged in to set budgets.");

  // Check if budget exists for this category
  const { data: existing } = await supabase
    .from("budgets")
    .select("id")
    .eq("user_id", userId)
    .eq("category", category)
    .single();

  const payload = {
    user_id: userId,
    category,
    amount,
  };

  let result;
  if (existing) {
    const { data, error } = await supabase
      .from("budgets")
      .update(payload)
      .eq("id", existing.id)
      .select()
      .single();
    if (error) throw error;
    result = data;
  } else {
    const { data, error } = await supabase
      .from("budgets")
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    result = data;
  }

  return result
    ? { id: result.id, category: result.category, amount: Number(result.amount) }
    : null;
};

export const deleteBudget = async (budgetId: string): Promise<void> => {
  const userId = await getCurrentUserId();
  if (!userId) return;

  const { error } = await supabase
    .from("budgets")
    .delete()
    .eq("id", budgetId)
    .eq("user_id", userId);

  if (error) throw error;
};

/* -----------------------------------------------------
   CUSTOM CATEGORY OPERATIONS
----------------------------------------------------- */
export const loadCategories = async (): Promise<string[]> => {
  const userId = await getCurrentUserId();
  if (!userId) return [];

  const { data, error } = await supabase
    .from("custom_categories")
    .select("name")
    .eq("user_id", userId)
    .order("name", { ascending: true });

  if (error) {
    console.error("Error loading custom categories:", error);
    return [];
  }

  return (data || []).map((c: any) => c.name);
};

export const addCategory = async (name: string): Promise<string | null> => {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("User must be logged in to add categories.");

  // Check if already exists (case insensitive check could be better, but simple for now)
  if (DEFAULT_CATEGORIES.includes(name)) return null;

  const { data, error } = await supabase
    .from("custom_categories")
    .insert({
      user_id: userId,
      name: name,
    })
    .select()
    .single();

  if (error) {
    console.error("Error adding custom category:", error);
    throw error;
  }

  return data ? data.name : null;
};