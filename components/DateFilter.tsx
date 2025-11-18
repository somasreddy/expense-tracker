import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface DateFilterProps {
  onFilter: (startDate: string, endDate: string) => void;
  onClear: () => void;
}

const DateFilter: React.FC<DateFilterProps> = ({ onFilter, onClear }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleFilter = () => {
    if (startDate && endDate) {
      onFilter(startDate, endDate);
    }
  };

  const handleClear = () => {
    setStartDate('');
    setEndDate('');
    onClear();
  };

  return (
    <div className="flex flex-wrap items-end gap-2">
      <div className="flex-grow min-w-[140px]">
        <label htmlFor="startDate" className="block text-xs font-medium text-slate-700 dark:text-slate-300">Start Date</label>
        <input
          type="date"
          id="startDate"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="mt-1 block w-full px-2 py-1.5 bg-white/50 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-md text-sm shadow-sm transition-shadow duration-300 ease-in-out"
        />
      </div>
      <div className="flex-grow min-w-[140px]">
        <label htmlFor="endDate" className="block text-xs font-medium text-slate-700 dark:text-slate-300">End Date</label>
        <input
          type="date"
          id="endDate"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="mt-1 block w-full px-2 py-1.5 bg-white/50 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-md text-sm shadow-sm transition-shadow duration-300 ease-in-out"
        />
      </div>
      <div className="flex items-center space-x-2">
        <motion.button
          onClick={handleFilter}
          disabled={!startDate || !endDate}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white animated-button disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          Filter
        </motion.button>
        <motion.button
          onClick={handleClear}
          className="inline-flex justify-center py-2 px-4 border border-slate-300 dark:border-slate-600 shadow-sm text-sm font-medium rounded-md text-slate-700 dark:text-slate-200 bg-white/80 dark:bg-slate-700/80 hover:bg-slate-50/90 dark:hover:bg-slate-600/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-colors"
          whileHover={{ scale: 1.05, y: -2, boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.1)" }}
          whileTap={{ scale: 0.95 }}
        >
          Clear
        </motion.button>
      </div>
    </div>
  );
};

export default DateFilter;