// FIX: Import the 'Category' type to resolve TypeScript errors in this file.
import { Expense, Profile, AppData, Category } from '../types';
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
      return JSON.parse(data);
    }

    // Migration logic from old format
    const oldData = localStorage.getItem(OLD_STORAGE_KEY);
    if (oldData) {
      console.log("Migrating old data to new format...");
      const oldExpenses: Omit<Expense, 'profileId'>[] = JSON.parse(oldData);
      const defaultProfile: Profile = { id: 'default-profile-1', name: 'Personal' };
      
      const newExpenses: Expense[] = oldExpenses.map(exp => ({
        ...exp,
        profileId: defaultProfile.id,
      }));
      
      const migratedData: AppData = {
        profiles: [defaultProfile],
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
  const defaultProfile: Profile = { id: 'default-profile-1', name: 'Personal' };
  const defaultData: AppData = {
      profiles: [defaultProfile],
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