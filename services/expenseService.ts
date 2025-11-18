
import { Expense, Category } from '../types';
import { CATEGORY_KEYWORDS } from '../constants';

const STORAGE_KEY = 'expenseCalculator_expenses';

export const saveExpenses = (expenses: Expense[]): void => {
  try {
    const data = JSON.stringify(expenses);
    localStorage.setItem(STORAGE_KEY, data);
  } catch (error) {
    console.error("Failed to save expenses to localStorage", error);
  }
};

export const loadExpenses = (): Expense[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Failed to load or parse expenses from localStorage", error);
  }
  return [];
};

export const categorizeExpense = (expenseName: string): Category => {
    const lowerCaseName = expenseName.toLowerCase();

    // Prioritize categories with more specific keywords
    const categoryPriority: Category[] = [
        'EMIs', 'Rent', 'Bills', 'Utilities', 'Fuel', 'Health',
        'Grocery', 'Food', 'Transportation', 'Entertainment', 'Shopping', 'Others'
    ];

    for (const category of categoryPriority) {
        const keywords = CATEGORY_KEYWORDS[category];
        if (keywords.some(keyword => lowerCaseName.includes(keyword))) {
            return category;
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
