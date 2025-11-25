// Voice command parser - converts natural language to expense data
import { Category } from '../types';
import { DEFAULT_CATEGORIES } from '../constants';

export interface ParsedExpense {
    amount: number | null;
    name: string;
    category: Category | null;
}

export const parseVoiceCommand = (transcript: string): ParsedExpense => {
    const text = transcript.toLowerCase().trim();

    // Extract amount (supports various formats)
    let amount: number | null = null;
    const amountPatterns = [
        /(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:rupees?|rs?|₹|dollars?|\$)/i,
        /(?:rupees?|rs?|₹|dollars?|\$)\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/i,
        /^(\d+(?:,\d{3})*(?:\.\d{2})?)\s/,  // Number at start
        /\s(\d+(?:,\d{3})*(?:\.\d{2})?)\s/,  // Number in middle
    ];

    for (const pattern of amountPatterns) {
        const match = text.match(pattern);
        if (match) {
            amount = parseFloat(match[1].replace(/,/g, ''));
            break;
        }
    }

    // Detect category from keywords
    let category: Category | null = null;
    const categoryKeywords: Record<string, Category> = {
        'food': 'Food',
        'grocery': 'Groceries',
        'groceries': 'Groceries',
        'transport': 'Transportation',
        'taxi': 'Transportation',
        'uber': 'Transportation',
        'cab': 'Transportation',
        'bus': 'Transportation',
        'train': 'Transportation',
        'shopping': 'Shopping',
        'clothes': 'Shopping',
        'entertainment': 'Entertainment',
        'movie': 'Entertainment',
        'game': 'Entertainment',
        'health': 'Health',
        'medical': 'Health',
        'doctor': 'Health',
        'medicine': 'Health',
        'utility': 'Utilities',
        'utilities': 'Utilities',
        'bill': 'Utilities',
        'electric': 'Utilities',
        'water': 'Utilities',
        'internet': 'Utilities',
        'other': 'Other',
    };

    for (const [keyword, cat] of Object.entries(categoryKeywords)) {
        if (text.includes(keyword)) {
            category = cat;
            break;
        }
    }

    // Extract expense name (clean up the text)
    let name = text
        .replace(/(?:add|spent|spend|expense|for|on|at)\s*/gi, '')
        .replace(/\d+(?:,\d{3})*(?:\.\d{2})?\s*(?:rupees?|rs?|₹|dollars?|\$)?/gi, '')
        .replace(new RegExp(Object.keys(categoryKeywords).join('|'), 'gi'), '')
        .trim();

    // If name is empty, use category or 'Expense'
    if (!name) {
        name = category || 'Voice Expense';
    }

    // Capitalize first letter
    name = name.charAt(0).toUpperCase() + name.slice(1);

    return {
        amount,
        name,
        category,
    };
};
