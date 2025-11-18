import React, { useState, useCallback } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, Sector } from 'recharts';
import { Category } from '../types';
import { formatToINR } from '../services/expenseService';

interface ExpenseChartProps {
  categoryTotals: { [key in Category]?: number };
}

const COLORS = [
  '#0ea5e9', '#8b5cf6', '#ec4899', '#f97316', '#10b981', 
  '#eab308', '#6366f1', '#d946ef', '#14b8a6', '#f43f5e',
  '#6b7280', '#84cc16'
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const { name, value } = payload[0].payload;
    const percent = payload[0].percent;
    return (
      <div className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg text-sm">
        <p className="font-bold text-slate-900 dark:text-white">{name}</p>
        <p className="text-slate-600 dark:text-slate-300">{`Amount: ${formatToINR(value)}`}</p>
        <p className="text-slate-500 dark:text-slate-400">{`Percentage: ${(percent * 100).toFixed(2)}%`}</p>
      </div>
    );
  }
  return null;
};

const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload } = props;

  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill} className="text-base font-bold dark:fill-white">
        {payload.name}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 6} // Pop out effect
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        style={{ filter: `drop-shadow(0 4px 8px ${fill}A0)` }} // 3D shadow
      />
    </g>
  );
};


const ExpenseChart: React.FC<ExpenseChartProps> = ({ categoryTotals }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const onPieEnter = useCallback((_: any, index: number) => {
    setActiveIndex(index);
  }, [setActiveIndex]);

  const chartData = Object.entries(categoryTotals)
    // FIX: Explicitly convert the value to a number to prevent type errors in subsequent filter and sort operations.
    .map(([name, value]) => ({ name, value: Number(value) || 0 }))
    .filter(item => item.value > 0)
    .sort((a, b) => b.value - a.value);

  if (chartData.length === 0) {
    return <p className="text-center text-slate-500 dark:text-slate-400 py-10">No data to display in chart.</p>;
  }

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            activeIndex={activeIndex}
            activeShape={renderActiveShape}
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={90}
            paddingAngle={5}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
            onMouseEnter={onPieEnter}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} style={{ outline: 'none' }}/>
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            iconType="circle"
            layout="vertical" 
            verticalAlign="middle" 
            align="right"
            wrapperStyle={{
              fontSize: '12px',
              color: '#475569',
            }}
            formatter={(value, entry, index) => <span className="text-slate-600 dark:text-slate-300">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ExpenseChart;