import { Category } from "../types";

// Weights for different categories (1-10 scale)
const CATEGORY_WEIGHTS: Record<string, number> = {
    "housing": 15,
    "rent": 15,
    "emi": 15,
    "emis": 15,
    "loan": 15,
    "food": 6,
    "transport": 5,
    "utilities": 5,
    "health": 4,
    "lifestyle": 3,
    "others": 2
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

    categories.forEach((cat) => {
        const rawAmount = (categoryScores[cat] / totalScore) * totalBudget;
        // Round to nearest 100 for cleaner numbers
        let roundedAmount = Math.round(rawAmount / 100) * 100;

        // Ensure at least some budget if score > 0
        if (roundedAmount === 0 && totalBudget > 1000) roundedAmount = 100;

        distribution[cat] = roundedAmount;
        allocatedSoFar += roundedAmount;
    });

    // 3. Allocate remainder to "Monthly Savings"
    const remainder = totalBudget - allocatedSoFar;
    if (remainder > 0) {
        // We cast "Monthly Savings" to Category to satisfy the return type, 
        // assuming the consumer can handle extra keys.
        distribution["Monthly Savings" as Category] = remainder;
    } else if (remainder < 0) {
        // If we over-allocated due to rounding, deduct from the highest weighted category (Housing/EMI)
        // or just the first one to keep it simple.
        const targetCat = categories[0];
        distribution[targetCat] = Math.max(0, (distribution[targetCat] || 0) + remainder);
    }

    return distribution;
};
