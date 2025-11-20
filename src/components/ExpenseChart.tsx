import { Category } from "../types";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

interface Props {
  categoryTotals: Record<Category, number>;
  onCategoryClick: (category: Category) => void;
  activeCategory: Category | null;
}

const COLORS = [
  "#F97316",
  "#22C55E",
  "#3B82F6",
  "#EC4899",
  "#A855F7",
  "#EAB308",
  "#F97316",
  "#06B6D4",
  "#4ADE80",
  "#FACC15",
  "#F97316",
  "#FB7185",
  "#94A3B8",
];

const ExpenseChart: React.FC<Props> = ({
  categoryTotals,
  onCategoryClick,
  activeCategory,
}) => {
  const data = Object.entries(categoryTotals)
    .filter(([, value]) => value > 0)
    .map(([name, value]) => ({ name, value }));

  if (data.length === 0) {
    return <div className="text-sm text-slate-400">No data to display yet.</div>;
  }

  return (
    <div className="w-full h-72 min-w-0">
      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={90}
            innerRadius={40}
            onClick={(entry) => onCategoryClick(entry.name as Category)}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${entry.name}`}
                fill={COLORS[index % COLORS.length]}
                stroke={
                  activeCategory === entry.name ? "#fbbf24" : "rgba(15,23,42,0.8)"
                }
                strokeWidth={activeCategory === entry.name ? 3 : 1}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(15,23,42,0.95)",
              border: "1px solid rgb(51,65,85)",
              borderRadius: "0.75rem",
              fontSize: "0.75rem",
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ExpenseChart;
