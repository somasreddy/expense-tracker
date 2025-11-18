export const Categories = [
  'Grocery',
  'Fuel',
  'Bills',
  'Shopping',
  'Food',
  'Transportation',
  'Entertainment',
  'Health',
  'Utilities',
  'Rent',
  'EMIs',
  'Others',
] as const;

export type Category = typeof Categories[number];

export interface Account {
  id: string;
  name: string;
}

export interface Expense {
  id: string;
  accountId: string;
  name: string;
  amount: number;
  category: Category;
  date: string; // YYYY-MM-DD
}

export interface AppData {
  accounts: Account[];
  expenses: Expense[];
}