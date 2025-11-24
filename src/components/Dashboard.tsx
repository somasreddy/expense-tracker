import React, { useState } from "react";
import { motion } from "framer-motion";
import ExpenseForm from "./ExpenseForm";
import Summary from "./Summary";
import ExpenseChart from "./ExpenseChart";
import DateFilter from "./DateFilter";
import ExpenseList from "./ExpenseList";
import BudgetProgress from "./BudgetProgress";
import BudgetManagerModal from "./BudgetManagerModal";
import { Expense, Category, Budget } from "../types";

interface DashboardProps {
    onAddExpense: (name: string, amount: number) => Promise<boolean>;
    filteredTotal: number;
    categoryTotals: Record<Category, number>;
    masterFilteredExpenses: Expense[];
    onSetCategoryFilter: (category: Category) => void;
    categoryFilter: Category | null;
    onSetFilter: (start: string, end: string) => void;
    onClearFilter: () => void;
    displayedExpenses: Expense[];
    onDeleteExpense: (id: string) => Promise<void>;
    onEditExpense: (expense: Expense) => void;
    selectedExpenses: string[];
    onToggleExpenseSelection: (id: string) => void;
    onToggleSelectAll: (ids: string[]) => void;
    onDeleteSelected: () => void;
    onLoadMore: () => void;
    hasMore: boolean;
    isLoadingMore: boolean;
    budgets: Budget[];
    onSetBudget: (category: Category, amount: number) => Promise<void>;
    customCategories: string[];
    onAddCategory: (name: string) => Promise<void>;
}

const Dashboard: React.FC<DashboardProps> = ({
    onAddExpense,
    filteredTotal,
    categoryTotals,
    masterFilteredExpenses,
    onSetCategoryFilter,
    categoryFilter,
    onSetFilter,
    onClearFilter,
    displayedExpenses,
    onDeleteExpense,
    onEditExpense,
    selectedExpenses,
    onToggleExpenseSelection,
    onToggleSelectAll,
    onDeleteSelected,
    onLoadMore,
    hasMore,
    isLoadingMore,
    budgets,
    onSetBudget,
    customCategories,
    onAddCategory,
}) => {
    const [isBudgetModalOpen, setBudgetModalOpen] = useState(false);

    // Calculate budget progress
    // We want to show progress for categories that have a budget set OR have spending
    // But maybe just show those with budgets for now to keep it clean?
    // Or show "Alerts" for over budget?
    // Let's show a "Budget Status" section if there are any budgets.
    const activeBudgets = budgets.filter((b) => b.amount > 0);

    return (
        <motion.main
            className="grid grid-cols-1 lg:col-span-3 lg:grid-cols-3 gap-8"
            variants={{
                hidden: { opacity: 0 },
                visible: {
                    opacity: 1,
                    transition: { staggerChildren: 0.2 },
                },
            }}
            initial="hidden"
            animate="visible"
        >
            {/* LEFT: FORM + SUMMARY + BUDGETS */}
            <motion.div
                variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}
                className="lg:col-span-1 space-y-6"
            >
                <div className="content-surface p-6 space-y-6">
                    <h2 className="text-2xl font-bold">Add New Expense</h2>
                    <ExpenseForm
                        onAddExpense={onAddExpense}
                        customCategories={customCategories}
                        onAddCategory={onAddCategory}
                    />
                    <hr className="border-[var(--border-subtle)]" />
                    <Summary
                        filteredTotal={filteredTotal}
                        categoryTotals={categoryTotals}
                    />
                </div>

                {/* BUDGET SECTION */}
                <div className="content-surface p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">Budgets</h2>
                        <button
                            onClick={() => setBudgetModalOpen(true)}
                            className="text-sm text-[var(--text-highlight)] hover:underline"
                        >
                            Manage
                        </button>
                    </div>

                    {activeBudgets.length === 0 ? (
                        <p className="text-sm text-[var(--text-muted)]">
                            No budgets set. Click "Manage" to set spending limits.
                        </p>
                    ) : (
                        <div className="space-y-1">
                            {activeBudgets.map((budget) => (
                                <BudgetProgress
                                    key={budget.id}
                                    category={budget.category}
                                    limit={budget.amount}
                                    spent={categoryTotals[budget.category] || 0}
                                    onClick={() => onSetCategoryFilter(budget.category)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </motion.div>

            {/* RIGHT: CHART + LIST */}
            <motion.div
                variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}
                className="lg:col-span-2 space-y-6"
            >
                {/* CHART */}
                <div className="content-surface p-6 min-h-[260px]">
                    <h2 className="text-2xl font-bold mb-4">
                        Expense Analysis
                    </h2>
                    {masterFilteredExpenses.length === 0 ? (
                        <p className="opacity-60 text-sm">
                            No expenses to visualize yet. Add a few expenses to see charts.
                        </p>
                    ) : (
                        <div className="w-full h-64">
                            <ExpenseChart
                                categoryTotals={categoryTotals}
                                onCategoryClick={onSetCategoryFilter}
                                activeCategory={categoryFilter}
                            />
                        </div>
                    )}
                </div>

                {/* LIST */}
                <div className="content-surface p-6">
                    <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
                        <h2 className="text-2xl font-bold">
                            {categoryFilter ? `${categoryFilter} Expenses` : "Recent Expenses"}
                            {categoryFilter && (
                                <button
                                    onClick={() => onSetCategoryFilter(null as any)}
                                    className="ml-2 text-sm text-[var(--text-highlight)]"
                                >
                                    (Clear)
                                </button>
                            )}
                        </h2>

                        <DateFilter onFilter={onSetFilter} onClear={onClearFilter} />
                    </div>

                    <ExpenseList
                        expenses={displayedExpenses}
                        onDeleteExpense={onDeleteExpense}
                        onEditExpense={onEditExpense}
                        selectedExpenses={selectedExpenses}
                        onToggleExpenseSelection={onToggleExpenseSelection}
                        onToggleSelectAll={() =>
                            onToggleSelectAll(masterFilteredExpenses.map((e) => e.id))
                        }
                        onDeleteSelected={onDeleteSelected}
                        onLoadMore={onLoadMore}
                        hasMore={hasMore}
                        isLoadingMore={isLoadingMore}
                    />
                </div>
            </motion.div>

            <BudgetManagerModal
                isOpen={isBudgetModalOpen}
                onClose={() => setBudgetModalOpen(false)}
                budgets={budgets}
                onSetBudget={onSetBudget}
            />
        </motion.main>
    );
};

export default Dashboard;
