import { useState, useEffect, useCallback } from "react";
import { Budget, Category } from "../types";
import { loadBudgets, upsertBudget, deleteBudget } from "../services/expenseService";

export const useBudgets = (user: any) => {
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchBudgets = useCallback(async () => {
        if (!user) {
            setBudgets([]);
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const data = await loadBudgets();
            setBudgets(data);
        } catch (error) {
            console.error("Failed to load budgets", error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchBudgets();
    }, [fetchBudgets]);

    const setBudget = async (category: Category, amount: number) => {
        try {
            const saved = await upsertBudget(category, amount);
            if (saved) {
                setBudgets((prev) => {
                    const exists = prev.find((b) => b.category === category);
                    if (exists) {
                        return prev.map((b) => (b.category === category ? saved : b));
                    }
                    return [...prev, saved];
                });
            }
        } catch (error) {
            console.error("Failed to set budget", error);
            throw error;
        }
    };

    const removeBudget = async (id: string) => {
        try {
            await deleteBudget(id);
            setBudgets((prev) => prev.filter((b) => b.id !== id));
        } catch (error) {
            console.error("Failed to remove budget", error);
            throw error;
        }
    };

    const getBudgetForCategory = (category: Category) => {
        return budgets.find((b) => b.category === category) || null;
    };

    return {
        budgets,
        loading,
        setBudget,
        removeBudget,
        getBudgetForCategory,
        refreshBudgets: fetchBudgets,
    };
};
