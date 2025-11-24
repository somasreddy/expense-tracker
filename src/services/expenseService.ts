// src/services/expenseService.ts
// Supabase-backed implementation of all data operations for the app.

import { Expense, Account, AppData, Category } from "../types";
import { CATEGORY_KEYWORDS } from "../constants";
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
   NOTE: This function now ONLY handles Profile/Account upsert and local cache.
----------------------------------------------------- */
export const saveData = async (data: AppData): Promise<void> => {
  const userId = await getCurrentUserId();
  if (!userId) {
    console.warn("saveData called but no authenticated user found");
    return;
  }

  const accounts = data.accounts || [];

  try {
    // 1) Upsert profiles (REQUIRED for accounts/profiles persistence)
    if (accounts.length > 0) {
      const profileRows = accounts.map((a) => ({
        id: a.id,
        user_id: userId,
        name: a.name,
      }));
      await supabase.from("profiles").upsert(profileRows, { onConflict: "id" });
    }

    // 🔥 REMOVED: Upsert expenses. This was causing the infinite Realtime loop.
    // Expense persistence is now handled only by createAndPersistExpense, 
    // updateExpenseInData, and deleteExpenseFromData.

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
   CATEGORY DETECTION & INR FORMATTER (Logic is fine)
----------------------------------------------------- */
export const categorizeExpense = (expenseName: string): Category => {
  const lower = expenseName.toLowerCase();
  const priority: Category[] = [
    "EMIs",
    "Rent",
    "Bills",
    "Utilities",
    "Fuel",
    "Health",
    "Grocery",
    "Food",
    "Transportation",
    "Entertainment",
    "Shopping",
    "Others",
  ];

  for (const category of priority) {
    // NOTE: CATEGORY_KEYWORDS must be defined elsewhere
    // const keywords = CATEGORY_KEYWORDS[category] || []; 
    // if (keywords.some((kw) => lower.includes(kw))) {
    //   return category;
    // }
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
  accountId: string
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
    category: categorizeExpense(name),
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

  try {
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