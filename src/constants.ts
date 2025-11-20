import { Category } from "./types";

export const CATEGORY_KEYWORDS: Record<Category, string[]> = {
  EMIs: ["emi", "loan", "installment"],
  Rent: ["rent"],
  Bills: ["bill", "electricity", "water", "gas", "wifi", "broadband","postpaid"],
  Utilities: ["utility", "utilities", "mobile recharge", "phone"],
  Fuel: ["fuel", "petrol", "diesel", "gasoline"],
  Health: ["hospital", "doctor", "medicine", "pharmacy", "health"],
  Grocery: ["grocery", "vegetable", "veg", "fruits", "supermarket","dmart","open mart"],
  Food: ["food", "restaurant", "hotel", "dining", "swiggy", "zomato","dinner","lunch","breakfast"],
  Transportation: ["uber", "ola", "cab", "bus", "train", "flight","rapido","porter"],
  Entertainment: ["movie", "netflix", "prime", "spotify", "entertainment","youtube","aha"],
  Shopping: ["shopping", "amazon", "flipkart", "clothes", "dress", "shoe","myntra","ajio","meesho"],
  Others: []
};
