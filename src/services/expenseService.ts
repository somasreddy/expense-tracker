import { Expense, Account, AppData, Category } from "../types";
import { CATEGORY_KEYWORDS } from "../constants";
import { auth, db, doc, getDoc, setDoc } from "../firebase";

/* -----------------------------------------------------
   STORAGE KEYS
----------------------------------------------------- */
const OLD_STORAGE_KEY = "expenseCalculator_expenses";
const NEW_STORAGE_KEY = "expenseCalculator_appData";

/* -----------------------------------------------------
   FIRESTORE DOC ACCESSOR
----------------------------------------------------- */
const getAppDataDocRef = () => {
  const user = auth.currentUser;
  if (!user) return null;

  // Stable location for user app data
  return doc(db, "users", user.uid, "appData", "main");
};

/* -----------------------------------------------------
   SORTING (non-mutating)
----------------------------------------------------- */
const sortExpenses = (data: AppData): AppData => {
  return {
    ...data,
    expenses: [...data.expenses].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    ),
  };
};

/* -----------------------------------------------------
   SAVE DATA (Firestore + Local cache)
----------------------------------------------------- */
export const saveData = async (data: AppData): Promise<void> => {
  try {
    const sorted = sortExpenses(data);
    const docRef = getAppDataDocRef();

    // Save to Firestore
    if (docRef) {
      await setDoc(docRef, sorted);
    }

    // Save to localStorage cache
    localStorage.setItem(NEW_STORAGE_KEY, JSON.stringify(sorted));
  } catch (error) {
    console.error("Failed to save app data", error);
  }
};

/* -----------------------------------------------------
   LOAD LOCAL CACHE + MIGRATION
----------------------------------------------------- */
const loadDataFromLocalStorage = (): AppData | null => {
  try {
    const data = localStorage.getItem(NEW_STORAGE_KEY);

    if (data) {
      const parsedData = JSON.parse(data);

      // Migrate older structure: profiles → accounts
      if (parsedData.profiles) {
        parsedData.accounts = parsedData.profiles;
        delete parsedData.profiles;
      }

      // Migrate old profileId → accountId
      if (
        parsedData.expenses &&
        parsedData.expenses.some((e: any) => e.profileId)
      ) {
        parsedData.expenses = parsedData.expenses.map((e: any) => {
          if (e.profileId) {
            const { profileId, ...rest } = e;
            return { ...rest, accountId: profileId };
          }
          return e;
        });
      }

      return parsedData;
    }

    // Migration from very old version
    const oldData = localStorage.getItem(OLD_STORAGE_KEY);
    if (oldData) {
      console.log("Migrating old format → new format...");

      const oldExpenses: Omit<Expense, "accountId">[] = JSON.parse(oldData);
      const defaultAccount: Account = {
        id: "default-account-1",
        name: "Personal",
      };

      const newExpenses = oldExpenses.map((exp) => ({
        ...exp,
        accountId: defaultAccount.id,
      }));

      const migratedData: AppData = {
        accounts: [defaultAccount],
        expenses: newExpenses,
      };

      localStorage.setItem(NEW_STORAGE_KEY, JSON.stringify(migratedData));
      localStorage.removeItem(OLD_STORAGE_KEY);

      return migratedData;
    }
  } catch (error) {
    console.error("Failed to load or parse local storage", error);
  }

  return null;
};

/* -----------------------------------------------------
   PUBLIC: Load Cached Local Data
----------------------------------------------------- */
export const loadCachedAppData = (): AppData | null => {
  return loadDataFromLocalStorage();
};

/* -----------------------------------------------------
   DEFAULT STRUCTURE
----------------------------------------------------- */
const getDefaultData = (): AppData => ({
  accounts: [{ id: "default-account-1", name: "Personal" }],
  expenses: [],
});

/* -----------------------------------------------------
   LOAD DATA (Firestore → fallback local → default)
----------------------------------------------------- */
export const loadData = async (): Promise<AppData> => {
  const docRef = getAppDataDocRef();

  // User not logged in → use only local data
  if (!docRef) {
    return sortExpenses(loadDataFromLocalStorage() || getDefaultData());
  }

  try {
    const docSnap = await getDoc(docRef);

    // Firestore is source of truth
    if (docSnap.exists()) {
      const firestoreData = docSnap.data() as AppData;

      // Update local cache for fast reloads
      localStorage.setItem(NEW_STORAGE_KEY, JSON.stringify(firestoreData));

      return sortExpenses(firestoreData);
    }

    // No Firestore data → try migrating local data
    const localData = loadDataFromLocalStorage();
    if (
      localData &&
      (localData.expenses.length > 0 ||
        localData.accounts.length > 1 ||
        (localData.accounts.length === 1 &&
          localData.accounts[0].name !== "Personal"))
    ) {
      console.log("Migrating local data → Firestore...");
      await saveData(localData);
      return sortExpenses(localData);
    }
  } catch (error) {
    console.error("Firestore load error, falling back to local cache.", error);
    return sortExpenses(loadDataFromLocalStorage() || getDefaultData());
  }

  return getDefaultData();
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
    if (keywords.some((kw) => lower.includes(kw))) return category;
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
   EXPENSE HELPERS
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
    expenses: [expense, ...currentData.expenses],
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
    expenses: currentData.expenses.filter((e) => e.id !== expenseId),
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
    expenses: currentData.expenses.map((e) =>
      e.id === updatedExpense.id ? updatedExpense : e
    ),
  };

  await saveData(updated);
  return sortExpenses(updated);
};
