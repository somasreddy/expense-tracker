export type Category = string;

export interface Expense {
  id: string;
  name: string;
  amount: number;
  date: string; // ISO
  accountId: string;
  category: Category;
}

export interface Account {
  id: string;
  name: string;
}

export interface AppData {
  accounts: Account[];
  expenses: Expense[];
}

export interface Budget {
  id: string;
  category: Category;
  amount: number;
}
