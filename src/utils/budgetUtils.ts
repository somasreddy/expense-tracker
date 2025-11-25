import { Category } from "../types";

// Weights for different categories (1-10 scale)
const CATEGORY_WEIGHTS: Record<string, number> = {
    "rent": 10,
    "emi": 9,
    "loan": 9,
    "investment": 8,
    "savings": 8,
    "grocery": 5,
    "groceries": 5,
    "food": 4,
    "bills": 4,
    "utilities": 4,
    "fuel": 3,
    "transport": 3,
    "health": 3,
    "medical": 3,
    "education": 3,
    "shopping": 2,
    "entertainment": 2,
    "travel": 2,
    "others": 1
};

const DEFAULT_WEIGHT = 2;

export const calculateSmartDistribution = (totalBudget: number, categories: Category[]): Record<Category, number> => {
    // 1. Calculate total weight score
    let totalScore = 0;
    const categoryScores: Record<Category, number> = {};

    categories.forEach(cat => {
        const lowerCat = cat.toLowerCase();
        // Check for exact match or partial match
        const matchedKey = Object.keys(CATEGORY_WEIGHTS).find(key => lowerCat.includes(key));
        const score = matchedKey ? CATEGORY_WEIGHTS[matchedKey] : DEFAULT_WEIGHT;

        categoryScores[cat] = score;
        totalScore += score;
    });

    // 2. Distribute budget based on scores
    const distribution: Record<Category, number> = {};
    let allocatedSoFar = 0;

    // Sort categories by score (descending) to handle rounding errors on less important ones if needed
    // but here we just iterate.

    categories.forEach((cat, index) => {
        const rawAmount = (categoryScores[cat] / totalScore) * totalBudget;
        // Round to nearest 100 for cleaner numbers
        let roundedAmount = Math.round(rawAmount / 100) * 100;

        // Ensure at least some budget if score > 0
        if (roundedAmount === 0 && totalBudget > 1000) roundedAmount = 100;

        distribution[cat] = roundedAmount;
        allocatedSoFar += roundedAmount;
    });

    // 3. Adjust for remainder (give/take from the highest weighted category or "Others")
    const remainder = totalBudget - allocatedSoFar;
    if (remainder !== 0) {
        // Find category with highest weight (Rent/EMI) to absorb the difference
        // Or "Others" if it exists
        const targetCat = categories.find(c => c.toLowerCase().includes("others")) || categories[0];
        distribution[targetCat] = (distribution[targetCat] || 0) + remainder;
    }

    return distribution;
};
