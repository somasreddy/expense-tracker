
import { Expense, Account, AppData, Category } from '../types';
import { CATEGORY_KEYWORDS } from '../constants';
import { auth, db, doc, getDoc, setDoc } from '../firebase';

const OLD_STORAGE_KEY = 'expenseCalculator_expenses';
const NEW_STORAGE_KEY = 'expenseCalculator_appData';

const getAppDataDocRef = () => {
  const user = auth.currentUser;
  if (!user) return null;
  // Use a consistent document ID for the user's app data
  return doc(db, 'users', user.uid, 'appData', 'main');
};

export const saveData = async (data: AppData): Promise<void> => {
  try {
    const docRef = getAppDataDocRef();
    if (docRef) {
      await setDoc(docRef, data);
    }
    // Also write to localStorage so the UI can feel snappy, but Firestore is the source of truth.
    localStorage.setItem(NEW_STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save app data", error);
  }
};

const loadDataFromLocalStorage = (): AppData | null => {
  try {
    const data = localStorage.getItem(NEW_STORAGE_KEY);
    if (data) {
      const parsedData = JSON.parse(data);
      // Migration for users with 'profiles' or 'profileId' keys
      if (parsedData.profiles) {
        console.log("Migrating profiles to accounts...");
        parsedData.accounts = parsedData.profiles;
        delete parsedData.profiles;
      }
      if (parsedData.expenses && parsedData.expenses.some((e: any) => e.profileId)) {
        console.log("Migrating profileId to accountId...");
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

    // Migration logic from old format (very first version)
    const oldData = localStorage.getItem(OLD_STORAGE_KEY);
    if (oldData) {
      console.log("Migrating old data to new format...");
      const oldExpenses: Omit<Expense, 'accountId'>[] = JSON.parse(oldData);
      const defaultAccount: Account = { id: 'default-account-1', name: 'Personal' };
      
      const newExpenses: Expense[] = oldExpenses.map(exp => ({
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
    console.error("Failed to load or parse data from localStorage", error);
  }
  return null;
};

const getDefaultData = (): AppData => {
  const defaultAccount: Account = { id: 'default-account-1', name: 'Personal' };
  return {
    accounts: [defaultAccount],
    expenses: [],
  };
};

const sortExpenses = (data: AppData): AppData => {
  if (data && data.expenses) {
    data.expenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
  return data;
}

export const loadData = async (): Promise<AppData> => {
  const docRef = getAppDataDocRef();
  if (!docRef) {
    // User not logged in, they can only see local data if any exists.
    const localData = loadDataFromLocalStorage() || getDefaultData();
    return sortExpenses(localData);
  }

  try {
    const docSnap = await getDoc(docRef);

    // Primary source of truth: Firestore
    if (docSnap.exists()) {
      console.log("Data loaded from Firestore.");
      const firestoreData = docSnap.data() as AppData;
      return sortExpenses(firestoreData);
    }

    // If no Firestore data, check localStorage for a one-time migration
    console.log("No data in Firestore. Checking localStorage for migration.");
    const localData = loadDataFromLocalStorage();

    // Check if local data is meaningful (not just the default empty state)
    if (localData && (localData.expenses.length > 0 || localData.accounts.length > 1 || (localData.accounts.length === 1 && localData.accounts[0].name !== 'Personal'))) {
      console.log("Found local data to migrate to Firestore.");
      await saveData(localData); // This saves it to Firestore and local cache
      return sortExpenses(localData);
    }
  } catch (error) {
    console.error("Failed to load data from Firestore, falling back to local storage.", error);
    const fallbackData = loadDataFromLocalStorage() || getDefaultData();
    return sortExpenses(fallbackData);
  }

  // If nothing found anywhere, return default.
  console.log("No user data found. Returning default structure.");
  return getDefaultData(); // Already sorted (empty)
};

export const categorizeExpense = (expenseName: string): Category => {
    const lowerCaseName = expenseName.toLowerCase();
    const categoryPriority = [
        'EMIs', 'Rent', 'Bills', 'Utilities', 'Fuel', 'Health',
        'Grocery', 'Food', 'Transportation', 'Entertainment', 'Shopping', 'Others'
    ];

    for (const category of categoryPriority) {
        const keywords = CATEGORY_KEYWORDS[category as Category];
        if (keywords.some(keyword => lowerCaseName.includes(keyword))) {
            return category as Category;
        }
    }
    return 'Others';
};

export const formatToINR = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};
