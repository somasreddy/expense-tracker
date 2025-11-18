
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

export interface Expense {
  id: string;
  name: string;
  amount: number;
  category: Category;
  date: string; // YYYY-MM-DD
}
