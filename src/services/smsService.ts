import { Capacitor } from "@capacitor/core";
import { MessageReader } from "@solimanware/capacitor-sms-reader";
import { createAndPersistExpense, loadData } from "./expenseService";

// Regex patterns for common Indian UPI/Bank SMS
const PATTERNS = [
    // HDFC / Generic: "Sent Rs. 100.00 to USERNAME on 01-01-2025..."
    /Sent\s+(?:Rs\.?|INR)\s*([\d,]+(?:\.\d{2})?)\s+to\s+([^o]+)\s+on/i,
    // SBI / Others: "Debited Rs. 500.00 from A/c ... to USERNAME..."
    /Debited\s+(?:Rs\.?|INR)\s*([\d,]+(?:\.\d{2})?)\s+.*to\s+([^o]+)\s+on/i,
    // GPay / PhonePe style (often just bank SMS): "Paid Rs. 200.00 to USERNAME..."
    /Paid\s+(?:Rs\.?|INR)\s*([\d,]+(?:\.\d{2})?)\s+to\s+([^o]+)/i,
    // Axis: "INR 1,234.00 debited from A/c ... to USERNAME..."
    /(?:Rs\.?|INR)\s*([\d,]+(?:\.\d{2})?)\s+debited\s+.*to\s+([^o]+)/i
];

export const startSMSListener = async (
    onExpenseDetected: (message: string) => void
) => {
    if (!Capacitor.isNativePlatform()) {
        console.log("SMS Listener skipped: Not running on native platform.");
        return;
    }

    console.log("Initializing SMS Listener...");
    // Note: This plugin is primarily a reader. Real-time listening might require background services
    // or polling. For now, we rely on the 'checkRecentSMS' called on app resume.
};

export const checkRecentSMS = async (): Promise<number> => {
    if (!Capacitor.isNativePlatform()) return 0;

    try {
        // Fetch last 10 messages
        // Updated to use 'limit' instead of 'count' based on definitions.d.ts
        const { messages } = await MessageReader.getMessages({ limit: 10 });

        let addedCount = 0;
        // const data = await loadData(); // Unused for now

        for (const msg of messages) {
            const body = msg.body;
            const sender = msg.sender; // Updated to use 'sender' instead of 'address'

            // Filter for Bank/UPI senders (usually contain "BK", "PAY", "UPI", "BNK")
            if (!/BK|PAY|UPI|BNK/i.test(sender)) continue;

            for (const pattern of PATTERNS) {
                const match = body.match(pattern);
                if (match) {
                    const amountStr = match[1].replace(/,/g, '');
                    const payee = match[2].trim();
                    const amount = parseFloat(amountStr);

                    console.log("Found Potential Expense:", { amount, payee, date: msg.date });

                    // TODO: Add logic to persist expense if not duplicate
                    // For now, we just log it to demonstrate the capability
                    addedCount++;
                }
            }
        }

        return addedCount;
    } catch (e) {
        console.error("Error reading SMS:", e);
        return 0;
    }
};
