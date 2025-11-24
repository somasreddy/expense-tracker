import { Category } from "./types";

export const CATEGORY_KEYWORDS: Record<Category, string[]> = {
  /**
   * Financial Obligations: Recurring fixed or variable payments
   */
  EMIs: [
    "emi", 
    "loan", 
    "installment", 
    "mortgage", 
    "financing", 
    "credit card payment", 
    "personal loan", 
    "home loan", 
    "car loan"
  ],
  Rent: [
    "rent", 
    "lease", 
    "security deposit", 
    "property tax", 
    "common area maintenance", 
    "maintenance fee"
  ],
  Bills: [
    "bill", 
    "electricity", 
    "water", 
    "gas", 
    "wifi", 
    "broadband", 
    "postpaid", 
    "internet", 
    "cable tv", 
    "dth", 
    "landline"
  ],

  /**
   * Essential Recurring Expenses
   */
  Utilities: [
    "utility", 
    "mobile recharge", 
    "phone bill", 
    "data plan", 
    "prepaid", 
    "garbage collection", 
    "sewage", 
    "subscription box"
  ],
  Fuel: [
    "fuel", 
    "petrol", 
    "diesel", 
    "gasoline", 
    "cng", 
    "hsd", 
    "bharat petroleum", 
    "indian oil", 
    "hpcl",
    "pump"
  ],
  Health: [
    "hospital", 
    "doctor", 
    "medicine", 
    "pharmacy", 
    "health insurance", 
    "dentist", 
    "optician", 
    "lab test", 
    "physio", 
    "apollo pharmacy"
  ],

  /**
   * Food and Household Goods
   */
  Grocery: [
    "grocery", 
    "vegetable", 
	"instamart",
	"flipkart minutes",
	"amazon now",
    "veg", 
    "fruits", 
    "supermarket", 
    "dmart", 
    "open mart", 
    "reliance fresh", 
    "bigbasket", 
    "blinkit", 
    "milk", 
    "bread", 
    "pantry", 
    "kirana"
  ],
  Food: [
    "food", 
    "restaurant", 
    "hotel", 
    "dining", 
    "swiggy", 
    "zomato", 
    "dinner", 
    "lunch", 
    "breakfast", 
    "cafe", 
    "coffee", 
    "bakery", 
    "fast food", 
    "dominos", 
    "pizzahut"
  ],

  /**
   * Travel and Leisure
   */
  Transportation: [
    "uber", 
    "ola", 
    "cab", 
    "bus", 
    "train", 
    "flight", 
    "rapido", 
    "porter", 
    "airport", 
    "railway", 
    "taxi", 
    "toll", 
    "parking", 
    "metro"
  ],
  Entertainment: [
    "movie", 
    "netflix", 
    "prime video", 
    "spotify", 
    "entertainment", 
    "youtube premium", 
    "aha", 
    "hotstar", 
    "cinema", 
    "gaming", 
    "bookmyshow", 
    "theatre"
  ],
  Shopping: [
    "shopping", 
    "amazon", 
    "flipkart", 
    "clothes", 
    "dress", 
    "shoe", 
    "myntra", 
    "ajio", 
    "meesho", 
    "electronics", 
    "gadgets", 
    "hardware store", 
    "jewellery", 
    "salon", 
    "cosmetics"
  ],

  /**
   * Default fallback
   */
  Others: [
    "miscellaneous", 
    "cash withdrawal", 
    "atm", 
    "bank charge", 
    "donation", 
    "gifting", 
    "pets", 
    "stationery", 
    "postage"
  ]
};