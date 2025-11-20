export type Category =
  | "EMIs"
  | "Rent"
  | "Bills"
  | "Utilities"
  | "Fuel"
  | "Health"
  | "Grocery"
  | "Food"
  | "Transportation"
  | "Entertainment"
  | "Shopping"
  | "Others";

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
