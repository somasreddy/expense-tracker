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
    return <div className="text-sm text-slate-400">No expenses yet.</div>;
  }

  const allIds = expenses.map((e) => e.id);
  const allSelected =
    allIds.length > 0 && allIds.every((id) => selectedExpenses.includes(id));

  return (
    <div className="space-y-3 text-sm">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={onToggleSelectAll}
          />
          <span className="text-slate-300">Select All</span>
        </div>
        {selectedExpenses.length > 0 && (
          <button
            className="button button-secondary"
            onClick={onDeleteSelected}
          >
            Delete Selected ({selectedExpenses.length})
          </button>
        )}
      </div>

      <div className="border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-xs sm:text-sm">
          <thead className="bg-slate-900/80">
            <tr>
              <th className="p-2 w-8"></th>
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-right">Amount</th>
              <th className="p-2 text-left hidden sm:table-cell">Category</th>
              <th className="p-2 text-left hidden sm:table-cell">Date</th>
              <th className="p-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((exp) => (
              <tr
                key={exp.id}
                className="border-t border-slate-800 hover:bg-slate-900/60"
              >
                <td className="p-2 text-center">
                  <input
                    type="checkbox"
                    checked={selectedExpenses.includes(exp.id)}
                    onChange={() => onToggleExpenseSelection(exp.id)}
                  />
                </td>
                <td className="p-2">
                  <div className="font-medium text-slate-100">{exp.name}</div>
                </td>
                <td className="p-2 text-right text-amber-300">
                  {formatToINR(exp.amount)}
                </td>
                <td className="p-2 hidden sm:table-cell">{exp.category}</td>
                <td className="p-2 hidden sm:table-cell">
                  {new Date(exp.date).toLocaleDateString()}
                </td>
                <td className="p-2 text-right space-x-2">
                  <button
                    className="button button-secondary text-xs px-2 py-1"
                    onClick={() => onEditExpense(exp)}
                  >
                    Edit
                  </button>
                  <button
                    className="button button-secondary text-xs px-2 py-1"
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
        <div className="flex justify-center pt-2">
          <button
            className="button button-secondary"
            onClick={onLoadMore}
            disabled={isLoadingMore}
          >
            {isLoadingMore ? "Loading..." : "Load more"}
          </button>
        </div>
      )}
    </div>
  );
};

export default ExpenseList;
