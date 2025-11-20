import React from "react";
import { Category } from "../types";
import { formatToINR } from "../services/expenseService";

interface Props {
  filteredTotal: number;
  categoryTotals: Record<Category, number>;
}
	
const Summary: React.FC<Props> = ({ filteredTotal, categoryTotals }) => {
  const topCategories = (Object.entries(categoryTotals) as [Category, number][])
    .filter(([, value]) => value > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="space-y-4">
      {/* Total Spent Card */}
      <div className="p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] shadow-sm">
        <div className="text-sm opacity-70">Total Spent</div>
        <div className="text-2xl font-bold text-[var(--text-highlight)]">
          {formatToINR(filteredTotal)}
        </div>
      </div>

      {/* Top Categories List */}
      {topCategories.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-semibold opacity-80">
            Top Categories
          </div>
          {topCategories.map(([cat, value]) => (
            <div
              key={cat}
              className="flex justify-between text-sm bg-[var(--bg-surface)] rounded-lg px-3 py-2 border border-[var(--border-subtle)]"
            >
              <span>{cat}</span>
              <span className="font-medium text-[var(--text-highlight)]">
                {formatToINR(value)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Summary;