import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ExpenseForm from "./ExpenseForm";
import Summary from "./Summary";
import ExpenseChart from "./ExpenseChart";
import DateFilter from "./DateFilter";
import ExpenseList from "./ExpenseList";
import BudgetProgress from "./BudgetProgress";
import BudgetManagerModal from "./BudgetManagerModal";
import { Expense, Category, Budget } from "../types";
import { ChevronDown, ChevronUp } from "lucide-react";

interface DashboardProps {
    onAddExpense: (name: string, amount: number) => Promise<boolean>;
    filteredTotal: number;
    categoryTotals: Record<Category, number>;
    masterFilteredExpenses: Expense[];
    onSetCategoryFilter: (category: Category | null) => void;
    categoryFilter: Category | null;
    onSetFilter: (start: string | null, end: string | null) => void;
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
    onAddCategory: (name: string) => Promise<string | null>;
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
    const [isBudgetsExpanded, setIsBudgetsExpanded] = useState(true);

    // Calculate budget progress
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
                        <div
                            className="flex items-center gap-2 cursor-pointer select-none"
                            onClick={() => setIsBudgetsExpanded(!isBudgetsExpanded)}
                        >
                            <h2 className="text-xl font-bold">Budgets</h2>
                            {isBudgetsExpanded ? (
                                <ChevronUp className="w-5 h-5 text-[var(--text-muted)]" />
                            ) : (
                                <ChevronDown className="w-5 h-5 text-[var(--text-muted)]" />
                            )}
                        </div>
                        <button
                            onClick={() => setBudgetModalOpen(true)}
                            className="text-sm text-[var(--text-highlight)] hover:underline"
                        >
                            Manage
                        </button>
                    </div>

                    <AnimatePresence>
                        {isBudgetsExpanded && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="overflow-hidden"
                            >
                                {activeBudgets.length === 0 ? (
                                    <p className="text-sm text-[var(--text-muted)]">
                                        No budgets set. Click "Manage" to set spending limits.
                                    </p>
                                ) : (
                                    <div className="space-y-1 pt-1">
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
                            </motion.div>
                        )}
                    </AnimatePresence>
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
                            {categoryFilter
                                ? (categoryFilter === "_TOTAL_" ? "Total Budget Expenses" : `${categoryFilter} Expenses`)
                                : "Recent Expenses"}
                            {categoryFilter && (
                                <button
                                    onClick={() => onSetCategoryFilter(null)}
                                    className="ml-2 text-sm text-[var(--text-highlight)]"
                                >
                                    (Clear)
                                </button>
                            )}
                        </h2>

                        <DateFilter onFilter={onSetFilter} onClear={onClearFilter} />
                    </div>

                    {/* Category Filter Chips */}
                    <div className="flex flex-wrap gap-2 mb-6">
                        <button
                            onClick={() => onSetCategoryFilter(null)}
                            className={`chip ${!categoryFilter ? "chip-active" : "chip-inactive"}`}
                        >
                            All
                        </button>
                        {Object.keys(categoryTotals).map((cat) => (
                            <button
                                key={cat}
                                onClick={() => onSetCategoryFilter(cat as Category)}
                                className={`chip ${categoryFilter === cat ? "chip-active" : "chip-inactive"}`}
                            >
                                {cat}
                            </button>
                        ))}
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
                customCategories={customCategories}
            />
        </motion.main>
    );
};

export default Dashboard;
