// src/services/expenseService.ts
import { Expense, Account, AppData, Category } from "../types";
import { CATEGORY_KEYWORDS } from "../constants";
import { auth, db, doc, getDoc, setDoc } from "../firebase";

/* -----------------------------------------------------
   STORAGE KEYS
----------------------------------------------------- */
const OLD_STORAGE_KEY = "expenseCalculator_expenses";
const NEW_STORAGE_KEY = "expenseCalculator_appData";

/* -----------------------------------------------------
   FIRESTORE DOC REFERENCE
----------------------------------------------------- */
const getAppDataDocRef = () => {
  const user = auth.currentUser;
  if (!user) return null;
  // Stable location for the logged-in user's app data
  return doc(db, "users", user.uid, "appData", "main");
};

/* -----------------------------------------------------
   SMALL HELPER: SORT EXPENSES (NON-MUTATING)
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
   SAVE DATA (FIRESTORE + LOCAL CACHE)
----------------------------------------------------- */
export const saveData = async (data: AppData): Promise<void> => {
  try {
    const sorted = sortExpenses(data);
    const docRef = getAppDataDocRef();

    // Save to Firestore if user is logged in
    if (docRef) {
      await setDoc(docRef, sorted);
    }

    // Cache in localStorage for instant reloads
    localStorage.setItem(NEW_STORAGE_KEY, JSON.stringify(sorted));
  } catch (error) {
    console.error("Failed to save app data", error);
  }
};

/* -----------------------------------------------------
   LOAD FROM LOCAL STORAGE + HANDLE MIGRATION
----------------------------------------------------- */
const loadDataFromLocalStorage = (): AppData | null => {
  try {
    const raw = localStorage.getItem(NEW_STORAGE_KEY);

    if (raw) {
      const parsed = JSON.parse(raw);

      // Migration: profiles → accounts
      if (parsed.profiles) {
        parsed.accounts = parsed.profiles;
        delete parsed.profiles;
      }

      // Migration: profileId → accountId
      if (
        parsed.expenses &&
        parsed.expenses.some((e: any) => e.profileId)
      ) {
        parsed.expenses = parsed.expenses.map((e: any) => {
          if (e.profileId) {
            const { profileId, ...rest } = e;
            return { ...rest, accountId: profileId };
          }
          return e;
        });
      }

      return parsed as AppData;
    }

    // Very old version: only expenses array
    const oldRaw = localStorage.getItem(OLD_STORAGE_KEY);
    if (oldRaw) {
      console.log("Migrating old local format → new format...");
      const oldExpenses: Omit<Expense, "accountId">[] = JSON.parse(oldRaw);

      const defaultAccount: Account = {
        id: "default-account-1",
        name: "Personal",
      };

      const newExpenses: Expense[] = oldExpenses.map((exp) => ({
        ...exp,
        accountId: defaultAccount.id,
      }));

      const migrated: AppData = {
        accounts: [defaultAccount],
        expenses: newExpenses,
      };

      localStorage.setItem(NEW_STORAGE_KEY, JSON.stringify(migrated));
      localStorage.removeItem(OLD_STORAGE_KEY);

      return migrated;
    }
  } catch (error) {
    console.error("Failed to load or parse local storage", error);
  }

  return null;
};

export const loadCachedAppData = (): AppData | null => {
  return loadDataFromLocalStorage();
};

/* -----------------------------------------------------
   DEFAULT STRUCTURE (NEW USER)
----------------------------------------------------- */
const getDefaultData = (): AppData => ({
  accounts: [{ id: "default-account-1", name: "Personal" }],
  expenses: [],
});

/* -----------------------------------------------------
   MAIN LOAD: FIRESTORE → LOCAL → DEFAULT
----------------------------------------------------- */
export const loadData = async (): Promise<AppData> => {
  const docRef = getAppDataDocRef();

  // If not logged in, only local data is available
  if (!docRef) {
    const local = loadDataFromLocalStorage() || getDefaultData();
    return sortExpenses(local);
  }

  try {
    const snap = await getDoc(docRef);

    // Firestore is the source of truth if it has data
    if (snap.exists()) {
      const firestoreData = snap.data() as AppData;

      // Refresh cache
      localStorage.setItem(NEW_STORAGE_KEY, JSON.stringify(firestoreData));

      return sortExpenses(firestoreData);
    }

    // No Firestore data yet → try localStorage once to migrate
    const local = loadDataFromLocalStorage();

    const hasMeaningfulLocalData =
      local &&
      (local.expenses.length > 0 ||
        local.accounts.length > 1 ||
        (local.accounts.length === 1 &&
          local.accounts[0].name !== "Personal"));

    if (hasMeaningfulLocalData) {
      console.log("Migrating local data → Firestore...");
      await saveData(local!); // this also updates cache
      return sortExpenses(local!);
    }

    // Nothing anywhere → default
    return getDefaultData();
  } catch (error) {
    console.error("Firestore load failed; falling back to local cache.", error);
    const fallback = loadDataFromLocalStorage() || getDefaultData();
    return sortExpenses(fallback);
  }
};

/* -----------------------------------------------------
   CATEGORY DETECTION
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
    const keywords = CATEGORY_KEYWORDS[category] || [];
    if (keywords.some((kw) => lower.includes(kw))) {
      return category;
    }
  }

  return "Others";
};

/* -----------------------------------------------------
   FORMAT INR
----------------------------------------------------- */
export const formatToINR = (amount: number): string => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/* -----------------------------------------------------
   EXPENSE HELPERS (ALWAYS PERSIST)
----------------------------------------------------- */
export const addExpenseToData = async (
  currentData: AppData,
  accountId: string,
  name: string,
  amount: number,
  date: string | Date = new Date()
): Promise<AppData> => {
  const expense: Expense = {
    id: crypto.randomUUID(),
    name,
    amount,
    accountId,
    category: categorizeExpense(name),
    date: date instanceof Date ? date.toISOString() : date,
  };

  const updated: AppData = {
    ...currentData,
    expenses: [expense, ...(currentData.expenses || [])],
  };

  await saveData(updated);
  return sortExpenses(updated);
};

export const deleteExpenseFromData = async (
  currentData: AppData,
  expenseId: string
): Promise<AppData> => {
  const updated: AppData = {
    ...currentData,
    expenses: (currentData.expenses || []).filter((e) => e.id !== expenseId),
  };

  await saveData(updated);
  return sortExpenses(updated);
};

export const updateExpenseInData = async (
  currentData: AppData,
  updatedExpense: Expense
): Promise<AppData> => {
  const updated: AppData = {
    ...currentData,
    expenses: (currentData.expenses || []).map((e) =>
      e.id === updatedExpense.id ? updatedExpense : e
    ),
  };

  await saveData(updated);
  return sortExpenses(updated);
};
