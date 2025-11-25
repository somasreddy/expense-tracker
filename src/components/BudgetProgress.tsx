import React from "react";
import { motion } from "framer-motion";
import { formatToINR } from "../services/expenseService";

interface BudgetProgressProps {
    category: string;
    spent: number;
    limit: number;
    onClick?: () => void;
}

const BudgetProgress: React.FC<BudgetProgressProps> = ({
    category,
    spent,
    limit,
    onClick,
}) => {
    const percentage = Math.min((spent / limit) * 100, 100);
    const isOverBudget = spent > limit;
    const isNearLimit = percentage > 80;

    let colorClass = "bg-emerald-500";
    if (isOverBudget) colorClass = "bg-red-500";
    else if (isNearLimit) colorClass = "bg-amber-500";

    return (
        <div
            className="mb-4 cursor-pointer hover:bg-[var(--bg-hover)] p-2 rounded transition-colors"
            onClick={onClick}
        >
            <div className="flex justify-between items-end mb-1">
                <span className="font-medium text-sm">
                    {category === "_TOTAL_" ? "Total Budget" : category}
                </span>
                <span className="text-xs opacity-80">
                    {formatToINR(spent)} / {formatToINR(limit)}
                </span>
            </div>
            <div className="w-full bg-[var(--bg-body)] rounded-full h-2.5 overflow-hidden">
                <motion.div
                    className={`h-2.5 rounded-full ${colorClass}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                />
            </div>
            {isOverBudget && (
                <p className="text-xs text-red-500 mt-1">
                    Over budget by {formatToINR(spent - limit)}
                </p>
            )}
        </div>
    );
};

export default BudgetProgress;
