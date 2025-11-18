import { Category } from './types';

export const CATEGORY_KEYWORDS: Record<Category, string[]> = {
  Grocery: ["grocery", "supermarket", "kirana", "vegetables", "fruits", "milk", "bread", "staples", "dmart", "openmart"],
  Fuel: ["fuel", "petrol", "diesel", "gas", "car wash", "bike wash"],
  Bills: ["electricity", "water bill", "internet", "phone bill", "mobile recharge", "subscription", "utility bill", "credit card bill", "jio fiber", "postpaid"],
  Shopping: ["shopping", "clothes", "fashion", "online store", "mall", "electronics", "gadgets", "apparel", "accessories"],
  Food: ["food", "restaurant", "cafe", "dine out", "swiggy", "zomato", "snacks", "coffee", "lunch", "dinner", "breakfast"],
  Transportation: ["transport", "cab", "auto", "bus", "train", "metro", "ola", "uber", "travel", "fare"],
  Entertainment: ["entertainment", "movie", "cinema", "concert", "event", "gaming", "theatre", "party"],
  Health: ["health", "pharmacy", "medicine", "doctor", "hospital", "clinic", "gym", "wellness", "fitness"],
  Utilities: ["utilities", "gas bill", "waste management", "maintenance fee"],
  Rent: ["rent", "house rent", "apartment rent", "flat rent"],
  EMIs: ["emi", "loan repayment", "installment"],
  Others: [],
};
