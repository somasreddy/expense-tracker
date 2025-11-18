
import React from 'react';
import { Category } from '../types';
import { formatToINR } from '../services/expenseService';

interface SummaryProps {
  filteredTotal: number;
  categoryTotals: { [key in Category]?: number };
}

const Summary: React.FC<SummaryProps> = ({ filteredTotal, categoryTotals }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-slate-400">Total Expenses</h3>
        <p className="text-3xl font-bold text-amber-300">{formatToINR(filteredTotal)}</p>
      </div>
      <div>
        <h3 className="text-lg font-medium text-white mb-2">Spend by Category</h3>
        <ul className="space-y-2 max-h-60 overflow-y-auto pr-2 -mr-2">
          {Object.entries(categoryTotals).length > 0 ? (
            Object.entries(categoryTotals)
              // FIX: Explicitly convert values to numbers to prevent type errors.
              .sort(([, a], [, b]) => (Number(b) || 0) - (Number(a) || 0))
              .map(([category, total]) => (
                <li key={category} className="flex justify-between items-center text-sm">
                  <span className="text-slate-300">{category}</span>
                  {/* FIX: Explicitly convert total to a number before formatting. */}
                  <span className="font-semibold text-slate-100">{formatToINR(Number(total) || 0)}</span>
                </li>
              ))
          ) : (
            <p className="text-sm text-slate-400">No expenses in this period.</p>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Summary;