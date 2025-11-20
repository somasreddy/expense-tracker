import React from "react";
import { Expense } from "../types";
import { formatToINR } from "../services/expenseService";

interface Props {
  expenses: Expense[];
  onDeleteExpense: (id: string) => void;
  onEditExpense: (expense: Expense) => void;
  selectedExpenses: string[];
  onToggleExpenseSelection: (id: string) => void;
  onToggleSelectAll: () => void;
  onDeleteSelected: () => void;
  onLoadMore: () => void;
  hasMore: boolean;
  isLoadingMore: boolean;
}

const ExpenseList: React.FC<Props> = (props) => {
  const {
    expenses,
    onDeleteExpense,
    onEditExpense,
    selectedExpenses,
    onToggleExpenseSelection,
    onToggleSelectAll,
    onDeleteSelected,
    onLoadMore,
    hasMore,
    isLoadingMore,
  } = props;

  if (expenses.length === 0) {
    return <div className="text-sm opacity-60 p-4 text-center">No expenses found.</div>;
  }

  const allIds = expenses.map((e) => e.id);
  const allSelected =
    allIds.length > 0 && allIds.every((id) => selectedExpenses.includes(id));

  return (
    <div className="space-y-3 text-sm">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 select-none cursor-pointer" onClick={onToggleSelectAll}>
          <input
            type="checkbox"
            checked={allSelected}
            onChange={onToggleSelectAll}
            className="w-4 h-4 rounded border-gray-400 accent-amber-500 cursor-pointer"
          />
          <span className="opacity-80 hover:opacity-100 transition-opacity">Select All</span>
        </div>
        {selectedExpenses.length > 0 && (
          <button
            className="button button-secondary text-xs px-3 py-1 bg-red-900/20 text-red-400 border-red-900/30 hover:bg-red-900/40"
            onClick={onDeleteSelected}
          >
            Delete Selected ({selectedExpenses.length})
          </button>
        )}
      </div>

      <div className="border border-[var(--border-subtle)] rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-xs sm:text-sm border-collapse">
          {/* Dynamic Header Background */}
          <thead className="bg-[var(--bg-elevated)] text-[var(--text-muted)] uppercase tracking-wider font-semibold border-b border-[var(--border-subtle)]">
            <tr>
              <th className="p-3 w-10 text-center"></th>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-right">Amount</th>
              <th className="p-3 text-left hidden sm:table-cell">Category</th>
              <th className="p-3 text-left hidden sm:table-cell">Date</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-subtle)]">
            {expenses.map((exp) => (
              <tr
                key={exp.id}
                // Hover effect adapts to theme via transparency
                className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors duration-150"
              >
                <td className="p-3 text-center">
                  <input
                    type="checkbox"
                    checked={selectedExpenses.includes(exp.id)}
                    onChange={() => onToggleExpenseSelection(exp.id)}
                    className="w-4 h-4 rounded border-gray-400 accent-amber-500 cursor-pointer"
                  />
                </td>
                <td className="p-3">
                  {/* Fixed: Use CSS variable for main text color */}
                  <div className="font-medium text-[var(--text-main)] text-sm sm:text-base">
                    {exp.name}
                  </div>
                </td>
                <td className="p-3 text-right">
                  {/* Fixed: Use CSS variable for highlight color (Amber in dark, Blue in light) */}
                  <span className="font-bold text-[var(--text-highlight)] text-sm sm:text-base">
                    {formatToINR(exp.amount)}
                  </span>
                </td>
                <td className="p-3 hidden sm:table-cell opacity-80">{exp.category}</td>
                <td className="p-3 hidden sm:table-cell opacity-70">
                  {new Date(exp.date).toLocaleDateString()}
                </td>
                <td className="p-3 text-right space-x-2">
                  <button
                    className="px-3 py-1 rounded-md bg-[var(--bg-elevated)] border border-[var(--border-subtle)] hover:brightness-110 transition-all"
                    onClick={() => onEditExpense(exp)}
                  >
                    Edit
                  </button>
                  <button
                    className="px-3 py-1 rounded-md bg-[var(--bg-elevated)] border border-[var(--border-subtle)] hover:bg-red-500 hover:text-white hover:border-red-500 transition-all"
                    onClick={() => onDeleteExpense(exp.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {hasMore && (
        <div className="flex justify-center pt-4">
          <button
            className="button button-secondary w-full sm:w-auto"
            onClick={onLoadMore}
            disabled={isLoadingMore}
          >
            {isLoadingMore ? "Loading..." : "Load more expenses"}
          </button>
        </div>
      )}
    </div>
  );
};

export default ExpenseList;