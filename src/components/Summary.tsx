import { Category } from "../types";
import { formatToINR } from "../services/expenseService";

interface Props {
  filteredTotal: number;
  categoryTotals: Record<Category, number>;
}

const Summary: React.FC<Props> = ({ filteredTotal, categoryTotals }) => {
  const topCategories = Object.entries(categoryTotals)
    .filter(([, value]) => value > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-xl bg-slate-800/70 border border-slate-700">
        <div className="text-sm text-slate-300">Total Spent</div>
        <div className="text-2xl font-bold text-amber-300">
          {formatToINR(filteredTotal)}
        </div>
      </div>

      {topCategories.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-semibold text-slate-300">
            Top Categories
          </div>
          {topCategories.map(([cat, value]) => (
            <div
              key={cat}
              className="flex justify-between text-sm bg-slate-900/60 rounded-lg px-3 py-2"
            >
              <span>{cat}</span>
              <span className="text-amber-300">
                {formatToINR(value as number)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Summary;
