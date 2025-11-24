import { useState, useEffect, useCallback } from "react";
import { Expense, Account, Category } from "../types";
import {
    loadData,
    saveData,
    loadCachedAppData,
    createAndPersistExpense,
    updateExpenseInData,
    deleteExpenseFromData,
} from "../services/expenseService";
import { supabase } from "../supabaseClient";

export const useExpenseData = (user: any) => {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [loading, setLoading] = useState(true);

    // Load Data
    useEffect(() => {
        if (!user) {
            setExpenses([]);
            setAccounts([]);
            setLoading(false);
            return;
        }

        const cached = loadCachedAppData();
        if (cached) {
            setExpenses(cached.expenses);
            setAccounts(cached.accounts);
            setLoading(false);
        } else {
            setLoading(true);
        }

        loadData()
            .then((fresh) => {
                setExpenses(fresh.expenses);
                setAccounts(fresh.accounts);
            })
            .catch((error) => {
                console.error("Initial data load failed:", error);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [user]);

    // Auto Save
    useEffect(() => {
        if (!user || loading) return;

        const isInitialDefault =
            expenses.length === 0 &&
            accounts.length === 1 &&
            accounts[0].id.startsWith("default-account");

        if (!isInitialDefault) {
            saveData({ expenses, accounts });
        }
    }, [accounts, expenses, user, loading]);

    // Real-time Listener
    useEffect(() => {
        if (!user) return;

        const userId = user.uid;
        const channel = supabase
            .channel(`public:expenses:${userId}`)
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "expenses",
                    filter: `user_id=eq.${userId}`,
                },
                (payload) => {
                    console.log("Realtime Change Received:", payload.eventType, payload.new);

                    setExpenses((prevExpenses) => {
                        const newExpenses = [...prevExpenses];
                        const toExpense = (data: any): Expense => ({
                            id: data.id,
                            name: data.name,
                            amount: Number(data.amount),
                            date: data.date,
                            accountId: data.profile_id,
                            category: data.category as Category,
                        });

                        if (payload.eventType === "INSERT") {
                            return [toExpense(payload.new), ...newExpenses];
                        } else if (payload.eventType === "DELETE") {
                            return newExpenses.filter((e) => e.id !== payload.old.id);
                        } else if (payload.eventType === "UPDATE") {
                            const updatedIndex = newExpenses.findIndex(
                                (e) => e.id === payload.new.id
                            );
                            if (updatedIndex > -1) {
                                newExpenses[updatedIndex] = toExpense(payload.new);
                            }
                            return newExpenses;
                        }
                        return prevExpenses;
                    });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user]);

    // Operations
    const addExpense = useCallback(
        async (name: string, amount: number, accountId: string, category?: Category) => {
            await createAndPersistExpense(
                { expenses, accounts },
                name,
                amount,
                new Date().toISOString(),
                accountId,
                category
            );
            // State update happens via realtime or we could optimistically update here
            // The service functions currently don't return the new object to append easily without reloading or waiting for realtime
            // But App.tsx relied on realtime or local state update?
            // Actually App.tsx didn't manually update state after createAndPersistExpense, it relied on the fact that createAndPersistExpense *might* update local storage but the state in App.tsx was only updated via Realtime or if we manually did it.
            // Wait, createAndPersistExpense returns Promise<void>.
            // In App.tsx:
            // await createAndPersistExpense(...)
            // return true;
            // It seems it relies on Realtime for the UI update?
            // Let's check createAndPersistExpense implementation.
        },
        [expenses, accounts]
    );

    const updateExpense = useCallback(
        async (expense: Expense) => {
            await updateExpenseInData({ expenses, accounts }, expense);
        },
        [expenses, accounts]
    );

    const deleteExpense = useCallback(
        async (id: string) => {
            await deleteExpenseFromData({ expenses, accounts }, id);
        },
        [expenses, accounts]
    );

    const addAccount = useCallback((name: string) => {
        const newAccount: Account = { id: `${Date.now()}`, name };
        setAccounts((prev) => [...prev, newAccount]);
        return newAccount;
    }, []);

    const updateAccount = useCallback((id: string, name: string) => {
        setAccounts((prev) =>
            prev.map((a) => (a.id === id ? { ...a, name } : a))
        );
    }, []);

    const deleteAccount = useCallback((id: string, fallbackId: string) => {
        setExpenses((prev) =>
            prev.map((exp) =>
                exp.accountId === id ? { ...exp, accountId: fallbackId } : exp
            )
        );
        setAccounts((prev) => prev.filter((p) => p.id !== id));
    }, []);

    return {
        expenses,
        accounts,
        loading,
        addExpense,
        updateExpense,
        deleteExpense,
        addAccount,
        updateAccount,
        deleteAccount,
        setExpenses, // Exposed if needed for manual manipulation
        setAccounts,
    };
};
