import { useState, useMemo } from "react";
import { Expense, Category } from "../types";

export interface FilterState {
    start: string | null;
    end: string | null;
}

export const useExpenseFilters = (expenses: Expense[], currentAccountId: string) => {
    const [filter, setFilter] = useState<FilterState>({
        start: null,
        end: null,
    });
    const [categoryFilter, setCategoryFilter] = useState<Category | null>(null);

    const [displayCount, setDisplayCount] = useState(20);

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

    const displayedExpenses = useMemo(() => {
        return filteredExpenses.slice(0, displayCount);
    }, [filteredExpenses, displayCount]);

    const hasMore = displayCount < filteredExpenses.length;

    const loadMoreExpenses = () => {
        setDisplayCount((prev) => prev + 20);
    };

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
        setDisplayCount(20); // Reset pagination on filter change
    };

    const clearFilter = () => {
        setFilter({ start: null, end: null });
        setDisplayCount(20); // Reset pagination on filter clear
    };

    const setCategoryFilterWrapper = (category: Category | null) => {
        setCategoryFilter(category);
        setDisplayCount(20); // Reset pagination on category filter change
    };

    return {
        filter,
        setDateFilter,
        clearFilter,
        categoryFilter,
        setCategoryFilter: setCategoryFilterWrapper,
        filteredExpenses,
        filteredTotal,
        categoryTotals,
        displayedExpenses,
        masterFilteredExpenses: filteredExpenses,
        loadMoreExpenses,
        hasMore,
        isLoadingMore: false, // Client-side pagination is instant
    };
};
