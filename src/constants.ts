import { Category } from "./types";

export const DEFAULT_CATEGORIES: Category[] = [
  "Housing",
  "Utilities",
  "Food",
  "Transport",
  "Lifestyle",
  "Health",
  "EMIs",
  "Others",
];

export const CATEGORY_KEYWORDS: Record<string, string[]> = {
  /**
   * Housing: Rent, Maintenance, Property Tax
   */
  Housing: [
    "rent",
    "lease",
    "security deposit",
    "property tax",
    "common area maintenance",
    "maintenance fee",
    "house tax"
  ],

  /**
   * Utilities: Bills (Electricity, Water, Gas, Internet) + Recurring Services
   */
  Utilities: [
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
    "landline",
    "utility",
    "mobile recharge",
    "phone bill",
    "data plan",
    "prepaid",
    "garbage collection",
    "sewage",
    "subscription box"
  ],

  /**
   * Food: Groceries + Dining Out
   */
  Food: [
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
    "kirana",
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
   * Transport: Fuel + Public Transport + Vehicle Insurance
   */
  Transport: [
    "fuel",
    "petrol",
    "diesel",
    "gasoline",
    "cng",
    "hsd",
    "bharat petroleum",
    "indian oil",
    "hpcl",
    "pump",
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
    "metro",
    "car insurance",
    "bike insurance",
    "vehicle insurance"
  ],

  /**
   * Lifestyle: Shopping + Entertainment
   */
  Lifestyle: [
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
    "cosmetics",
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

  /**
   * Health: Medical + Insurance
   */
  Health: [
    "hospital",
    "doctor",
    "medicine",
    "pharmacy",
    "health insurance",
    "mediclaim",
    "dentist",
    "optician",
    "lab test",
    "physio",
    "apollo pharmacy"
  ],

  /**
   * EMIs: Loans + Life/Term Insurance
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
    "car loan",
    "life insurance",
    "term insurance",
    "insurance premium"
  ],

  /**
   * Others: Miscellaneous
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