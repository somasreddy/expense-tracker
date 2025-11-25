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
    const [customCategories, setCustomCategories] = useState<string[]>([]);

    // Load Data
    useEffect(() => {
        if (!user) {
            setExpenses([]);
            setAccounts([]);
            setCustomCategories([]);
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

        // Load categories
        import("../services/expenseService").then(({ loadCategories }) => {
            loadCategories().then(setCustomCategories);
        });

    }, [user]);

    // Auto Save
    useEffect(() => {
        if (!user || loading) return;

        // We want to save even if it's the initial default, to ensure the profile exists in Supabase
        // This prevents Foreign Key errors when adding expenses to the default profile.
        saveData({ expenses, accounts });
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
                            const exists = newExpenses.some(e => e.id === payload.new.id);
                            if (exists) return newExpenses;
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
        async (name: string, amount: number, accountId: string, category?: Category, date?: string) => {
            const newExpense = await createAndPersistExpense(
                { expenses, accounts },
                name,
                amount,
                date ? new Date(date).toISOString() : new Date().toISOString(),
                accountId,
                category
            );
            setExpenses(prev => [newExpense, ...prev]);
        },
        [expenses, accounts]
    );

    const updateExpense = useCallback(
        async (expense: Expense) => {
            const updatedData = await updateExpenseInData({ expenses, accounts }, expense);
            setExpenses(updatedData.expenses);
        },
        [expenses, accounts]
    );

    const deleteExpense = useCallback(
        async (id: string) => {
            const updatedData = await deleteExpenseFromData({ expenses, accounts }, id);
            setExpenses(updatedData.expenses);
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

    const deleteAccount = useCallback(async (id: string, fallbackId?: string) => {
        const { deleteProfile, transferExpenses, deleteAllExpensesForProfile } = await import("../services/expenseService");

        if (fallbackId) {
            // Transfer expenses to fallback profile
            await transferExpenses(id, fallbackId);
            setExpenses((prev) =>
                prev.map((exp) =>
                    exp.accountId === id ? { ...exp, accountId: fallbackId } : exp
                )
            );
        } else {
            // Delete all expenses associated with this profile
            await deleteAllExpensesForProfile(id);
            setExpenses((prev) => prev.filter((exp) => exp.accountId !== id));
        }

        await deleteProfile(id);
        setAccounts((prev) => prev.filter((p) => p.id !== id));
    }, []);

    const addCategory = useCallback(async (name: string) => {
        const { addCategory: serviceAddCategory } = await import("../services/expenseService");
        const newCategory = await serviceAddCategory(name);
        if (newCategory) {
            setCustomCategories(prev => [...prev, newCategory]);
            return newCategory;
        }
        return null;
    }, []);

    const updateCategory = useCallback(async (oldName: string, newName: string) => {
        const { updateCategory: serviceUpdateCategory } = await import("../services/expenseService");
        const success = await serviceUpdateCategory(oldName, newName);
        if (success) {
            setCustomCategories(prev => prev.map(c => c === oldName ? newName : c));
            // Also update expenses that use this category
            setExpenses(prev => prev.map(e => e.category === oldName ? { ...e, category: newName } : e));
        }
    }, []);

    const deleteCategory = useCallback(async (name: string) => {
        const { deleteCategory: serviceDeleteCategory } = await import("../services/expenseService");
        const success = await serviceDeleteCategory(name);
        if (success) {
            setCustomCategories(prev => prev.filter(c => c !== name));
        }
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
        setExpenses,
        setAccounts,
        customCategories,
        addCategory,
        updateCategory,
        deleteCategory,
    };
};
