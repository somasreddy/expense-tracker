import React from "react";
import { Category } from "../types";
// Import formatToINR for displaying currency in the tooltip
import { formatToINR } from "../services/expenseService";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  TooltipProps, // Import TooltipProps for typing the custom content
} from "recharts";
import {
  NameType,
  ValueType,
} from "recharts/types/component/Tooltip"; // Import necessary Tooltip types

interface Props {
  categoryTotals: Record<Category, number>;
  onCategoryClick: (category: Category) => void;
  activeCategory: Category | null;
}

const COLORS = [
  "#F97316", // Orange
  "#22C55E", // Green
  "#3B82F6", // Blue
  "#EC4899", // Pink
  "#A855F7", // Purple
  "#EAB308", // Yellow
  "#06B6D4", // Cyan
  "#4ADE80",
  "#FACC15",
  "#FB7185",
  "#94A3B8",
];

// Custom Tooltip component to display INR formatted amounts
const CustomTooltip = ({ active, payload }: TooltipProps<ValueType, NameType>) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    const name = data.name;
    const value = data.value as number;

    return (
      <div
        className="p-3 bg-gray-900 border border-gray-700 rounded-xl text-xs text-white shadow-xl"
        style={{ pointerEvents: 'none' }} // Ensure the tooltip doesn't interfere with clicks
      >
        <p className="font-semibold">{name}</p>
        <p className="text-amber-300">{formatToINR(value)}</p>
      </div>
    );
  }

  return null;
};


const ExpenseChart: React.FC<Props> = ({
  categoryTotals,
  onCategoryClick,
  activeCategory,
}) => {
  const data = Object.entries(categoryTotals)
    .filter(([, value]) => value > 0)
    .map(([name, value]) => ({ name, value: value as number })); // Assert value as number for safety

  if (data.length === 0) {
    return <div className="text-sm text-slate-400 p-4">No data to display yet.</div>;
  }

  return (
    // Ensured parent container has explicit height/width to resolve previous dimension errors
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
            paddingAngle={2} // Add small padding for visual separation
            onClick={(entry) => onCategoryClick(entry.name as Category)}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${entry.name}`}
                fill={COLORS[index % COLORS.length]}
                stroke={
                  // Highlight active category with a light border color
                  activeCategory === entry.name ? "#fbbf24" : "rgba(15,23,42,0.8)" 
                }
                strokeWidth={activeCategory === entry.name ? 3 : 1}
              />
            ))}
          </Pie>

          {/* ✅ CORRECTION: Use CustomTooltip component for currency formatting */}
          <Tooltip content={<CustomTooltip />} /> 
          
          <Legend 
            wrapperStyle={{ paddingTop: "10px" }} // Add padding above legend
            layout="horizontal" 
            align="center" 
            verticalAlign="bottom"
            iconType="square"
            // Style the text in the legend for dark theme
            formatter={(value) => <span className="text-slate-300 text-sm">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ExpenseChart;