import { Expense, Account, AppData, Category } from "../types";
import { CATEGORY_KEYWORDS } from "../constants";
import { auth, db } from "../firebase";

// Firestore imports MUST come from Firebase SDK directly
import { doc, getDoc, setDoc } from "firebase/firestore";

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

  return doc(db, "users", user.uid, "appData", "main");
};

/* -----------------------------------------------------
   SORT EXPENSES (non-mutating)
----------------------------------------------------- */
const sortExpenses = (data: AppData): AppData => ({
  ...data,
  expenses: [...data.expenses].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  ),
});

/* -----------------------------------------------------
   SAVE DATA (FIRESTORE + LOCAL CACHE)
----------------------------------------------------- */
export const saveData = async (data: AppData): Promise<void> => {
  try {
    const sorted = sortExpenses(data);
    const docRef = getAppDataDocRef();

    if (docRef) {
      await setDoc(docRef, sorted);
    }

    localStorage.setItem(NEW_STORAGE_KEY, JSON.stringify(sorted));
  } catch (error) {
    console.error("Failed to save app data:", error);
  }
};

/* -----------------------------------------------------
   LOAD LOCAL STORAGE (w/ auto-migration)
----------------------------------------------------- */
const loadDataFromLocalStorage = (): AppData | null => {
  try {
    const json = localStorage.getItem(NEW_STORAGE_KEY);

    if (json) {
      const parsed = JSON.parse(json);

      // Migrate profiles → accounts
      if (parsed.profiles) {
        parsed.accounts = parsed.profiles;
        delete parsed.profiles;
      }

      // Migrate profileId → accountId
      if (parsed.expenses?.some((e: any) => e.profileId)) {
        parsed.expenses = parsed.expenses.map((e: any) =>
          e.profileId
            ? { ...e, accountId: e.profileId }
            : e
        );
      }

      return parsed;
    }

    // Very old format
    const old = localStorage.getItem(OLD_STORAGE_KEY);
    if (old) {
      const oldExpenses: Omit<Expense, "accountId">[] = JSON.parse(old);

      const defaultAcc: Account = {
        id: "default-account-1",
        name: "Personal",
      };

      const migrated: AppData = {
        accounts: [defaultAcc],
        expenses: oldExpenses.map((e) => ({
          ...e,
          accountId: defaultAcc.id,
        })),
      };

      localStorage.setItem(NEW_STORAGE_KEY, JSON.stringify(migrated));
      localStorage.removeItem(OLD_STORAGE_KEY);

      return migrated;
    }
  } catch (err) {
    console.error("Local storage parse error:", err);
  }

  return null;
};

export const loadCachedAppData = () => loadDataFromLocalStorage();

/* -----------------------------------------------------
   DEFAULT STRUCTURE
----------------------------------------------------- */
const getDefaultData = (): AppData => ({
  accounts: [{ id: "default-account-1", name: "Personal" }],
  expenses: [],
});

/* -----------------------------------------------------
   LOAD DATA (FIRESTORE → LOCAL → DEFAULT)
----------------------------------------------------- */
export const loadData = async (): Promise<AppData> => {
  const docRef = getAppDataDocRef();

  // Not logged in
  if (!docRef) {
    return sortExpenses(loadDataFromLocalStorage() || getDefaultData());
  }

  try {
    const snap = await getDoc(docRef);

    if (snap.exists()) {
      const firestoreData = snap.data() as AppData;

      // Update local cache
      localStorage.setItem(NEW_STORAGE_KEY, JSON.stringify(firestoreData));

      return sortExpenses(firestoreData);
    }

    // Migrate local → Firestore if useful
    const local = loadDataFromLocalStorage();
    if (
      local &&
      (local.expenses.length > 0 ||
        local.accounts.length > 1 ||
        (local.accounts.length === 1 &&
          local.accounts[0].name !== "Personal"))
    ) {
      await saveData(local);
      return sortExpenses(local);
    }
  } catch (error) {
    console.error("Firestore fetch failure, using local:", error);
    return sortExpenses(loadDataFromLocalStorage() || getDefaultData());
  }

  return getDefaultData();
};

/* -----------------------------------------------------
   CATEGORIZATION
----------------------------------------------------- */
export const categorizeExpense = (expenseName: string): Category => {
  const name = expenseName.toLowerCase();

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

  for (const c of priority) {
    const keywords = CATEGORY_KEYWORDS[c] || [];
    if (keywords.some((kw) => name.includes(kw))) return c;
  }

  return "Others";
};

/* -----------------------------------------------------
   INR Formatting
----------------------------------------------------- */
export const formatToINR = (amt: number): string =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amt);

/* -----------------------------------------------------
   EXPENSE CRUD HELPERS
----------------------------------------------------- */
export const addExpenseToData = async (
  current: AppData,
  accountId: string,
  name: string,
  amount: number,
  date: string | Date = new Date()
): Promise<AppData> => {
  const newExpense: Expense = {
    id: crypto.randomUUID(),
    name,
    amount,
    accountId,
    category: categorizeExpense(name),
    date: date instanceof Date ? date.toISOString() : date,
  };

  const updated: AppData = {
    ...current,
    expenses: [newExpense, ...current.expenses],
  };

  await saveData(updated);
  return sortExpenses(updated);
};

export const deleteExpenseFromData = async (
  current: AppData,
  expenseId: string
): Promise<AppData> => {
  const updated: AppData = {
    ...current,
    expenses: current.expenses.filter((e) => e.id !== expenseId),
  };

  await saveData(updated);
  return sortExpenses(updated);
};

export const updateExpenseInData = async (
  current: AppData,
  updatedExpense: Expense
): Promise<AppData> => {
  const updated: AppData = {
    ...current,
    expenses: current.expenses.map((e) =>
      e.id === updatedExpense.id ? updatedExpense : e
    ),
  };

  await saveData(updated);
  return sortExpenses(updated);
};
