import { Expense, Account, AppData, Category } from '../types';
import { CATEGORY_KEYWORDS } from '../constants';

const OLD_STORAGE_KEY = 'expenseCalculator_expenses';
const NEW_STORAGE_KEY = 'expenseCalculator_appData';

export const saveData = (data: AppData): void => {
  try {
    const serializedData = JSON.stringify(data);
    localStorage.setItem(NEW_STORAGE_KEY, serializedData);
  } catch (error) {
    console.error("Failed to save app data to localStorage", error);
  }
};

export const loadData = (): AppData => {
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
      
      saveData(migratedData);
      localStorage.removeItem(OLD_STORAGE_KEY);
      return migratedData;
    }

  } catch (error) {
    console.error("Failed to load or parse data from localStorage", error);
  }
  
  // Return default structure if nothing is found
  const defaultAccount: Account = { id: 'default-account-1', name: 'Personal' };
  const defaultData: AppData = {
      accounts: [defaultAccount],
      expenses: [],
  };
  return defaultData;
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