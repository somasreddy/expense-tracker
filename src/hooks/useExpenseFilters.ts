import { useState, useMemo } from "react";
import { Expense, Category } from "../types";

export const useExpenseFilters = (expenses: Expense[], currentAccountId: string) => {
    const [filter, setFilter] = useState<{ start: string | null; end: string | null }>({
        start: null,
        end: null,
    });
    const [categoryFilter, setCategoryFilter] = useState<Category | null>(null);

    const filteredExpenses = useMemo(() => {
        let temp = [...expenses];

        if (currentAccountId !== "all") {
            temp = temp.filter((e) => e.accountId === currentAccountId);
        }
        if (filter.start && filter.end) {
            const s = new Date(filter.start);
            const e = new Date(filter.end);
            temp = temp.filter((ex) => {
                const d = new Date(ex.date);
                return d >= s && d <= e;
            });
        }
        if (categoryFilter) {
            temp = temp.filter((e) => e.category === categoryFilter);
        }

        return temp.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [expenses, currentAccountId, filter, categoryFilter]);

    const filteredTotal = useMemo(
        () => filteredExpenses.reduce((sum, e) => sum + e.amount, 0),
        [filteredExpenses]
    );

    const categoryTotals = useMemo(() => {
        const totals: Record<Category, number> = {} as any;
        filteredExpenses.forEach((e) => {
            totals[e.category] = (totals[e.category] || 0) + e.amount;
        });
        return totals;
    }, [filteredExpenses]);

    const setDateFilter = (start: string | null, end: string | null) => {
        setFilter({ start, end });
    };

    const clearFilter = () => {
        setFilter({ start: null, end: null });
    };

    return {
        filter,
        setDateFilter,
        clearFilter,
        categoryFilter,
        setCategoryFilter,
        filteredExpenses,
        filteredTotal,
        categoryTotals,
    };
};
